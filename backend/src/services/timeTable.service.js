const db = require('../models');
const User = db.user;
const Semester = db.semester;
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { findStudentUserByCode } = require('../utils/studentLookup');

const TimeTable = db.timeTable;
const SchoolYear = db.schoolYear;

const normalizeHeader = (value) => String(value || '').trim().toLowerCase();

const getCellValue = (row, headerMap, names) => {
  for (const name of names) {
    const index = headerMap.get(normalizeHeader(name));
    if (!index) continue;
    const value = row.getCell(index).value;
    if (value && typeof value === 'object' && 'text' in value) return value.text;
    if (value && typeof value === 'object' && 'result' in value) return value.result;
    return value;
  }
  return undefined;
};

const toText = (value) => {
  if (value === null || value === undefined) return undefined;
  const text = String(value).trim();
  return text || undefined;
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};

const toTimeText = (value) => {
  if (value instanceof Date) {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  }
  if (typeof value === 'number' && value >= 0 && value < 1) {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  const text = toText(value);
  if (!text) return undefined;
  const match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return text;
  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
};

const parseWeeks = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const text = String(value).trim();
  if (!text) return null;
  const weeks = text
    .split(/[,\n;]/)
    .map((item) => Number(String(item).trim()))
    .filter((item) => Number.isFinite(item));
  if (weeks.length === 0) return null;
  return weeks.length === 1 ? weeks[0] : weeks;
};

const findSemesterByImportFields = async ({ semesterId, semester, schoolYear }) => {
  if (semesterId) return semesterId;
  const semesterCode = toNumber(semester);
  if (!semesterCode || !schoolYear) return undefined;

  const record = await Semester.findOne({
    where: { code: semesterCode },
    include: [{
      model: SchoolYear,
      as: 'schoolYearInfo',
      where: { schoolYear },
      required: true,
    }],
  });

  if (!record) {
    throw new BadRequestError(`Không tìm thấy học kỳ ${semesterCode} năm học ${schoolYear}`);
  }
  return record.id;
};

const ensureStudentUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user || user.role !== 'STUDENT') {
    throw new BadRequestError('Chỉ được nhập lịch học cho học viên');
  }
};

const ensureSemester = async (semesterId) => {
  if (!semesterId) return;
  const semester = await Semester.findByPk(semesterId);
  if (!semester) throw new BadRequestError('Không tìm thấy học kỳ');
};

const getScheduleWeeks = (schedule) => {
  if (Array.isArray(schedule.week)) return schedule.week.filter(Boolean);
  return schedule.week ? [schedule.week] : [];
};

const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const validateSchedules = (schedules) => {
  if (!schedules || !Array.isArray(schedules)) return;
  
  for (let i = 0; i < schedules.length; i++) {
    const s = schedules[i];
    const start = parseTime(s.startTime);
    const end = parseTime(s.endTime);
    if (start >= end) {
      throw new BadRequestError(`Lịch học sai thời gian: Giờ bắt đầu (${s.startTime}) phải trước giờ kết thúc (${s.endTime})`);
    }
  }

  for (let i = 0; i < schedules.length; i++) {
    const s1 = schedules[i];
    for (let j = i + 1; j < schedules.length; j++) {
      const s2 = schedules[j];
      if (s1.day === s2.day) {
        const weeks1 = Array.isArray(s1.week) ? s1.week : (s1.week ? [s1.week] : []);
        const weeks2 = Array.isArray(s2.week) ? s2.week : (s2.week ? [s2.week] : []);
        const hasCommonWeek = weeks1.length === 0 || weeks2.length === 0 || weeks1.some(w => weeks2.includes(w));
        
        if (hasCommonWeek) {
          const start1 = parseTime(s1.startTime);
          const end1 = parseTime(s1.endTime);
          const start2 = parseTime(s2.startTime);
          const end2 = parseTime(s2.endTime);
          
          if (Math.max(start1, start2) < Math.min(end1, end2)) {
            throw new BadRequestError(`Trùng lịch học ngày ${s1.day} giữa môn ${s1.subjectName || ''} và ${s2.subjectName || ''}`);
          }
        }
      }
    }
  }
};

const validateAndCombineSchedules = async (userId, semesterId, newSchedules, skipTimeTableId = null) => {
  const where = { userId };
  if (semesterId) where.semesterId = semesterId;
  if (skipTimeTableId) {
    where.id = { [db.Sequelize.Op.ne]: skipTimeTableId };
  }
  
  const existingTimetables = await TimeTable.findAll({ where });
  let allSchedules = [...(newSchedules || [])];
  for (const tt of existingTimetables) {
    if (tt.schedules && Array.isArray(tt.schedules)) {
      allSchedules = allSchedules.concat(tt.schedules);
    }
  }
  
  validateSchedules(allSchedules);
};

