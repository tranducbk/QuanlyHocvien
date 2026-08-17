const DEFAULT_ERRORS = {
  BAD_TOKEN: { code: 'BAD_TOKEN', message: 'Token không hợp lệ' },
  TOKEN_EXPIRED: { code: 'TOKEN_EXPIRED', message: 'Token đã hết hạn' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Thông tin xác thực không hợp lệ' },
  SERVER_ERROR: { code: 'SERVER_ERROR', message: 'Lỗi máy chủ nội bộ' },
  NOT_FOUND: { code: 'NOT_FOUND', message: 'Không tìm thấy' },
  BAD_REQUEST: { code: 'BAD_REQUEST', message: 'Yêu cầu không hợp lệ' },
  FORBIDDEN: { code: 'FORBIDDEN', message: 'Bạn không có quyền truy cập' },
  VALIDATION: { code: 'VALIDATION', message: 'Lỗi xác thực dữ liệu' },
};

class BaseError extends Error {
  constructor(message, statusCode, type, isOperational = true) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

class ApiError extends BaseError {
  constructor(message, statusCode, type) {
    super(message, statusCode, type, true);
  }
}

const IsApiError = (err) => err instanceof ApiError ? err.isOperational : false;

class NotFoundError extends ApiError {
  constructor(message = DEFAULT_ERRORS.NOT_FOUND.message, type = DEFAULT_ERRORS.NOT_FOUND.code) {
    super(message, 404, type);
  }
}

class BadRequestError extends ApiError {
  constructor(message = DEFAULT_ERRORS.BAD_REQUEST.message, type = DEFAULT_ERRORS.BAD_REQUEST.code) {
    super(message, 400, type);
  }
}

class ValidationError extends ApiError {
  constructor(message = DEFAULT_ERRORS.VALIDATION.message, type = DEFAULT_ERRORS.VALIDATION.code) {
    super(message, 400, type);
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = DEFAULT_ERRORS.UNAUTHORIZED.message, type = DEFAULT_ERRORS.UNAUTHORIZED.code) {
    super(message, 401, type);
  }
}

class ForbiddenError extends ApiError {
  constructor(message = DEFAULT_ERRORS.FORBIDDEN.message, type = DEFAULT_ERRORS.FORBIDDEN.code) {
    super(message, 403, type);
  }
}

class InternalServerError extends ApiError {
  constructor(message = DEFAULT_ERRORS.SERVER_ERROR.message, type = DEFAULT_ERRORS.SERVER_ERROR.code) {
    super(message, 500, type);
  }
}

class BadTokenError extends ApiError {
  constructor(message = DEFAULT_ERRORS.BAD_TOKEN.message, type = DEFAULT_ERRORS.BAD_TOKEN.code) {
    super(message, 401, type);
  }
}

class TokenExpiredError extends ApiError {
  constructor(message = DEFAULT_ERRORS.TOKEN_EXPIRED.message, type = DEFAULT_ERRORS.TOKEN_EXPIRED.code) {
    super(message, 401, type);
  }
}

module.exports = {
  IsApiError,
  NotFoundError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  BadTokenError,
  TokenExpiredError,
  ApiError,
};
