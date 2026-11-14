const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/models');
const catalog = require('../src/services/training-program/subjectCatalog.service');
const classes = require('../src/services/training-program/trainingClass.service');
const validation = require('../src/validations/training-program/trainingClass.validation');
const catalogValidation = require('../src/validations/training-program/subjectCatalog.validation');

const commander = { id: 'commander', role: 'COMMANDER', trainingSystemCode: 'HE_1', trainingSystemId: 'system-1' };
const values = { subjectCode: 'M01', subjectName: 'Môn học', credits: 3 };

test('catalog list is scoped to the authenticated system, for all four supported systems', async (t) => {
  t.mock.method(db.subjectCatalog, 'findAll', async ({ where }) => {
    assert.deepEqual(where, { trainingSystemId: 'system-1' });
    return [];
  });
  for (const trainingSystemCode of ['HE_1', 'HE_3', 'HE_4', 'HE_7']) {
    assert.deepEqual(await catalog.list({ ...commander, trainingSystemCode }), []);
  }
  for (const user of [null, { ...commander, role: 'ADMIN' }, { ...commander, role: 'STUDENT' }, { ...commander, trainingSystemCode: 'HE_5' }, { ...commander, trainingSystemId: null }]) {
    assert.throws(() => catalog.list(user), /Chỉ Chỉ huy/);
  }
});

test('create ignores a supplied system id and translates duplicate code errors', async (t) => {
  t.mock.method(db.subjectCatalog, 'create', async (input) => {
    assert.deepEqual(input, { ...values, trainingSystemId: commander.trainingSystemId });
    throw Object.assign(new Error(), { name: 'SequelizeUniqueConstraintError' });
  });
  await assert.rejects(catalog.save(null, { ...values, trainingSystemId: 'other-system' }, commander), /Mã môn đã tồn tại/);
});

test('cross-system catalog ids cannot be read or updated', async (t) => {
  t.mock.method(db.subjectCatalog, 'findOne', async ({ where }) => {
    assert.deepEqual(where, { id: 'foreign-subject', trainingSystemId: 'system-1' });
    return null;
  });
  await assert.rejects(catalog.get('foreign-subject', commander), /Không tìm thấy môn/);
  await assert.rejects(catalog.save('foreign-subject', values, commander), /Không tìm thấy môn/);
});

test('catalog updates change only catalog values and never write class subjects/results', async (t) => {
  t.mock.method(db.subjectCatalog, 'findOne', async () => ({ update: async (input) => input }));
  t.mock.method(db.trainingClassSubject, 'update', () => { assert.fail('Snapshot must not be updated'); });
  t.mock.method(db.trainingClassResult, 'update', () => { assert.fail('Grades must not be updated'); });
  assert.deepEqual(await catalog.save('subject', values, commander), values);
});

const stubOwnedSemester = (t) => {
  t.mock.method(db.trainingClass, 'findOne', async ({ where }) => {
    assert.deepEqual(where, { id: 'class', trainingSystemId: 'system-1', commanderId: 'commander' });
    return { id: 'class' };
  });
  t.mock.method(db.trainingClassSemester, 'findOne', async ({ where }) => {
    assert.deepEqual(where, { id: 'semester', trainingClassId: 'class' });
    return { id: 'semester' };
  });
};

test('assignment uses catalog snapshot, not client overrides, within an owned class/semester', async (t) => {
  stubOwnedSemester(t);
  t.mock.method(db.subjectCatalog, 'findOne', async ({ where }) => {
    assert.deepEqual(where, { id: 'subject', trainingSystemId: 'system-1' });
    return { id: 'subject', ...values };
  });
  t.mock.method(db.trainingClassSubject, 'findOne', async ({ where }) => {
    assert.equal(where.trainingClassId, 'class');
    assert.equal(where.semesterId, 'semester');
    assert.deepEqual(where[db.Sequelize.Op.or], [{ subjectCode: 'M01' }, { catalogSubjectId: 'subject' }]);
    return null;
  });
  t.mock.method(db.trainingClassSubject, 'create', async (input) => input);
  assert.deepEqual(await classes.createSubject('class', 'semester', {
    catalogSubjectId: 'subject', subjectCode: 'FAKE', subjectName: 'Fake', credits: 99,
  }, commander), { trainingClassId: 'class', semesterId: 'semester', catalogSubjectId: 'subject', ...values });
});

