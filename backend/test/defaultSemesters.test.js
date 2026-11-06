const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/models');
const { semesterRows, ensureDefaultSemesters } = require('../src/services/training-program/defaultSemesters');
const classService = require('../src/services/training-program/trainingClass.service');
const yearService = require('../src/services/academic-years/semester.service');

test('2025–2029 generates exactly eight semesters across four consecutive years', () => {
  const rows = semesterRows({ id: 'class', startYear: 2025, endYear: 2029 });
  assert.deepEqual(rows.map((row) => [row.schoolYear, row.code]), [
    ['2025-2026', 1], ['2025-2026', 2], ['2026-2027', 1], ['2026-2027', 2],
    ['2027-2028', 1], ['2027-2028', 2], ['2028-2029', 1], ['2028-2029', 2],
  ]);
  assert.ok(rows.every((row) => row.trainingClassId === 'class'));
  for (const [startYear, endYear] of [[null, 2029], [2025, null], [2025, 2025], [2029, 2025], [NaN, 2029]]) {
    assert.deepEqual(semesterRows({ id: 'class', startYear, endYear }), []);
  }
});

test('default creation uses the class transaction and never overwrites existing semesters', async (t) => {
  const transaction = {};
  t.mock.method(db.trainingClassSemester, 'bulkCreate', async (rows, options) => {
    assert.equal(rows.length, 2);
    assert.equal(options.transaction, transaction);
    assert.equal(options.ignoreDuplicates, true);
    assert.ok(rows.every((row) => row.code === 1 || row.code === 2));
  });
  await ensureDefaultSemesters({ id: 'class', startYear: 2025, endYear: 2026 }, transaction);
});

test('updating class duration adds missing defaults in the same transaction', async (t) => {
  const transaction = {};
  const original = { id: 'class', trainingSystemId: 'system', code: 'C1', name: 'Lớp', startYear: 2025, endYear: 2029, trainingProgramId: 'program', curriculumVersionId: 'version' };
  t.mock.method(db.trainingClass, 'findOne', async ({ where }) => {
    assert.deepEqual(where, { id: 'class', trainingSystemId: 'system', commanderId: 'commander' });
    return { ...original, get: () => original, update: async (values, options) => {
      assert.equal(options.transaction, transaction);
      return { ...original, ...values };
    } };
  });
  t.mock.method(db.trainingSystem, 'findByPk', async () => ({ id: 'system', code: 'HE_1', isActive: true }));
  t.mock.method(db.trainingProgram, 'findByPk', async () => ({ id: 'program', trainingSystemId: 'system', isActive: true }));
  t.mock.method(db.curriculumVersion, 'findByPk', async () => ({ trainingProgramId: 'program', startYear: 2025, endYear: 2030 }));
  t.mock.method(db.sequelize, 'transaction', async (callback) => callback(transaction));
  t.mock.method(db.trainingClassSemester, 'bulkCreate', async (rows, options) => {
    assert.equal(rows.length, 10);
    assert.equal(options.transaction, transaction);
    assert.equal(options.ignoreDuplicates, true);
  });
  await classService.updateClass('class', { name: 'Tên mới' }, { id: 'commander', trainingSystemId: 'system' });
});

test('ordinary semesters cannot be manually created in cohort classes', async (t) => {
  t.mock.method(db.trainingClass, 'findOne', async () => ({ trainingSystemId: 'system' }));
  t.mock.method(db.trainingSystem, 'findByPk', async () => ({ code: 'HE_3' }));
  await assert.rejects(classService.createSemester('class', { code: 1, schoolYear: '2025-2026' }, {}), /tự động/);
});

test('HE_5 class can add summer only in its duration', async (t) => {
  t.mock.method(db.trainingClass, 'findOne', async () => ({ trainingSystemId: 'system', startYear: 2025, endYear: 2029 }));
  t.mock.method(db.trainingSystem, 'findByPk', async () => ({ code: 'HE_5' }));
  t.mock.method(db.trainingClassSemester, 'findOne', async () => null);
  t.mock.method(db.trainingClassSemester, 'create', async (data) => data);
  const result = await classService.createSemester('class', { code: 3, schoolYear: '2025-2026' }, {});
  assert.equal(result.code, 3);
  await assert.rejects(classService.createSemester('class', { code: 3, schoolYear: '2029-2030' }, {}), /niên khóa/);
});

test('HE_5 school-year creation atomically creates HK1 and HK2', async (t) => {
  const transaction = {};
  t.mock.method(db.schoolYear, 'findOne', async () => null);
  t.mock.method(db.sequelize, 'transaction', async (callback) => callback(transaction));
  t.mock.method(db.schoolYear, 'create', async (values, options) => {
    assert.equal(options.transaction, transaction);
    return { id: 'year', ...values };
  });
  t.mock.method(db.semester, 'bulkCreate', async (rows, options) => {
    assert.equal(options.transaction, transaction);
    assert.deepEqual(rows, [{ schoolYearId: 'year', code: 1 }, { schoolYearId: 'year', code: 2 }]);
  });
  await yearService.createSchoolYear({ schoolYear: '2025-2026' });
  await assert.rejects(yearService.createSchoolYear({ schoolYear: '2025-2027' }), /liên tiếp/);
});

test('HE_5 ordinary semester creation is blocked while summer stays available', async (t) => {
  const validation = require('../src/validations/academic-years/semester.validation');
  await validation.createTerm.validate({ schoolYear: '2025-2026', term: 3 });
  await validation.create.validate({ schoolYear: '2025-2026', code: 3 });
  await assert.rejects(validation.createTerm.validate({ schoolYear: '2025-2026', term: 1 }));
  t.mock.method(db.schoolYear, 'findOne', async () => ({ id: 'year', schoolYear: '2025-2026' }));
  t.mock.method(db.semester, 'findOne', async () => null);
  t.mock.method(db.semester, 'create', async (row) => row);
  await assert.rejects(yearService.createTerm({ schoolYear: '2025-2026', term: 1 }), /kỳ hè/);
  await assert.rejects(yearService.create({ schoolYear: '2025-2026', code: 2 }), /kỳ hè/);
  assert.equal((await yearService.createTerm({ schoolYear: '2025-2026', term: 3 })).code, 3);
});
