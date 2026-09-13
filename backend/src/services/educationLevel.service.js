const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const EducationLevel = db.educationLevel;
const Organization = db.organization;

const ensureUniqueEducationLevel = async (organizationId, levelName, excludeId) => {
  if (!levelName) return;
  const trimmed = String(levelName).trim();
  const existing = await EducationLevel.findOne({
    where: {
      organizationId,
      levelName: { [db.Sequelize.Op.iLike]: trimmed },
      ...(excludeId ? { id: { [db.Sequelize.Op.ne]: excludeId } } : {}),
    },
  });
  if (existing) {
    throw new BadRequestError(`Trình độ đào tạo "${trimmed}" đã tồn tại trong khoa/đơn vị này`);
  }
};

const create = async (data) => {
  const trimmedName = String(data.levelName || '').trim();
  await ensureUniqueEducationLevel(data.organizationId, trimmedName);
  return EducationLevel.create({ ...data, levelName: trimmedName });
};
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
  if (data.levelName) {
    await ensureUniqueEducationLevel(record.organizationId, data.levelName, id);
    data.levelName = String(data.levelName).trim();
  }
  return record.update(data);
};

const deleteRecord = async (id) => {
  const record = await getDetail(id);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
