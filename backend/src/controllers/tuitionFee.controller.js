const asyncHandler = require('express-async-handler');
const service = require('../services/tuitionFee.service');
const { success, paginated, validateOrThrow } = require('../utils/response');
const s = require('../validations/tuitionFee.validation');

const create = asyncHandler(async (req, res) => {
  await validateOrThrow(s.create, req.body);
  const result = await service.create(req.body);
  return success(res, result, 'Tạo mới thành công', 201);
});

const createBatch = asyncHandler(async (req, res) => {
  await validateOrThrow(s.batch, req.body);
  const result = await service.createBatch(req.body);
  return success(res, result, 'Nhập học phí hàng loạt thành công', 201);
});

const importExcel = asyncHandler(async (req, res) => {
  const data = await service.parseExcelImport(req.file);
  await validateOrThrow(s.batch, data);
  const result = await service.createBatch(data);
  return success(res, result, 'Nhập học phí từ Excel thành công', 201);
});

const downloadTemplate = asyncHandler(async (req, res) => {
  const buffer = await service.createImportTemplate();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=mau-nhap-hoc-phi.xlsx');
  return res.send(buffer);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await service.getAll(req.query);
  return paginated(res, result.rows, result.pagination);
});

const getDetail = asyncHandler(async (req, res) => {
  const result = await service.getDetail(req.params.id);
  return success(res, result);
});

const getHistories = asyncHandler(async (req, res) => {
  const result = await service.getHistories(req.params.id);
  return success(res, result);
});

const update = asyncHandler(async (req, res) => {
  await validateOrThrow(s.update, req.body);
  const result = await service.update(req.params.id, req.body, req.userId);
  return success(res, result, 'Cập nhật thành công');
});

const deleteRecord = asyncHandler(async (req, res) => {
  await service.delete(req.params.id);
  return success(res, null, 'Xóa thành công');
});

module.exports = { create, createBatch, importExcel, downloadTemplate, getAll, getDetail, getHistories, update, delete: deleteRecord };
