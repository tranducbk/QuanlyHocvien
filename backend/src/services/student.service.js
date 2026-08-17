const db = require('../models');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const Student = db.profile;
const Class = db.class;
const Organization = db.organization;
const University = db.university;
const EducationLevel = db.educationLevel;
const YearlyResult = db.yearlyResult;
const SemesterResult = db.semesterResult;
const SubjectResult = db.subjectResult;
const TimeTable = db.timeTable;
const CutRice = db.cutRice;
const CutRiceRequest = db.cutRiceRequest;
const User = db.user;
const Achievement = db.achievement;
const AchievementProfile = db.achievementProfile;
const YearlyAchievement = db.yearlyAchievement;
const ScientificInitiative = db.scientificInitiative;
const ScientificTopic = db.scientificTopic;
const TuitionFee = db.tuitionFee;
const Notification = db.notification;
const Semester = db.semester;

const isCommander = (requester) => requester?.role === 'COMMANDER';

const applyCommanderScope = (where, requester) => {
  if (isCommander(requester)) where.commanderId = requester.id;
};

const assertCommanderCanAccessProfile = (profile, requester) => {
  if (isCommander(requester) && profile?.commanderId !== requester.id) {
    throw new NotFoundError('Khong tim thay hoc vien');
  }
};

const toDateOnly = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

const parseLocalDate = (value) => {
  if (value instanceof Date) return new Date(value);
  if (typeof value === 'string') {
    const [year, month, day] = value.split('-').map(Number);
    if (year && month && day) return new Date(year, month - 1, day);
  }
  return new Date(value);
};

const getWeekRange = (value = new Date()) => {
  const date = parseLocalDate(value);
  if (Number.isNaN(date.getTime())) throw new BadRequestError('Ngay tuan khong hop le');
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(date);
  start.setDate(date.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { weekStartDate: toDateOnly(start), weekEndDate: toDateOnly(end) };
};

const EXCEL_HEADERS = {
  // Thông tin cá nhân
  'code': 'Mã học viên',
  'fullName': 'Họ và tên',
  'gender': 'Giới tính',
  'birthday': 'Ngày sinh',
  'hometown': 'Quê quán',
  'placeOfBirth': 'Nơi sinh',
  'currentAddress': 'Địa chỉ hiện tại',
  'phoneNumber': 'Số điện thoại',
  'email': 'Email',
  'cccdNumber': 'Số CCCD',
  'avatar': 'Ảnh đại diện',
  // Quân sự
  'rank': 'Cấp bậc',
  'unit': 'Đơn vị',
  'positionGovernment': 'Chức vụ chính quyền',
  'positionParty': 'Chức vụ Đảng',
  'dateOfEnlistment': 'Ngày nhập ngũ',
  // Đảng
  'partyMemberCardNumber': 'Số thẻ Đảng',
  'probationaryPartyMember': 'Ngày vào Đảng dự bị',
  'fullPartyMember': 'Ngày vào Đảng chính thức',
  // Dân tộc - Tôn giáo
  'ethnicity': 'Dân tộc',
  'religion': 'Tôn giáo',
  // Gia đình - Yếu tố nước ngoài
  'familyMember': 'Thông tin gia đình',
  'foreignRelations': 'Yếu tố nước ngoài',
  // Học tập
  'enrollment': 'Khóa nhập học',
  'graduationDate': 'Ngày tốt nghiệp',
  'currentCpa4': 'CPA hệ 4',
  'currentCpa10': 'CPA hệ 10',
  // Tổ chức
  'class.className': 'Lớp',
  'organization.organizationName': 'Đơn vị trực thuộc',
  'organization.travelTime': 'Thời gian di chuyển',
  'university.universityCode': 'Mã trường',
  'university.universityName': 'Tên trường',
  'educationLevel.levelName': 'Hệ đào tạo',
  // Xếp loại năm học (cần filter schoolYear)
  'yearlyResult.schoolYear': 'Năm học',
  'yearlyResult.averageGrade4': 'Điểm TB hệ 4',
  'yearlyResult.averageGrade10': 'Điểm TB hệ 10',
  'yearlyResult.totalCredits': 'Tổng tín chỉ',
  'yearlyResult.passedSubjects': 'Số môn đạt',
  'yearlyResult.failedSubjects': 'Số môn không đạt',
  'yearlyResult.academicStatus': 'Xếp loại học tập',
  'yearlyResult.partyRating': 'Xếp loại Đảng viên',
  'yearlyResult.trainingRating': 'Xếp loại rèn luyện',
  // Khen thưởng
  'achievements': 'Danh sách khen thưởng',
  'yearlyAchievements': 'Thành tích theo năm',
};

const resolveField = (obj, path) => {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return '';
    current = current[part];
  }
  if (current instanceof Date) return current.toISOString().split('T')[0];
  return current !== null && current !== undefined ? current : '';
};

