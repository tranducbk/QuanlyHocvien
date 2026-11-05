const asyncHandler = require('express-async-handler');
const service = require('../../services/training-program/trainingProgram.service.js');
const validation = require('../../validations/training-program/trainingProgram.validation.js');
const { success, validateOrThrow } = require('../../utils/response');

const listPrograms = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.listProgramsQuery, req.query);
  return success(res, await service.listPrograms(req.user, req.query));
});
const createProgram = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.createProgram, req.body);
  return success(res, await service.createProgram(req.body, req.user), 'Đã tạo chương trình đào tạo', 201);
});
const updateProgram = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.versionParams, req.params);
  await validateOrThrow(validation.updateProgram, req.body);
  return success(res, await service.updateProgram(req.params.id, req.body, req.user), 'Đã cập nhật chương trình đào tạo');
});
const updateProgramStatus = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.versionParams, req.params);
  await validateOrThrow(validation.updateProgramStatus, req.body);
  return success(res, await service.updateProgramStatus(req.params.id, req.body.isActive, req.user), 'Đã cập nhật trạng thái chương trình');
});
const createVersion = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.versionParams, req.params);
  await validateOrThrow(validation.createVersion, req.body);
  return success(res, await service.createVersion(req.params.id, req.body, req.user), 'Đã tạo khóa chương trình', 201);
});

module.exports = { listPrograms, createProgram, updateProgram, updateProgramStatus, createVersion };
