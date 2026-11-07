const db = require('../../models');
const { NotFoundError, BadRequestError } = require('../../utils/apiError');
const { paginateQuery } = require('../../utils/response');

const Organization = db.organization;
const University = db.university;
const EducationLevel = db.educationLevel;
const DEFAULT_LEVEL_NAMES = ['Cử nhân', 'Kỹ sư'];

const normalizeName = (name) => {
  const normalized = typeof name === 'string' ? name.normalize('NFC').trim().replace(/\s+/gu, ' ') : '';
  if (!normalized) throw new BadRequestError('Tên ngành học là bắt buộc');
  return normalized;
};

const assertNameAvailable = async (universityId, name, transaction, excludeId) => {
  const university = await University.findByPk(universityId, { transaction, lock: transaction.LOCK.UPDATE });
  if (!university) throw new NotFoundError('Không tìm thấy trường');
  const records = await Organization.findAll({
    where: { universityId }, attributes: ['id', 'organizationName'], transaction,
  });
  const key = normalizeName(name).toLocaleLowerCase('vi');
  if (records.some((record) => record.id !== excludeId && normalizeName(record.organizationName).toLocaleLowerCase('vi') === key)) {
    throw new BadRequestError('Ngành học đã tồn tại trong trường này. Vui lòng chọn ngành đã có');
  }
};

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
    const organizationName = normalizeName(data.organizationName);
    await assertNameAvailable(data.universityId, organizationName, transaction);
    const record = await Organization.create({
      organizationName,
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
  return db.sequelize.transaction(async (transaction) => {
    const organizationName = normalizeName(data.organizationName !== undefined ? data.organizationName : record.organizationName);
    await assertNameAvailable(data.universityId ?? record.universityId, organizationName, transaction, id);
    return record.update({
    organizationName,
    ...(data.travelTime !== undefined ? { travelTime: data.travelTime } : {}),
    ...(data.totalStudents !== undefined ? { totalStudents: data.totalStudents } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.universityId !== undefined ? { universityId: data.universityId } : {}),
    }, { transaction });
  });
};

const deleteRecord = async (id) => {
  const record = await getDetail(id);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, update, delete: deleteRecord, normalizeName, assertNameAvailable };
