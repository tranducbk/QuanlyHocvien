const asyncHandler = require('express-async-handler');
const service = require('../services/subjectResult.service');
const { success, paginated, validateOrThrow } = require('../utils/response');
const { BadRequestError } = require('../utils/apiError');
const s = require('../validations/subjectResult.validation');

const create = asyncHandler(async (req, res) => {
  await validateOrThrow(s.create, req.body);
  const result = await service.create(req.body, req.user);
  return success(res, result, 'Tạo mới thành công', 201);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await service.getAll(req.query, req.user);
  return paginated(res, result.rows, result.pagination);
});

const getDetail = asyncHandler(async (req, res) => {
  const result = await service.getDetail(req.params.id, req.user);
  return success(res, result);
});

const downloadTemplate = asyncHandler(async (req, res) => {
  const buffer = await service.downloadTemplate();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=DiemMonHoc_Template.xlsx');
  return res.send(buffer);
});

const importExcel = asyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequestError('Vui lòng chọn file Excel');
  const { semesterResultId } = req.body;
  if (!semesterResultId) throw new BadRequestError('Thiếu thông tin semesterResultId');

  const result = await service.importExcel(req.file.buffer, semesterResultId, req.user);
  return success(res, result, `Thêm thành công ${result.length} môn học`);
});

module.exports = { create, getAll, getDetail, downloadTemplate, importExcel };
