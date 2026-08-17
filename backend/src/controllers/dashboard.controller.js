const asyncHandler = require('express-async-handler');
const service = require('../services/dashboard.service');
const { success } = require('../utils/response');

const getAdminDashboard = asyncHandler(async (req, res) => {
  const result = await service.getAdminDashboard(req.query);
  return success(res, result);
});

const getCommanderDashboard = asyncHandler(async (req, res) => {
  const result = await service.getCommanderDashboard(req.query, req.user);
  return success(res, result);
});

const getStudentDashboard = asyncHandler(async (req, res) => {
  const result = await service.getStudentDashboard(req.userId);
  return success(res, result);
});

module.exports = { getAdminDashboard, getCommanderDashboard, getStudentDashboard };
