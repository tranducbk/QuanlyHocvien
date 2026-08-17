const db = require('../models');
const { BadRequestError } = require('./apiError');

const User = db.user;
const Profile = db.profile;

const normalizeCode = (code) => String(code || '').trim();

const findStudentUserByCode = async (code) => {
  const normalizedCode = normalizeCode(code);
  if (!normalizedCode) {
    throw new BadRequestError('Mã học viên là bắt buộc');
  }

  const profile = await Profile.findOne({
    where: { code: normalizedCode },
    include: [{ model: User, where: { role: 'STUDENT' }, required: true }],
  });

  if (!profile || !profile.User) {
    throw new BadRequestError(`Không tìm thấy học viên có mã ${normalizedCode}`);
  }

  return { code: normalizedCode, profile, user: profile.User };
};

const findStudentUsersByCodes = async (codes = []) => {
  const results = [];
  for (const code of codes) {
    results.push(await findStudentUserByCode(code));
  }
  return results;
};

module.exports = {
  findStudentUserByCode,
  findStudentUsersByCodes,
};
