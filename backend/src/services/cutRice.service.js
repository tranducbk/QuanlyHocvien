const db = require('../models');
const User = db.user;
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { findStudentUserByCode } = require('../utils/studentLookup');

const CutRice = db.cutRice;
const CutRiceRequest = db.cutRiceRequest;
const Semester = db.semester;

const isCommander = (requester) => requester?.role === 'COMMANDER';

const cutRiceInclude = [
  { model: User, include: [{ model: db.profile }] },
  { model: Semester, as: 'semesterInfo', include: [{ model: db.schoolYear, as: 'schoolYearInfo' }] },
];

const requestInclude = [
  { model: User, include: [{ model: db.profile }] },
  { model: Semester, as: 'semesterInfo', include: [{ model: db.schoolYear, as: 'schoolYearInfo' }] },
  { model: User, as: 'reviewer', attributes: { exclude: ['password', 'refreshToken'] } },
];

const cloneInclude = (include) => include.map((item) => {
  const cloned = { ...item };
  if (item.include) cloned.include = cloneInclude(item.include);
  return cloned;
});

const applyCommanderProfileScope = (include, profileWhere, requester) => {
  if (isCommander(requester)) profileWhere.commanderId = requester.id;
  if (Object.keys(profileWhere).length > 0) {
    include[0].include[0].where = profileWhere;
    include[0].include[0].required = true;
    include[0].required = true;
  }
};

const assertCommanderCanAccessRow = (row, requester) => {
  if (!isCommander(requester)) return;
  const plain = typeof row?.get === 'function' ? row.get({ plain: true }) : row;
  const profile = plain?.User?.Profile || plain?.User?.profile;
  if (profile?.commanderId !== requester.id) throw new NotFoundError('Khong tim thay du lieu cat com');
};

const ensureSemester = async (semesterId) => {
  if (!semesterId) return null;
  const semester = await Semester.findByPk(semesterId);
  if (!semester) throw new BadRequestError('Khong tim thay hoc ky');
  return semester;
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

const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const slots = [
  { label: 'Sáng', key: 'morning' },
  { label: 'Trưa', key: 'noon' },
  { label: 'Tối', key: 'evening' },
];

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

const toBooleanMark = (value) => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  return ['x', '1', 'true', 'yes', 'y', 'co', 'có'].includes(String(value).trim().toLowerCase());
};

const buildWeeklyFromRow = (row, headerMap) => {
  const weekly = {};
  for (const day of days) {
    weekly[day] = {};
    for (const slot of slots) {
      weekly[day][slot.key] = toBooleanMark(
        getCellValue(row, headerMap, [`${day} ${slot.label}`, `${day}_${slot.label.toLowerCase()}`])
      );
    }
  }
  return weekly;
};

const create = async (data) => {
  await ensureSemester(data.semesterId);
  const weekRange = getWeekRange(data.weekStartDate || new Date());
  return CutRice.create({ ...data, ...weekRange });
};
const getAll = async (query, requester) => {
  const profileWhere = {};
  const include = cloneInclude(cutRiceInclude);

  if (query.fullName) profileWhere.fullName = { [db.Sequelize.Op.like]: `%${query.fullName}%` };
  if (query.unit) profileWhere.unit = query.unit;
  applyCommanderProfileScope(include, profileWhere, requester);

  const optionsWhere = {};
  if (query.weekStartDate) {
    optionsWhere.weekStartDate = getWeekRange(query.weekStartDate).weekStartDate;
  }

  const result = await paginateQuery(CutRice, query, {
    filterFields: ['userId', 'semesterId', 'isAutoGenerated'],
    where: optionsWhere,
    include,
  });

  result.rows = result.rows.map(row => {
    const plain = row.get({ plain: true });
    const weekly = plain.weekly || {};
    const dayMap = {
      'Thứ 2': ['Thứ 2', 'thứ 2'],
      'Thứ 3': ['Thứ 3', 'thứ 3'],
      'Thứ 4': ['Thứ 4', 'thứ 4'],
      'Thứ 5': ['Thứ 5', 'thứ 5'],
      'Thứ 6': ['Thứ 6', 'thứ 6'],
      'Thứ 7': ['Thứ 7', 'thứ 7'],
      'Chủ nhật': ['Chủ nhật', 'chủ nhật'],
    };
    for (const [day, keys] of Object.entries(dayMap)) {
      const slot = weekly[keys[0]] || weekly[keys[1]] || {};
      plain[day + '_sáng'] = slot.morning || false;
      plain[day + '_trưa'] = slot.noon || false;
      plain[day + '_tối'] = slot.evening || false;
    }
    return plain;
  });

  return result;
};

