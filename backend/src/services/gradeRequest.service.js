const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { bucket, publicBaseUrl } = require('../config/minio');

const GradeRequest = db.gradeRequest;
const SubjectResult = db.subjectResult;
const SemesterResult = db.semesterResult;
const YearlyResult = db.yearlyResult;
const Student = db.profile;
const User = db.user;
const Notification = db.notification;
const Op = db.Sequelize.Op;
const { convertGrade } = require('../utils/gradeConversion');

const hasOfficialGrade = (subject) => (
  subject.letterGrade !== null && subject.letterGrade !== ''
) || subject.gradePoint4 !== null || subject.gradePoint10 !== null;

const withRequesterFullName = (record) => {
  const plain = typeof record.get === 'function' ? record.get({ plain: true }) : record;
  const profile = plain.User?.Profile || plain.user?.profile;

  return {
    ...plain,
    fullName: profile?.fullName || null,
  };
};

// ===================== Student =====================

const create = async (userId, data) => db.sequelize.transaction(async (transaction) => {
  const subject = await SubjectResult.findByPk(data.subjectResultId, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!subject) throw new BadRequestError('Không tìm thấy môn học');

  const semResult = await SemesterResult.findByPk(subject.semesterResultId, { transaction });
  if (!semResult || semResult.userId !== userId) {
    throw new BadRequestError('Môn học không thuộc về học viên này');
  }
  if (data.requestType !== 'ADD') {
    throw new BadRequestError('Điểm chính thức không được sửa hoặc xóa');
  }
  if (hasOfficialGrade(subject)) {
    throw new BadRequestError('Môn học đã có điểm chính thức và không thể thay đổi');
  }
  if (data.proposedGradePoint10 === null || data.proposedGradePoint10 === undefined) {
    throw new BadRequestError('Điểm đề xuất hệ 10 là bắt buộc');
  }

  const proposedGrade10 = Number(data.proposedGradePoint10);
  if (!Number.isFinite(proposedGrade10) || proposedGrade10 < 0 || proposedGrade10 > 10) {
    throw new BadRequestError('Điểm đề xuất hệ 10 không hợp lệ');
  }
  const proposedGrade4 = convertGrade(proposedGrade10, '10', '4').value;
  const proposedLetterGrade = convertGrade(proposedGrade10, '10', 'letter').value;

  const existingPending = await GradeRequest.findOne({
    where: { userId, subjectResultId: data.subjectResultId, status: 'PENDING' },
    transaction,
  });
  if (existingPending) {
    throw new BadRequestError('Môn học này đã có đề xuất đang chờ xử lý. Vui lòng chờ phản hồi.');
  }

  // Chỉ chấp nhận link minh chứng do chính học viên tải lên qua /evidence
  const evidencePrefix = `${publicBaseUrl}/${bucket}/evidence/${userId}/`;
  if (data.attachmentUrl && !data.attachmentUrl.startsWith(evidencePrefix)) {
    throw new BadRequestError('Link minh chứng không hợp lệ');
  }

  return GradeRequest.create({
    userId,
    subjectResultId: data.subjectResultId,
    requestType: data.requestType,
    reason: data.reason,
    proposedLetterGrade,
    proposedGradePoint4: proposedGrade4,
    proposedGradePoint10: proposedGrade10,
    attachmentUrl: data.attachmentUrl,
  }, { transaction });
});

