const { USER_ROLES, SYSTEM_TYPES } = require('./constants');
const { BadRequestError } = require('./apiError');

const normalizeRole = (value, fallback = 'STUDENT') => String(value || fallback).trim().toUpperCase();

const normalizeSystemType = (value) => {
  if (value === null || value === undefined || value === '') return null;
  return String(value).trim().toUpperCase();
};

const assertValidUserAccess = (role, systemType) => {
  if (!USER_ROLES.includes(role)) {
    throw new BadRequestError('Vai trò không hợp lệ');
  }
  if (role === 'ADMIN') {
    if (systemType !== null) {
      throw new BadRequestError('Tài khoản ADMIN không được thuộc hệ đào tạo');
    }
    return;
  }
  if (!SYSTEM_TYPES.includes(systemType)) {
    throw new BadRequestError('Tài khoản STUDENT hoặc COMMANDER bắt buộc thuộc một hệ đào tạo');
  }
};

const normalizeAndValidateUserAccess = (data, fallbackRole = 'STUDENT') => {
  const role = normalizeRole(data.role, fallbackRole);
  const systemType = normalizeSystemType(data.systemType);
  assertValidUserAccess(role, systemType);
  data.role = role;
  data.systemType = systemType;
  return data;
};

module.exports = {
  normalizeRole,
  normalizeSystemType,
  assertValidUserAccess,
  normalizeAndValidateUserAccess,
};
