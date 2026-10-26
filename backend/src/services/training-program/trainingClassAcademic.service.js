const db = require('../../models');
const ExcelJS = require('exceljs');
const { BadRequestError, NotFoundError } = require('../../utils/apiError');

const ownClass = async (classId, commander, transaction) => {
  const trainingClass = await db.trainingClass.findOne({
    where: { id: classId, trainingSystemId: commander.trainingSystemId, commanderId: commander.id },
    transaction,
  });
  if (!trainingClass) throw new NotFoundError('Không tìm thấy lớp được giao trong Hệ của bạn');
  return trainingClass;
};

const subjectInClass = async (classId, subjectId, transaction) => {
  const subject = await db.trainingClassSubject.findOne({ where: { id: subjectId, trainingClassId: classId }, transaction });
  if (!subject) throw new NotFoundError('Không tìm thấy môn học trong lớp');
  return subject;
};

const studentInClass = async (classId, profileId, commander, transaction) => {
  const profile = await db.profile.findOne({
    where: { id: profileId, trainingClassId: classId, commanderId: commander.id },
    include: [{ model: db.user, where: { role: 'STUDENT', isActive: true, trainingSystemId: commander.trainingSystemId }, required: true }],
    transaction,
  });
  if (!profile) throw new BadRequestError('Học viên không thuộc lớp được giao và Hệ của Chỉ huy');
  return profile;
};

const ownStudent = async (student) => {
  const user = await db.user.findOne({
    where: { id: student.id, role: 'STUDENT', isActive: true, trainingSystemId: student.trainingSystemId },
    include: [{ model: db.profile, required: true }],
  });
  if (!user?.Profile?.trainingClassId || !user.Profile.commanderId) throw new BadRequestError('Bạn chưa được xếp vào lớp có Chỉ huy quản lý');
  const trainingClass = await db.trainingClass.findOne({
    where: { id: user.Profile.trainingClassId, trainingSystemId: student.trainingSystemId, commanderId: user.Profile.commanderId },
  });
  if (!trainingClass) throw new BadRequestError('Lớp hoặc Chỉ huy quản lý không hợp lệ');
  return { profile: user.Profile, trainingClass };
};

const calculate = ({ midtermScore, finalScore }) => {
  const midterm = Math.round(Number(midtermScore) * 100);
  const final = Math.round(Number(finalScore) * 100);
  if (![midtermScore, finalScore].every((score) => score !== null && score !== undefined && score !== '' && Number.isFinite(Number(score)) && Number(score) >= 0 && Number(score) <= 10 && Math.abs(Number(score) * 100 - Math.round(Number(score) * 100)) < 1e-6)) {
    throw new BadRequestError('Điểm giữa kỳ và cuối kỳ phải trong thang 0–10, tối đa hai chữ số thập phân');
  }
  const totalScore = Math.round((midterm + final) / 2) / 100;
  const classification = totalScore < 5 ? 'FAIL' : totalScore < 6.5 ? 'AVERAGE' : totalScore < 8 ? 'GOOD' : 'EXCELLENT';
  return { midtermScore: midterm / 100, finalScore: final / 100, midtermWeight: 0.5, finalWeight: 0.5, totalScore, classification };
};

const resultInclude = [
  { model: db.profile, attributes: ['id', 'code', 'fullName', 'unit', 'trainingClassId'] },
  { model: db.trainingClassSubject, attributes: ['id', 'subjectCode', 'subjectName', 'credits'] },
  { model: db.trainingClassSemester, attributes: ['id', 'code', 'schoolYear'] },
];

const markBestAttempt = (rows) => {
  const best = new Map();
  for (const row of rows) {
    const key = `${row.profileId}:${row.subjectId}`;
    const previous = best.get(key);
    if (!previous || Number(row.totalScore) > Number(previous.totalScore) ||
      (Number(row.totalScore) === Number(previous.totalScore) && row.attemptNo < previous.attemptNo)) best.set(key, row);
  }
  return rows.map((row) => ({ ...row.get({ plain: true }), isBestAttempt: best.get(`${row.profileId}:${row.subjectId}`)?.id === row.id }));
};

const listClassResults = async (classId, semesterId, commander) => {
  await ownClass(classId, commander);
  if (semesterId && !await db.trainingClassSemester.findOne({ where: { id: semesterId, trainingClassId: classId } })) {
    throw new NotFoundError('Không tìm thấy học kỳ trong lớp');
  }
  const rows = await db.trainingClassResult.findAll({
    where: { trainingClassId: classId, ...(semesterId ? { semesterId } : {}) },
    include: resultInclude,
    order: [['createdAt', 'DESC']],
  });
  return markBestAttempt(rows);
};