const syncCutRiceFromTimeTable = async (userId, semesterId) => {
  const timetables = await TimeTable.findAll({ where: { userId, semesterId: semesterId || null } });
  
  const weekly = {};
  for (const tt of timetables) {
    if (!tt.schedules || !Array.isArray(tt.schedules)) continue;
    for (const s of tt.schedules) {
      const day = s.day;
      if (!day) continue;
      if (!weekly[day]) weekly[day] = { morning: false, noon: false, afternoon: false, evening: false };
      const startHour = parseInt(s.startTime?.split(':')[0]) || 0;
      const endHour = parseInt(s.endTime?.split(':')[0]) || 0;
      if (startHour < 10 || endHour <= 10) weekly[day].morning = true;
      if ((startHour >= 10 && startHour < 13) || (endHour > 10 && endHour <= 13)) weekly[day].noon = true;
      if ((startHour >= 13 && startHour < 17) || (endHour > 13 && endHour <= 17)) weekly[day].afternoon = true;
      if (startHour >= 17 || endHour >= 17) weekly[day].evening = true;
    }
  }

  const CutRice = db.cutRice;
  const Notification = db.notification;
  
  const cutRices = await CutRice.findAll({
    where: { userId, semesterId: semesterId || null, isAutoGenerated: true }
  });
  
  let updated = false;
  for (const cr of cutRices) {
    await cr.update({ weekly, lastUpdated: new Date() });
    updated = true;
  }
  
  if (updated) {
    await Notification.create({
      userId,
      title: 'Lịch cắt cơm đã được đồng bộ',
      content: 'Lịch cắt cơm của bạn vừa được cập nhật do thay đổi thời khóa biểu.',
      type: 'CUT_RICE',
    });
  }
};

const create = async (data) => {
  await ensureStudentUser(data.userId);
  await ensureSemester(data.semesterId);
  await validateAndCombineSchedules(data.userId, data.semesterId, data.schedules);
  const record = await TimeTable.create(data);
  await syncCutRiceFromTimeTable(data.userId, data.semesterId);
  return record;
};

const createBatch = async (data) => {
  const items = data.items || [];
  const results = [];

  if (data.semesterId) {
    await ensureSemester(data.semesterId);
  }

  for (const item of items) {
    const studentCode = item.studentCode;
    try {
      const { user } = await findStudentUserByCode(studentCode);
      const payload = {
        userId: user.id,
        semesterId: item.semesterId !== undefined ? item.semesterId : data.semesterId,
        schedules: item.schedules || [],
      };

      await ensureSemester(payload.semesterId);
      await validateAndCombineSchedules(payload.userId, payload.semesterId, payload.schedules);
      const record = await TimeTable.create(payload);
      await syncCutRiceFromTimeTable(payload.userId, payload.semesterId);
      results.push({ studentCode, id: record.id, status: 'CREATED' });
    } catch (err) {
      results.push({ studentCode, status: 'ERROR', message: err.message });
    }
  }

  return {
    total: results.length,
    created: results.filter((item) => item.status === 'CREATED').length,
    errors: results.filter((item) => item.status === 'ERROR').length,
    results,
  };
};

const createImportTemplate = async () => {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Thoi khoa bieu');

  worksheet.columns = [
    { header: 'Mã học viên', key: 'studentCode', width: 18 },
    { header: 'Năm học', key: 'schoolYear', width: 16 },
    { header: 'Học kỳ', key: 'semester', width: 12 },
    { header: 'SemesterId', key: 'semesterId', width: 38 },
    { header: 'Thứ', key: 'day', width: 14 },
    { header: 'Giờ bắt đầu', key: 'startTime', width: 14 },
    { header: 'Giờ kết thúc', key: 'endTime', width: 14 },
    { header: 'Phòng', key: 'room', width: 14 },
    { header: 'Môn học', key: 'subjectName', width: 28 },
    { header: 'Tuần', key: 'week', width: 18 },
  ];

  worksheet.addRows([
    {
      studentCode: 'HV001',
      schoolYear: '2024-2025',
      semester: 1,
      day: 'Thứ 2',
      startTime: '07:00',
      endTime: '09:00',
      room: 'P101',
      subjectName: 'Toán cao cấp',
      week: '1,2,3,4',
    },
    {
      studentCode: 'HV001',
      schoolYear: '2024-2025',
      semester: 1,
      day: 'Thứ 4',
      startTime: '13:30',
      endTime: '15:30',
      room: 'P202',
      subjectName: 'Tin học cơ sở',
      week: '1,2,3,4',
    },
  ]);

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  return workbook.xlsx.writeBuffer();
};

