const db = require('../models');
const { NotFoundError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const ScientificTopic = db.scientificTopic;
const YearlyAchievement = db.yearlyAchievement;

const create = async (data) => ScientificTopic.create(data);
const getAll = async (query) => paginateQuery(ScientificTopic, query, {
  filterFields: ['yearlyAchievementId', 'title', 'year', 'status'],
  include: [{ model: YearlyAchievement }],
});

const getDetail = async (id) => {
  const record = await ScientificTopic.findByPk(id, {
    include: [{ model: YearlyAchievement }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy đề tài NCKH');
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

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
