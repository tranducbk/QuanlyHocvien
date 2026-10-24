const db = require('../models');
const { BadRequestError, NotFoundError } = require('../utils/apiError');

const ensureWorkDay = (value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new BadRequestError('Ngày trực không hợp lệ');
  }
};

const ownClass = async (classId, commander) => {
  const record = await db.trainingClass.findOne({
    where: { id: classId, trainingSystemId: commander.trainingSystemId, commanderId: commander.id },
  });
  if (!record) throw new NotFoundError('Không tìm thấy lớp được giao trong Hệ của bạn');
  return record;
};

const ensureStudent = async (classId, studentUserId, commander) => {
  const student = await db.user.findOne({
    where: { id: studentUserId, role: 'STUDENT', trainingSystemId: commander.trainingSystemId, isActive: true },
    include: [{ model: db.profile, where: { trainingClassId: classId, commanderId: commander.id }, required: true }],
  });
  if (!student) throw new BadRequestError('Học viên không thuộc lớp được giao và Hệ của Chỉ huy');
  return student;
};

const getRecord = async (model, classId, recordId, commander) => {
  await ownClass(classId, commander);
  const record = await model.findOne({ where: { id: recordId, trainingClassId: classId } });
  if (!record) throw new NotFoundError('Không tìm thấy bản ghi trong lớp được giao');
  return record;
};

const getStudentNames = async (classId, commander) => {
  const students = await db.user.findAll({
    where: { role: 'STUDENT', trainingSystemId: commander.trainingSystemId },
    attributes: ['id'],
    include: [{ model: db.profile, where: { trainingClassId: classId, commanderId: commander.id }, required: true, attributes: ['code', 'fullName'] }],
  });
  return new Map(students.map((student) => [student.id, { code: student.Profile.code, fullName: student.Profile.fullName }]));
};

const listAchievements = async (classId, commander) => {
  await ownClass(classId, commander);
  const rows = await db.trainingClassAchievement.findAll({ where: { trainingClassId: classId }, order: [['createdAt', 'DESC']] });
  const names = await getStudentNames(classId, commander);
  return rows.filter((row) => names.has(row.studentUserId)).map((row) => ({ ...row.get({ plain: true }), student: names.get(row.studentUserId) }));
};

const createAchievement = async (classId, data, commander) => {
  await ownClass(classId, commander);
  await ensureStudent(classId, data.studentUserId, commander);
  return db.trainingClassAchievement.create({
    trainingClassId: classId,
    studentUserId: data.studentUserId,
    category: data.category,
    title: String(data.title).trim(),
    award: data.award == null ? null : String(data.award).trim() || null,
    year: data.year ?? null,
    description: data.description == null ? null : String(data.description).trim() || null,
  });
};

const updateAchievement = async (classId, recordId, data, commander) => {
  const record = await getRecord(db.trainingClassAchievement, classId, recordId, commander);
  await ensureStudent(classId, record.studentUserId, commander);
  return record.update({
    category: data.category,
    title: String(data.title).trim(),
    award: data.award == null ? null : String(data.award).trim() || null,
    year: data.year ?? null,
    description: data.description == null ? null : String(data.description).trim() || null,
  });
};

const deleteAchievement = async (classId, recordId, commander) => {
  const record = await getRecord(db.trainingClassAchievement, classId, recordId, commander);
  await ensureStudent(classId, record.studentUserId, commander);
  await record.destroy();
  return { deleted: true };
};

const listDutySchedules = async (classId, commander) => {
  await ownClass(classId, commander);
  const rows = await db.trainingClassDutySchedule.findAll({ where: { trainingClassId: classId }, order: [['workDay', 'ASC']] });
  const names = await getStudentNames(classId, commander);
  return rows.filter((row) => names.has(row.studentUserId)).map((row) => ({ ...row.get({ plain: true }), student: names.get(row.studentUserId) }));
};

const createDutySchedule = async (classId, data, commander) => {
  await ownClass(classId, commander);
  await ensureStudent(classId, data.studentUserId, commander);
  ensureWorkDay(data.workDay);
  if (await db.trainingClassDutySchedule.findOne({ where: { trainingClassId: classId, studentUserId: data.studentUserId, workDay: data.workDay } })) {
    throw new BadRequestError('Học viên đã được phân công trong ngày này');
  }
  try {
    return await db.trainingClassDutySchedule.create({ trainingClassId: classId, studentUserId: data.studentUserId, position: String(data.position).trim(), workDay: data.workDay });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Học viên đã được phân công trong ngày này');
    throw error;
  }
};

const updateDutySchedule = async (classId, recordId, data, commander) => {
  const record = await getRecord(db.trainingClassDutySchedule, classId, recordId, commander);
  await ensureStudent(classId, record.studentUserId, commander);
  ensureWorkDay(data.workDay);
  try {
    return await record.update({ position: String(data.position).trim(), workDay: data.workDay });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Học viên đã được phân công trong ngày này');
    throw error;
  }
};

const deleteDutySchedule = async (classId, recordId, commander) => {
  const record = await getRecord(db.trainingClassDutySchedule, classId, recordId, commander);
  await ensureStudent(classId, record.studentUserId, commander);
  await record.destroy();
  return { deleted: true };
};

module.exports = { listAchievements, createAchievement, updateAchievement, deleteAchievement, listDutySchedules, createDutySchedule, updateDutySchedule, deleteDutySchedule };
