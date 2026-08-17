const asyncHandler = require('express-async-handler');
const db = require('../models');
const JwtService = require('../services/jwt.service');
const { serialize } = require('../utils/serialize');
const { BadTokenError, ForbiddenError } = require('../utils/apiError');

const User = db.user;

const authMiddleware = asyncHandler(async (req, res, next) => {
  if (process.env.SERVER_JWT === 'false') return next();

  const token = JwtService.jwtGetToken(req);
  if (!token) throw new BadTokenError();

  const decoded = JwtService.jwtVerify(token);
  const user = await User.findByPk(decoded.userId, {
    include: [{ model: db.profile }],
  });
  if (!user) {
    throw new BadTokenError('Tài khoản không tồn tại');
  }

  const plainUser = serialize(user);
  req.userId = plainUser.id;
  req.user = {
    ...plainUser,
    profileId: plainUser.profileId || null,
    organizationId: plainUser.Profile ? plainUser.Profile.organizationId : null,
  };
  return next();
});

const requireRole = (...roleNames) => {
  return asyncHandler(async (req, res, next) => {
    if (process.env.SERVER_JWT === 'false') return next();
    if (!req.user) {
      throw new BadTokenError();
    }
    if (!req.user.role || !roleNames.includes(req.user.role)) {
      throw new ForbiddenError();
    }
    return next();
  });
};

const requireStudent = asyncHandler(async (req, res, next) => {
  if (process.env.SERVER_JWT === 'false') return next();
  if (!req.user || req.user.role !== 'STUDENT') {
    throw new ForbiddenError('Chỉ học viên mới có quyền truy cập');
  }
  return next();
});

const requireAdmin = requireRole('ADMIN');

module.exports = {
  authMiddleware,
  requireRole,
  requireStudent,
  requireAdmin,
};
