const asyncHandler = require('express-async-handler');
const service = require('../services/militaryClass.service');
const { success, paginated, validateOrThrow } = require('../utils/response');
const validation = require('../validations/militaryClass.validation');

const create = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.create, req.body);
  return success(res, await service.create(req.body, req.userId), 'Tạo lớp thành công', 201);
});
const getAll = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.query, req.query);
  const result = await service.getAll(req.query, req.userId);
  return paginated(res, result.rows, result.pagination);
});
const getDetail = asyncHandler(async (req, res) => success(res, await service.getDetail(req.params.id, req.userId)));
const update = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.update, req.body);
  return success(res, await service.update(req.params.id, req.body, req.userId), 'Cập nhật lớp thành công');
});
const assignStudents = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.assignStudents, req.body);
  return success(res, await service.assignStudents(req.params.id, req.body.userIds, req.userId), 'Đã xếp học viên vào lớp');
});
const assignStudentsByCode = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.assignStudentsByCode, req.body);
  return success(res, await service.assignStudentsByCode(req.params.id, req.body.studentCodes, req.userId), 'Đã xếp học viên vào lớp');
});
const getStudents = asyncHandler(async (req, res) => {
  const result = await service.getStudents(req.params.id, req.query, req.userId);
  return paginated(res, result.rows, result.pagination);
});
const removeStudents = asyncHandler(async (req, res) => {
  return success(res, await service.removeStudent(req.params.id, req.params.userId, req.userId), 'Đã chuyển học viên khỏi lớp');
});
const deleteRecord = asyncHandler(async (req, res) => success(res, await service.delete(req.params.id, req.userId), 'Đã xóa lớp'));

module.exports = { create, getAll, getDetail, update, assignStudents, assignStudentsByCode, getStudents, removeStudents, delete: deleteRecord };
