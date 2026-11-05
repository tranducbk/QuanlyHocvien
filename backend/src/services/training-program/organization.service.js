const db = require('../../models');
const { NotFoundError } = require('../../utils/apiError');
const { paginateQuery } = require('../../utils/response');

const Organization = db.organization;
const University = db.university;
const EducationLevel = db.educationLevel;
const DEFAULT_LEVEL_NAMES = ['Cử nhân', 'Kỹ sư'];

const totalStudentsLiteral = [
  db.Sequelize.literal(`(
    SELECT CAST(COUNT(id) AS INTEGER)
    FROM profiles
    WHERE profiles.organization_id = "Organization"."id"
  )`),
  'totalStudents'
];

const create = async (data) => {
  const transaction = await db.sequelize.transaction();
  try {
    const record = await Organization.create({
      organizationName: data.organizationName,
      universityId: data.universityId,
      travelTime: data.travelTime ?? 0,
      totalStudents: data.totalStudents ?? 0,
      status: data.status || 'ACTIVE',
    }, { transaction });
    await EducationLevel.bulkCreate(
      DEFAULT_LEVEL_NAMES.map((levelName) => ({ levelName, organizationId: record.id })),
      { transaction }
    );
    await transaction.commit();
    return getDetail(record.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
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
  return record.update({
    ...(data.organizationName !== undefined ? { organizationName: data.organizationName } : {}),
    ...(data.travelTime !== undefined ? { travelTime: data.travelTime } : {}),
    ...(data.totalStudents !== undefined ? { totalStudents: data.totalStudents } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.universityId !== undefined ? { universityId: data.universityId } : {}),
  });
};

const deleteRecord = async (id) => {
  const record = await getDetail(id);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
