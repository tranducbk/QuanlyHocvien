const asyncHandler = require('express-async-handler');
const service = require('../services/user.service');
const studentService = require('../services/student.service');
const commanderService = require('../services/commander.service');
const { success, paginated, validateOrThrow } = require('../utils/response');
const { BadRequestError, ForbiddenError } = require('../utils/apiError');
const us = require('../validations/user.validation');
const ss = require('../validations/student.validation');
const cs = require('../validations/commander.validation');
const crs = require('../validations/cutRice.validation');

// ===================== User CRUD =====================

const create = asyncHandler(async (req, res) => {
  await validateOrThrow(us.create, req.body);
  const result = await service.create(req.body, req.user);
  return success(res, result, 'Tạo mới thành công', 201);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await service.getAll(req.query, req.user);
  return paginated(res, result.rows, result.pagination);
});

const exportUsers = asyncHandler(async (req, res) => {
  const buffer = await service.exportUsers(req.query);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=danh-sach-tai-khoan.xlsx');
  return res.send(buffer);
});

const getDetail = asyncHandler(async (req, res) => {
  const result = await service.getDetail(req.params.id, req.user);
  return success(res, result);
});

const update = asyncHandler(async (req, res) => {
  await validateOrThrow(us.update, req.body);
  const result = await service.update(req.params.id, req.body, req.user);
  return success(res, result, 'Cập nhật thành công');
});

const deleteRecord = asyncHandler(async (req, res) => {
  await service.delete(req.params.id, req.user);
  return success(res, null, 'Xóa thành công');
});

const createBatchUsers = asyncHandler(async (req, res) => {
  const users = req.body.users || [];
  for (const u of users) {
    await validateOrThrow(us.batch, u);
  }
  const result = await service.createBatchUsers(users, req.user);
  return success(res, result, 'Tạo tài khoản hàng loạt thành công', 201);
});

const createBatchUsersProfiles = asyncHandler(async (req, res) => {
  const users = req.body.users || [];
  for (const u of users) {
    await validateOrThrow(us.batch, u);
  }
  const result = await service.createBatchUsersProfiles(users, req.user);
  return success(res, result, 'Tạo tài khoản và hồ sơ hàng loạt thành công', 201);
});

const importUsers = asyncHandler(async (req, res) => {
  const users = await service.parseExcelImport(req.file);
  for (const u of users) {
    await validateOrThrow(us.batch, u);
  }
  const result = await service.createBatchUsersProfiles(users, req.user);
  return success(res, result, 'Tạo tài khoản từ Excel thành công', 201);
});

const downloadImportTemplate = asyncHandler(async (req, res) => {
  const buffer = await service.createImportTemplate();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=mau-nhap-tai-khoan.xlsx');
  return res.send(buffer);
});

const updateBatchProfiles = asyncHandler(async (req, res) => {
  const profiles = req.file
    ? await service.parseBatchProfileUpdateExcelImport(req.file)
    : req.body;
  await validateOrThrow(us.batchProfileUpdate, profiles);
  const result = await service.updateBatchProfiles(profiles);
  return success(res, result, req.file ? 'Cập nhật hồ sơ từ Excel thành công' : 'Cập nhật hồ sơ hàng loạt thành công');
});

const downloadBatchProfilesTemplate = asyncHandler(async (req, res) => {
  const buffer = await service.createBatchProfileUpdateTemplate();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=mau-cap-nhat-hoc-vien.xlsx');
  return res.send(buffer);
});

const graduateBatchProfiles = asyncHandler(async (req, res) => {
  await validateOrThrow(us.batchGraduation, req.body);
  const result = await service.graduateBatchProfiles(req.body);
  return success(res, result, 'Xác nhận học viên ra trường hàng loạt thành công');
});

const resetPassword = asyncHandler(async (req, res) => {
  await validateOrThrow(us.resetPassword, req.body);
  const result = await service.resetPassword(req.params.id, req.body.newPassword, req.user);
  return success(res, result, 'Đặt lại mật khẩu thành công');
});

const toggleActive = asyncHandler(async (req, res) => {
  const result = await service.toggleActive(req.params.id, req.user);
  const msg = result.isActive ? 'Mở khóa tài khoản thành công' : 'Khóa tài khoản thành công';
  return success(res, result, msg);
});

// ===================== Profile =====================

const getMyProfile = asyncHandler(async (req, res) => {
  const result = await service.getMyProfile(req.userId);
  return success(res, result);
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const result = await service.updateMyProfile(req.userId, req.body);
  return success(res, result, 'Cập nhật hồ sơ thành công');
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError('Vui lòng chọn file avatar để tải lên');
  }

  const result = await service.uploadAvatarFile(req.userId, req.file);
  return success(res, result, 'Upload avatar thành công');
});

// ===================== Student: Học tập =====================

const getAcademicResults = asyncHandler(async (req, res) => {
  const result = await studentService.getAcademicResults(req.userId, req.query);
  return paginated(res, result.rows, result.pagination);
});

// ===================== Student: Thời khóa biểu =====================

const getMyTimeTable = asyncHandler(async (req, res) => {
  const result = await studentService.getMyTimeTable(req.userId, req.query);
  return paginated(res, result.rows, result.pagination);
});

