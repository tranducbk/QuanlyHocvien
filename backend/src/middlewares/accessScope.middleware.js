const asyncHandler = require('express-async-handler');
const { BadTokenError, ForbiddenError } = require('../utils/apiError');

const requireRoleAndSystem = ({ roles = [], systemTypes = [] } = {}) => {
  return asyncHandler(async (req, res, next) => {
    if (process.env.SERVER_JWT === 'false') return next();
    if (!req.user) throw new BadTokenError();

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new ForbiddenError('Vai trò không có quyền truy cập');
    }
    if (systemTypes.length > 0 && !systemTypes.includes(req.user.systemType)) {
      throw new ForbiddenError('Hệ đào tạo không có quyền truy cập');
    }
    return next();
  });
};

module.exports = { requireRoleAndSystem };
