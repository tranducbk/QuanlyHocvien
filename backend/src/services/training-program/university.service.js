const db = require('../../models');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/apiError');
const { paginateQuery } = require('../../utils/response');
const { normalizeName, assertNameAvailable } = require('./organization.service');

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

const create = async (data) => {
  const transaction = await db.sequelize.transaction();
  try {
    const university = await University.create(
      {
        universityCode: data.universityCode,
        universityName: data.universityName,
        status: data.status || 'ACTIVE',
      },
      { transaction }
    );

    if (data.organizations && data.organizations.length > 0) {
      for (const orgData of data.organizations) {
        if (orgData.organizationName) {
          const organizationName = normalizeName(orgData.organizationName);
          await assertNameAvailable(university.id, organizationName, transaction);
          const organization = await Organization.create(
            {
              organizationName,
              universityId: university.id,
              status: 'ACTIVE',
              travelTime: 0,
            },
            { transaction }
          );

          const levels = orgData.educationLevels
            ? orgData.educationLevels.split(',').map((l) => l.trim()).filter((l) => l)
            : ['Cử nhân', 'Kỹ sư'];

          if (levels.some((levelName) => !['Cử nhân', 'Kỹ sư'].includes(levelName))) {
            throw new BadRequestError('Trình độ đào tạo Hệ 5 chỉ gồm Cử nhân hoặc Kỹ sư');
          }

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
  return record.update(data);
};

const deleteRecord = async (id) => {
  const record = await University.findByPk(id);
  if (!record) throw new NotFoundError('Không tìm thấy trường');
  await record.destroy();
  return { deleted: true };
};

const studentScope = (requester) => {
  if (requester?.role !== 'COMMANDER' || requester.trainingSystemCode !== 'HE_5' || !requester.trainingSystemId) {
    throw new ForbiddenError('Chỉ Chỉ huy Hệ 5 được thêm học viên vào trường');
  }
  return { role: 'STUDENT', trainingSystemId: requester.trainingSystemId, isActive: true };
};

const availableStudents = async (id, query, requester) => {
  const scope = studentScope(requester);
  await getDetail(id);
  const { Op } = db.Sequelize;
  const where = { universityId: null };
  if (query.search) where[Op.or] = ['fullName', 'code'].map((field) => ({ [field]: { [Op.iLike]: `%${query.search}%` } }));
  for (const field of ['fullName', 'code']) {
    if (query[field]) where[field] = { [Op.iLike]: `%${query[field]}%` };
  }
  if (query.gender) where.gender = query.gender;
  return paginateQuery(db.profile, query, {
    where, attributes: ['id', 'code', 'fullName', 'gender'],
    include: [{ model: db.user, attributes: [], required: true, where: scope }],
    order: [['fullName', 'ASC'], ['id', 'ASC']],
  });
};

const addStudents = async (id, profileIds, requester) => {
  const scope = studentScope(requester);
  const { Op } = db.Sequelize;
  return db.sequelize.transaction(async (transaction) => {
    const university = await University.findByPk(id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!university) throw new NotFoundError('Không tìm thấy trường');
    if (university.status !== 'ACTIVE') throw new BadRequestError('Trường đang tạm dừng hoạt động');
    const accounts = await db.user.findAll({
      where: { ...scope, profileId: { [Op.in]: profileIds } }, attributes: ['profileId'],
      transaction, lock: transaction.LOCK.UPDATE, order: [['id', 'ASC']],
    });
    if (new Set(accounts.map((row) => row.profileId)).size !== profileIds.length) {
      throw new BadRequestError('Chỉ được chọn học viên đang hoạt động thuộc Hệ 5');
    }
    const profiles = await db.profile.findAll({
      where: { id: { [Op.in]: profileIds } }, transaction,
      lock: transaction.LOCK.UPDATE, order: [['id', 'ASC']],
    });
    if (profiles.length !== profileIds.length || profiles.some((row) => row.universityId)) {
      throw new BadRequestError('Danh sách đã thay đổi. Vui lòng chọn lại học viên chưa có trường');
    }
    for (const profile of profiles) {
      let organizationId = profile.organizationId;
      let educationLevelId = profile.educationLevelId;
      if (profile.classId) {
        const academicClass = await Class.findByPk(profile.classId, { transaction });
        if (!academicClass || (educationLevelId && educationLevelId !== academicClass.educationLevelId)) {
          throw new BadRequestError('Thông tin lớp đào tạo của học viên không nhất quán');
        }
        educationLevelId = academicClass.educationLevelId;
      }
      if (educationLevelId) {
        const level = await EducationLevel.findByPk(educationLevelId, { transaction });
        if (!level || (organizationId && organizationId !== level.organizationId)) {
          throw new BadRequestError('Thông tin trình độ đào tạo của học viên không nhất quán');
        }
        organizationId = level.organizationId;
      }
      if (organizationId) {
        const organization = await Organization.findByPk(organizationId, { transaction });
        if (!organization || organization.universityId !== id) {
          throw new BadRequestError('Chuyên ngành hiện tại của học viên không thuộc trường này');
        }
      }
      await profile.update({ universityId: id }, { transaction });
    }
    return { added: profiles.length };
  });
};

module.exports = { create, getAll, getDetail, getHierarchy, update, delete: deleteRecord, availableStudents, addStudents };
