const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { isCommander, scopedUserInclude } = require('../utils/commanderScope');

const ScientificInitiative = db.scientificInitiative;
const YearlyAchievement = db.yearlyAchievement;

// Chỉ các trường nghiệp vụ được phép ghi (chống mass assignment)
const FIELDS = ['title', 'description', 'year', 'status'];

const pickFields = (data = {}) => FIELDS.reduce((acc, key) => {
  if (data[key] !== undefined) acc[key] = data[key];
  return acc;
}, {});

// Chỉ huy: chỉ thấy bản ghi thuộc thành tích năm của học viên cùng hệ
const yearlyAchievementInclude = (requester) => (
  isCommander(requester)
    ? {
      model: YearlyAchievement,
      required: true,
      include: [scopedUserInclude(requester, { attributes: ['id'] })],
    }
    : { model: YearlyAchievement }
);

const assertYearlyAchievementInScope = async (requester, yearlyAchievementId) => {
  if (!yearlyAchievementId) throw new BadRequestError('Mã thành tích năm là bắt buộc');
  const yearly = await YearlyAchievement.findOne({
    where: { id: yearlyAchievementId },
    include: isCommander(requester) ? [scopedUserInclude(requester, { attributes: ['id'] })] : [],
  });
  if (!yearly) throw new NotFoundError('Không tìm thấy thành tích năm');
  return yearly;
};

const create = async (data, requester) => {
  await assertYearlyAchievementInScope(requester, data.yearlyAchievementId);
  return ScientificInitiative.create({ ...pickFields(data), yearlyAchievementId: data.yearlyAchievementId });
};

const getAll = async (query, requester) => paginateQuery(ScientificInitiative, query, {
  filterFields: ['yearlyAchievementId', 'title', 'year', 'status'],
  include: [yearlyAchievementInclude(requester)],
});

const getDetail = async (id, requester) => {
  const record = await ScientificInitiative.findOne({
    where: { id },
    include: [yearlyAchievementInclude(requester)],
  });
  if (!record) throw new NotFoundError('Không tìm thấy sáng kiến');
  return record;
};

const update = async (id, data, requester) => {
  const record = await getDetail(id, requester);
  const payload = pickFields(data);
  if (data.yearlyAchievementId && data.yearlyAchievementId !== record.yearlyAchievementId) {
    await assertYearlyAchievementInScope(requester, data.yearlyAchievementId);
    payload.yearlyAchievementId = data.yearlyAchievementId;
  }
  return record.update(payload);
};

const deleteRecord = async (id, requester) => {
  const record = await getDetail(id, requester);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