const getDetail = async (id, requester) => {
  const record = await CutRice.findByPk(id, {
    include: cutRiceInclude,
  });
  if (!record) throw new NotFoundError('Không tìm thấy lịch cắt cơm');
  assertCommanderCanAccessRow(record, requester);
  return record;
};

const update = async (id, data, requester) => {
  const record = await getDetail(id, requester);
  await ensureSemester(data.semesterId);
  const weekRange = data.weekStartDate ? getWeekRange(data.weekStartDate) : {};
  return record.update({ ...data, ...weekRange });
};

const deleteRecord = async (id, requester) => {
  const record = await getDetail(id, requester);
  await record.destroy();
  return { deleted: true };
};

// ===================== Export Excel =====================

const createImportTemplate = async () => {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lich cat com');

  const headers = [
    'Mã học viên',
    'Ghi chú',
    ...days.flatMap((day) => slots.map((slot) => `${day} ${slot.label}`)),
  ];
  worksheet.addRow(headers);
  worksheet.addRow(['HV001', 'Cắt cơm do lịch học', 'x', '', 'x', '', '', '', '', 'x', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
  worksheet.addRow(['HV002', 'Điều chỉnh thủ công', '', 'x', '', '', '', '', 'x', '', '', '', '', '', '', '', '', '', '', '', '', '', '']);

  worksheet.columns.forEach(col => { col.width = 13; });
  worksheet.getColumn(1).width = 18;
  worksheet.getColumn(2).width = 28;
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { wrapText: true, horizontal: 'center' };
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

  const items = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const studentCode = toText(getCellValue(row, headerMap, ['Mã học viên', 'MSSV', 'studentCode']));
    if (!studentCode) return;
    items.push({
      studentCode,
      semesterId: toText(getCellValue(row, headerMap, ['SemesterId', 'semesterId'])),
      weekStartDate: toText(getCellValue(row, headerMap, ['WeekStartDate', 'weekStartDate'])),
      notes: toText(getCellValue(row, headerMap, ['Ghi chú', 'notes'])),
      weekly: buildWeeklyFromRow(row, headerMap),
    });
  });

  if (!items.length) throw new BadRequestError('File Excel không có dòng lịch cắt cơm hợp lệ');
  return items;
};

const importExcel = async (file) => {
  const items = await parseExcelImport(file);
  const results = [];

  for (const item of items) {
    const studentCode = item.studentCode;
    try {
      const { user } = await findStudentUserByCode(studentCode);
      const payload = {
        userId: user.id,
        semesterId: item.semesterId || null,
        ...getWeekRange(item.weekStartDate || new Date()),
        weekly: item.weekly,
        notes: item.notes || null,
        isAutoGenerated: false,
        lastUpdated: new Date(),
      };

      const [record, created] = await CutRice.findOrCreate({
        where: {
          userId: user.id,
          semesterId: item.semesterId || null,
          weekStartDate: payload.weekStartDate,
        },
        defaults: payload,
      });
      if (!created) await record.update(payload);

      results.push({ studentCode, id: record.id, status: created ? 'CREATED' : 'UPDATED' });
    } catch (err) {
      results.push({ studentCode, status: 'ERROR', message: err.message });
    }
  }

  return {
    total: results.length,
    created: results.filter((item) => item.status === 'CREATED').length,
    updated: results.filter((item) => item.status === 'UPDATED').length,
    errors: results.filter((item) => item.status === 'ERROR').length,
    results,
  };
};