const parseExcelImport = async (file) => {
  if (!file?.buffer) throw new BadRequestError('Vui lòng tải lên file Excel');

  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(file.buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new BadRequestError('File Excel không có sheet dữ liệu');

  const headerMap = new Map();
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headerMap.set(normalizeHeader(cell.value), colNumber);
  });

  const grouped = new Map();

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const studentCode = toText(getCellValue(row, headerMap, ['Mã học viên', 'studentCode']));
    if (!studentCode) continue;

    const semesterId = await findSemesterByImportFields({
      semesterId: toText(getCellValue(row, headerMap, ['SemesterId', 'semesterId'])),
      schoolYear: toText(getCellValue(row, headerMap, ['Năm học', 'schoolYear'])),
      semester: getCellValue(row, headerMap, ['Học kỳ', 'semester']),
    });

    const schedule = {
      day: toText(getCellValue(row, headerMap, ['Thứ', 'Ngày', 'day'])),
      startTime: toTimeText(getCellValue(row, headerMap, ['Giờ bắt đầu', 'startTime'])),
      endTime: toTimeText(getCellValue(row, headerMap, ['Giờ kết thúc', 'endTime'])),
      room: toText(getCellValue(row, headerMap, ['Phòng', 'room'])),
      subjectName: toText(getCellValue(row, headerMap, ['Môn học', 'subjectName'])),
      week: parseWeeks(getCellValue(row, headerMap, ['Tuần', 'week'])),
    };

    const key = `${studentCode}::${semesterId || ''}`;
    if (!grouped.has(key)) grouped.set(key, { studentCode, semesterId, schedules: [] });
    grouped.get(key).schedules.push(schedule);
  }

  const items = [...grouped.values()].filter((item) => item.schedules.length > 0);
  if (!items.length) throw new BadRequestError('File Excel không có dòng thời khóa biểu hợp lệ');
  return { items };
};

const exportExcel = async (query = {}) => {
  const result = await getAll({ ...query, fetchAll: true });
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Bao cao thoi khoa bieu');

  worksheet.columns = [
    { header: 'Mã học viên', key: 'code', width: 16 },
    { header: 'Họ và tên', key: 'fullName', width: 28 },
    { header: 'Đơn vị', key: 'unit', width: 22 },
    { header: 'Năm học', key: 'schoolYear', width: 16 },
    { header: 'Học kỳ', key: 'semester', width: 12 },
    { header: 'Thứ', key: 'day', width: 14 },
    { header: 'Giờ bắt đầu', key: 'startTime', width: 14 },
    { header: 'Giờ kết thúc', key: 'endTime', width: 14 },
    { header: 'Phòng', key: 'room', width: 14 },
    { header: 'Môn học', key: 'subjectName', width: 28 },
    { header: 'Tuần', key: 'week', width: 18 },
    { header: 'Ngày cập nhật', key: 'updatedAt', width: 22 },
  ];

  for (const row of result.rows) {
    const plain = row.get ? row.get({ plain: true }) : row;
    const user = plain.User || plain.user || {};
    const profile = user.Profile || user.profile || {};
    const semester = plain.Semester || plain.semester || {};
    const schoolYearInfo = semester.schoolYearInfo || semester.SchoolYear || {};

    for (const schedule of plain.schedules || []) {
      worksheet.addRow({
        code: profile.code || '',
        fullName: profile.fullName || user.username || '',
        unit: profile.unit || '',
        schoolYear: schoolYearInfo.schoolYear || '',
        semester: semester.code || '',
        day: schedule.day || '',
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        room: schedule.room || '',
        subjectName: schedule.subjectName || '',
        week: getScheduleWeeks(schedule).join(', '),
        updatedAt: plain.updatedAt || '',
      });
    }
  }

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getColumn('updatedAt').numFmt = 'dd/mm/yyyy hh:mm:ss';

  return workbook.xlsx.writeBuffer();
};
const getAll = async (query) => {
  const userWhere = {};
  const profileWhere = {};
  const semesterWhere = {};
  const schoolYearWhere = {};
  const opts = {
    filterFields: ['userId'],
    include: [{ model: User, include: [{ model: db.profile }] }, { model: Semester, include: [{ model: SchoolYear, as: 'schoolYearInfo' }] }],
  };

  if (query.semesterId) opts.filterFields.push('semesterId');

  if (query.code) {
    userWhere.role = 'STUDENT';
    profileWhere.code = query.code;
  }

  if (query.semester) semesterWhere.code = Number(query.semester);
  if (query.schoolYear) schoolYearWhere.schoolYear = query.schoolYear;

  if (query.fullName) {
    profileWhere.fullName = { [db.Sequelize.Op.like]: `%${query.fullName}%` };
  }

  if (Object.keys(userWhere).length > 0) {
    opts.include[0].where = userWhere;
    opts.include[0].required = true;
  }

  if (Object.keys(profileWhere).length > 0) {
    opts.include[0].include[0].where = profileWhere;
    opts.include[0].include[0].required = true;
    opts.include[0].required = true;
  }

  if (Object.keys(semesterWhere).length > 0) {
    opts.include[1].where = semesterWhere;
    opts.include[1].required = true;
  }
  if (Object.keys(schoolYearWhere).length > 0) {
    opts.include[1].include[0].where = schoolYearWhere;
    opts.include[1].include[0].required = true;
    opts.include[1].required = true;
  }

  const result = await paginateQuery(TimeTable, query, opts);

  result.rows = result.rows.map(row => {
    const plain = row.get({ plain: true });
    const schedules = plain.schedules || [];
    plain.scheduleCount = schedules.length;
    plain.subjectNames = [...new Set(schedules.map(s => s.subjectName).filter(Boolean))];
    plain.weeks = [...new Set(schedules.flatMap(getScheduleWeeks))];
    plain.rooms = [...new Set(schedules.map(s => s.room).filter(Boolean))];
    return plain;
  });

  return result;
};

