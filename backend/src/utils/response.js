const { ValidationError } = require('../utils/apiError');
const { serialize } = require('./serialize');

const success = (res, data = null, message = 'Thành công', statusCode = 200) => {
  const body = { success: true, statusCode, message };
  if (data !== null && data !== undefined) body.data = serialize(data);
  return res.status(statusCode).json(body);
};

const paginated = (res, data, pagination, summaryOrMessage, statusCode = 200, extra = {}) => {
  const body = {
    success: true,
    statusCode,
    message: 'Thành công',
    data: serialize(data),
    pagination,
  };

  if (typeof summaryOrMessage === 'string') {
    body.message = summaryOrMessage;
  } else if (summaryOrMessage && typeof summaryOrMessage === 'object') {
    body.summary = summaryOrMessage;
  }

  if (extra && typeof extra === 'object') {
    for (const [key, value] of Object.entries(extra)) {
      body[key] = serialize(value);
    }
  }

  return res.status(statusCode).json(body);
};

const fail = (res, message = 'Lỗi máy chủ nội bộ', statusCode = 500, type) => {
  const body = { success: false, statusCode, message };
  if (type) body.type = type;
  return res.status(statusCode).json(body);
};

const validateOrThrow = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
  } catch (err) {
    throw new ValidationError(err.errors);
  }
};

const paginateQuery = async (model, query = {}, options = {}) => {
  const {
    filterFields: optionFilterFields,
    filters: optionFilters,
    where: optionWhere,
    ...sequelizeOptions
  } = options;
  const fetchAll = query.fetchAll === true || query.fetchAll === 'true';
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const offset = (page - 1) * limit;

  // --- Filter ---
  const where = { ...(optionWhere || {}) };
  const filterFields = (optionFilterFields || []).concat(optionFilters || []);
  for (const field of filterFields) {
    if (query[field] !== undefined) {
      where[field] = query[field];
    }
  }

  // --- Sort --- (mặc định: createdAt DESC, hệ thống tự xử lý)
  let order = sequelizeOptions.order || [['createdAt', 'DESC']];
  if (query.sortBy) {
    const sortOrder = query.sortOrder === 'desc' ? 'DESC' : 'ASC';
    order = [[query.sortBy, sortOrder]];
  }

  const queryOptions = { ...sequelizeOptions, where, order, distinct: sequelizeOptions.distinct ?? true };
  if (!fetchAll) {
    queryOptions.offset = offset;
    queryOptions.limit = limit;
  }

  const { count, rows } = await model.findAndCountAll(queryOptions);
  const total = Array.isArray(count) ? count.length : count;
  const pageSize = fetchAll ? total : limit;

  return {
    rows,
    pagination: {
      pageIndex: fetchAll ? 1 : page,
      page: fetchAll ? 1 : page,
      pageSize,
      limit: pageSize,
      totalPages: fetchAll ? 1 : Math.ceil(total / limit),
      total,
      fetchAll,
    },
  };
};

module.exports = { success, paginated, fail, validateOrThrow, paginateQuery };
