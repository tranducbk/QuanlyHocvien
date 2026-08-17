const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const CommanderDutySchedule = db.commanderDutySchedule;
const User = db.user;
const Profile = db.profile;

const commanderInclude = (profileWhere = {}) => ([
  {
    model: User,
    as: 'commander',
    attributes: { exclude: ['password', 'refreshToken'] },
    include: [{ model: Profile, ...(Object.keys(profileWhere).length ? { where: profileWhere, required: true } : {}) }],
    required: true,
  },
]);

const sanitizePayload = (data) => {
  const { fullName, rank, phoneNumber, ...payload } = data;
  return payload;
};

const ensureStudent = async (userId) => {
  const user = await User.findByPk(userId, { include: [{ model: Profile }] });
  if (!user) throw new BadRequestError('Không tìm thấy học viên');
  if (user.role !== 'STUDENT') throw new BadRequestError('Người được phân công phải là tài khoản học viên');
  return user;
};

const flattenCommander = (record) => {
  const plain = typeof record.get === 'function' ? record.get({ plain: true }) : record;
  const profile = plain.commander?.Profile || plain.commander?.profile || {};
  return {
    ...plain,
    fullName: profile.fullName || plain.commander?.username || null,
    rank: profile.rank || null,
    phoneNumber: profile.phoneNumber || null,
  };
};

const create = async (data) => {
  const payload = sanitizePayload(data);
  await ensureStudent(payload.userId);
  const record = await CommanderDutySchedule.create(payload);
  return getDetail(record.id);
};

const getAll = async (query) => {
  const profileWhere = {};
  if (query.fullName) profileWhere.fullName = { [db.Sequelize.Op.iLike]: `%${query.fullName}%` };
  if (query.rank) profileWhere.rank = query.rank;

  const result = await paginateQuery(CommanderDutySchedule, query, {
    filterFields: ['position', 'userId'],
    include: commanderInclude(profileWhere),
  });

  return { ...result, rows: result.rows.map(flattenCommander) };
};

const getDetail = async (id) => {
  const record = await CommanderDutySchedule.findByPk(id, { include: commanderInclude() });
  if (!record) throw new NotFoundError('Không tìm thấy lịch trực');
  return flattenCommander(record);
};

const update = async (id, data) => {
  const record = await CommanderDutySchedule.findByPk(id);
  if (!record) throw new NotFoundError('Không tìm thấy lịch trực');
  const payload = sanitizePayload(data);
  if (payload.userId) await ensureStudent(payload.userId);
  await record.update(payload);
  return getDetail(id);
};

const deleteRecord = async (id) => {
  const record = await CommanderDutySchedule.findByPk(id);
  if (!record) throw new NotFoundError('Không tìm thấy lịch trực');
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