const grade4 = (score) => score >= 8.5 ? 4 : score >= 8 ? 3.5 : score >= 7 ? 3
  : score >= 6.5 ? 2.5 : score >= 5.5 ? 2 : score >= 5 ? 1.5 : score >= 4 ? 1 : 0;
const average = (scores) => scores.length
  ? Math.round(scores.reduce((sum, score) => sum + score, 0) * 100 / scores.length) / 100 : null;
const summarize = (rows) => {
  const groups = new Map();
  for (const row of rows.filter((item) => item.isBestAttempt)) {
    const semester = row.trainingClassSemester;
    const profile = row.profile;
    if (!semester || !profile) continue;
    const key = `${profile.id}:${semester.schoolYear}:${semester.code}`;
    if (!groups.has(key)) groups.set(key, {
      profileId: profile.id, student: { id: profile.id, code: profile.code, fullName: profile.fullName, unit: profile.unit },
      schoolYear: semester.schoolYear, semester: semester.code, grades: [],
    });
    groups.get(key).grades.push({ score: Number(row.totalScore), credits: Number(row.trainingClassSubject?.credits ?? 0) });
  }
  const format = (group, grades) => ({
    profileId: group.profileId, student: group.student, schoolYear: group.schoolYear,
    ...(group.semester ? { semester: group.semester } : {}),
    subjectCount: grades.length, passedSubjects: grades.filter((grade) => grade.score >= 5).length,
    failedSubjects: grades.filter((grade) => grade.score < 5).length,
    totalCredits: grades.reduce((sum, grade) => sum + grade.credits, 0),
    debtCredits: grades.filter((grade) => grade.score < 5).reduce((sum, grade) => sum + grade.credits, 0),
    averageGrade10: average(grades.map((grade) => grade.score)),
    averageGrade4: average(grades.map((grade) => grade4(grade.score))),
  });
  const semesters = [...groups.values()]
    .sort((left, right) => left.schoolYear.localeCompare(right.schoolYear) || left.semester - right.semester)
    .map((group) => format(group, group.grades));
  const years = new Map();
  for (const group of groups.values()) {
    const key = `${group.profileId}:${group.schoolYear}`;
    if (!years.has(key)) years.set(key, { ...group, semester: null, grades: [] });
    years.get(key).grades.push(...group.grades);
  }
  const yearly = [...years.values()]
    .sort((left, right) => left.schoolYear.localeCompare(right.schoolYear))
    .map((group) => format(group, group.grades));
  const cumulative = new Map();
  for (const group of [...groups.values()].sort((left, right) => left.schoolYear.localeCompare(right.schoolYear) || left.semester - right.semester)) {
    const list = cumulative.get(group.profileId) || [];
    list.push(...group.grades);
    cumulative.set(group.profileId, list);
    const semester = semesters.find((item) => item.profileId === group.profileId && item.schoolYear === group.schoolYear && item.semester === group.semester);
    semester.cumulativeGrade10 = average(list.map((grade) => grade.score));
    semester.cumulativeGrade4 = average(list.map((grade) => grade4(grade.score)));
    semester.cumulativeCredits = list.filter((grade) => grade.score >= 5).reduce((sum, grade) => sum + grade.credits, 0);
  }
  const yearlyCumulative = new Map();
  for (const group of [...years.values()].sort((left, right) => left.schoolYear.localeCompare(right.schoolYear))) {
    const list = yearlyCumulative.get(group.profileId) || [];
    list.push(...group.grades);
    yearlyCumulative.set(group.profileId, list);
    const year = yearly.find((item) => item.profileId === group.profileId && item.schoolYear === group.schoolYear);
    year.cumulativeGrade10 = average(list.map((grade) => grade.score));
    year.cumulativeGrade4 = average(list.map((grade) => grade4(grade.score)));
    year.cumulativeCredits = list.filter((grade) => grade.score >= 5).reduce((sum, grade) => sum + grade.credits, 0);
  }
  return { semesters, years: yearly };
};

const getClassSummary = async (classId, commander) => summarize(await listClassResults(classId, null, commander));

