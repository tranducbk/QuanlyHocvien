const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const Organization = db.organization;
const University = db.university;

const totalStudentsLiteral = [
  db.Sequelize.literal(`(
    SELECT CAST(COUNT(id) AS INTEGER)
    FROM profiles
    WHERE profiles.organization_id = "Organization"."id"
  )`),
  'totalStudents'
];

const ensureUniqueOrganization = async (universityId, organizationName, excludeId) => {
  if (!organizationName) return;
  const trimmed = String(organizationName).trim();
  const existing = await Organization.findOne({
    where: {
      universityId,
      organizationName: { [db.Sequelize.Op.iLike]: trimmed },
      ...(excludeId ? { id: { [db.Sequelize.Op.ne]: excludeId } } : {}),
    },
  });
  if (existing) {
    throw new BadRequestError(`Khoa/ngành "${trimmed}" đã tồn tại trong trường này`);
  }
};

const create = async (data) => {
  const trimmedName = String(data.organizationName || '').trim();
  await ensureUniqueOrganization(data.universityId, trimmedName);
  return Organization.create({ ...data, organizationName: trimmedName });
};
const getAll = async (query) => paginateQuery(Organization, query, {
  filterFields: ['organizationName', 'status', 'universityId'],
  attributes: { include: [totalStudentsLiteral] },
  include: [{ model: University }],
});

const getDetail = async (id) => {
  const record = await Organization.findByPk(id, {
    attributes: { include: [totalStudentsLiteral] },
    include: [{ model: University }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy đơn vị');
  return record;
};

const update = async (id, data) => {
  const record = await getDetail(id);
  if (data.organizationName) {
    await ensureUniqueOrganization(record.universityId, data.organizationName, id);
    data.organizationName = String(data.organizationName).trim();
  }
  return record.update(data);
};

const deleteRecord = async (id) => {
  const record = await getDetail(id);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