const getMyRequests = async (userId, query = {}) => {
  const where = { userId };
  if (query.status) where.status = query.status;

  return paginateQuery(GradeRequest, query, {
    where,
    include: [
      { model: SubjectResult, include: [{ model: SemesterResult }] },
      { model: User, as: 'reviewer', attributes: ['id', 'username'] },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const getMyRequestDetail = async (userId, id) => {
  const req = await GradeRequest.findOne({
    where: { id, userId },
    include: [
      { model: SubjectResult, include: [{ model: SemesterResult }] },
      { model: User, as: 'reviewer', attributes: ['id', 'username'] },
    ],
  });
  if (!req) throw new NotFoundError('Không tìm thấy đề xuất');
  return req;
};

// ===================== Commander =====================

const getAll = async (query = {}, requester = {}) => {
  const where = {};
  const studentWhere = { commanderId: requester.id };
  const semesterWhere = {};

  if (query.semester) semesterWhere.semester = query.semester;
  if (query.schoolYear) semesterWhere.schoolYear = query.schoolYear;
  const semesterRequired = Object.keys(semesterWhere).length > 0;

  const include = [
    {
      model: SubjectResult,
      include: [{ model: SemesterResult, ...(semesterRequired ? { where: semesterWhere, required: true } : {}) }],
      ...(semesterRequired ? { required: true } : {}),
    },
    {
      model: User,
      attributes: { exclude: ['password', 'refreshToken'] },
      where: { role: 'STUDENT', systemType: requester.systemType },
      required: true,
      include: [{ model: Student, where: studentWhere, required: true }],
    },
    {
      model: User,
      as: 'reviewer',
      attributes: { exclude: ['password', 'refreshToken'] },
      include: [{ model: Student }],
    },
  ];

  if (query.status) where.status = query.status;
  if (query.userId) where.userId = query.userId;
  if (query.requestType) where.requestType = query.requestType;

  if (query.code) {
    const matchedUsers = await User.findAll({
      attributes: ['id'],
      include: [{ model: Student, attributes: [], where: { code: query.code }, required: true }],
    });
    const userIds = matchedUsers.map((user) => user.id);
    if (userIds.length === 0) {
      where.id = null;
    } else {
      where[Op.or] = [
        { userId: { [Op.in]: userIds } },
        { reviewerId: { [Op.in]: userIds } },
      ];
    }
  }

  if (query.fullName) studentWhere.fullName = { [Op.iLike]: `%${query.fullName}%` };
  if (query.unit) studentWhere.unit = query.unit;

  include[1].include[0].where = studentWhere;

  const result = await paginateQuery(GradeRequest, query, { where, include, order: [['createdAt', 'DESC']] });

  // Summary from DB
  const summaryQuery = { where, include, attributes: ['id', 'status'] };
  // Remove limit/offset for counting all
  delete summaryQuery.limit;
  delete summaryQuery.offset;
  const allRecords = await GradeRequest.findAll(summaryQuery);
  const summary = { pending: 0, approved: 0, rejected: 0, total: allRecords.length };
  for (const r of allRecords) {
    if (r.status === 'PENDING') summary.pending++;
    else if (r.status === 'APPROVED') summary.approved++;
    else if (r.status === 'REJECTED') summary.rejected++;
  }

  return { ...result, rows: result.rows.map(withRequesterFullName), summary };
};

const getDetail = async (id, requester, options = {}) => {
  const req = await GradeRequest.findOne({
    where: { id },
    include: [
      { model: SubjectResult, include: [{ model: SemesterResult }] },
      {
        model: User,
        attributes: { exclude: ['password', 'refreshToken'] },
        where: { role: 'STUDENT', systemType: requester.systemType },
        required: true,
        include: [{ model: Student, where: { commanderId: requester.id }, required: true }],
      },
      { model: User, as: 'reviewer', attributes: { exclude: ['password', 'refreshToken'] } },
    ],
    ...options,
  });
  if (!req) throw new NotFoundError('Không tìm thấy đề xuất trong phạm vi quản lý');
  return req;
};

// ===================== CPA Recalculation =====================

async function recalculateCpa(semesterResultId, transaction) {
  // Update semester
  const semResult = await SemesterResult.findByPk(semesterResultId, { transaction });
  if (!semResult) return;

  const allSubjects = await SubjectResult.findAll({ where: { semesterResultId: semResult.id }, transaction });
  let semCredits = 0, semPoint4 = 0, semPoint10 = 0, failed = 0, debtCredits = 0;

  for (const s of allSubjects) {
    const credits = s.credits || 0;
    semCredits += credits;
    semPoint4 += (s.gradePoint4 || 0) * credits;
    semPoint10 += (s.gradePoint10 || 0) * credits;
    if (!s.gradePoint4 || s.gradePoint4 === 0) { failed++; debtCredits += credits; }
  }

  await semResult.update({
    totalCredits: semCredits,
    averageGrade4: semCredits ? parseFloat((semPoint4 / semCredits).toFixed(2)) : 0,
    averageGrade10: semCredits ? parseFloat((semPoint10 / semCredits).toFixed(2)) : 0,
    debtCredits,
    failedSubjects: failed,
  }, { transaction });

  // Update yearly
  const yearly = await YearlyResult.findByPk(semResult.yearlyResultId, { transaction });
  if (!yearly) return;

  const allSemesters = await SemesterResult.findAll({ where: { yearlyResultId: yearly.id }, transaction });
  let yearCredits = 0, yearPoint4 = 0, yearPoint10 = 0, yearFailed = 0, yearDebt = 0;

  for (const sm of allSemesters) {
    yearCredits += sm.totalCredits || 0;
    yearPoint4 += (sm.averageGrade4 || 0) * (sm.totalCredits || 0);
    yearPoint10 += (sm.averageGrade10 || 0) * (sm.totalCredits || 0);
    yearFailed += sm.failedSubjects || 0;
    yearDebt += sm.debtCredits || 0;
  }

  await yearly.update({
    totalCredits: yearCredits,
    cumulativeCredits: yearCredits,
    averageGrade4: yearCredits ? parseFloat((yearPoint4 / yearCredits).toFixed(2)) : 0,
    averageGrade10: yearCredits ? parseFloat((yearPoint10 / yearCredits).toFixed(2)) : 0,
    cumulativeGrade4: yearCredits ? parseFloat((yearPoint4 / yearCredits).toFixed(2)) : 0,
    cumulativeGrade10: yearCredits ? parseFloat((yearPoint10 / yearCredits).toFixed(2)) : 0,
    failedSubjects: yearFailed,
    debtCredits: yearDebt,
  }, { transaction });

  // Update student profile
  const user = await User.findByPk(yearly.userId, {
    include: [{ model: db.profile }],
    transaction,
  });
  if (user && user.Profile) {
    await user.Profile.update({
      currentCpa4: yearCredits ? parseFloat((yearPoint4 / yearCredits).toFixed(2)) : 0,
      currentCpa10: yearCredits ? parseFloat((yearPoint10 / yearCredits).toFixed(2)) : 0,
    }, { transaction });
  }
}

const approve = async (id, requester, reviewNote) => {
  await db.sequelize.transaction(async (transaction) => {
    const scopedRequest = await getDetail(id, requester, { transaction });
    const req = await GradeRequest.findByPk(scopedRequest.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!req) throw new NotFoundError('Không tìm thấy đề xuất trong phạm vi quản lý');
    if (req.status !== 'PENDING') throw new BadRequestError('Chỉ đề xuất đang chờ mới được phê duyệt');
    if (req.requestType !== 'ADD') {
      throw new BadRequestError('Điểm chính thức không được sửa hoặc xóa; hãy từ chối đề xuất cũ này');
    }

    const subject = await SubjectResult.findByPk(req.subjectResultId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!subject) throw new NotFoundError('Không tìm thấy môn học');
    if (hasOfficialGrade(subject)) {
      throw new BadRequestError('Môn học đã có điểm chính thức và không thể thay đổi');
    }

    const proposedGrade10 = Number(req.proposedGradePoint10);
    if (!Number.isFinite(proposedGrade10) || proposedGrade10 < 0 || proposedGrade10 > 10) {
      throw new BadRequestError('Điểm đề xuất hệ 10 không hợp lệ');
    }
    const point4 = convertGrade(proposedGrade10, '10', '4').value;
    const letterGrade = convertGrade(proposedGrade10, '10', 'letter').value;

    await subject.update({
      letterGrade,
      gradePoint4: point4,
      gradePoint10: proposedGrade10,
    }, { transaction });

    await recalculateCpa(subject.semesterResultId, transaction);
    await req.update({
      status: 'APPROVED',
      reviewerId: requester.id,
      reviewNote: reviewNote || null,
      reviewedAt: new Date(),
    }, { transaction });

    await Notification.create({
      userId: req.userId,
      title: 'Đề xuất đã được phê duyệt',
      content: 'Đề xuất bổ sung điểm môn học của bạn đã được phê duyệt.',
      type: 'GRADE',
    }, { transaction });
  });

  return getDetail(id, requester);
};

const reject = async (id, requester, reviewNote) => {
  await db.sequelize.transaction(async (transaction) => {
    const scopedRequest = await getDetail(id, requester, { transaction });
    const req = await GradeRequest.findByPk(scopedRequest.id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!req) throw new NotFoundError('Không tìm thấy đề xuất trong phạm vi quản lý');
    if (req.status !== 'PENDING') throw new BadRequestError('Chỉ đề xuất đang chờ mới được từ chối');

    await req.update({
      status: 'REJECTED',
      reviewerId: requester.id,
      reviewNote,
      reviewedAt: new Date(),
    }, { transaction });

    await Notification.create({
      userId: req.userId,
      title: 'Đề xuất đã bị từ chối',
      content: `Đề xuất của bạn đã bị từ chối. Lý do: ${reviewNote}`,
      type: 'GRADE',
    }, { transaction });
  });

  return getDetail(id, requester);
};

module.exports = { create, getMyRequests, getMyRequestDetail, getAll, getDetail, approve, reject };
