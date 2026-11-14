const db = require('../../models');
const { BadRequestError, NotFoundError } = require('../../utils/apiError');

const ownClass = async (classId, commander, transaction) => {
  const record = await db.trainingClass.findOne({ where: {
    id: classId, commanderId: commander.id, trainingSystemId: commander.trainingSystemId,
  }, transaction });
  if (!record) throw new NotFoundError('Không tìm thấy lớp được giao trong Hệ của bạn');
  return record;
};

// Every point write and semester closure uses this same lock before touching result/profile rows.
const lockSemester = async (classId, semesterId, transaction) => {
  const semester = await db.trainingClassSemester.findOne({
    where: { id: semesterId, trainingClassId: classId }, transaction, lock: transaction.LOCK.UPDATE,
  });
  if (!semester) throw new NotFoundError('Không tìm thấy học kỳ trong lớp');
  return semester;
};
const prepareWrite = async (classId, semesterId, reason, commander, transaction) => {
  const semester = await lockSemester(classId, semesterId, transaction);
  const normalized = String(reason || '').trim();
  if (semester.gradeClosedAt && normalized.length < 5) throw new BadRequestError('Học kỳ đã chốt: cần lý do ít nhất 5 ký tự');
  await db.sequelize.query(`SELECT set_config('qlhv.grade_editor', :editor, true), set_config('qlhv.grade_reason', :reason, true)`, {
    replacements: { editor: commander.id, reason: normalized }, transaction,
  });
  return semester;
};

const counts = async (classId, semesterId, commander, transaction) => {
  const [students, subjects, results, pending] = await Promise.all([
    db.profile.findAll({ where: { trainingClassId: classId, commanderId: commander.id },
      include: [{ model: db.user, where: { role: 'STUDENT', isActive: true, trainingSystemId: commander.trainingSystemId }, required: true }], transaction }),
    db.trainingClassSubject.findAll({ where: { trainingClassId: classId, semesterId }, transaction }),
    db.trainingClassResult.findAll({ where: { trainingClassId: classId, semesterId }, attributes: ['profileId', 'subjectId'], transaction }),
    db.trainingClassGradeProposal.count({ where: { trainingClassId: classId, semesterId, status: 'PENDING' }, transaction }),
  ]);
  const keys = new Set(results.map((row) => `${row.profileId}:${row.subjectId}`));
  const missing = students.reduce((total, student) => total + subjects.filter((subject) => !keys.has(`${student.id}:${subject.id}`)).length, 0);
  return { missing, pending, studentCount: students.length, subjectCount: subjects.length };
};

const status = async (classId, semesterId, commander) => {
  await ownClass(classId, commander);
  const semester = await db.trainingClassSemester.findOne({ where: { id: semesterId, trainingClassId: classId } });
  if (!semester) throw new NotFoundError('Không tìm thấy học kỳ trong lớp');
  return { gradeClosedAt: semester.gradeClosedAt, gradeClosedBy: semester.gradeClosedBy, ...await counts(classId, semesterId, commander) };
};

const close = (classId, semesterId, confirmIncomplete, commander) => db.sequelize.transaction(async (transaction) => {
  await ownClass(classId, commander, transaction);
  const semester = await lockSemester(classId, semesterId, transaction);
  if (semester.gradeClosedAt) throw new BadRequestError('Học kỳ đã chốt');
  const report = await counts(classId, semesterId, commander, transaction);
  if (!report.studentCount || !report.subjectCount) throw new BadRequestError('Chưa có học viên hoặc môn học để chốt điểm');
  if ((report.missing || report.pending) && !confirmIncomplete) {
    throw new BadRequestError(`Còn ${report.missing} môn/học viên chưa có điểm, ${report.pending} đề xuất chờ duyệt. Cần xác nhận chốt khi chưa đầy đủ.`);
  }
  return semester.update({ gradeClosedAt: new Date(), gradeClosedBy: commander.id }, { transaction });
});

const history = async (classId, resultId, commander) => {
  await ownClass(classId, commander);
  if (!await db.trainingClassResult.findOne({ where: { id: resultId, trainingClassId: classId } })) throw new NotFoundError('Không tìm thấy điểm trong lớp');
  return db.trainingClassGradeRevision.findAll({ where: { resultId },
    include: [{ model: db.user, as: 'editor', attributes: ['id', 'username'] }], order: [['createdAt', 'ASC'], ['id', 'ASC']] });
};

module.exports = { ownClass, lockSemester, prepareWrite, status, close, history };
