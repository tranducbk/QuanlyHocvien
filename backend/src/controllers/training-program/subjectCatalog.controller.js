const asyncHandler = require('express-async-handler');
const service = require('../../services/training-program/subjectCatalog.service');
const validation = require('../../validations/training-program/subjectCatalog.validation');
const { success, validateOrThrow } = require('../../utils/response');

const list = asyncHandler(async (req, res) => success(res, await service.list(req.user)));
const create = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.subject, req.body);
  return success(res, await service.save(null, req.body, req.user), 'Đã tạo môn trong danh mục', 201);
});
const update = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.params, req.params);
  await validateOrThrow(validation.subject, req.body);
  return success(res, await service.save(req.params.subjectId, req.body, req.user), 'Đã cập nhật danh mục môn');
});

module.exports = { list, create, update };
