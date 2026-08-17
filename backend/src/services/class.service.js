const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { findStudentUsersByCodes } = require('../utils/studentLookup');

const Class = db.class;
const EducationLevel = db.educationLevel;
const Organization = db.organization;
const University = db.university;
const Profile = db.profile;
const User = db.user;
const Op = db.Sequelize.Op;

const NESTED_SORT_MAP = {
  levelName: [{ model: EducationLevel }, 'levelName'],
  organizationName: [{ model: EducationLevel }, { model: Organization }, 'organizationName'],
  universityName: [{ model: EducationLevel }, { model: Organization }, { model: University }, 'universityName'],
};

const studentCountLiteral = [
  db.Sequelize.literal(`(
    SELECT CAST(COUNT(id) AS INTEGER)
    FROM profiles
    WHERE profiles.class_id = "Class"."id"
  )`),
  'studentCount'
];

const create = async (data) => Class.create(data);

const getAll = async (query) => {
  const where = {};
  const elWhere = {};
  const orgWhere = {};
  const uniWhere = {};

  if (query.className) {
    where.className = { [db.Sequelize.Op.like]: `%${query.className}%` };
  }
  if (query.educationLevelId) {
    where.educationLevelId = query.educationLevelId;
  }
  if (query.organizationId) {
    orgWhere.id = query.organizationId;
  }
  if (query.levelName) {
    elWhere.levelName = { [db.Sequelize.Op.like]: `%${query.levelName}%` };
  }
  if (query.organizationName) {
    orgWhere.organizationName = { [db.Sequelize.Op.like]: `%${query.organizationName}%` };
  }
  if (query.universityName) {
    uniWhere.universityName = { [db.Sequelize.Op.like]: `%${query.universityName}%` };
  }
  if (query.universityId) {
    uniWhere.id = query.universityId;
  }

  const hasNestedFilter = Object.keys(elWhere).length > 0 || Object.keys(orgWhere).length > 0 || Object.keys(uniWhere).length > 0;

  const uniInclude = { model: University };
  if (Object.keys(uniWhere).length > 0) {
    uniInclude.where = uniWhere;
    uniInclude.required = true;
  }

  const orgInclude = { model: Organization, include: [uniInclude] };
  if (Object.keys(orgWhere).length > 0) {
    orgInclude.where = orgWhere;
    orgInclude.required = true;
  }

  const elInclude = { model: EducationLevel, include: [orgInclude] };
  if (Object.keys(elWhere).length > 0) {
    elInclude.where = elWhere;
    elInclude.required = true;
  }

  if (hasNestedFilter) {
    elInclude.required = true;
    orgInclude.required = true;
  }

  const options = { where, include: [elInclude], attributes: { include: [studentCountLiteral] } };

  if (query.sortBy && NESTED_SORT_MAP[query.sortBy]) {
    const sortOrder = query.sortOrder === 'desc' ? 'DESC' : 'ASC';
    options.order = [[...NESTED_SORT_MAP[query.sortBy], sortOrder]];
    delete query.sortBy;
    delete query.sortOrder;
  }

  return paginateQuery(Class, query, options);
};

const getDetail = async (id) => {
  const record = await Class.findByPk(id, {
    attributes: { include: [studentCountLiteral] },
    include: [{ model: EducationLevel }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy lớp học');
  return record;
};

const update = async (id, data) => {
  const record = await getDetail(id);
  return record.update(data);
};

const getStudents = async (classId, query) => {
  const where = { classId };

  if (query.code) where.code = query.code;
  if (query.fullName) {
    where.fullName = { [db.Sequelize.Op.like]: `%${query.fullName}%` };
  }
  if (query.gender) where.gender = query.gender;
  if (query.enrollment) where.enrollment = query.enrollment;
  if (query.unit) where.unit = query.unit;
  if (query.rank) where.rank = query.rank;

  return paginateQuery(Profile, query, {
    where,
    include: [{ model: User }, { model: Class }, { model: Organization }, { model: University }, { model: EducationLevel }],
  });
};

const deleteRecord = async (id) => {
  const record = await getDetail(id);
  await record.destroy();
  return { deleted: true };
};

const getClassWithHierarchy = async (id) => {
  const record = await Class.findByPk(id, {
    attributes: { include: [studentCountLiteral] },
    include: [{ model: EducationLevel, include: [{ model: Organization, include: [{ model: University }] }] }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy lớp học');
  return record;
};

const getStudentProfilesByUserIds = async (userIds = []) => {
  const uniqueIds = [...new Set(userIds)];
  const users = await User.findAll({
    where: {
      id: { [Op.in]: uniqueIds },
      role: 'STUDENT',
    },
    include: [{ model: Profile }],
  });

  if (users.length !== uniqueIds.length) {
    throw new BadRequestError('Có học viên không tồn tại');
  }

  const profiles = users.map((user) => user.Profile).filter(Boolean);
  if (profiles.length !== uniqueIds.length) {
    throw new BadRequestError('Có học viên chưa có hồ sơ');
  }

  return { uniqueIds, profiles };
};

const assignStudents = async (classId, userIds = []) => {
  const record = await getClassWithHierarchy(classId);
  const { uniqueIds, profiles } = await getStudentProfilesByUserIds(userIds);
  const profileIds = profiles.map((profile) => profile.id);
  const orgId = record.EducationLevel?.organizationId || null;
  const uniId = record.EducationLevel?.Organization?.universityId || null;

  await Profile.update({
    classId: record.id,
    educationLevelId: record.educationLevelId,
    organizationId: orgId,
    universityId: uniId,
  }, {
    where: { id: { [Op.in]: profileIds } },
  });

  // Re-fetch to get accurate updated count
  const updatedRecord = await getClassWithHierarchy(classId);

  return { classId: record.id, updated: uniqueIds.length, studentCount: updatedRecord.dataValues.studentCount };
};

const assignStudentsByCodes = async (classId, studentCodes = []) => {
  const students = await findStudentUsersByCodes(studentCodes);
  const userIds = students.map((student) => student.user.id);
  const result = await assignStudents(classId, userIds);
  return {
    ...result,
    studentCodes: students.map((student) => student.code),
  };
};

const removeStudents = async (classId, userIds = []) => {
  const record = await getClassWithHierarchy(classId);
  const { uniqueIds, profiles } = await getStudentProfilesByUserIds(userIds);
  const profileIds = profiles.map((profile) => profile.id);
  const invalidProfile = profiles.find((profile) => profile.classId !== record.id);
  if (invalidProfile) {
    throw new BadRequestError('Có học viên không thuộc lớp này');
  }

  await Profile.update({
    classId: null,
    educationLevelId: null,
    organizationId: null,
    universityId: null,
  }, {
    where: { id: { [Op.in]: profileIds } },
  });

  // Re-fetch to get accurate updated count
  const updatedRecord = await getClassWithHierarchy(classId);

  return { classId: record.id, updated: uniqueIds.length, studentCount: updatedRecord.dataValues.studentCount };
};

const removeStudent = async (classId, userId) => {
  const result = await removeStudents(classId, [userId]);
  return { ...result, userId };
};

module.exports = { create, getAll, getDetail, getStudents, update, delete: deleteRecord, assignStudents, assignStudentsByCodes, removeStudents, removeStudent };
