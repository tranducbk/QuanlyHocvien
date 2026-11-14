const asyncHandler = require('express-async-handler');
const service = require('../../services/training-program/university.service.js');
const { success, paginated, validateOrThrow } = require('../../utils/response');
const s = require('../../validations/training-program/university.validation.js');

const create = asyncHandler(async (req, res) => {
  await validateOrThrow(s.create, req.body);
  const result = await service.create(req.body);
  return success(res, result, 'Tạo mới thành công', 201);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await service.getAll(req.query);
  return paginated(res, result.rows, result.pagination);
});

const getDetail = asyncHandler(async (req, res) => {
  const result = await service.getDetail(req.params.id);
  return success(res, result);
});

const getHierarchy = asyncHandler(async (req, res) => {
  const result = await service.getHierarchy();
  return success(res, result);
});

const update = asyncHandler(async (req, res) => {
  await validateOrThrow(s.update, req.body);
  const result = await service.update(req.params.id, req.body);
  return success(res, result, 'Cập nhật thành công');
});

const deleteRecord = asyncHandler(async (req, res) => {
  await service.delete(req.params.id);
  return success(res, null, 'Xóa thành công');
});

const availableStudents = asyncHandler(async (req, res) => {
  await validateOrThrow(s.params, req.params);
  await validateOrThrow(s.availableStudents, req.query);
  const query = s.availableStudents.cast(req.query, { stripUnknown: true });
  const result = await service.availableStudents(req.params.id, query, req.user);
  return paginated(res, result.rows, result.pagination);
});
const addStudents = asyncHandler(async (req, res) => {
  await validateOrThrow(s.params, req.params);
  await validateOrThrow(s.addStudents, req.body);
  return success(res, await service.addStudents(req.params.id, req.body.profileIds, req.user), 'Đã thêm học viên vào trường');
});

module.exports = { create, getAll, getDetail, getHierarchy, update, delete: deleteRecord, availableStudents, addStudents };
