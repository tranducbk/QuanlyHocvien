const asyncHandler = require('express-async-handler');
const service = require('../services/militaryAcademic.service');
const validation = require('../validations/militaryAcademic.validation');
const { success, paginated, validateOrThrow } = require('../utils/response');

const listSemesters = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.query, req.query);
  const result = await service.getSemesters(req.query, req.userId);
  return paginated(res, result.rows, result.pagination);
});
const createSemester = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.semester, req.body);
  return success(
    res,
    await service.createSemester(req.body, req.userId),
    'Tạo học kỳ thành công',
    201,
  );
});
const getSemester = asyncHandler(async (req, res) =>
  success(res, await service.getSemester(req.params.id, req.userId)),
);
const updateSemester = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.semester, req.body);
  return success(
    res,
    await service.updateSemester(req.params.id, req.body, req.userId),
    'Cập nhật học kỳ thành công',
  );
});
const deleteSemester = asyncHandler(async (req, res) =>
  success(res, await service.deleteSemester(req.params.id, req.userId)),
);
const listSubjects = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.query, req.query);
  const result = await service.getSubjects(req.params.classId, req.query, req.userId);
  return paginated(res, result.rows, result.pagination);
});
const createSubject = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.subject, req.body);
  return success(
    res,
    await service.createSubject(req.params.classId, req.body, req.userId),
    'Thêm môn học thành công',
    201,
  );
});
const updateSubject = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.subject, req.body);
  return success(
    res,
    await service.updateSubject(req.params.classId, req.params.id, req.body, req.userId),
    'Cập nhật môn học thành công',
  );
});
const deleteSubject = asyncHandler(async (req, res) =>
  success(res, await service.deleteSubject(req.params.classId, req.params.id, req.userId)),
);
const getTimeTable = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.query, req.query);
  return success(
    res,
    await service.getTimeTable(req.params.classId, req.query.semesterId, req.userId),
  );
});
const saveTimeTable = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.timetable, req.body);
  return success(
    res,
    await service.saveTimeTable(req.params.classId, req.body, req.userId),
    'Lưu lịch học thành công',
  );
});
const studentTimeTable = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.query, req.query);
  return success(res, await service.getStudentTimeTable(req.userId, req.query.semesterId));
});
const studentSubjects = asyncHandler(async (req, res) =>
  success(res, await service.getStudentSubjects(req.userId)),
);

module.exports = {
  listSemesters,
  createSemester,
  getSemester,
  updateSemester,
  deleteSemester,
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getTimeTable,
  saveTimeTable,
  studentTimeTable,
  studentSubjects,
};