const exportYearlySummary = async (classId, query, commander) => {
  const { years } = await getClassSummary(classId, commander);
  const normalize = (value) => String(value ?? '').normalize('NFD').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  const filtered = years.filter((row) =>
    (!query.schoolYear || row.schoolYear.includes(query.schoolYear))
    && (!query.unit || normalize(row.student.unit).includes(normalize(query.unit)))
    && (!query.student || normalize(`${row.student.fullName} ${row.student.code}`).includes(normalize(query.student))));
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Kết quả năm học');
  sheet.addRow(['Mã học viên', 'Học viên', 'Đơn vị', 'Năm học', 'Số môn', 'Môn đạt', 'Môn không đạt', 'Tín chỉ', 'Tín chỉ tích lũy', 'Tín chỉ nợ', 'Điểm TB hệ 10', 'Điểm TB hệ 4', 'Tích lũy hệ 10', 'Tích lũy hệ 4']);
  const safe = (value) => typeof value === 'string' && /^[=+@\-\t\r]/.test(value) ? `'${value}` : value;
  for (const row of filtered) sheet.addRow([
    safe(row.student.code), safe(row.student.fullName), safe(row.student.unit), safe(row.schoolYear), row.subjectCount,
    row.passedSubjects, row.failedSubjects, row.totalCredits, row.cumulativeCredits, row.debtCredits,
    row.averageGrade10, row.averageGrade4, row.cumulativeGrade10, row.cumulativeGrade4,
  ]);
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B7250' } };
  sheet.columns.forEach((column) => { column.width = 20; });
  return workbook.xlsx.writeBuffer();
};

