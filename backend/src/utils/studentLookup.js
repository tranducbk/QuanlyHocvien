const db = require('../models');
const { BadRequestError } = require('./apiError');

const User = db.user;
const Profile = db.profile;

const normalizeCode = (code) => String(code || '').trim();

// options (tùy chọn, giữ tương thích ngược):
//   - systemType: chỉ tìm học viên thuộc hệ này
//   - requester: người gọi; nếu là chỉ huy thì giới hạn theo hệ của chỉ huy
const resolveSystemType = (options = {}) => {
  if (options.requester?.role === 'COMMANDER') return options.requester.systemType || '__NONE__';
  return options.systemType;
};

const findStudentUserByCode = async (code, options = {}) => {
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) {
    throw new BadRequestError('Mã học viên là bắt buộc');
  }

  const userWhere = { role: 'STUDENT' };
  const systemType = resolveSystemType(options);
  if (systemType) userWhere.systemType = systemType;

  const profile = await Profile.findOne({
    where: { code: normalizedCode },
    include: [{
      model: User,
      where: userWhere,
      required: true,
      attributes: { exclude: ['password', 'refreshToken'] },
    }],
  });

  if (!profile || !profile.User) {
    throw new BadRequestError(`Không tìm thấy học viên có mã ${normalizedCode}`);
  }

  return { code: normalizedCode, profile, user: profile.User };
};

const findStudentUsersByCodes = async (codes = [], options = {}) => {
  const results = [];
  for (const code of codes) {
    results.push(await findStudentUserByCode(code, options));
  }
  return results;
};

module.exports = {
  findStudentUserByCode,
  findStudentUsersByCodes,
};
