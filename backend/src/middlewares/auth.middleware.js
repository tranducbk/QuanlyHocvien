const asyncHandler = require('express-async-handler');
const db = require('../models');
const JwtService = require('../services/authentication/jwt.service.js');
const { serialize } = require('../utils/serialize');
const { BadTokenError, ForbiddenError } = require('../utils/apiError');

const User = db.user;

const authMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user) return next();
  if (process.env.SERVER_JWT === 'false') return next();

  const token = JwtService.jwtGetToken(req);
  if (!token) throw new BadTokenError();

  const decoded = JwtService.jwtVerify(token);
  const user = await User.findByPk(decoded.userId, {
    include: [{ model: db.profile }, { model: db.trainingSystem }],
  });
  if (!user) {
    throw new BadTokenError('Tài khoản không tồn tại');
  }

  if (user.role !== 'ADMIN' && (!user.trainingSystemId || !user.TrainingSystem?.isActive)) {
    throw new ForbiddenError('Tài khoản chưa được gán hệ đào tạo đang hoạt động');
  }

  const plainUser = serialize(user);
  req.userId = plainUser.id;
  req.user = {
    ...plainUser,
    profileId: plainUser.profileId || null,
    organizationId: plainUser.Profile ? plainUser.Profile.organizationId : null,
    trainingSystemCode: plainUser.trainingSystem?.code || null,
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

const requireSystemType = (...systemTypes) => asyncHandler(async (req, res, next) => {
  if (process.env.SERVER_JWT === 'false') return next();
  if (req.user?.role === 'ADMIN') return next();
  const code = req.user?.trainingSystemCode;
  const isExternal = code === 'HE_5' && systemTypes.includes('EXTERNAL');
  const isMilitary = ['HE_1', 'HE_3', 'HE_4', 'HE_7'].includes(code) && systemTypes.includes('MILITARY');
  if (!isExternal && !isMilitary) throw new ForbiddenError();
  return next();
});

const requireTrainingSystem = (...codes) => asyncHandler(async (req, res, next) => {
  if (process.env.SERVER_JWT === 'false') return next();
  if (!req.user || !codes.includes(req.user.trainingSystemCode)) throw new ForbiddenError();
  return next();
});

module.exports = {
  authMiddleware,
  requireRole,
  requireStudent,
  requireAdmin,
  requireSystemType,
  requireTrainingSystem,
};
