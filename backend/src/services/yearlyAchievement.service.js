const db = require('../models');
const User = db.user;
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { findStudentUserByCode } = require('../utils/studentLookup');

const YearlyAchievement = db.yearlyAchievement;
const Student = db.profile;
const ScientificInitiative = db.scientificInitiative;
const ScientificTopic = db.scientificTopic;

const create = async (data) => YearlyAchievement.create(data);

const resolveStudentUserId = async (data) => {
  if (data.userId) return data.userId;
  if (data.studentCode) {
    const { user } = await findStudentUserByCode(data.studentCode);
    return user.id;
  }
  throw new BadRequestError('Cần truyền userId hoặc studentCode');
};

const createFull = async (data) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = await resolveStudentUserId(data);
    const yearlyAchievement = await YearlyAchievement.create({
      userId,
      year: data.year,
      decisionNumber: data.decisionNumber,
      decisionDate: data.decisionDate,
      title: data.title,
      hasMinistryReward: data.hasMinistryReward,
      hasNationalReward: data.hasNationalReward,
      notes: data.notes,
    }, { transaction });

    const scientificTopics = await ScientificTopic.bulkCreate(
      (data.scientificTopics || []).map((item) => ({
        ...item,
        year: item.year || data.year,
        yearlyAchievementId: yearlyAchievement.id,
      })),
      { transaction },
    );

    const scientificInitiatives = await ScientificInitiative.bulkCreate(
      (data.scientificInitiatives || []).map((item) => ({
        ...item,
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

const getAll = async (query) => paginateQuery(YearlyAchievement, query, {
  filterFields: ['userId', 'year', 'hasMinistryReward', 'hasNationalReward'],
  include: [
    { model: User },
    { model: ScientificInitiative },
    { model: ScientificTopic },
  ],
});

const getDetail = async (id) => {
  const record = await YearlyAchievement.findByPk(id, {
    include: [
      { model: User },
      { model: ScientificInitiative },
      { model: ScientificTopic },
    ],
  });
  if (!record) throw new NotFoundError('Không tìm thấy thành tích năm');
  return record;
};

const update = async (id, data) => {
  const record = await getDetail(id);
  return record.update(data);
};

const deleteRecord = async (id) => {
  const record = await getDetail(id);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, createFull, getAll, getDetail, update, delete: deleteRecord };
