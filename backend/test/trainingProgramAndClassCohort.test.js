const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/models');
const programService = require('../src/services/training-program/trainingProgram.service.js');
const classService = require('../src/services/training-program/trainingClass.service.js');

const restoreModels = (t) => {
  const originals = {
    findSystem: db.trainingSystem.findByPk,
    findProgram: db.trainingProgram.findOne,
    createProgram: db.trainingProgram.create,
    findVersion: db.curriculumVersion.findOne,
    findVersionPk: db.curriculumVersion.findByPk,
    createVersion: db.curriculumVersion.create,
    findClass: db.trainingClass.findOne,
    createClass: db.trainingClass.create,
    transaction: db.sequelize.transaction,
    bulkSemesters: db.trainingClassSemester.bulkCreate,
  };
  t.after(() => {
    db.trainingSystem.findByPk = originals.findSystem;
    db.trainingProgram.findOne = originals.findProgram;
    db.trainingProgram.create = originals.createProgram;
    db.curriculumVersion.findOne = originals.findVersion;
    db.curriculumVersion.findByPk = originals.findVersionPk;
    db.curriculumVersion.create = originals.createVersion;
    db.trainingClass.findOne = originals.findClass;
    db.trainingClass.create = originals.createClass;
    db.sequelize.transaction = originals.transaction;
    db.trainingClassSemester.bulkCreate = originals.bulkSemesters;
  });
};

test('Tạo chương trình đào tạo không cần mã (mã tự sinh theo tên)', async (t) => {
  restoreModels(t);
  db.trainingSystem.findByPk = async () => ({ id: 'sys-3', code: 'HE_3', isActive: true });
  db.trainingProgram.findOne = async () => null;

  let createdPayload = null;
  db.trainingProgram.create = async (payload) => {
    createdPayload = payload;
    return payload;
  };

  await programService.createProgram({ name: 'Trinh sát Đặc nhiệm', description: 'Mô tả' }, { trainingSystemId: 'sys-3' });

  assert.ok(createdPayload);
  assert.equal(createdPayload.name, 'Trinh sát Đặc nhiệm');
  assert.equal(createdPayload.code, 'TRINH-SAT-DAC-NHIEM');
});

test('Tạo khóa đào tạo không cần mã (mã tự sinh theo tên)', async (t) => {
  restoreModels(t);
  db.trainingProgram.findOne = async () => ({ id: 'prog-1', trainingSystemId: 'sys-3' });
  db.trainingSystem.findByPk = async () => ({ id: 'sys-3', code: 'HE_3', isActive: true });
  db.curriculumVersion.findOne = async () => null;

  let createdPayload = null;
  db.curriculumVersion.create = async (payload) => {
    createdPayload = payload;
    return payload;
  };

  await programService.createVersion('prog-1', {
    name: 'Khóa 28',
    effectiveFrom: '2022-09-01',
    effectiveTo: '2026-06-30',
  }, { trainingSystemId: 'sys-3' });

  assert.ok(createdPayload);
  assert.equal(createdPayload.name, 'Khóa 28');
  assert.equal(createdPayload.versionCode, 'KHOA-28');
  assert.equal(createdPayload.effectiveFrom, '2022-09-01');
  assert.equal(createdPayload.effectiveTo, '2026-06-30');
});

test('Tạo lớp thuộc Hệ 1,3,4,7 tự động lấy startYear và endYear dựa theo khóa', async (t) => {
  restoreModels(t);
  db.sequelize.transaction = async (callback) => callback({});
  db.trainingClassSemester.bulkCreate = async (rows) => {
    assert.equal(rows.length, 8);
    assert.equal(rows[0].schoolYear, '2022-2023');
    assert.equal(rows[7].schoolYear, '2025-2026');
  };
  db.trainingSystem.findByPk = async () => ({ id: 'sys-3', code: 'HE_3', isActive: true });
  db.trainingProgram.findByPk = async () => ({ id: 'prog-1', isActive: true, trainingSystemId: 'sys-3' });
  db.curriculumVersion.findByPk = async () => ({
    id: 'ver-1',
    trainingProgramId: 'prog-1',
    effectiveFrom: '2022-09-01',
    effectiveTo: '2026-06-30',
  });
  db.trainingClass.findOne = async () => null;

  let createdClassPayload = null;
  db.trainingClass.create = async (payload) => {
    createdClassPayload = payload;
    return payload;
  };

  await classService.create({
    name: 'Lớp Trinh sát 1',
    trainingProgramId: 'prog-1',
    curriculumVersionId: 'ver-1',
  }, { id: 'commander-1', trainingSystemId: 'sys-3' });

  assert.ok(createdClassPayload);
  assert.equal(createdClassPayload.startYear, 2022);
  assert.equal(createdClassPayload.endYear, 2026);
});

