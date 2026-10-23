const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../models');
const JwtService = require('./jwt.service');
const { serialize } = require('../utils/serialize');
const { NotFoundError, UnauthorizedError, BadRequestError, ForbiddenError } = require('../utils/apiError');

const User = db.user;
const Profile = db.profile;
const TrainingSystem = db.trainingSystem;

const requireAssignedSystem = (user) => {
  if (user.role === 'ADMIN') return null;
  const system = user.TrainingSystem;
  if (!user.trainingSystemId || !system?.isActive) {
    throw new ForbiddenError('Tài khoản chưa được gán hệ đào tạo đang hoạt động');
  }
  return system.code;
};

const authUserResponse = (user) => ({
  ..._excludePassword(user),
  trainingSystemCode: requireAssignedSystem(user),
});

const SELF_PROFILE_FIELDS = [
  'fullName', 'email', 'gender', 'birthday', 'hometown', 'ethnicity',
  'religion', 'currentAddress', 'placeOfBirth', 'phoneNumber', 'cccd',
  'partyMemberCardNumber', 'unit', 'rank', 'positionGovernment', 'positionParty',
  'fullPartyMember', 'probationaryPartyMember', 'dateOfEnlistment',
  'enrollment', 'graduationDate', 'familyMember',
  'foreignRelations', 'startWork', 'organization',
];

const _generateCode = (prefix) => `${prefix}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const _excludePassword = (user) => {
  const plain = serialize(user);
  delete plain.refreshToken;
  return plain;
};

const _generateTokens = (userId) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const accessToken = JwtService.jwtSign({ userId, issuedAt, token: 1 }, { expiresIn: '180d' });
  const refreshToken = JwtService.jwtSign({ userId, issuedAt, token: 2 }, { expiresIn: '365d' });
  return { accessToken, refreshToken };
};

const login = async (username, password) => {
  const user = await User.findOne({
    where: { username },
    include: [{ model: TrainingSystem }],
  });
  if (!user) {
    throw new BadRequestError('Người dùng không tồn tại');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Mật khẩu không chính xác');
  }
  requireAssignedSystem(user);

  user.refreshToken = _generateTokens(user.id).refreshToken;
  await user.save();

  const { accessToken, refreshToken } = _generateTokens(user.id);
  return { accessToken, refreshToken, user: authUserResponse(user) };
};

const register = async (data) => {
  const { username, password, role, fullName, email, code, commanderId, trainingSystemCode } = data;
  const trainingSystem = role === 'ADMIN' ? null : await TrainingSystem.findOne({
    where: { code: trainingSystemCode, isActive: true },
  });
  if (role !== 'ADMIN' && !trainingSystem) throw new BadRequestError('Hệ đào tạo không hợp lệ');
  const assignedSystemType = role === 'ADMIN' ? null : (trainingSystemCode === 'HE_5' ? 'EXTERNAL' : 'MILITARY');

  const exist = await User.findOne({ where: { username } });
  if (exist) {
    throw new BadRequestError('Tên đăng nhập đã tồn tại');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await db.sequelize.transaction(async (transaction) => {
    let profileId = null;
    if ((role === 'STUDENT' || role === 'COMMANDER') && fullName) {
      if (code) {
        const existing = await Profile.findOne({ where: { code }, transaction });
        if (existing) throw new BadRequestError(`Mã ${code} đã tồn tại`);
      }
      const prefix = role === 'STUDENT' ? 'HV' : 'CH';
      let assignedCommanderId = null;
      if (role === 'STUDENT' && commanderId) {
        const commander = await User.findOne({
          where: { id: commanderId, role: 'COMMANDER', trainingSystemId: trainingSystem.id },
          transaction,
        });
        if (!commander) throw new BadRequestError('Chỉ huy phải thuộc cùng hệ đào tạo');
        assignedCommanderId = commander.id;
      }
      const profile = await Profile.create({
        code: code || _generateCode(prefix),
        fullName,
        email,
        commanderId: assignedCommanderId,
      }, { transaction });
      profileId = profile.id;
    }

    return User.create({
      username,
      password: hashedPassword,
      role,
      systemType: assignedSystemType,
      trainingSystemId: trainingSystem?.id || null,
      isAdmin: role === 'ADMIN',
      profileId,
    }, { transaction });
  });

  return _excludePassword(newUser);
};

const refreshToken = async (token) => {
  const decoded = JwtService.jwtVerify(token);
  if (decoded.token !== 2) {
    throw new UnauthorizedError('Token không hợp lệ');
  }

  const user = await User.findByPk(decoded.userId, {
    include: [{ model: TrainingSystem }],
  });
  if (!user) {
    throw new UnauthorizedError('Tài khoản không tồn tại');
  }
  requireAssignedSystem(user);

  const { accessToken, refreshToken } = _generateTokens(user.id);
  return { accessToken, refreshToken, user: authUserResponse(user) };
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
};
