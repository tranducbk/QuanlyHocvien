const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../models');
const JwtService = require('./jwt.service');
const { serialize } = require('../utils/serialize');
const { NotFoundError, UnauthorizedError, BadRequestError } = require('../utils/apiError');

const User = db.user;
const Profile = db.profile;

// Trường người dùng (học viên/chỉ huy) được tự sửa trên hồ sơ của mình.
// Dùng chung cho PUT /auth/profile và PUT /users/profile.
// Không cho tự sửa: code, commanderId, CPA, enrollment, graduationDate, lớp/đơn vị/trường/trình độ đào tạo.
// Giữ các trường lý lịch quân sự/Đảng mà form tự cập nhật hồ sơ (student/commander UpdateProfileForm) đang gửi.
const SELF_PROFILE_FIELDS = [
  'fullName', 'email', 'gender', 'birthday', 'hometown', 'ethnicity',
  'religion', 'currentAddress', 'placeOfBirth', 'phoneNumber', 'cccd',
  'familyMember', 'foreignRelations',
  'rank', 'unit', 'positionGovernment', 'positionParty', 'dateOfEnlistment', 'startWork',
  'partyMemberCardNumber', 'probationaryPartyMember', 'fullPartyMember',
];

const _generateCode = (prefix) => `${prefix}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const _excludePassword = (user) => serialize(user);

const _generateTokens = (userId) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const accessToken = JwtService.jwtSign({ userId, issuedAt, token: 1 }, { expiresIn: '180d' });
  const refreshToken = JwtService.jwtSign({ userId, issuedAt, token: 2 }, { expiresIn: '365d' });
  return { accessToken, refreshToken };
};

const login = async (username, password) => {
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new BadRequestError('Người dùng không tồn tại');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Mật khẩu không chính xác');
  }
  if (!user.isActive) {
    throw new UnauthorizedError('Tài khoản đã bị khóa');
  }

  const { accessToken, refreshToken } = _generateTokens(user.id);
  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken, user: _excludePassword(user) };
};

const register = async (data) => {
  const { username, password, role, fullName, email, code, systemType, commanderId } = data;
  const assignedSystemType = role === 'ADMIN' ? null : (systemType || 'EXTERNAL');

  const exist = await User.findOne({ where: { username } });
  if (exist) {
    throw new BadRequestError('Tên đăng nhập đã tồn tại');
  }

  let profileId = null;
  if ((role === 'STUDENT' || role === 'COMMANDER') && fullName) {
    if (code) {
      const existing = await Profile.findOne({ where: { code } });
      if (existing) throw new BadRequestError(`Mã ${code} đã tồn tại`);
    }
    const prefix = (role === 'STUDENT' ? 'HV' : 'CH');
    let assignedCommanderId = null;
    if (role === 'STUDENT' && commanderId) {
      const commander = await User.findOne({ where: { id: commanderId, role: 'COMMANDER', systemType: assignedSystemType } });
      if (!commander) throw new BadRequestError('Chỉ huy phải thuộc cùng hệ đào tạo');
      assignedCommanderId = commander.id;
    }
    const profile = await Profile.create({
      code: code || _generateCode(prefix),
      fullName,
      email,
      commanderId: assignedCommanderId,
    });
    profileId = profile.id;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    username,
    password: hashedPassword,
    role: role || 'STUDENT',
    systemType: assignedSystemType,
    isAdmin: role === 'ADMIN',
    profileId,
  });

  return _excludePassword(newUser);
};

const refreshToken = async (token) => {
  const decoded = JwtService.jwtVerify(token);
  if (decoded.token !== 2) {
    throw new UnauthorizedError('Token không hợp lệ');
  }

  const user = await User.findByPk(decoded.userId);
  if (!user) {
    throw new UnauthorizedError('Tài khoản không tồn tại');
  }
  if (!user.isActive) {
    throw new UnauthorizedError('Tài khoản đã bị khóa');
  }
  // Chỉ chấp nhận refresh token đang được lưu (token cũ hoặc bị lộ sẽ bị từ chối)
  if (!user.refreshToken || user.refreshToken !== token) {
    throw new UnauthorizedError('Token không hợp lệ');
  }

  // Không xoay vòng refresh token: SSR (axios-server) không lưu lại token mới
  const { accessToken } = _generateTokens(user.id);
  const refreshToken = token;
  return { accessToken, refreshToken, user: _excludePassword(user) };
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('Không tìm thấy người dùng');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Mật khẩu cũ không chính xác');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
};

const updateProfile = async (userId, data) => {
  const user = await User.findByPk(userId);
  if (!user?.profileId) {
    throw new BadRequestError('Không có hồ sơ để cập nhật');
  }

  const profile = await Profile.findByPk(user.profileId);
  if (!profile) {
    throw new NotFoundError('Không tìm thấy hồ sơ');
  }

  const updateData = {};
  for (const field of SELF_PROFILE_FIELDS) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  return profile.update(updateData);
};

module.exports = {
  login,
  register,
  refreshToken,
  changePassword,
  updateProfile,
  SELF_PROFILE_FIELDS,
};
