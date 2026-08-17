const db = require('../models');
const { NotFoundError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const ScientificInitiative = db.scientificInitiative;
const YearlyAchievement = db.yearlyAchievement;

const create = async (data) => ScientificInitiative.create(data);
const getAll = async (query) => paginateQuery(ScientificInitiative, query, {
  filterFields: ['yearlyAchievementId', 'title', 'year', 'status'],
  include: [{ model: YearlyAchievement }],
});

const getDetail = async (id) => {
  const record = await ScientificInitiative.findByPk(id, {
    include: [{ model: YearlyAchievement }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy sáng kiến');
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
