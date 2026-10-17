const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { findStudentUserByCode } = require('../utils/studentLookup');
const { assertStudentIdInScope, scopedUserInclude } = require('../utils/commanderScope');

const YearlyAchievement = db.yearlyAchievement;
const ScientificInitiative = db.scientificInitiative;
const ScientificTopic = db.scientificTopic;

// Chỉ các trường nghiệp vụ được phép ghi (chống mass assignment)
const FIELDS = ['year', 'decisionNumber', 'decisionDate', 'title', 'hasMinistryReward', 'hasNationalReward', 'notes'];
const SCIENCE_FIELDS = ['title', 'description', 'year', 'status'];

const pick = (data = {}, fields) => fields.reduce((acc, key) => {
  if (data[key] !== undefined) acc[key] = data[key];
  return acc;
}, {});

const create = async (data, requester) => {
  if (!data.userId) throw new BadRequestError('Mã người dùng là bắt buộc');
  await assertStudentIdInScope(requester, data.userId);
  return YearlyAchievement.create({ ...pick(data, FIELDS), userId: data.userId });
};

const resolveStudentUserId = async (data, requester) => {
  if (data.userId) {
    await assertStudentIdInScope(requester, data.userId);
    return data.userId;
  }
  if (data.studentCode) {
    const { user } = await findStudentUserByCode(data.studentCode, { requester });
    return user.id;
  }
  throw new BadRequestError('Cần truyền userId hoặc studentCode');
};

const createFull = async (data, requester) => {
  // Kiểm tra phạm vi trước khi mở transaction
  const userId = await resolveStudentUserId(data, requester);
  const transaction = await db.sequelize.transaction();
  try {
    const yearlyAchievement = await YearlyAchievement.create({
      ...pick(data, FIELDS),
      userId,
    }, { transaction });

    const scientificTopics = await ScientificTopic.bulkCreate(
      (data.scientificTopics || []).map((item) => ({
        ...pick(item, SCIENCE_FIELDS),
        year: item.year || data.year,
        yearlyAchievementId: yearlyAchievement.id,
      })),
      { transaction },
    );

    const scientificInitiatives = await ScientificInitiative.bulkCreate(
      (data.scientificInitiatives || []).map((item) => ({
        ...pick(item, SCIENCE_FIELDS),
        year: item.year || data.year,
        yearlyAchievementId: yearlyAchievement.id,
      })),
      { transaction },
    );

    await transaction.commit();

    return {
      yearlyAchievement,
      scientificTopics,
      scientificInitiatives,
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const getAll = async (query, requester) => paginateQuery(YearlyAchievement, query, {
  filterFields: ['userId', 'year', 'hasMinistryReward', 'hasNationalReward'],
  include: [
    scopedUserInclude(requester),
    { model: ScientificInitiative },
    { model: ScientificTopic },
  ],
});

const getDetail = async (id, requester) => {
  const record = await YearlyAchievement.findOne({
    where: { id },
    include: [
      scopedUserInclude(requester),
      { model: ScientificInitiative },
      { model: ScientificTopic },
    ],
  });
  if (!record) throw new NotFoundError('Không tìm thấy thành tích năm');
  return record;
};

const update = async (id, data, requester) => {
  const record = await getDetail(id, requester);
  if (data.userId && data.userId !== record.userId) {
    throw new BadRequestError('Không được thay đổi học viên của thành tích năm');
  }
  return record.update(pick(data, FIELDS));
};

const deleteRecord = async (id, requester) => {
  const record = await getDetail(id, requester);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, createFull, getAll, getDetail, update, delete: deleteRecord };
