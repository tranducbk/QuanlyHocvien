const asyncHandler = require('express-async-handler');
const service = require('../services/semester.service');
const gradeConversion = require('../utils/gradeConversion');
const { success, paginated, validateOrThrow } = require('../utils/response');
const s = require('../validations/semester.validation');

// ===================== CRUD Cơ bản =====================

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

const update = asyncHandler(async (req, res) => {
  await validateOrThrow(s.update, req.body);
  const result = await service.update(req.params.id, req.body);
  return success(res, result, 'Cập nhật thành công');
});

const deleteRecord = asyncHandler(async (req, res) => {
  await service.delete(req.params.id);
  return success(res, null, 'Xóa thành công');
});

const createSchoolYear = asyncHandler(async (req, res) => {
  await validateOrThrow(s.createSchoolYear, req.body);
  const result = await service.createSchoolYear(req.body);
  return success(res, result, 'Tạo năm học thành công', 201);
});

const getSchoolYears = asyncHandler(async (req, res) => {
  const result = await service.getSchoolYears(req.query);
  return paginated(res, result.rows, result.pagination);
});

const createTerm = asyncHandler(async (req, res) => {
  await validateOrThrow(s.createTerm, req.body);
  const result = await service.createTerm(req.body);
  return success(res, result, 'Tạo học kỳ thành công', 201);
});

// ===================== CH-11: Chuyển đổi điểm =====================

const convertGrade = asyncHandler(async (req, res) => {
  await validateOrThrow(s.gradeConvert, req.body);
  const { value, from, to } = req.body;
  const result = gradeConversion.convertGrade(value, from, to);
  return success(res, result);
});

const convertMultipleGrades = asyncHandler(async (req, res) => {
  const result = gradeConversion.convertMultiple(req.body.grades || []);
  return success(res, result);
});

const calculateGpa = asyncHandler(async (req, res) => {
  await validateOrThrow(s.gpaCalculate, req.body);
  const result = gradeConversion.calculateGpa(req.body.grades || []);
  return success(res, result);
});

const getGradeTable = asyncHandler(async (req, res) => {
  const result = gradeConversion.getGradeTable();
  return success(res, result);
});

module.exports = {
  create,
  getAll,
  getDetail,
  update,
  delete: deleteRecord,
  createSchoolYear,
  getSchoolYears,
  createTerm,
  convertGrade,
  convertMultipleGrades,
  calculateGpa,
  getGradeTable,
};
