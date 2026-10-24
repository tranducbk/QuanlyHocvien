const asyncHandler = require('express-async-handler');
const service = require('../services/trainingClassRecords.service');
const validation = require('../validations/trainingClassRecords.validation');
const { success, validateOrThrow } = require('../utils/response');

const listAchievements = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classParams, req.params);
  return success(res, await service.listAchievements(req.params.id, req.user));
});
const createAchievement = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classParams, req.params);
  await validateOrThrow(validation.achievementCreate, req.body);
  return success(res, await service.createAchievement(req.params.id, req.body, req.user), 'Đã thêm thành tích', 201);
});
const updateAchievement = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.recordParams, req.params);
  await validateOrThrow(validation.achievementUpdate, req.body);
  return success(res, await service.updateAchievement(req.params.id, req.params.recordId, req.body, req.user), 'Đã cập nhật thành tích');
});
const deleteAchievement = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.recordParams, req.params);
  return success(res, await service.deleteAchievement(req.params.id, req.params.recordId, req.user));
});
const listDutySchedules = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classParams, req.params);
  return success(res, await service.listDutySchedules(req.params.id, req.user));
});
const createDutySchedule = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classParams, req.params);
  await validateOrThrow(validation.dutyCreate, req.body);
  return success(res, await service.createDutySchedule(req.params.id, req.body, req.user), 'Đã phân công lịch trực', 201);
});
const updateDutySchedule = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.recordParams, req.params);
  await validateOrThrow(validation.dutyUpdate, req.body);
  return success(res, await service.updateDutySchedule(req.params.id, req.params.recordId, req.body, req.user), 'Đã cập nhật lịch trực');
});
const deleteDutySchedule = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.recordParams, req.params);
  return success(res, await service.deleteDutySchedule(req.params.id, req.params.recordId, req.user));
});

module.exports = { listAchievements, createAchievement, updateAchievement, deleteAchievement, listDutySchedules, createDutySchedule, updateDutySchedule, deleteDutySchedule };
