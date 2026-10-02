const db = require('../models');
const { BadRequestError, NotFoundError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const ownClass = async (id, commanderId) => {
  const record = await db.militaryClass.findOne({ where: { id, commanderId } });
  if (!record) throw new NotFoundError('Không tìm thấy lớp quân sự');
  return record;
};
const ownSemester = async (id, commanderId) => {
  const record = await db.militarySemester.findOne({
    where: { id, commanderId },
  });
  if (!record) throw new NotFoundError('Không tìm thấy học kỳ quân sự');
  return record;
};

const getSemesters = (query, commanderId) =>
  paginateQuery(db.militarySemester, query, { where: { commanderId } });
const createSemester = async (data, commanderId) => {
  if (await db.militarySemester.findOne({ where: { ...data, commanderId } }))
    throw new BadRequestError('Học kỳ đã tồn tại');
  return db.militarySemester.create({ ...data, commanderId });
};
const getSemester = async (id, commanderId) => ownSemester(id, commanderId);
const updateSemester = async (id, data, commanderId) => {
  const record = await ownSemester(id, commanderId);
  const duplicate = await db.militarySemester.findOne({
    where: { ...data, commanderId },
  });
  if (duplicate && duplicate.id !== record.id) throw new BadRequestError('Học kỳ đã tồn tại');
  return record.update(data);
};
const deleteSemester = async (id, commanderId) => {
  const record = await ownSemester(id, commanderId);
  if (
    (await db.militarySubject.count({ where: { semesterId: id } })) ||
    (await db.militaryTimeTable.count({ where: { semesterId: id } }))
  )
    throw new BadRequestError('Không thể xóa học kỳ đang có môn học hoặc lịch học');
  await record.destroy();
  return { deleted: true };
};

const getSubjects = async (classId, query, commanderId) => {
  await ownClass(classId, commanderId);
  return paginateQuery(db.militarySubject, query, {
    where: { classId },
    include: [{ model: db.militarySemester, where: { commanderId }, required: true }],
  });
};
const createSubject = async (classId, data, commanderId) => {
  await ownClass(classId, commanderId);
  await ownSemester(data.semesterId, commanderId);
  if (
    await db.militarySubject.findOne({
      where: {
        classId,
        semesterId: data.semesterId,
        subjectCode: data.subjectCode,
      },
    })
  )
    throw new BadRequestError('Mã môn đã tồn tại trong lớp và học kỳ');
  return db.militarySubject.create({ ...data, classId });
};
const updateSubject = async (classId, id, data, commanderId) => {
  await ownClass(classId, commanderId);
  const record = await db.militarySubject.findOne({ where: { id, classId } });
  if (!record) throw new NotFoundError('Không tìm thấy môn học');
  if (
    data.subjectCode &&
    data.subjectCode !== record.subjectCode &&
    (await db.militarySubject.findOne({
      where: {
        classId,
        semesterId: data.semesterId || record.semesterId,
        subjectCode: data.subjectCode,
      },
    }))
  )
    throw new BadRequestError('Mã môn đã tồn tại trong lớp và học kỳ');
  if (data.semesterId) await ownSemester(data.semesterId, commanderId);
  if (
    data.subjectName !== record.subjectName ||
    (data.semesterId && data.semesterId !== record.semesterId)
  ) {
    const tables = await db.militaryTimeTable.findAll({
      where: { classId, semesterId: record.semesterId },
    });
    if (
      tables.some((table) =>
        table.schedules.some((item) => item.subjectName === record.subjectName),
      )
    )
      throw new BadRequestError('Không thể đổi tên hoặc học kỳ môn đang có lịch học');
  }
  return record.update(data);
};
const deleteSubject = async (classId, id, commanderId) => {
  await ownClass(classId, commanderId);
  const record = await db.militarySubject.findOne({ where: { id, classId } });
  if (!record) throw new NotFoundError('Không tìm thấy môn học');
  const tables = await db.militaryTimeTable.findAll({
    where: { classId, semesterId: record.semesterId },
  });
  if (
    tables.some((table) => table.schedules.some((item) => item.subjectName === record.subjectName))
  )
    throw new BadRequestError('Không thể xóa môn đang có lịch học');
  if (
    (await db.militarySubjectResult.count({
      where: { militarySubjectId: id },
    })) ||
    (await db.militaryGradeProposal.count({ where: { militarySubjectId: id } }))
  )
    throw new BadRequestError('Không thể xóa môn đã có điểm hoặc đề xuất điểm');
  await record.destroy();
  return { deleted: true };
};

const getTimeTable = async (classId, semesterId, commanderId) => {
  await ownClass(classId, commanderId);
  await ownSemester(semesterId, commanderId);
  return db.militaryTimeTable.findOne({ where: { classId, semesterId } });
};
const saveTimeTable = async (classId, data, commanderId) => {
  await ownClass(classId, commanderId);
  await ownSemester(data.semesterId, commanderId);
  for (const item of data.schedules) {
    if (item.startTime >= item.endTime)
      throw new BadRequestError('Giờ bắt đầu phải trước giờ kết thúc');
    const subject = await db.militarySubject.findOne({
      where: {
        classId,
        semesterId: data.semesterId,
        subjectName: item.subjectName,
      },
    });
    if (!subject)
      throw new BadRequestError(`Môn ${item.subjectName} chưa được khai báo cho lớp và học kỳ này`);
  }
  for (let left = 0; left < data.schedules.length; left += 1) {
    for (let right = left + 1; right < data.schedules.length; right += 1) {
      const first = data.schedules[left];
      const second = data.schedules[right];
      const firstWeeks = first.week || [];
      const secondWeeks = second.week || [];
      const sameWeek =
        !firstWeeks.length ||
        !secondWeeks.length ||
        firstWeeks.some((week) => secondWeeks.includes(week));
      const overlap = first.startTime < second.endTime && second.startTime < first.endTime;
      if (sameWeek && first.day === second.day && overlap)
        throw new BadRequestError(`Trùng lịch học ngày ${first.day}`);
    }
  }
  const record = await db.militaryTimeTable.findOne({
    where: { classId, semesterId: data.semesterId },
  });
  return record
    ? record.update({ schedules: data.schedules })
    : db.militaryTimeTable.create({ classId, ...data });
};
const getStudentTimeTable = async (userId, semesterId) => {
  const user = await db.user.findOne({
    where: { id: userId, systemType: 'MILITARY', role: 'STUDENT' },
    include: [{ model: db.profile }],
  });
  const profile = user?.Profile;
  if (!profile?.militaryClassId) throw new NotFoundError('Chưa được xếp vào lớp quân sự');
  const where = { classId: profile.militaryClassId };
  if (semesterId) where.semesterId = semesterId;
  return db.militaryTimeTable.findAll({
    where,
    include: [{ model: db.militarySemester }],
  });
};

const getStudentSubjects = async (userId) => {
  const user = await db.user.findOne({
    where: { id: userId, systemType: 'MILITARY', role: 'STUDENT' },
    include: [{ model: db.profile }],
  });
  if (!user?.Profile?.militaryClassId)
    throw new NotFoundError('ChÆ°a Ä‘Æ°á»£c xáº¿p vÃ o lá»›p quÃ¢n sá»±');
  return db.militarySubject.findAll({
    where: { classId: user.Profile.militaryClassId },
    include: [{ model: db.militarySemester }],
    order: [['subjectName', 'ASC']],
  });
};

module.exports = {
  getSemesters,
  createSemester,
  getSemester,
  updateSemester,
  deleteSemester,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getTimeTable,
  saveTimeTable,
  getStudentTimeTable,
  getStudentSubjects,
};