const createResult = async (classId, data, commander) => {
  await ownClass(classId, commander);
  const subject = await subjectInClass(classId, data.subjectId);
  await studentInClass(classId, data.profileId, commander);
  const grade = calculate(data);
  try {
    return await db.sequelize.transaction(async (transaction) => {
      await db.profile.findByPk(data.profileId, { transaction, lock: transaction.LOCK.UPDATE });
      const where = { profileId: data.profileId, subjectId: subject.id, attemptNo: data.attemptNo };
      if (await db.trainingClassResult.findOne({ where, transaction })) throw new BadRequestError('Lần thi này đã có điểm chính thức');
      if (await db.trainingClassGradeProposal.findOne({ where: { ...where, status: 'PENDING' }, transaction })) {
        throw new BadRequestError('Lần thi này có đề xuất đang chờ duyệt');
      }
      return db.trainingClassResult.create({
        trainingClassId: classId, semesterId: subject.semesterId, subjectId: subject.id,
        profileId: data.profileId, attemptNo: data.attemptNo, ...grade, enteredBy: commander.id,
      }, { transaction });
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Lần thi này đã có điểm chính thức');
    throw error;
  }
};

const listMySubjects = async (student) => {
  const { trainingClass } = await ownStudent(student);
  return db.trainingClassSubject.findAll({
    where: { trainingClassId: trainingClass.id },
    include: [{ model: db.trainingClassSemester, attributes: ['id', 'code', 'schoolYear'] }],
    order: [['subjectCode', 'ASC']],
  });
};

const listMyTimeTables = async (student) => {
  const { trainingClass } = await ownStudent(student);
  const [timeTables, semesters, subjects] = await Promise.all([
    db.trainingClassTimeTable.findAll({
      where: { trainingClassId: trainingClass.id },
      order: [['updatedAt', 'DESC']],
    }),
    db.trainingClassSemester.findAll({
      where: { trainingClassId: trainingClass.id },
      attributes: ['id', 'code', 'schoolYear'],
      raw: true,
    }),
    db.trainingClassSubject.findAll({
      where: { trainingClassId: trainingClass.id },
      attributes: ['id', 'subjectCode', 'subjectName'],
      raw: true,
    }),
  ]);
  const semesterById = new Map(semesters.map((semester) => [semester.id, semester]));
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  return timeTables.map((timeTable) => ({
    ...timeTable.get({ plain: true }),
    trainingClassSemester: semesterById.get(timeTable.semesterId) || null,
    schedules: timeTable.schedules.map((schedule) => ({
      ...schedule,
      subjectCode: subjectById.get(schedule.subjectId)?.subjectCode || null,
      subjectName: subjectById.get(schedule.subjectId)?.subjectName || null,
    })),
  }));
};

const listMyAchievements = async (student) => {
  const { trainingClass } = await ownStudent(student);
  return db.trainingClassAchievement.findAll({
    where: { trainingClassId: trainingClass.id, studentUserId: student.id },
    order: [['createdAt', 'DESC']],
  });
};

const listMyResults = async (student) => {
  const { profile, trainingClass } = await ownStudent(student);
  const rows = await db.trainingClassResult.findAll({
    where: { profileId: profile.id, trainingClassId: trainingClass.id }, include: resultInclude,
    order: [['createdAt', 'DESC']],
  });
  return markBestAttempt(rows);
};

const listMyProposals = async (student) => {
  const { profile, trainingClass } = await ownStudent(student);
  return db.trainingClassGradeProposal.findAll({
    where: { studentUserId: student.id, profileId: profile.id, trainingClassId: trainingClass.id },
    include: [{ model: db.trainingClassSubject, attributes: ['id', 'subjectCode', 'subjectName'] }, { model: db.trainingClassSemester, attributes: ['id', 'code', 'schoolYear'] }],
    order: [['createdAt', 'DESC']],
  });
};

const createProposal = async (data, student) => {
  const { profile, trainingClass } = await ownStudent(student);
  const subject = await subjectInClass(trainingClass.id, data.subjectId);
  const grade = calculate(data);
  const where = { profileId: profile.id, subjectId: subject.id, attemptNo: data.attemptNo };
  try {
    return await db.sequelize.transaction(async (transaction) => {
      await db.profile.findByPk(profile.id, { transaction, lock: transaction.LOCK.UPDATE });
      if (await db.trainingClassResult.findOne({ where, transaction })) throw new BadRequestError('Lần thi này đã có điểm chính thức');
      return db.trainingClassGradeProposal.create({
        trainingClassId: trainingClass.id, semesterId: subject.semesterId, subjectId: subject.id,
        profileId: profile.id, studentUserId: student.id, attemptNo: data.attemptNo,
        midtermScore: grade.midtermScore, finalScore: grade.finalScore, reason: data.reason.trim(),
      }, { transaction });
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Lần thi này đã có đề xuất đang chờ duyệt');
    throw error;
  }
};

const listClassProposals = async (classId, status, commander) => {
  await ownClass(classId, commander);
  return db.trainingClassGradeProposal.findAll({
    where: { trainingClassId: classId, ...(status ? { status } : {}) },
    include: [
      { model: db.profile, attributes: ['id', 'code', 'fullName', 'trainingClassId'] },
      { model: db.trainingClassSubject, attributes: ['id', 'subjectCode', 'subjectName'] },
      { model: db.trainingClassSemester, attributes: ['id', 'code', 'schoolYear'] },
    ],
    order: [['createdAt', 'DESC']],
  });
};

const reviewProposal = async (classId, proposalId, status, reviewNote, commander) => {
  await ownClass(classId, commander);
  const candidate = await db.trainingClassGradeProposal.findOne({ where: { id: proposalId, trainingClassId: classId } });
  if (!candidate) throw new NotFoundError('Không tìm thấy đề xuất trong lớp được giao');
  try {
    return await db.sequelize.transaction(async (transaction) => {
      await db.profile.findByPk(candidate.profileId, { transaction, lock: transaction.LOCK.UPDATE });
      const proposal = await db.trainingClassGradeProposal.findOne({
        where: { id: proposalId, trainingClassId: classId }, transaction, lock: transaction.LOCK.UPDATE,
      });
      if (!proposal) throw new NotFoundError('Không tìm thấy đề xuất trong lớp được giao');
      if (proposal.status !== 'PENDING') throw new BadRequestError('Đề xuất đã được xử lý');
      const subject = await subjectInClass(classId, proposal.subjectId, transaction);
      if (subject.semesterId !== proposal.semesterId) throw new BadRequestError('Môn học của đề xuất không hợp lệ');
      const profile = await studentInClass(classId, proposal.profileId, commander, transaction);
      if (profile.User.id !== proposal.studentUserId) throw new BadRequestError('Học viên của đề xuất không hợp lệ');
      if (status === 'APPROVED') {
        const where = { profileId: proposal.profileId, subjectId: proposal.subjectId, attemptNo: proposal.attemptNo };
        if (await db.trainingClassResult.findOne({ where, transaction })) throw new BadRequestError('Lần thi này đã có điểm chính thức');
        await db.trainingClassResult.create({
          trainingClassId: classId, semesterId: proposal.semesterId, subjectId: proposal.subjectId,
          profileId: proposal.profileId, attemptNo: proposal.attemptNo,
          ...calculate(proposal), enteredBy: commander.id,
        }, { transaction });
      }
      await proposal.update({ status, reviewerId: commander.id, reviewNote: reviewNote || null, reviewedAt: new Date() }, { transaction });
      await db.notification.create({
        userId: proposal.studentUserId,
        title: status === 'APPROVED' ? 'Đề xuất điểm đã được phê duyệt' : 'Đề xuất điểm đã bị từ chối',
        content: reviewNote || 'Đề xuất điểm của bạn đã được xử lý.', type: 'GRADE',
      }, { transaction });
      return proposal;
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Lần thi này đã có điểm chính thức');
    throw error;
  }
};

module.exports = { calculate, summarize, listClassResults, getClassSummary, exportYearlySummary, createResult, listMySubjects, listMyTimeTables, listMyAchievements, listMyResults, listMyProposals, createProposal, listClassProposals, reviewProposal };
