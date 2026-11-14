const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/models');
const service = require('../src/services/training-program/trainingClassAcademic.service');
const lifecycle = require('../src/services/training-program/gradeLifecycle.service');
const validation = require('../src/validations/training-program/trainingClassAcademic.validation');
const user = { id: 'commander', trainingSystemId: 'system' };
const tx = { LOCK: { UPDATE: 'UPDATE' } };

const setup = (t) => {
  t.mock.method(db.trainingClass, 'findOne', async ({ where }) => {
    assert.deepEqual(where, { id: 'class', trainingSystemId: 'system', commanderId: 'commander' });
    return { id: 'class' };
  });
  t.mock.method(db.sequelize, 'transaction', async (callback) => callback(tx));
  t.mock.method(lifecycle, 'lockSemester', async () => ({ id: 'semester' }));
  t.mock.method(lifecycle, 'prepareWrite', async (classId, semesterId, reason, commander, transaction) => { assert.equal(transaction, tx); });
  t.mock.method(db.trainingClassSubject, 'findOne', async () => ({ id: 'subject', semesterId: 'semester' }));
  t.mock.method(db.profile, 'findOne', async ({ where }) => {
    assert.equal(where.trainingClassId, 'class');
    assert.equal(where.commanderId, user.id);
    return { id: where.id, code: where.id };
  });
  t.mock.method(db.profile, 'findByPk', async (id, options) => { assert.equal(options.transaction, tx); return { id }; });
  t.mock.method(db.trainingClassResult, 'findOne', async () => null);
  t.mock.method(db.trainingClassGradeProposal, 'findOne', async () => null);
};

test('bulk creates ungraded rows and edits existing rows in one transaction, including grade zero', async (t) => {
  setup(t);
  const writes = [];
  t.mock.method(db.trainingClassResult, 'findOne', async ({ where }) => where.profileId === 'b' ? {
    id: 'result-b', midtermScore: '6.00', finalScore: '8.00', update: async (values, options) => {
      assert.equal(options.transaction, tx); writes.push(values); return values;
    },
  } : null);
  t.mock.method(db.trainingClassResult, 'create', async (values, options) => { assert.equal(options.transaction, tx); writes.push(values); return values; });
  const saved = await service.saveSubjectGrades('class', 'semester', { subjectId: 'subject', attemptNo: 1, rows: [
    { profileId: 'a', midtermScore: 0, finalScore: 0 },
    { profileId: 'b', resultId: 'result-b', midtermScore: 8, finalScore: 9, expectedMidtermScore: 6, expectedFinalScore: 8 },
  ] }, user);
  assert.equal(saved.length, 2);
  assert.equal(writes[0].totalScore, 0);
  assert.equal(writes[1].totalScore, 8.5);
});

test('bulk refuses stale grades instead of overwriting a newer update', async (t) => {
  setup(t);
  t.mock.method(db.trainingClassResult, 'findOne', async () => ({ id: 'result', midtermScore: 9, finalScore: 9 }));
  await assert.rejects(service.saveSubjectGrades('class', 'semester', { subjectId: 'subject', attemptNo: 1, rows: [
    { profileId: 'a', resultId: 'result', midtermScore: 7, finalScore: 8, expectedMidtermScore: 6, expectedFinalScore: 6 },
  ] }, user), /điểm đã thay đổi/);
});

test('a newly created result after loading cannot be silently overwritten', async (t) => {
  setup(t);
  t.mock.method(db.trainingClassResult, 'findOne', async () => ({ id: 'new', midtermScore: 5, finalScore: 5 }));
  await assert.rejects(service.saveSubjectGrades('class', 'semester', { subjectId: 'subject', attemptNo: 1, rows: [
    { profileId: 'a', midtermScore: 8, finalScore: 9 },
  ] }, user), /điểm đã thay đổi/);
});

test('pending proposals block direct inserts', async (t) => {
  setup(t);
  t.mock.method(db.trainingClassGradeProposal, 'findOne', async () => ({ id: 'pending' }));
  await assert.rejects(service.saveSubjectGrades('class', 'semester', { subjectId: 'subject', attemptNo: 1, rows: [
    { profileId: 'a', midtermScore: 8, finalScore: 9 },
  ] }, user), /đề xuất chờ duyệt/);
});

test('a failure on a later row propagates through the single transaction', async (t) => {
  setup(t);
  const writes = [];
  let rolledBack = false;
  t.mock.method(db.sequelize, 'transaction', async (callback) => {
    try { return await callback(tx); } catch (error) { writes.length = 0; rolledBack = true; throw error; }
  });
  t.mock.method(db.trainingClassResult, 'create', async (values) => { writes.push(values); return values; });
  t.mock.method(lifecycle, 'prepareWrite', async (classId, semesterId, reason) => {
    if (!reason) throw new Error('Sau chốt cần lý do');
  });
  await assert.rejects(service.saveSubjectGrades('class', 'semester', { subjectId: 'subject', attemptNo: 1, rows: [
    { profileId: 'a', midtermScore: 8, finalScore: 9, reason: 'Theo bảng điểm' },
    { profileId: 'b', midtermScore: 7, finalScore: 8 },
  ] }, user), /cần lý do/);
  assert.equal(rolledBack, true);
  assert.equal(writes.length, 0);
});

test('cross-class students and subjects from another semester are rejected', async (t) => {
  setup(t);
  const payload = { subjectId: 'subject', attemptNo: 1, rows: [{ profileId: 'a', midtermScore: 8, finalScore: 9 }] };
  t.mock.method(db.profile, 'findOne', async () => null);
  await assert.rejects(service.saveSubjectGrades('class', 'semester', payload, user), /không thuộc lớp/);
  t.mock.method(db.trainingClassSubject, 'findOne', async () => ({ id: 'subject', semesterId: 'other' }));
  await assert.rejects(service.saveSubjectGrades('class', 'semester', payload, user), /không thuộc học kỳ/);
});

test('batch validation rejects duplicate students, absent expected scores and empty batches', async () => {
  const id = '9137ba6b-f3f4-4b4e-a10f-6476da193db4';
  const row = { profileId: id, midtermScore: 0, finalScore: 0 };
  await validation.bulkGrades.validate({ subjectId: id, attemptNo: 1, rows: [row] });
  await assert.rejects(validation.bulkGrades.validate({ subjectId: id, attemptNo: 1, rows: [] }));
  await assert.rejects(validation.bulkGrades.validate({ subjectId: id, attemptNo: 1, rows: [row, row] }));
  await assert.rejects(validation.bulkGrades.validate({ subjectId: id, attemptNo: 1, rows: [{ ...row, resultId: id }] }));
});
