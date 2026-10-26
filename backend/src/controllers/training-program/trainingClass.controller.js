const asyncHandler = require('express-async-handler');
const service = require('../../services/training-program/trainingClass.service.js');
const validation = require('../../validations/training-program/trainingClass.validation.js');
const { success, validateOrThrow } = require('../../utils/response');

const listOptions = asyncHandler(async (_req, res) => success(res, await service.listOptions()));
const list = asyncHandler(async (_req, res) => success(res, await service.list()));
const listMine = asyncHandler(async (req, res) => success(res, await service.listMine(req.user)));
const listStudents = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.params, req.params);
  return success(res, await service.listStudents(req.params.id, req.user));
});
const listAvailableStudents = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.params, req.params);
  await validateOrThrow(validation.availableStudentsQuery, req.query);
  return success(res, await service.listAvailableStudents(req.params.id, req.query.search, req.user));
});
const assignStudent = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.params, req.params);
  await validateOrThrow(validation.student, req.body);
  return success(res, await service.assignStudent(req.params.id, req.body.studentCode, req.user), 'Đã xếp học viên vào lớp');
});
const listSemesters = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.params, req.params);
  return success(res, await service.listSemesters(req.params.id, req.user));
});
const createSemester = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.params, req.params);
  await validateOrThrow(validation.semester, req.body);
  return success(res, await service.createSemester(req.params.id, req.body, req.user), 'Đã tạo học kỳ', 201);
});
const listSubjects = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.semesterParams, req.params);
  return success(res, await service.listSubjects(req.params.id, req.params.semesterId, req.user));
});
const createSubject = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.semesterParams, req.params);
  await validateOrThrow(validation.subject, req.body);
  return success(res, await service.createSubject(req.params.id, req.params.semesterId, req.body, req.user), 'Đã thêm môn học', 201);
});
const getTimeTable = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.semesterParams, req.params);
  return success(res, await service.getTimeTable(req.params.id, req.params.semesterId, req.user));
});
const saveTimeTable = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.semesterParams, req.params);
  await validateOrThrow(validation.timeTable, req.body);
  return success(res, await service.saveTimeTable(req.params.id, req.params.semesterId, req.body.schedules, req.user), 'Đã lưu lịch học');
});
const create = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.create, req.body);
  return success(res, await service.create(req.body), 'Đã tạo lớp đào tạo', 201);
});
const assignCommander = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.params, req.params);
  await validateOrThrow(validation.commander, req.body);
  return success(res, await service.assignCommander(req.params.id, req.body.commanderId), 'Đã cập nhật Chỉ huy');
});

module.exports = { listOptions, list, listMine, listStudents, listAvailableStudents, assignStudent, listSemesters, createSemester, listSubjects, createSubject, getTimeTable, saveTimeTable, create, assignCommander };
