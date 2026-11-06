const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../src/models');
const programService = require('../src/services/training-program/trainingProgram.service.js');
const programValidation = require('../src/validations/training-program/trainingProgram.validation.js');
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
    startYear: 2022,
    endYear: 2026,
  }, { trainingSystemId: 'sys-3' });

  assert.ok(createdPayload);
  assert.equal(createdPayload.name, 'Khóa 28');
  assert.equal(createdPayload.versionCode, 'KHOA-28');
  assert.equal(createdPayload.startYear, 2022);
  assert.equal(createdPayload.endYear, 2026);
});

test('Bắt buộc thời gian bắt đầu và kết thúc hợp lệ khi tạo khóa', async (t) => {
  restoreModels(t);
  db.trainingProgram.findOne = async () => ({ id: 'prog-1', trainingSystemId: 'sys-3' });
  db.trainingSystem.findByPk = async () => ({ id: 'sys-3', code: 'HE_3', isActive: true });

  const validYears = {
    name: 'Khóa 28',
    startYear: 2022,
    endYear: 2026,
  };
  await assert.rejects(
    programValidation.createVersion.validate({ ...validYears, startYear: undefined }),
    /Năm bắt đầu khóa học là bắt buộc/,
  );
  await assert.rejects(
    programValidation.createVersion.validate({ ...validYears, endYear: undefined }),
    /Năm kết thúc khóa học là bắt buộc/,
  );
  await assert.rejects(
    programValidation.createVersion.validate({
      ...validYears,
      startYear: 2026,
      endYear: 2022,
    }),
    /Năm kết thúc phải sau năm bắt đầu/,
  );
  await assert.rejects(
    programValidation.createVersion.validate({ ...validYears, startYear: 1944 }),
    /Năm bắt đầu khóa học không được trước năm 1945/,
  );
  await assert.rejects(
    programValidation.createVersion.validate({
      ...validYears,
      startYear: 2101,
      endYear: 2102,
    }),
    /không được sau năm 2100/,
  );
  await assert.rejects(
    programValidation.createVersion.validateAt('endYear', { ...validYears, endYear: 1944 }),
    /Năm kết thúc khóa học không được trước năm 1945/,
  );
  await programValidation.createVersion.validate({
    ...validYears,
    startYear: 1945,
    endYear: 2100,
  });

  let created = false;
  db.curriculumVersion.findOne = async () => null;
  db.curriculumVersion.create = async (payload) => {
    created = true;
    return payload;
  };
  await assert.rejects(
    programService.createVersion('prog-1', { name: 'Khóa thiếu năm' }, { trainingSystemId: 'sys-3' }),
    /Năm bắt đầu và năm kết thúc khóa học là bắt buộc/,
  );
  await assert.rejects(
    programService.createVersion('prog-1', {
      ...validYears,
      startYear: 2026,
      endYear: 2022,
    }, { trainingSystemId: 'sys-3' }),
    /Năm kết thúc phải sau năm bắt đầu/,
  );
  await assert.rejects(
    programService.createVersion('prog-1', {
      ...validYears,
      endYear: 2101,
    }, { trainingSystemId: 'sys-3' }),
    /Năm khóa học phải nằm trong khoảng 1945–2100/,
  );
  assert.equal(created, false);
});

test('Cập nhật tên và thời gian khóa chỉ trong chương trình thuộc Hệ của Chỉ huy', async (t) => {
  restoreModels(t);
  db.trainingProgram.findOne = async () => ({ id: 'prog-1', trainingSystemId: 'sys-3' });
  db.trainingSystem.findByPk = async () => ({ id: 'sys-3', code: 'HE_3' });

  let updatedData = null;
  db.curriculumVersion.findOne = async ({ where }) => {
    assert.deepEqual(where, { id: 'version-1', trainingProgramId: 'prog-1' });
    return {
      update: async (data) => {
        updatedData = data;
        return { id: 'version-1', ...data };
      },
    };
  };

  const updated = await programService.updateVersion(
    'prog-1',
    'version-1',
    {
      name: '  Khóa trinh sát  ',
      startYear: 2022,
      endYear: 2026,
    },
    { trainingSystemId: 'sys-3' },
  );

  assert.deepEqual(updatedData, {
    name: 'Khóa trinh sát',
    startYear: 2022,
    endYear: 2026,
  });
  assert.equal(updated.name, 'Khóa trinh sát');
});

test('Không cho cập nhật khóa với năm bắt đầu hoặc kết thúc không hợp lệ', async (t) => {
  restoreModels(t);
  db.trainingProgram.findOne = async () => ({ id: 'prog-1', trainingSystemId: 'sys-3' });
  db.trainingSystem.findByPk = async () => ({ id: 'sys-3', code: 'HE_3' });
  db.curriculumVersion.findOne = async () => ({
    update: async () => assert.fail('Không được cập nhật khóa với ngày không hợp lệ'),
  });

  const validName = { name: 'Khóa trinh sát' };
  await assert.rejects(
    programValidation.updateVersion.validate({
      ...validName,
      endYear: 2026,
    }),
    /Năm bắt đầu khóa học là bắt buộc/,
  );
  await assert.rejects(
    programValidation.updateVersion.validate({
      ...validName,
      startYear: 2022,
    }),
    /Năm kết thúc khóa học là bắt buộc/,
  );
  await assert.rejects(
    programValidation.updateVersion.validate({
      ...validName,
      startYear: 2026,
      endYear: 2022,
    }),
    /Năm kết thúc phải sau năm bắt đầu/,
  );
  await assert.rejects(
    programService.updateVersion('prog-1', 'version-1', {
      ...validName,
      startYear: 2026,
      endYear: 2022,
    }, { trainingSystemId: 'sys-3' }),
    /Năm kết thúc phải sau năm bắt đầu/,
  );
});

test('Không cho đổi tên khóa thuộc chương trình khác', async (t) => {
  restoreModels(t);
  db.trainingProgram.findOne = async () => ({ id: 'prog-1', trainingSystemId: 'sys-3' });
  db.trainingSystem.findByPk = async () => ({ id: 'sys-3', code: 'HE_3' });
  db.curriculumVersion.findOne = async () => null;

  await assert.rejects(
    programService.updateVersion(
      'prog-1',
      'version-from-another-program',
      {
        name: 'Khóa trinh sát',
        startYear: 2022,
        endYear: 2026,
      },
      { trainingSystemId: 'sys-3' },
    ),
    (error) => error.message === 'Không tìm thấy khóa đào tạo',
  );
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
    startYear: 2022,
    endYear: 2026,
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