test('assignment rejects another system catalog and classes outside commander ownership', async (t) => {
  stubOwnedSemester(t);
  t.mock.method(db.subjectCatalog, 'findOne', async () => null);
  t.mock.method(db.trainingClassSubject, 'create', () => { assert.fail('No insert on forbidden assignment'); });
  await assert.rejects(classes.createSubject('class', 'semester', { catalogSubjectId: 'foreign' }, commander), /Không tìm thấy môn/);
  t.mock.method(db.trainingClass, 'findOne', async () => null);
  await assert.rejects(classes.createSubject('class', 'semester', { catalogSubjectId: 'subject' }, commander), /Không tìm thấy lớp/);
});

test('duplicate assignment is rejected even after catalog code changes', async (t) => {
  stubOwnedSemester(t);
  t.mock.method(db.subjectCatalog, 'findOne', async () => ({ id: 'subject', ...values, subjectCode: 'NEW' }));
  t.mock.method(db.trainingClassSubject, 'findOne', async () => ({ catalogSubjectId: 'subject', subjectCode: 'OLD' }));
  await assert.rejects(classes.createSubject('class', 'semester', { catalogSubjectId: 'subject' }, commander), /Mã môn đã tồn tại/);
});

test('existing raw subject payload stays compatible for existing clients', async (t) => {
  stubOwnedSemester(t);
  t.mock.method(db.trainingClassSubject, 'findOne', async () => null);
  t.mock.method(db.trainingClassSubject, 'create', async (input) => input);
  assert.deepEqual(await classes.createSubject('class', 'semester', values, commander), {
    trainingClassId: 'class', semesterId: 'semester', ...values,
  });
});

test('assignment rejects a semester outside the class and handles concurrent duplicate inserts', async (t) => {
  stubOwnedSemester(t);
  t.mock.method(db.subjectCatalog, 'findOne', async () => ({ id: 'subject', ...values }));
  t.mock.method(db.trainingClassSubject, 'findOne', async () => null);
  t.mock.method(db.trainingClassSubject, 'create', async () => {
    throw Object.assign(new Error(), { name: 'SequelizeUniqueConstraintError' });
  });
  await assert.rejects(classes.createSubject('class', 'semester', { catalogSubjectId: 'subject' }, commander), /Mã môn đã tồn tại/);
  t.mock.method(db.trainingClassSemester, 'findOne', async () => null);
  await assert.rejects(classes.createSubject('class', 'other-semester', { catalogSubjectId: 'subject' }, commander), /Không tìm thấy học kỳ/);
});

test('validation accepts catalog selection and rejects empty or invalid fields', async () => {
  await validation.subject.validate({ catalogSubjectId: '9137ba6b-f3f4-4b4e-a10f-6476da193db4' });
  await validation.subject.validate(values);
  await assert.rejects(validation.subject.validate({}));
  await assert.rejects(validation.subject.validate({ catalogSubjectId: 'invalid-id' }));
  await assert.rejects(catalogValidation.subject.validate({ ...values, subjectCode: '   ' }));
  await assert.rejects(catalogValidation.subject.validate({ ...values, credits: 1.5 }));
});

test('catalog HTTP routes deny Admin, Student and HE_5 before any database access', async (t) => {
  const express = require('express');
  let user = commander;
  const app = express();
  app.use(express.json(), (req, res, next) => { req.user = user; next(); });
  app.use('/training-classes', require('../src/routes/training-program/trainingClass.route'));
  app.use((error, req, res, next) => { res.status(403).json({ message: error.message }); });
  t.mock.method(db.subjectCatalog, 'findAll', async () => []);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }));
  const endpoint = `http://127.0.0.1:${server.address().port}/training-classes/subject-catalog`;
  assert.equal((await fetch(endpoint)).status, 200);
  for (const deniedUser of [{ ...commander, role: 'ADMIN' }, { ...commander, role: 'STUDENT' }, { ...commander, trainingSystemCode: 'HE_5' }]) {
    user = deniedUser;
    for (const method of ['GET', 'POST', 'PUT']) {
      const url = method === 'PUT' ? `${endpoint}/9137ba6b-f3f4-4b4e-a10f-6476da193db4` : endpoint;
      assert.equal((await fetch(url, { method })).status, 403);
    }
  }
});
