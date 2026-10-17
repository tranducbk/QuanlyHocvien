const asyncHandler = require('express-async-handler');
const db = require('../models');
const service = require('../services/fileStorage.service');
const JwtService = require('../services/jwt.service');
const { bucket: allowedBucket } = require('../config/minio');
const { BadTokenError, ForbiddenError, NotFoundError } = require('../utils/apiError');

// Minh chứng lưu tại evidence/<userId>/..., chỉ chủ sở hữu, admin hoặc chỉ huy cùng hệ được xem
const assertCanReadEvidence = async (req, objectName) => {
  const token = JwtService.jwtGetToken(req) || req.query.token;
  if (!token) throw new BadTokenError('Không có quyền truy cập');

  const decoded = JwtService.jwtVerify(token);
  if (decoded.token !== 1) throw new BadTokenError('Token không hợp lệ');
  const user = await db.user.findByPk(decoded.userId);
  if (!user || !user.isActive) throw new BadTokenError('Tài khoản không tồn tại');

  if (user.role === 'ADMIN') return;
  const ownerId = objectName.split('/')[1];
  if (user.role === 'STUDENT' && ownerId === user.id) return;
  if (user.role === 'COMMANDER') {
    const owner = await db.user.findByPk(ownerId);
    if (owner?.role === 'STUDENT' && owner.systemType === user.systemType) return;
  }
  throw new ForbiddenError('Không có quyền truy cập minh chứng của người khác');
};

const getFile = asyncHandler(async (req, res) => {
  const bucket = req.params.bucket;
  const objectName = req.params[0];

  if (bucket !== allowedBucket) throw new NotFoundError('Không tìm thấy file');

  const isEvidence = objectName.startsWith('evidence/');
  if (isEvidence) await assertCanReadEvidence(req, objectName);

  const { stream, stat } = await service.getObjectStream(bucket, objectName);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', isEvidence ? 'private, no-store' : 'public, max-age=31536000, immutable');
  if (stat?.metaData?.['content-type']) {
    res.setHeader('Content-Type', stat.metaData['content-type']);
  }
  return stream.pipe(res);
});

module.exports = { getFile };
