const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/models');
const lifecycle = require('../src/services/training-program/gradeLifecycle.service');
const academic = require('../src/services/training-program/trainingClassAcademic.service');
const commander = { id: 'commander', trainingSystemId: 'system', role: 'COMMANDER' };
const tx = { LOCK: { UPDATE: 'UPDATE' } };

test('writes lock semester and require a nonblank reason after closure', async (t) => {
  let closed = false;
  let context;
  t.mock.method(db.trainingClassSemester, 'findOne', async (options) => {
    assert.deepEqual(options.where, { id: 'semester', trainingClassId: 'class' });
    assert.equal(options.lock, 'UPDATE');
    return { gradeClosedAt: closed ? new Date() : null };
  });
  t.mock.method(db.sequelize, 'query', async (sql, options) => { context = options; });
  await lifecycle.prepareWrite('class', 'semester', undefined, commander, tx);
  assert.deepEqual(context.replacements, { editor: commander.id, reason: '' });
  closed = true;
  await assert.rejects(lifecycle.prepareWrite('class', 'semester', '    ', commander, tx), /cần lý do/);
  await lifecycle.prepareWrite('class', 'semester', '  Theo bảng điểm xác nhận  ', commander, tx);
  assert.equal(context.transaction, tx);
  assert.equal(context.replacements.reason, 'Theo bảng điểm xác nhận');
});

const mockClosure = (t, { closed = false, pending = 1, subjects = 1 } = {}) => {
  t.mock.method(db.sequelize, 'transaction', async (callback) => callback(tx));
  t.mock.method(db.trainingClass, 'findOne', async ({ where }) => {
    assert.deepEqual(where, { id: 'class', commanderId: 'commander', trainingSystemId: 'system' });
    return { id: 'class' };
  });
  t.mock.method(db.trainingClassSemester, 'findOne', async () => ({
    gradeClosedAt: closed ? new Date() : null,
    update: async (data, options) => { assert.equal(options.transaction, tx); return data; },
  }));
  t.mock.method(db.profile, 'findAll', async () => [{ id: 'student' }]);
  t.mock.method(db.trainingClassSubject, 'findAll', async () => subjects ? [{ id: 'subject' }] : []);
  t.mock.method(db.trainingClassResult, 'findAll', async () => []);
  t.mock.method(db.trainingClassGradeProposal, 'count', async () => pending);
};

test('closure reports missing grades and pending proposals; requires explicit confirmation', async (t) => {
  mockClosure(t);
  const status = await lifecycle.status('class', 'semester', commander);
  assert.equal(status.missing, 1);
  assert.equal(status.pending, 1);
  await assert.rejects(lifecycle.close('class', 'semester', false, commander), /Còn 1.*1 đề xuất/);
  const result = await lifecycle.close('class', 'semester', true, commander);
  assert.equal(result.gradeClosedBy, 'commander');
  assert.ok(result.gradeClosedAt instanceof Date);
});

test('closure refuses empty semester or a second close', async (t) => {
  mockClosure(t, { subjects: 0 });
  await assert.rejects(lifecycle.close('class', 'semester', true, commander), /Chưa có học viên hoặc môn/);
  t.mock.method(db.trainingClassSemester, 'findOne', async () => ({ gradeClosedAt: new Date() }));
  await assert.rejects(lifecycle.close('class', 'semester', true, commander), /đã chốt/);
});

test('history and closure reject classes outside the authenticated system/commander', async (t) => {
  t.mock.method(db.trainingClass, 'findOne', async () => null);
  t.mock.method(db.sequelize, 'transaction', async (callback) => callback(tx));
  await assert.rejects(lifecycle.history('foreign-class', 'result', commander), /Không tìm thấy lớp/);
  await assert.rejects(lifecycle.close('foreign-class', 'semester', false, commander), /Không tìm thấy lớp/);
});

test('grade edits recalculate totals and keep identity, attempt and original author unchanged', async (t) => {
  t.mock.method(db.trainingClass, 'findOne', async () => ({ id: 'class' }));
  t.mock.method(db.sequelize, 'transaction', async (callback) => callback(tx));
  t.mock.method(lifecycle, 'prepareWrite', async (classId, semesterId, reason, editor, transaction) => {
    assert.equal(semesterId, 'semester');
    assert.equal(reason, 'Sửa theo bảng điểm');
    assert.equal(transaction, tx);
  });
  t.mock.method(db.trainingClassResult, 'findOne', async (options) => ({
    semesterId: 'semester', update: async (values, options) => {
      assert.equal(options.transaction, tx);
      assert.equal(values.totalScore, 8);
      assert.equal(values.classification, 'EXCELLENT');
      for (const field of ['enteredBy', 'profileId', 'subjectId', 'attemptNo', 'semesterId']) assert.equal(values[field], undefined);
      return values;
    },
  }));
  await academic.updateResult('class', 'result', { midtermScore: 7, finalScore: 9, reason: 'Sửa theo bảng điểm' }, commander);
});

test('missing reason blocks an edit before any result write', async (t) => {
  t.mock.method(db.trainingClass, 'findOne', async () => ({ id: 'class' }));
  t.mock.method(db.trainingClassResult, 'findOne', async () => ({ semesterId: 'semester', update: () => assert.fail('Must not write') }));
  t.mock.method(db.trainingClassSemester, 'findOne', async () => ({ gradeClosedAt: new Date() }));
  t.mock.method(db.sequelize, 'transaction', async (callback) => callback(tx));
  await assert.rejects(academic.updateResult('class', 'result', { midtermScore: 7, finalScore: 9 }, commander), /cần lý do/);
});

test('zero is an official grade, so closure does not count it as missing', async (t) => {
  mockClosure(t, { pending: 0 });
  t.mock.method(db.trainingClassResult, 'findAll', async () => [{ profileId: 'student', subjectId: 'subject', totalScore: 0 }]);
  assert.equal((await lifecycle.status('class', 'semester', commander)).missing, 0);
});

test('new grade lifecycle routes reject Student, Admin and HE_5 callers', async (t) => {
  const express = require('express');
  let user;
  const app = express();
  app.use(express.json(), (req, res, next) => { req.user = user; next(); });
  app.use('/training-classes', require('../src/routes/training-program/trainingClass.route'));
  app.use((error, req, res, next) => res.status(error.statusCode || 500).json({ message: error.message }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}/training-classes/class`;
  for (const deniedUser of [
    { role: 'STUDENT', trainingSystemCode: 'HE_1' },
    { role: 'ADMIN', trainingSystemCode: 'HE_1' },
    { role: 'COMMANDER', trainingSystemCode: 'HE_5' },
  ]) {
    user = deniedUser;
    for (const [path, method] of [
      ['/results/result', 'PUT'], ['/results/result/history', 'GET'],
      ['/semesters/semester/grade-status', 'GET'], ['/semesters/semester/close-grades', 'POST'],
      ['/semesters/semester/subject-grades', 'POST'],
    ]) assert.equal((await fetch(base + path, { method })).status, 403);
  }
});
