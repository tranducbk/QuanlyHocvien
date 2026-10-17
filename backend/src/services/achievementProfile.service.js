const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { assertStudentIdInScope, scopedUserInclude } = require('../utils/commanderScope');

const Model = db.achievementProfile;

// Chỉ các trường nghiệp vụ được phép ghi (chống mass assignment)
const FIELDS = [
  'totalYears',
  'totalAdvancedSoldier',
  'totalCompetitiveSoldier',
  'totalScientificTopics',
  'totalScientificInitiatives',
  'eligibleForMinistryReward',
  'eligibleForNationalReward',
];

const pickFields = (data = {}) => FIELDS.reduce((acc, key) => {
  if (data[key] !== undefined) acc[key] = data[key];
  return acc;
}, {});

const create = async (data, requester) => {
  if (!data.userId) throw new BadRequestError('Mã người dùng là bắt buộc');
  await assertStudentIdInScope(requester, data.userId);
  return Model.create({ ...pickFields(data), userId: data.userId });
};

const getAll = async (query, requester) => paginateQuery(Model, query, {
  filterFields: ['userId', 'eligibleForMinistryReward', 'eligibleForNationalReward'],
  include: [scopedUserInclude(requester)],
});

const getDetail = async (id, requester) => {
  const record = await Model.findOne({
    where: { id },
    include: [scopedUserInclude(requester)],
  });
  if (!record) throw new NotFoundError('Không tìm thấy hồ sơ thành tích');
  return record;
};

const update = async (id, data, requester) => {
  const record = await getDetail(id, requester);
  if (data.userId && data.userId !== record.userId) {
    throw new BadRequestError('Không được thay đổi học viên của hồ sơ thành tích');
  }
  return record.update(pickFields(data));
};

const deleteRecord = async (id, requester) => {
  const record = await getDetail(id, requester);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
