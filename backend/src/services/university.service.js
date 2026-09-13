const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const University = db.university;
const Organization = db.organization;
const EducationLevel = db.educationLevel;
const Class = db.class;

const totalStudentsLiteral = [
  db.Sequelize.literal(`(
    SELECT CAST(COUNT(id) AS INTEGER)
    FROM profiles
    WHERE profiles.university_id = "University"."id"
  )`),
  'totalStudents'
];

const ensureUniqueUniversity = async ({ code, name, excludeId } = {}) => {
  if (code) {
    const trimmedCode = String(code).trim();
    const existing = await University.findOne({
      where: {
        universityCode: { [db.Sequelize.Op.iLike]: trimmedCode },
        ...(excludeId ? { id: { [db.Sequelize.Op.ne]: excludeId } } : {}),
      },
    });
    if (existing) throw new BadRequestError(`Mã trường "${trimmedCode}" đã tồn tại trong hệ thống`);
  }

  if (name) {
    const trimmedName = String(name).trim();
    const existing = await University.findOne({
      where: {
        universityName: { [db.Sequelize.Op.iLike]: trimmedName },
        ...(excludeId ? { id: { [db.Sequelize.Op.ne]: excludeId } } : {}),
      },
    });
    if (existing) throw new BadRequestError(`Tên trường "${trimmedName}" đã tồn tại trong hệ thống`);
  }
};

const create = async (data) => {
  const trimmedCode = String(data.universityCode || '').trim();
  const trimmedName = String(data.universityName || '').trim();

  await ensureUniqueUniversity({ code: trimmedCode, name: trimmedName });

  const transaction = await db.sequelize.transaction();
  try {
    const university = await University.create(
      {
        universityCode: trimmedCode,
        universityName: trimmedName,
        status: data.status || 'ACTIVE',
      },
      { transaction }
    );

    if (data.organizations && data.organizations.length > 0) {
      for (const orgData of data.organizations) {
        if (orgData.organizationName) {
          const organization = await Organization.create(
            {
              organizationName: orgData.organizationName,
              universityId: university.id,
              status: 'ACTIVE',
              travelTime: 0,
            },
            { transaction }
          );

          const levels = orgData.educationLevels
            ? orgData.educationLevels.split(',').map((l) => l.trim()).filter((l) => l)
            : ['Đại học', 'Thạc sĩ', 'Tiến sĩ'];

          for (const levelName of levels) {
            await EducationLevel.create(
              {
                levelName,
                organizationId: organization.id,
              },
              { transaction }
            );
          }
        }
      }
    }

    await transaction.commit();
    return getDetail(university.id);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
const getAll = async (query) => paginateQuery(University, query, {
  filterFields: ['universityCode', 'universityName', 'status'],
  attributes: { include: [totalStudentsLiteral] },
  include: [
    {
      model: Organization,
      include: [{ model: EducationLevel, include: [Class] }],
    },
  ],
});

const getDetail = async (id) => {
  const record = await University.findByPk(id, {
    attributes: { include: [totalStudentsLiteral] },
    include: [
      {
        model: Organization,
        include: [
          {
            model: EducationLevel,
            include: [Class],
          },
        ],
      },
    ],
  });
  if (!record) throw new NotFoundError('Không tìm thấy trường');
  return record;
};

const getHierarchy = async () => {
  return University.findAll({
    attributes: { include: [totalStudentsLiteral] },
    include: [
      {
        model: Organization,
        include: [
          {
            model: EducationLevel,
            include: [Class],
          },
        ],
      },
    ],
    order: [['universityName', 'ASC']],
  });
};

const update = async (id, data) => {
  const record = await getDetail(id);

  await ensureUniqueUniversity({
    code: data.universityCode,
    name: data.universityName,
    excludeId: id,
  });

  if (data.universityCode) data.universityCode = String(data.universityCode).trim();
  if (data.universityName) data.universityName = String(data.universityName).trim();

  return record.update(data);
};

const deleteRecord = async (id) => {
  const record = await University.findByPk(id);
  if (!record) throw new NotFoundError('Không tìm thấy trường');
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, getAll, getDetail, getHierarchy, update, delete: deleteRecord };