const exportCutRice = async (query, requester) => {
  const where = {};
  const profileWhere = {};
  const include = cloneInclude(cutRiceInclude);

  if (query.userId) {
    where.userId = query.userId;
  }
  if (query.semesterId) {
    where.semesterId = query.semesterId;
  }
  if (query.weekStartDate) {
    where.weekStartDate = getWeekRange(query.weekStartDate).weekStartDate;
  }
  if (query.isAutoGenerated !== undefined && query.isAutoGenerated !== '') {
    where.isAutoGenerated = String(query.isAutoGenerated) === 'true';
  }
  if (query.unit) {
    profileWhere.unit = query.unit;
  }
  if (query.fullName) {
    profileWhere.fullName = { [db.Sequelize.Op.like]: `%${query.fullName}%` };
  }
  applyCommanderProfileScope(include, profileWhere, requester);

  const order = [];
  const sortableFields = ['userId', 'isAutoGenerated', 'updatedAt', 'createdAt'];
  if (sortableFields.includes(query.sortBy)) {
    order.push([query.sortBy, String(query.sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC']);
  }

  const records = await CutRice.findAll({ where, include, order });

  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lịch cắt cơm');

  const dayHeaders = ['Sáng', 'Trưa', 'Tối'];
  const dayKeyLower = ['thứ 2', 'thứ 3', 'thứ 4', 'thứ 5', 'thứ 6', 'thứ 7', 'chủ nhật'];

  const headers = ['Đơn vị', 'Họ và tên', 'MSSV', 'Ghi chú', ...days.flatMap(d => dayHeaders.map(t => `${d} ${t}`))];
  worksheet.addRow(headers);

  for (const record of records) {
    const profile = record.User?.Profile;
    const weekly = record.weekly || {};
    const row = [
      profile?.unit || '',
      profile?.fullName || '',
      profile?.code || '',
      record.notes || '',
    ];

    for (let i = 0; i < days.length; i++) {
      const slot = weekly[days[i]] || weekly[dayKeyLower[i]] || {};
      row.push(slot.morning ? 'x' : '');
      row.push(slot.noon ? 'x' : '');
      row.push(slot.evening ? 'x' : '');
    }
    worksheet.addRow(row);
  }

  worksheet.columns.forEach(col => { col.width = 13; });
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  worksheet.getRow(1).alignment = { wrapText: true, horizontal: 'center' };

  return workbook.xlsx.writeBuffer();
};

const getRequests = async (query, requester) => {
  const where = {};
  const profileWhere = {};
  const include = cloneInclude(requestInclude);
  if (query.status) where.status = query.status;
  if (query.userId) where.userId = query.userId;
  if (query.semesterId) where.semesterId = query.semesterId;
  if (query.weekStartDate) where.weekStartDate = getWeekRange(query.weekStartDate).weekStartDate;
  if (query.fullName) profileWhere.fullName = { [db.Sequelize.Op.like]: `%${query.fullName}%` };
  if (query.unit) profileWhere.unit = query.unit;

  applyCommanderProfileScope(include, profileWhere, requester);

  return paginateQuery(CutRiceRequest, query, {
    where,
    include,
    order: [['createdAt', 'DESC']],
  });
};

const approveRequest = async (id, reviewerId, data = {}, requester) => {
  const request = await CutRiceRequest.findByPk(id, { include: requestInclude });
  if (!request) throw new NotFoundError('Khong tim thay yeu cau cat com');
  assertCommanderCanAccessRow(request, requester);
  if (request.status !== 'PENDING') throw new BadRequestError('Yeu cau da duoc xu ly');

  const payload = {
    userId: request.userId,
    semesterId: request.semesterId,
    weekStartDate: request.weekStartDate,
    weekEndDate: request.weekEndDate,
    weekly: request.weekly,
    notes: request.notes,
    isAutoGenerated: false,
    lastUpdated: new Date(),
  };

  const [record, created] = await CutRice.findOrCreate({
    where: {
      userId: request.userId,
      semesterId: request.semesterId,
      weekStartDate: request.weekStartDate,
    },
    defaults: payload,
  });
  if (!created) await record.update(payload);

  await request.update({
    status: 'APPROVED',
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
    reviewNote: data.reviewNote || null,
  });

  return CutRiceRequest.findByPk(id, { include: requestInclude });
};

const rejectRequest = async (id, reviewerId, data = {}, requester) => {
  const request = await CutRiceRequest.findByPk(id, { include: requestInclude });
  if (!request) throw new NotFoundError('Khong tim thay yeu cau cat com');
  assertCommanderCanAccessRow(request, requester);
  if (request.status !== 'PENDING') throw new BadRequestError('Yeu cau da duoc xu ly');

  await request.update({
    status: 'REJECTED',
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
    reviewNote: data.reviewNote || null,
  });

  return CutRiceRequest.findByPk(id, { include: requestInclude });
};

module.exports = {
  create,
  getAll,
  getDetail,
  update,
  delete: deleteRecord,
  createImportTemplate,
  importExcel,
  exportCutRice,
  getRequests,
  approveRequest,
  rejectRequest,
};
