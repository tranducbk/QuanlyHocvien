const db = require('../models');
const { BadRequestError, NotFoundError } = require('../utils/apiError');

const getOwnedClass = async (classId, commanderId) => {
  const record = await db.militaryClass.findOne({
    where: { id: classId, commanderId },
  });
  if (!record) throw new NotFoundError('Không tìm thấy lớp quân sự');
  return record;
};

const ensureClassStudent = async (classId, userId) => {
  const user = await db.user.findOne({
    where: { id: userId, role: 'STUDENT', systemType: 'MILITARY' },
    include: [
      {
        model: db.profile,
        where: { militaryClassId: classId },
        required: true,
      },
    ],
  });
  if (!user) throw new BadRequestError('Học viên không thuộc lớp quân sự này');
  return user;
};

const achievementInclude = [
  {
    model: db.user,
    attributes: ['id', 'username'],
    include: [
      {
        model: db.profile,
        attributes: ['id', 'code', 'fullName', 'militaryClassId'],
      },
    ],
  },
];
const listClassAchievements = async (classId, commanderId) => {
  await getOwnedClass(classId, commanderId);
  return db.militaryAchievement.findAll({
    where: { classId },
    include: achievementInclude,
    order: [
      ['year', 'DESC'],
      ['createdAt', 'DESC'],
    ],
  });
};
const listStudentAchievements = async (userId) =>
  db.militaryAchievement.findAll({
    where: { userId },
    order: [
      ['year', 'DESC'],
      ['createdAt', 'DESC'],
    ],
  });
const createAchievement = async (classId, data, commanderId) => {
  await getOwnedClass(classId, commanderId);
  await ensureClassStudent(classId, data.userId);
  return db.militaryAchievement.create({ ...data, classId });
};
const getAchievement = async (id, commanderId) => {
  const record = await db.militaryAchievement.findByPk(id, {
    include: achievementInclude,
  });
  if (!record) throw new NotFoundError('Không tìm thấy thành tích');
  await getOwnedClass(record.classId, commanderId);
  return record;
};
const updateAchievement = async (id, data, commanderId) => {
  const record = await getAchievement(id, commanderId);
  if (data.userId) await ensureClassStudent(record.classId, data.userId);
  return record.update(data);
};
const deleteAchievement = async (id, commanderId) => {
  const record = await getAchievement(id, commanderId);
  await record.destroy();
  return { deleted: true };
};

const listClassDutySchedules = async (classId, commanderId) => {
  await getOwnedClass(classId, commanderId);
  return db.militaryDutySchedule.findAll({
    where: { classId },
    include: [
      {
        model: db.user,
        attributes: ['id', 'username'],
        include: [
          {
            model: db.profile,
            attributes: ['code', 'fullName', 'rank', 'phoneNumber'],
          },
        ],
      },
    ],
    order: [['workDay', 'ASC']],
  });
};
const createDutySchedule = async (classId, data, commanderId) => {
  await getOwnedClass(classId, commanderId);
  await ensureClassStudent(classId, data.userId);
  return db.militaryDutySchedule.create({ ...data, classId });
};
const getDutySchedule = async (id, commanderId) => {
  const record = await db.militaryDutySchedule.findByPk(id);
  if (!record) throw new NotFoundError('Không tìm thấy lịch trực');
  await getOwnedClass(record.classId, commanderId);
  return record;
};
const updateDutySchedule = async (id, data, commanderId) => {
  const record = await getDutySchedule(id, commanderId);
  if (data.userId) await ensureClassStudent(record.classId, data.userId);
  return record.update(data);
};
const deleteDutySchedule = async (id, commanderId) => {
  const record = await getDutySchedule(id, commanderId);
  await record.destroy();
  return { deleted: true };
};

module.exports = {
  listClassAchievements,
  listStudentAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  listClassDutySchedules,
  createDutySchedule,
  updateDutySchedule,
  deleteDutySchedule,
};
