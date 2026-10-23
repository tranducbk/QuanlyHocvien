const asyncHandler = require('express-async-handler');
const service = require('../services/trainingClass.service');
const validation = require('../validations/trainingClass.validation');
const { success, validateOrThrow } = require('../utils/response');

const listOptions = asyncHandler(async (_req, res) => success(res, await service.listOptions()));
const list = asyncHandler(async (_req, res) => success(res, await service.list()));
const create = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.create, req.body);
  return success(res, await service.create(req.body), 'Đã tạo lớp đào tạo', 201);
});
const assignCommander = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.params, req.params);
  await validateOrThrow(validation.commander, req.body);
  return success(res, await service.assignCommander(req.params.id, req.body.commanderId), 'Đã cập nhật Chỉ huy');
});

module.exports = { listOptions, list, create, assignCommander };
