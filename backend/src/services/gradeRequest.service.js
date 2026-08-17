const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const GradeRequest = db.gradeRequest;
const SubjectResult = db.subjectResult;
const SemesterResult = db.semesterResult;
const YearlyResult = db.yearlyResult;
const Student = db.profile;
const User = db.user;
const Notification = db.notification;
const Op = db.Sequelize.Op;

const withRequesterFullName = (record) => {
  const plain = typeof record.get === 'function' ? record.get({ plain: true }) : record;
  const profile = plain.User?.Profile || plain.user?.profile;

  return {
    ...plain,
    fullName: profile?.fullName || null,
  };
};

// ===================== Student =====================

const create = async (userId, data) => {
  const subject = await SubjectResult.findByPk(data.subjectResultId);
  if (!subject) throw new BadRequestError('Không tìm thấy môn học');

  const semResult = await SemesterResult.findByPk(subject.semesterResultId);
  if (!semResult || semResult.userId !== userId) {
    throw new BadRequestError('Môn học không thuộc về học viên này');
  }

  const existingPending = await GradeRequest.findOne({
    where: { userId, subjectResultId: data.subjectResultId, status: 'PENDING' }
  });
  if (existingPending) {
    throw new BadRequestError('Môn học này đã có đề xuất đang chờ xử lý. Vui lòng chờ phản hồi.');
  }

  return GradeRequest.create({
    userId,
    subjectResultId: data.subjectResultId,
    requestType: data.requestType,
    reason: data.reason,
    proposedLetterGrade: data.proposedLetterGrade,
    proposedGradePoint4: data.proposedGradePoint4,
    proposedGradePoint10: data.proposedGradePoint10,
    attachmentUrl: data.attachmentUrl,
  });
};

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
  const studentWhere = {};
  const semesterWhere = {};

  if (requester.role === 'COMMANDER') {
    studentWhere.commanderId = requester.id;
  }

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
      include: [{ model: Student }],
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

  if (Object.keys(studentWhere).length > 0) {
    include[1].include[0].where = studentWhere;
    include[1].include[0].required = true;
    include[1].required = true;
  }

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

const getDetail = async (id) => {
  const req = await GradeRequest.findByPk(id, {
    include: [
      { model: SubjectResult, include: [{ model: SemesterResult }] },
      {
        model: User,
        attributes: { exclude: ['password', 'refreshToken'] },
        include: [{ model: Student }],
      },
      { model: User, as: 'reviewer', attributes: { exclude: ['password', 'refreshToken'] } },
    ],
  });
  if (!req) throw new NotFoundError('Không tìm thấy đề xuất');
  return req;
};

// ===================== CPA Recalculation =====================

async function recalculateCpa(semesterResultId) {
  // Update semester
  const semResult = await SemesterResult.findByPk(semesterResultId);
  if (!semResult) return;

  const allSubjects = await SubjectResult.findAll({ where: { semesterResultId: semResult.id } });
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
  });

  // Update yearly
  const yearly = await YearlyResult.findByPk(semResult.yearlyResultId);
  if (!yearly) return;

  const allSemesters = await SemesterResult.findAll({ where: { yearlyResultId: yearly.id } });
  let yearCredits = 0, yearPoint4 = 0, yearPoint10 = 0, yearFailed = 0, yearDebt = 0;

  for (const sm of allSemesters) {
    yearCredits += sm.totalCredits || 0;
    yearPoint4 += (sm.averageGrade4 || 0) * (sm.totalCredits || 0);
    yearPoint10 += (sm.averageGrade10 || 0) * (sm.totalCredits || 0);
    yearFailed += sm.failedSubjects || 0;
    yearDebt += sm.debtCredits || 0;
  }

  const totalSubjects = allSemesters.reduce((s, sm) => s + sm.totalCredits / (allSubjects[0]?.credits || 3), 0);

  await yearly.update({
    totalCredits: yearCredits,
    cumulativeCredits: yearCredits,
    averageGrade4: yearCredits ? parseFloat((yearPoint4 / yearCredits).toFixed(2)) : 0,
    averageGrade10: yearCredits ? parseFloat((yearPoint10 / yearCredits).toFixed(2)) : 0,
    cumulativeGrade4: yearCredits ? parseFloat((yearPoint4 / yearCredits).toFixed(2)) : 0,
    cumulativeGrade10: yearCredits ? parseFloat((yearPoint10 / yearCredits).toFixed(2)) : 0,
    failedSubjects: yearFailed,
    debtCredits: yearDebt,
  });

  // Update student profile
  const user = await User.findByPk(yearly.userId, { include: [{ model: db.profile }] });
  if (user && user.Profile) {
    await user.Profile.update({
      currentCpa4: yearCredits ? parseFloat((yearPoint4 / yearCredits).toFixed(2)) : 0,
      currentCpa10: yearCredits ? parseFloat((yearPoint10 / yearCredits).toFixed(2)) : 0,
    });
  }
}

const approve = async (id, reviewerId, reviewNote) => {
  const req = await getDetail(id);
  if (req.status !== 'PENDING') throw new BadRequestError('Chỉ đề xuất đang chờ mới được phê duyệt');

  const subject = await SubjectResult.findByPk(req.subjectResultId);
  if (!subject) throw new NotFoundError('Không tìm thấy môn học');

  const semesterResultId = subject.semesterResultId;

  if (req.requestType === 'UPDATE' || req.requestType === 'ADD') {
    await subject.update({
      letterGrade: req.proposedLetterGrade || subject.letterGrade,
      gradePoint4: req.proposedGradePoint4 ?? subject.gradePoint4,
      gradePoint10: req.proposedGradePoint10 ?? subject.gradePoint10,
    });
  } else if (req.requestType === 'DELETE') {
    await subject.destroy();
  }

  await recalculateCpa(semesterResultId);

  await req.update({
    status: 'APPROVED',
    reviewerId,
    reviewNote: reviewNote || null,
    reviewedAt: new Date(),
  });

  const user = await User.findByPk(req.userId);
  if (user) {
    await Notification.create({
      userId: user.id,
      title: 'Đề xuất đã được phê duyệt',
      content: `Đề xuất ${req.requestType === 'DELETE' ? 'xóa' : 'cập nhật'} điểm môn học của bạn đã được phê duyệt.`,
      type: 'GRADE',
    });
  }

  return req.reload({
    include: [{ model: SubjectResult }, { model: User }],
  });
};

const reject = async (id, reviewerId, reviewNote) => {
  const req = await getDetail(id);
  if (req.status !== 'PENDING') throw new BadRequestError('Chỉ đề xuất đang chờ mới được từ chối');

  await req.update({
    status: 'REJECTED',
    reviewerId,
    reviewNote,
    reviewedAt: new Date(),
  });

  const user = await User.findByPk(req.userId);
  if (user) {
    await Notification.create({
      userId: user.id,
      title: 'Đề xuất đã bị từ chối',
      content: `Đề xuất của bạn đã bị từ chối. Lý do: ${reviewNote}`,
      type: 'GRADE',
    });
  }

  return req.reload({
    include: [{ model: SubjectResult }, { model: User }],
  });
};

module.exports = { create, getMyRequests, getMyRequestDetail, getAll, getDetail, approve, reject };
