const asyncHandler = require('express-async-handler');
const service = require('../services/class.service');
const { success, paginated, validateOrThrow } = require('../utils/response');
const s = require('../validations/class.validation');

const create = asyncHandler(async (req, res) => {
  await validateOrThrow(s.create, req.body);
  const result = await service.create(req.body);
  return success(res, result, 'Tạo mới thành công', 201);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await service.getAll(req.query);

  const educationLevels = [];
  const organizations = [];
  const universities = [];
  const elIds = new Set();
  const orgIds = new Set();
  const uniIds = new Set();

  const rows = result.rows.map(r => {
    const plain = r.get({ plain: true });
    const el = plain.EducationLevel;

    if (el && !elIds.has(el.id)) {
      elIds.add(el.id);
      educationLevels.push(el);
    }

    const org = el?.Organization;
    if (org && !orgIds.has(org.id)) {
      orgIds.add(org.id);
      organizations.push(org);
    }

    const uni = org?.University;
    if (uni && !uniIds.has(uni.id)) {
      uniIds.add(uni.id);
      universities.push(uni);
    }

    return {
      id: plain.id,
      className: plain.className,
      studentCount: plain.studentCount,
      educationLevelId: plain.educationLevelId,
      levelName: el?.levelName || null,
      organizationName: org?.organizationName || null,
      organizationId: org?.id || null,
      universityName: uni?.universityName || null,
      universityId: uni?.id || null,
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  });

  return paginated(res, rows, result.pagination, undefined, 200, {
    educationLevels,
    organizations,
    universities,
  });
});

const getDetail = asyncHandler(async (req, res) => {
  const result = await service.getDetail(req.params.id);
  return success(res, result);
});

const update = asyncHandler(async (req, res) => {
  await validateOrThrow(s.update, req.body);
  const result = await service.update(req.params.id, req.body);
  return success(res, result, 'Cập nhật thành công');
});

const getStudents = asyncHandler(async (req, res) => {
  const result = await service.getStudents(req.params.id, req.query);
  return paginated(res, result.rows, result.pagination);
});

const deleteRecord = asyncHandler(async (req, res) => {
  await service.delete(req.params.id);
  return success(res, null, 'Xóa thành công');
});

const assignStudents = asyncHandler(async (req, res) => {
  await validateOrThrow(s.assignStudents, req.body);
  const result = req.body.studentCodes
    ? await service.assignStudentsByCodes(req.params.id, req.body.studentCodes || [])
    : await service.assignStudents(req.params.id, req.body.userIds || []);
  return success(res, result, 'Thêm học viên vào lớp thành công');
});

const assignStudentsBatch = asyncHandler(async (req, res) => {
  await validateOrThrow(s.assignStudentsByCodes, req.body);
  const result = await service.assignStudentsByCodes(req.params.id, req.body.studentCodes || []);
  return success(res, result, 'Thêm học viên vào lớp hàng loạt thành công');
});

const removeStudent = asyncHandler(async (req, res) => {
  const result = await service.removeStudent(req.params.id, req.params.userId);
  return success(res, result, 'Đã bỏ học viên khỏi lớp');
});

const removeStudents = asyncHandler(async (req, res) => {
  await validateOrThrow(s.removeStudents, req.body);
  const result = await service.removeStudents(req.params.id, req.body.userIds || []);
  return success(res, result, 'Đã bỏ học viên khỏi lớp');
});

module.exports = { create, getAll, getDetail, getStudents, update, delete: deleteRecord, assignStudents, assignStudentsBatch, removeStudents, removeStudent };
