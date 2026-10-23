const asyncHandler = require('express-async-handler');
const service = require('../services/semesterResult.service');
const { success, paginated, validateOrThrow } = require('../utils/response');
const validation = require('../validations/semesterResult.validation');

const create = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.create, req.body);
  const result = await service.create(req.body, req.user);
  return success(res, result, 'Tạo mới thành công', 201);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await service.getAll(req.query, req.user);
  return paginated(res, result.rows, result.pagination);
});

const getDetail = asyncHandler(async (req, res) => {
  const result = await service.getDetail(req.params.id, req.user);
  return success(res, result);
});

module.exports = { create, getAll, getDetail };
