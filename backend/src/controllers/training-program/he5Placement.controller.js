const asyncHandler = require('express-async-handler');
const service = require('../../services/training-program/he5Placement.service');
const validation = require('../../validations/training-program/he5Placement.validation');
const { success, validateOrThrow } = require('../../utils/response');

const listYears = asyncHandler(async (req, res) => success(res, await service.listYears(req.user)));
const prepareNext = asyncHandler(async (req, res) => success(res, await service.prepareNext(req.user), 'Đã chuẩn bị danh sách năm học mới', 201));
const withYear = (fn) => asyncHandler(async (req, res) => {
  await validateOrThrow(validation.params, req.params);
  return success(res, await fn(req.params.yearId, req.user));
});
const detail = withYear(service.detail);
const available = withYear(service.available);
const history = withYear(service.history);
const close = withYear(service.close);
const assign = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.params, req.params);
  await validateOrThrow(validation.assign, req.body);
  return success(res, await service.assign(req.params.yearId, req.body, req.user), 'Đã xếp lớp');
});
const graduate = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.params, req.params);
  await validateOrThrow(validation.graduate, req.body);
  return success(res, await service.graduate(req.params.yearId, req.body.profileIds, req.user), 'Đã đánh dấu tốt nghiệp trong bản nháp');
});
module.exports = { listYears, prepareNext, detail, available, history, close, assign, graduate };
