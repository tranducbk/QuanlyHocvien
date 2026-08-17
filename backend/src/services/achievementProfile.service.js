const db = require('../models');
const User = db.user;
const { NotFoundError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const Model = db.achievementProfile;
const Student = db.profile;

const create = async (data) => Model.create(data);
const getAll = async (query) => paginateQuery(Model, query, {
  filterFields: ['userId', 'eligibleForMinistryReward', 'eligibleForNationalReward'],
  include: [{ model: User }],
});

const getDetail = async (id) => {
  const record = await Model.findByPk(id, {
    include: [{ model: User }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy hồ sơ thành tích');
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