const getMyTimeTableSemesters = asyncHandler(async (req, res) => {
  const result = await studentService.getMyTimeTableSemesters(req.userId);
  return success(res, result);
});

const denyMyTimeTableMutation = asyncHandler(async () => {
  throw new ForbiddenError('Chỉ chỉ huy mới được nhập và cập nhật lịch học');
});

// ===================== Student: Cắt cơm =====================

const getMyCutRice = asyncHandler(async (req, res) => {
  const result = await studentService.getMyCutRice(req.userId, req.query);
  return success(res, result);
});

const updateMyCutRice = asyncHandler(async (req, res) => {
  await validateOrThrow(crs.cutRice || crs.update, req.body);
  const result = await studentService.updateMyCutRice(req.userId, req.body);
  return success(res, result, 'Cập nhật lịch cắt cơm thành công');
});

const createMyCutRiceRequest = asyncHandler(async (req, res) => {
  await validateOrThrow(crs.request, req.body);
  const result = await studentService.createMyCutRiceRequest(req.userId, req.body);
  return success(res, result, 'Gửi yêu cầu cắt cơm thành công', 201);
});

const getMyCutRiceRequests = asyncHandler(async (req, res) => {
  const result = await studentService.getMyCutRiceRequests(req.userId, req.query);
  return paginated(res, result.rows, result.pagination);
});

// ===================== Student: Thành tích & Học phí =====================

const getMyAchievements = asyncHandler(async (req, res) => {
  const result = await studentService.getMyAchievements(req.userId, req.query);
  return success(res, result);
});

const getMyTuitionFees = asyncHandler(async (req, res) => {
  const result = await studentService.getMyTuitionFees(req.userId, req.query);
  return paginated(res, result.rows, result.pagination);
});

// ===================== Admin/Commander: Quản lý hồ sơ =====================

const createProfile = asyncHandler(async (req, res) => {
  await validateOrThrow(ss.create, req.body);
  const result = await studentService.create(req.body);
  return success(res, result, 'Tạo hồ sơ thành công', 201);
});

const getAllProfiles = asyncHandler(async (req, res) => {
  const result = await studentService.getAll(req.query, req.user);
  return paginated(res, result.rows, result.pagination);
});

const getProfileDetail = asyncHandler(async (req, res) => {
  const result = await studentService.getDetail(req.params.id, req.user);
  return success(res, result);
});

const updateProfile = asyncHandler(async (req, res) => {
  await validateOrThrow(ss.update, req.body);
  const result = await studentService.update(req.params.id, req.body, req.user);
  return success(res, result, 'Cập nhật hồ sơ thành công');
});

const deleteProfile = asyncHandler(async (req, res) => {
  await studentService.delete(req.params.id, req.user);
  return success(res, null, 'Xóa hồ sơ thành công');
});

const exportProfiles = asyncHandler(async (req, res) => {
  const buffer = await studentService.exportStudents(req.query, req.user);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=danh-sach-ho-so.xlsx');
  res.send(buffer);
});

// ===================== Commander: Cắt cơm hàng loạt =====================

const generateCutRice = asyncHandler(async (req, res) => {
  const result = await commanderService.generateCutRice(req.params.userId, req.query, req.user);
  return success(res, result, 'Tạo lịch cắt cơm tự động thành công');
});

const generateAllCutRice = asyncHandler(async (req, res) => {
  const result = await commanderService.generateAllCutRice(req.user);
  return success(res, result, 'Tạo lịch cắt cơm hàng loạt thành công');
});

// ===================== Commander: Báo cáo =====================

const getAcademicReport = asyncHandler(async (req, res) => {
  const result = await commanderService.getAcademicReport(req.query);
  return success(res, result);
});

const getPartyTrainingReport = asyncHandler(async (req, res) => {
  const result = await commanderService.getPartyTrainingReport(req.query);
  return success(res, result);
});

const getAchievementReport = asyncHandler(async (req, res) => {
  const result = await commanderService.getAchievementReport();
  return success(res, result);
});

const getTuitionReport = asyncHandler(async (req, res) => {
  const result = await commanderService.getTuitionReport(req.query);
  return success(res, result);
});

const exportTuitionReport = asyncHandler(async (req, res) => {
  const buffer = await commanderService.exportTuitionReport(req.query);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=bao-cao-hoc-phi.xlsx');
  return res.send(buffer);
});

module.exports = {
  create,
  getAll,
  exportUsers,
  getDetail,
  update,
  delete: deleteRecord,
  createBatchUsers,
  createBatchUsersProfiles,
  importUsers,
  downloadImportTemplate,
  downloadBatchProfilesTemplate,
  updateBatchProfiles,
  graduateBatchProfiles,
  resetPassword,
  toggleActive,
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  getAcademicResults,
  getMyTimeTable,
  getMyTimeTableSemesters,
  denyMyTimeTableMutation,
  getMyCutRice,
  updateMyCutRice,
  createMyCutRiceRequest,
  getMyCutRiceRequests,
  getMyAchievements,
  getMyTuitionFees,
  createProfile,
  getAllProfiles,
  getProfileDetail,
  updateProfile,
  deleteProfile,
  exportProfiles,
  generateCutRice,
  generateAllCutRice,
  getAcademicReport,
  getPartyTrainingReport,
  getAchievementReport,
  getTuitionReport,
  exportTuitionReport,
};
