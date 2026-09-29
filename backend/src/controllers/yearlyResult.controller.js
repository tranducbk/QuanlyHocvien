const asyncHandler = require('express-async-handler');
const service = require('../services/yearlyResult.service');
const { success, paginated, validateOrThrow } = require('../utils/response');
const s = require('../validations/yearlyResult.validation');

const getAll = asyncHandler(async (req, res) => {
  await validateOrThrow(s.listQuery, req.query);
  const result = await service.getAll(req.query);
  return paginated(res, result.rows, result.pagination);
});

const getDetail = asyncHandler(async (req, res) => {
  const result = await service.getDetail(req.params.id);
  return success(res, result);
});

const exportYearlyResults = asyncHandler(async (req, res) => {
  await validateOrThrow(s.listQuery, req.query);
  const buffer = await service.exportYearlyResults(req.query);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=thong-ke-nam-hoc.xlsx');
  res.send(buffer);
});

module.exports = { getAll, getDetail, exportYearlyResults };
