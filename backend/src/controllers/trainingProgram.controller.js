const asyncHandler = require('express-async-handler');
const service = require('../services/trainingProgram.service');
const validation = require('../validations/trainingProgram.validation');
const { success, validateOrThrow } = require('../utils/response');

const listSystems = asyncHandler(async (_req, res) => success(res, await service.listSystems()));
const listPrograms = asyncHandler(async (_req, res) => success(res, await service.listPrograms()));
const createProgram = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.createProgram, req.body);
  return success(res, await service.createProgram(req.body), 'Đã tạo chương trình đào tạo', 201);
});
const createVersion = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.versionParams, req.params);
  await validateOrThrow(validation.createVersion, req.body);
  return success(res, await service.createVersion(req.params.id, req.body), 'Đã tạo phiên bản chương trình', 201);
});

module.exports = { listSystems, listPrograms, createProgram, createVersion };
