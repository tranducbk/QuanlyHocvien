const db = require('../models');
const { NotFoundError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const EducationLevel = db.educationLevel;
const Organization = db.organization;

const create = async (data) => EducationLevel.create(data);
const getAll = async (query) => paginateQuery(EducationLevel, query, {
  filterFields: ['levelName', 'organizationId'],
  include: [{ model: Organization }],
});

const getDetail = async (id) => {
  const record = await EducationLevel.findByPk(id, {
    include: [{ model: Organization }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy trình độ đào tạo');
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
