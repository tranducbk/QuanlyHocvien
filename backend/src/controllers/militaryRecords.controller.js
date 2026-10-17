const asyncHandler = require('express-async-handler');
const service = require('../services/militaryRecords.service');
const validation = require('../validations/militaryRecords.validation');
const { success, validateOrThrow } = require('../utils/response');

const listAchievements = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classQuery, req.query);
  return success(res, await service.listClassAchievements(req.query.classId, req.userId));
});
const myAchievements = asyncHandler(async (req, res) =>
  success(res, await service.listStudentAchievements(req.userId)),
);
const createAchievement = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.achievementCreate, req.body);
  return success(
    res,
    await service.createAchievement(req.params.classId, req.body, req.userId),
    'Đã thêm thành tích',
    201,
  );
});
const updateAchievement = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.achievementUpdate, req.body);
  return success(
    res,
    await service.updateAchievement(req.params.id, req.body, req.userId),
    'Đã cập nhật thành tích',
  );
});
const deleteAchievement = asyncHandler(async (req, res) =>
  success(res, await service.deleteAchievement(req.params.id, req.userId)),
);
const listDutySchedules = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classQuery, req.query);
  return success(res, await service.listClassDutySchedules(req.query.classId, req.userId));
});
const createDutySchedule = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.dutyCreate, req.body);
  return success(
    res,
    await service.createDutySchedule(req.params.classId, req.body, req.userId),
    'Đã phân công lịch trực',
    201,
  );
});
const updateDutySchedule = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.dutyUpdate, req.body);
  return success(
    res,
    await service.updateDutySchedule(req.params.id, req.body, req.userId),
    'Đã cập nhật lịch trực',
  );
});
const deleteDutySchedule = asyncHandler(async (req, res) =>
  success(res, await service.deleteDutySchedule(req.params.id, req.userId)),
);

module.exports = {
  listAchievements,
  myAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  listDutySchedules,
  createDutySchedule,
  updateDutySchedule,
  deleteDutySchedule,
};
