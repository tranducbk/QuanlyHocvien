const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { isStudentInScope, studentUserWhere } = require('../utils/commanderScope');

const CommanderDutySchedule = db.commanderDutySchedule;
const User = db.user;
const Profile = db.profile;

const commanderInclude = (profileWhere = {}, requester) => ([
  {
    model: User,
    as: 'commander',
    attributes: { exclude: ['password', 'refreshToken'] },
    ...(studentUserWhere(requester) ? { where: { ...studentUserWhere(requester) } } : {}),
    include: [{ model: Profile, ...(Object.keys(profileWhere).length ? { where: profileWhere, required: true } : {}) }],
    required: true,
  },
]);

const WRITABLE_FIELDS = ['userId', 'position', 'workDay'];

const sanitizePayload = (data) => Object.fromEntries(
  WRITABLE_FIELDS.filter((field) => data[field] !== undefined).map((field) => [field, data[field]])
);

const ensureStudent = async (userId, requester) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password', 'refreshToken'] },
    include: [{ model: Profile }],
  });
  if (!user) throw new BadRequestError('Không tìm thấy học viên');
  if (user.role !== 'STUDENT') throw new BadRequestError('Người được phân công phải là tài khoản học viên');
  if (!isStudentInScope(requester, user)) throw new BadRequestError('Không tìm thấy học viên');
  return user;
};

const findScopedRecord = async (id, requester) => {
  const record = await CommanderDutySchedule.findByPk(id, { include: commanderInclude({}, requester) });
  if (!record) throw new NotFoundError('Không tìm thấy lịch trực');
  return record;
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

const create = async (data, requester) => {
  const payload = sanitizePayload(data);
  await ensureStudent(payload.userId, requester);
  const record = await CommanderDutySchedule.create(payload);
  return getDetail(record.id, requester);
};

const getAll = async (query, requester) => {
  const profileWhere = {};
  if (query.fullName) profileWhere.fullName = { [db.Sequelize.Op.iLike]: `%${query.fullName}%` };
  if (query.rank) profileWhere.rank = query.rank;

  const result = await paginateQuery(CommanderDutySchedule, query, {
    filterFields: ['position', 'userId'],
    include: commanderInclude(profileWhere, requester),
  });

  return { ...result, rows: result.rows.map(flattenCommander) };
};

const getDetail = async (id, requester) => {
  const record = await findScopedRecord(id, requester);
  return flattenCommander(record);
};

const update = async (id, data, requester) => {
  const record = await findScopedRecord(id, requester);
  const payload = sanitizePayload(data);
  if (payload.userId) await ensureStudent(payload.userId, requester);
  await record.update(payload);
  return getDetail(id, requester);
};

const deleteRecord = async (id, requester) => {
  const record = await findScopedRecord(id, requester);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
