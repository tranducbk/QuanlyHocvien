const db = require('../models');
const { BadRequestError, NotFoundError } = require('../utils/apiError');

const getStudentProfile = async (userId) => {
  const user = await db.user.findOne({
    where: { id: userId, role: 'STUDENT', systemType: 'MILITARY' },
    include: [{ model: db.profile }],
  });
  if (!user?.Profile) throw new NotFoundError('Không tìm thấy hồ sơ học viên quân sự');
  return { user, profile: user.Profile };
};

const ownClass = async (classId, commanderId) => {
  const record = await db.militaryClass.findOne({
    where: { id: classId, commanderId },
  });
  if (!record) throw new NotFoundError('Không tìm thấy lớp quân sự');
  return record;
};

const ensureSubject = async (subjectId, classId) => {
  const subject = await db.militarySubject.findOne({
    where: { id: subjectId, classId },
    include: [{ model: db.militarySemester }],
  });
  if (!subject) throw new NotFoundError('Không tìm thấy môn học quân sự trong lớp');
  return subject;
};

const listClassResults = async (classId, semesterId, commanderId) => {
  await ownClass(classId, commanderId);
  const subjectWhere = { classId };
  if (semesterId) subjectWhere.semesterId = semesterId;
  const subjects = await db.militarySubject.findAll({
    where: subjectWhere,
    attributes: ['id'],
  });
  const subjectIds = subjects.map((subject) => subject.id);
  if (!subjectIds.length) return [];
  return db.militarySubjectResult.findAll({
    where: { militarySubjectId: subjectIds },
    include: [
      {
        model: db.profile,
        where: { militaryClassId: classId },
        include: [
          {
            model: db.user,
            attributes: { exclude: ['password', 'refreshToken'] },
            where: { systemType: 'MILITARY', role: 'STUDENT' },
            required: true,
          },
        ],
        required: true,
      },
      { model: db.militarySubject, include: [{ model: db.militarySemester }] },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const createResult = async (classId, data, commanderId) => {
  await ownClass(classId, commanderId);
  await ensureSubject(data.militarySubjectId, classId);
  const profile = await db.profile.findOne({
    where: { id: data.profileId, militaryClassId: classId },
    include: [
      {
        model: db.user,
        where: { systemType: 'MILITARY', role: 'STUDENT' },
        required: true,
      },
    ],
  });
  if (!profile) throw new BadRequestError('Học viên không thuộc lớp quân sự này');
  if (
    await db.militarySubjectResult.findOne({
      where: {
        profileId: profile.id,
        militarySubjectId: data.militarySubjectId,
      },
    })
  )
    throw new BadRequestError('Điểm môn học đã được ghi nhận và không thể thay đổi');
  return db.militarySubjectResult.create({ ...data, enteredBy: commanderId });
};

const listStudentResults = async (userId) => {
  const { profile } = await getStudentProfile(userId);
  return db.militarySubjectResult.findAll({
    where: { profileId: profile.id },
    include: [{ model: db.militarySubject, include: [{ model: db.militarySemester }] }],
    order: [['createdAt', 'DESC']],
  });
};

const createProposal = async (userId, data) => {
  const { profile } = await getStudentProfile(userId);
  if (!profile.militaryClassId) throw new BadRequestError('Bạn chưa được xếp vào lớp quân sự');
  await ensureSubject(data.militarySubjectId, profile.militaryClassId);
  if (
    await db.militarySubjectResult.findOne({
      where: {
        profileId: profile.id,
        militarySubjectId: data.militarySubjectId,
      },
    })
  )
    throw new BadRequestError('Môn học đã có điểm chính thức; không thể đề xuất sửa điểm');
  if (
    await db.militaryGradeProposal.findOne({
      where: {
        profileId: profile.id,
        militarySubjectId: data.militarySubjectId,
        status: 'PENDING',
      },
    })
  )
    throw new BadRequestError('Đề xuất môn học này đang chờ duyệt');
  return db.militaryGradeProposal.create({
    ...data,
    userId,
    profileId: profile.id,
  });
};

const listStudentProposals = async (userId) =>
  db.militaryGradeProposal.findAll({
    where: { userId },
    include: [
      { model: db.militarySubject, include: [{ model: db.militarySemester }] },
      { model: db.user, as: 'reviewer', attributes: ['id', 'username'] },
    ],
    order: [['createdAt', 'DESC']],
  });

const listClassProposals = async (classId, status, commanderId) => {
  await ownClass(classId, commanderId);
  const subjectIds = (
    await db.militarySubject.findAll({ where: { classId }, attributes: ['id'] })
  ).map((subject) => subject.id);
  if (!subjectIds.length) return [];
  const where = { militarySubjectId: subjectIds };
  if (status) where.status = status;
  return db.militaryGradeProposal.findAll({
    where,
    include: [
      {
        model: db.profile,
        include: [{ model: db.user, attributes: ['id', 'username'] }],
      },
      { model: db.militarySubject, include: [{ model: db.militarySemester }] },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const reviewProposal = async (id, commanderId, status, reviewNote) =>
  db.sequelize.transaction(async (transaction) => {
    const proposal = await db.militaryGradeProposal.findByPk(id, {
      include: [{ model: db.militarySubject }, { model: db.profile }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!proposal) throw new NotFoundError('Không tìm thấy đề xuất điểm');
    await ownClass(proposal.MilitarySubject.classId, commanderId);
    if (proposal.status !== 'PENDING') throw new BadRequestError('Đề xuất đã được xử lý');
    if (proposal.Profile.militaryClassId !== proposal.MilitarySubject.classId)
      throw new BadRequestError('Học viên đã chuyển lớp; không thể duyệt đề xuất cũ');
    if (status === 'APPROVED') {
      const existing = await db.militarySubjectResult.findOne({
        where: {
          profileId: proposal.profileId,
          militarySubjectId: proposal.militarySubjectId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (existing) throw new BadRequestError('Môn học đã có điểm chính thức; không thể thay đổi');
      await db.militarySubjectResult.create(
        {
          profileId: proposal.profileId,
          militarySubjectId: proposal.militarySubjectId,
          enteredBy: commanderId,
          letterGrade: proposal.proposedLetterGrade,
          gradePoint4: proposal.proposedGradePoint4,
          gradePoint10: proposal.proposedGradePoint10,
        },
        { transaction },
      );
    }
    await proposal.update(
      {
        status,
        reviewerId: commanderId,
        reviewNote: reviewNote || null,
        reviewedAt: new Date(),
      },
      { transaction },
    );
    await db.notification.create(
      {
        userId: proposal.userId,
        title:
          status === 'APPROVED' ? 'Đề xuất điểm đã được phê duyệt' : 'Đề xuất điểm đã bị từ chối',
        content: reviewNote || 'Đề xuất điểm của bạn đã được xử lý.',
        type: 'GRADE',
      },
      { transaction },
    );
    return proposal.reload({
      include: [
        {
          model: db.militarySubject,
          include: [{ model: db.militarySemester }],
        },
        { model: db.profile },
      ],
      transaction,
    });
  });

module.exports = {
  listClassResults,
  createResult,
  listStudentResults,
  createProposal,
  listStudentProposals,
  listClassProposals,
  reviewProposal,
};
