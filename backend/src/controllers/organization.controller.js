const asyncHandler = require('express-async-handler');
const service = require('../services/organization.service');
const { success, paginated, validateOrThrow } = require('../utils/response');
const s = require('../validations/organization.validation');

const create = asyncHandler(async (req, res) => {
  await validateOrThrow(s.create, req.body);
  const result = await service.create(req.body);
  return success(res, result, 'Tạo mới thành công', 201);
});

const getAll = asyncHandler(async (req, res) => {
  const result = await service.getAll(req.query);

  const universities = [...new Map(
    result.rows.map(r => r.University).filter(Boolean).map(u => [u.id, u])
  ).values()];

  const rows = result.rows.map(r => {
    const plain = r.get({ plain: true });
    delete plain.University;
    return plain;
  });

  return paginated(res, rows, result.pagination, undefined, 200, { universities });
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

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