const getDetail = async (id) => {
  const record = await TimeTable.findByPk(id, {
    include: [{ model: User, include: [{ model: db.profile }] }, { model: Semester, include: [{ model: SchoolYear, as: 'schoolYearInfo' }] }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy thời khóa biểu');
  return record;
};

const update = async (id, data) => {
  const record = await getDetail(id);
  if (data.userId) await ensureStudentUser(data.userId);
  if (data.semesterId !== undefined) await ensureSemester(data.semesterId);
  
  const userId = data.userId || record.userId;
  const semesterId = data.semesterId !== undefined ? data.semesterId : record.semesterId;
  const schedules = data.schedules || record.schedules;
  
  await validateAndCombineSchedules(userId, semesterId, schedules, id);
  await record.update(data);
  await syncCutRiceFromTimeTable(userId, semesterId);
  return record;
};

const deleteRecord = async (id) => {
  const record = await getDetail(id);
  await record.destroy();
  await syncCutRiceFromTimeTable(record.userId, record.semesterId);
  return { deleted: true };
};

const getReport = async () => {
  const timetables = await TimeTable.findAll({
    include: [{ model: User, include: [{ model: db.profile }] }, { model: Semester, include: [{ model: SchoolYear, as: 'schoolYearInfo' }] }],
  });

  const rows = [];
  const studentSet = new Set();
  const subjectSet = new Set();
  const weekSet = new Set();
  let totalSchedules = 0;

  for (const tt of timetables) {
    const profile = tt.User?.Profile;
    const schedules = tt.schedules || [];
    if (schedules.length > 0) studentSet.add(profile?.code);

    for (const s of schedules) {
      totalSchedules++;
      if (s.subjectName) subjectSet.add(s.subjectName);
      const weeks = getScheduleWeeks(s);
      weeks.forEach((week) => weekSet.add(week));

      rows.push({
        unit: profile?.unit || '',
        fullName: profile?.fullName || '',
        semester: tt.Semester?.code || '',
        schoolYear: tt.Semester?.schoolYearInfo?.schoolYear || '',
        scheduleCount: schedules.length,
        subjectName: s.subjectName || '',
        room: s.room || '',
        week: weeks.join(', '),
        day: s.day || '',
        startTime: s.startTime || '',
        endTime: s.endTime || '',
      });
    }
  }

  return {
    summary: {
      totalStudents: studentSet.size,
      totalSchedules,
      totalSubjects: subjectSet.size,
      totalWeeks: weekSet.size,
    },
    data: rows,
  };
};

module.exports = {
  create,
  createBatch,
  parseExcelImport,
  createImportTemplate,
  exportExcel,
  getAll,
  getDetail,
  update,
  delete: deleteRecord,
  getReport,
};