// ===================== CRUD Cơ bản =====================

const create = async (data) => Student.create(data);
const getAll = async (query, requester) => {
  const where = {};
  const exactFilterFields = ['gender', 'enrollment', 'unit', 'rank', 'classId', 'organizationId', 'universityId', 'educationLevelId', 'commanderId'];

  for (const field of exactFilterFields) {
    if (query[field] !== undefined && query[field] !== '') {
      where[field] = query[field];
    }
  }

  if (query.code) {
    where.code = { [db.Sequelize.Op.iLike]: `%${query.code}%` };
  }

  if (query.fullName) {
    where.fullName = { [db.Sequelize.Op.iLike]: `%${query.fullName}%` };
  }
  applyCommanderScope(where, requester);

  const opts = {
    where,
    include: [{ model: Class }, { model: Organization }, { model: University }, { model: EducationLevel }, { model: User, as: 'commander', attributes: ['id', 'username', 'role', 'isActive'] }],
  };

  if (query.schoolYear) {
    opts.include.push({
      model: YearlyResult,
      where: { schoolYear: query.schoolYear },
      required: true,
    });
  }

  return paginateQuery(Student, query, opts);
};

const getDetail = async (id, requester) => {
  const record = await Student.findByPk(id, {
    include: [{ model: Class }, { model: Organization }, { model: University }, { model: EducationLevel }, { model: User, as: 'commander', attributes: ['id', 'username', 'role', 'isActive'] }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy học viên');
  assertCommanderCanAccessProfile(record, requester);
  return record;
};

const update = async (id, data, requester) => {
  if (isCommander(requester) && data.commanderId !== undefined) {
    throw new ForbiddenError('Chi admin moi duoc gan chi huy quan ly hoc vien');
  }
  const record = await getDetail(id, requester);
  return record.update(data);
};

const deleteRecord = async (id, requester) => {
  const record = await getDetail(id, requester);
  await record.destroy();
  return { deleted: true };
};

// ===================== Export Excel =====================

const exportStudents = async (query, requester) => {
  const where = {};
  const include = [{ model: Class }, { model: Organization }, { model: University }, { model: EducationLevel }, { model: User, as: 'commander', attributes: ['id', 'username', 'role', 'isActive'] }];

  const filterFields = ['code', 'fullName', 'gender', 'enrollment', 'unit', 'rank', 'classId', 'organizationId', 'universityId', 'educationLevelId', 'commanderId'];
  for (const field of filterFields) {
    if (query[field] !== undefined) {
      where[field] = query[field];
    }
  }
  applyCommanderScope(where, requester);

  if (query.schoolYear) {
    include.push({
      model: YearlyResult,
      where: { schoolYear: query.schoolYear },
      required: true,
    });
  }

  const students = await Student.findAll({ where, include, order: [['fullName', 'ASC']] });

  const studentIds = students.map(s => s.id);
  const achievementsMap = {};
  const yearlyAchievementsMap = {};

  if (studentIds.length > 0) {
    const achievements = await Achievement.findAll({ where: { userId: studentIds }, order: [['year', 'DESC']] });
    const yearlyAchievements = await YearlyAchievement.findAll({ where: { userId: studentIds }, order: [['year', 'DESC']] });

    for (const a of achievements) {
      if (!achievementsMap[a.userId]) achievementsMap[a.userId] = [];
      achievementsMap[a.userId].push(a);
    }
    for (const ya of yearlyAchievements) {
      if (!yearlyAchievementsMap[ya.userId]) yearlyAchievementsMap[ya.userId] = [];
      yearlyAchievementsMap[ya.userId].push(ya);
    }
  }

  const requestedFields = query.fields ? query.fields.split(',').map(f => f.trim()).filter(f => EXCEL_HEADERS[f]) : Object.keys(EXCEL_HEADERS);

  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Danh sách học viên');

  worksheet.addRow(requestedFields.map(f => EXCEL_HEADERS[f]));

  for (const student of students) {
    const plain = student.get({ plain: true });

    const studentAchievements = achievementsMap[plain.id] || [];
    const studentYearlyAchievements = yearlyAchievementsMap[plain.id] || [];

    plain.achievements = studentAchievements.map(a => `${a.title || ''} (${a.award || ''}, ${a.year || ''})`).join('; ');
    plain.yearlyAchievements = studentYearlyAchievements.map(ya => `${ya.title || ''} (${ya.year || ''})`).join('; ');

    if (plain.familyMember && typeof plain.familyMember === 'object') {
      plain.familyMember = JSON.stringify(plain.familyMember);
    }
    if (plain.foreignRelations && typeof plain.foreignRelations === 'object') {
      plain.foreignRelations = JSON.stringify(plain.foreignRelations);
    }

    const yearlyResults = plain.YearlyResults;
    if (yearlyResults && yearlyResults.length > 0) {
      const yr = yearlyResults[0];
      plain.yearlyResult = {
        schoolYear: yr.schoolYear,
        averageGrade4: yr.averageGrade4,
        averageGrade10: yr.averageGrade10,
        totalCredits: yr.totalCredits,
        passedSubjects: yr.passedSubjects,
        failedSubjects: yr.failedSubjects,
        academicStatus: yr.academicStatus,
        partyRating: yr.partyRating,
        trainingRating: yr.trainingRating,
      };
    }

    const row = requestedFields.map(field => resolveField(plain, field));
    worksheet.addRow(row);
  }

  worksheet.columns.forEach(col => { col.width = 22; });

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };

  return workbook.xlsx.writeBuffer();
};

// ===================== HV-02: Profile (xem profile dùng /api/auth/profile) =====================

const updateProfile = async (userId, data) => {
  const student = await Student.findByPk(userId);
  if (!student) throw new NotFoundError('Không tìm thấy học viên');

  const allowedFields = [
    'currentAddress', 'phoneNumber', 'email',
    'rank', 'unit', 'positionGovernment', 'positionParty',
  ];
  const updateData = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }

  return student.update(updateData);
};

// ===================== HV-03: Academic Results =====================

const getAcademicResults = async (userId, query = {}) => {
  const where = { userId };
  if (query.schoolYear) where.schoolYear = query.schoolYear;

  return paginateQuery(YearlyResult, query, {
    where,
    include: [{
      model: SemesterResult,
      include: [{ model: SubjectResult }],
    }],
    order: [['schoolYear', 'DESC']],
  });
};

// ===================== HV-06: TimeTable =====================

const getMyTimeTable = async (userId, query = {}) => {
  const where = { userId };
  const include = [{ model: db.semester, include: [{ model: db.schoolYear, as: 'schoolYearInfo' }] }];

  if (query.semesterId) where.semesterId = query.semesterId;
  if (query.semester || query.schoolYear) {
    include[0].where = {};
    include[0].required = true;
    if (query.semester) include[0].where.code = Number(query.semester);
    if (query.schoolYear) {
      include[0].include[0].where = { schoolYear: query.schoolYear };
      include[0].include[0].required = true;
    }
  }

  return paginateQuery(TimeTable, query, {
    where,
    include,
    order: [['createdAt', 'DESC']],
  });
};

const getMyTimeTableSemesters = async (userId) => {
  const records = await TimeTable.findAll({
    attributes: ['semesterId'],
    where: {
      userId,
      semesterId: { [db.Sequelize.Op.ne]: null },
    },
    include: [{
      model: db.semester,
      required: true,
      include: [{ model: db.schoolYear, as: 'schoolYearInfo' }],
    }],
    order: [['createdAt', 'DESC']],
  });

  const semestersById = new Map();

  for (const record of records) {
    const semester = record.get({ plain: true }).Semester;
    if (semester && !semestersById.has(semester.id)) {
      semestersById.set(semester.id, semester);
    }
  }

  return [...semestersById.values()].sort((a, b) => {
    const yearA = a.schoolYearInfo?.schoolYear || '';
    const yearB = b.schoolYearInfo?.schoolYear || '';
    return yearB.localeCompare(yearA) || Number(b.code) - Number(a.code);
  });
};

const createMyTimeTable = async (userId, data) => {
  return TimeTable.create({ ...data, userId });
};

const updateMyTimeTable = async (userId, id, data) => {
  const record = await TimeTable.findOne({ where: { id, userId } });
  if (!record) throw new NotFoundError('Không tìm thấy thời khóa biểu');
  return record.update(data);
};

const deleteMyTimeTable = async (userId, id) => {
  const record = await TimeTable.findOne({ where: { id, userId } });
  if (!record) throw new NotFoundError('Không tìm thấy thời khóa biểu');
  await record.destroy();
  return { deleted: true };
};

// ===================== HV-07: Cut Rice =====================

const getLatestTimeTableSemesterId = async (userId) => {
  const record = await TimeTable.findOne({
    where: { userId, semesterId: { [db.Sequelize.Op.ne]: null } },
    order: [['createdAt', 'DESC']],
  });
  return record?.semesterId || null;
};

const ensureSemester = async (semesterId) => {
  const semester = await Semester.findByPk(semesterId);
  if (!semester) throw new BadRequestError('Khong tim thay hoc ky');
  return semester;
};

const getMyCutRice = async (userId, query = {}) => {
  const include = [
    { model: User, include: [{ model: Student }] },
    { model: Semester, as: 'semesterInfo', include: [{ model: db.schoolYear, as: 'schoolYearInfo' }] },
  ];
  const semesterId = query.semesterId || await getLatestTimeTableSemesterId(userId);
  const weekRange = getWeekRange(query.weekStartDate || new Date());
  const where = {
    userId,
    semesterId: semesterId || null,
    weekStartDate: weekRange.weekStartDate,
  };
  let record = await CutRice.findOne({ where, include });
  if (!record) {
    record = await CutRice.create({ userId, semesterId: semesterId || null, ...weekRange, weekly: {} });
    record = await CutRice.findOne({ where, include });
  }
  return record;
};

const updateMyCutRice = async (userId, data) => {
  const semesterId = data.semesterId || await getLatestTimeTableSemesterId(userId);
  const weekRange = getWeekRange(data.weekStartDate || new Date());
  let record = await CutRice.findOne({
    where: { userId, semesterId: semesterId || null, weekStartDate: weekRange.weekStartDate },
  });
  if (!record) {
    record = await CutRice.create({ userId, semesterId: semesterId || null, ...weekRange, weekly: {} });
  }

  return record.update({
    semesterId: data.semesterId !== undefined ? data.semesterId : record.semesterId,
    ...weekRange,
    weekly: data.weekly !== undefined ? data.weekly : record.weekly,
    isAutoGenerated: false,
    notes: data.notes !== undefined ? data.notes : record.notes,
    lastUpdated: new Date(),
  });
};

const createMyCutRiceRequest = async (userId, data) => {
  await ensureSemester(data.semesterId);
  const weekRange = getWeekRange(data.weekStartDate);
  const existingPending = await CutRiceRequest.findOne({
    where: {
      userId,
      semesterId: data.semesterId,
      weekStartDate: weekRange.weekStartDate,
      status: 'PENDING',
    },
  });
  if (existingPending) throw new BadRequestError('Da co yeu cau cat com dang cho duyet cho tuan nay');

  return CutRiceRequest.create({
    userId,
    semesterId: data.semesterId,
    ...weekRange,
    weekly: data.weekly,
    notes: data.notes || null,
  });
};

const getMyCutRiceRequests = async (userId, query = {}) => {
  const where = { userId };
  if (query.status) where.status = query.status;
  if (query.semesterId) where.semesterId = query.semesterId;
  if (query.weekStartDate) where.weekStartDate = getWeekRange(query.weekStartDate).weekStartDate;

  return paginateQuery(CutRiceRequest, query, {
    where,
    include: [{ model: Semester, as: 'semesterInfo', include: [{ model: db.schoolYear, as: 'schoolYearInfo' }] }],
    order: [['createdAt', 'DESC']],
  });
};

// ===================== HV-08: Achievements & Tuition =====================

const getMyAchievements = async (userId, query = {}) => {
  const achievementsResult = await paginateQuery(Achievement, query, {
    where: { userId },
    order: [['year', 'DESC']],
  });
  const profile = await AchievementProfile.findOne({ where: { userId } });
  const yearlyAchievementsResult = await paginateQuery(YearlyAchievement, query, {
    where: { userId },
    include: [{ model: ScientificInitiative }, { model: ScientificTopic }],
    order: [['year', 'DESC']],
  });
  return {
    achievements: achievementsResult.rows,
    achievementsPagination: achievementsResult.pagination,
    profile,
    yearlyAchievements: yearlyAchievementsResult.rows,
    yearlyAchievementsPagination: yearlyAchievementsResult.pagination,
  };
};

const getMyTuitionFees = async (userId, query = {}) => {
  const where = { userId };
  const include = [{ model: db.semester, as: 'semesterInfo', include: [{ model: db.schoolYear, as: 'schoolYearInfo' }] }];

  if (query.semesterId) where.semesterId = query.semesterId;
  if (query.semester) where.semester = query.semester;
  if (query.schoolYear) where.schoolYear = query.schoolYear;
  if (query.status) where.status = query.status;

  if (query.semester || query.schoolYear) {
    include[0].where = {};
    include[0].required = true;
    if (query.semester) include[0].where.code = Number(query.semester);
    if (query.schoolYear) {
      include[0].include[0].where = { schoolYear: query.schoolYear };
      include[0].include[0].required = true;
    }
  }

  return paginateQuery(TuitionFee, query, {
    where,
    include,
    order: [['createdAt', 'DESC']],
  });
};

// ===================== HV-09: Notifications =====================

const getMyNotifications = async (userId, query = {}) => {
  const where = { userId };
  if (query.type) where.type = query.type;
  if (query.isRead !== undefined) where.isRead = query.isRead === 'true';

  return paginateQuery(Notification, query, { where, order: [['createdAt', 'DESC']] });
};

const getMyNotificationDetail = async (userId, id) => {
  const notif = await Notification.findOne({ where: { id, userId } });
  if (!notif) throw new NotFoundError('Không tìm thấy thông báo');
  await notif.update({ isRead: true });
  return notif;
};

const markNotificationRead = async (userId, id) => {
  const notif = await Notification.findOne({ where: { id, userId } });
  if (!notif) throw new NotFoundError('Không tìm thấy thông báo');
  return notif.update({ isRead: true });
};

const markAllNotificationsRead = async (userId) => {
  await Notification.update({ isRead: true }, { where: { userId } });
  return { updated: true };
};

module.exports = {
  create,
  getAll,
  getDetail,
  update,
  delete: deleteRecord,
  exportStudents,
  getAcademicResults,
  getMyTimeTable,
  getMyTimeTableSemesters,
  createMyTimeTable,
  updateMyTimeTable,
  deleteMyTimeTable,
  getMyCutRice,
  updateMyCutRice,
  createMyCutRiceRequest,
  getMyCutRiceRequests,
  getMyAchievements,
  getMyTuitionFees,
  getMyNotifications,
  getMyNotificationDetail,
  markNotificationRead,
  markAllNotificationsRead,
};
