const asyncHandler = require('express-async-handler');
const service = require('../services/fileStorage.service');

const getFile = asyncHandler(async (req, res) => {
  const bucket = req.params.bucket;
  const objectName = req.params[0];

  if (bucket === 'evidence') {
    const JwtService = require('../services/jwt.service');
    const db = require('../models');
    const { BadTokenError, ForbiddenError } = require('../utils/apiError');
    
    const token = (req.headers.authorization?.split(' ')[1]) || req.query.token;
    if (!token) throw new BadTokenError('Không có quyền truy cập');
    
    const decoded = JwtService.jwtVerify(token);
    const user = await db.user.findByPk(decoded.userId);
    if (!user) throw new BadTokenError('Tài khoản không tồn tại');
    
    const ownerId = objectName.split('/')[0];
    if (user.role === 'STUDENT' && ownerId !== user.id) {
      throw new ForbiddenError('Không có quyền truy cập minh chứng của người khác');
    }
  }

  const { stream, stat } = await service.getObjectStream(bucket, objectName);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  if (stat?.metaData?.['content-type']) {
    res.setHeader('Content-Type', stat.metaData['content-type']);
  }
  return stream.pipe(res);
});

module.exports = { getFile };
