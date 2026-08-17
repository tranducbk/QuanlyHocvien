const db = require('../models');
const User = db.user;
const Semester = db.semester;
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { findStudentUserByCode } = require('../utils/studentLookup');

const TuitionFee = db.tuitionFee;
const Student = db.profile;
const University = db.university;
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

const parseAmount = (value) => {
  if (typeof value === 'number') return value;
  const normalized = String(value || '').replace(/[.,\s₫đ]/gi, '');
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
};

const normalizeStatus = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  if (!normalized) return 'UNPAID';
  if (['PAID', 'DA THANH TOAN', 'ĐÃ THANH TOÁN', 'DA DONG', 'ĐÃ ĐÓNG'].includes(normalized)) return 'PAID';
  if (['UNPAID', 'CHUA THANH TOAN', 'CHƯA THANH TOÁN', 'CHUA DONG', 'CHƯA ĐÓNG'].includes(normalized)) return 'UNPAID';
  return normalized;
};

const attachSemester = async (data) => {
  if (data.semesterId === null) return data;

  let semester = null;
  if (data.semesterId) {
    semester = await Semester.findByPk(data.semesterId);
    if (!semester) throw new BadRequestError('Không tìm thấy học kỳ');
  } else if (data.semester) {
    if (!data.schoolYear) throw new BadRequestError('Cần truyền schoolYear khi tìm học kỳ theo mã');
    const schoolYear = await SchoolYear.findOne({ where: { schoolYear: data.schoolYear } });
    if (!schoolYear) throw new BadRequestError('Không tìm thấy năm học');
    semester = await Semester.findOne({ where: { code: Number(data.semester), schoolYearId: schoolYear.id } });
    if (!semester) throw new BadRequestError('Không tìm thấy học kỳ');
  }

  if (semester) {
    data.semesterId = semester.id;
    data.semester = String(semester.code);
    const schoolYear = await SchoolYear.findByPk(semester.schoolYearId);
    data.schoolYear = schoolYear?.schoolYear || data.schoolYear;
  }

  return data;
};

const create = async (data) => {
  await attachSemester(data);
  return TuitionFee.create(data);
};

const createBatch = async (data) => {
  const items = data.items || [];
  const results = [];

  for (const item of items) {
    const studentCode = item.studentCode;
    try {
      const { user } = await findStudentUserByCode(studentCode);
      const payload = {
        ...item,
        userId: user.id,
        semesterId: item.semesterId !== undefined ? item.semesterId : data.semesterId,
        semester: item.semester !== undefined ? item.semester : data.semester,
        schoolYear: item.schoolYear !== undefined ? item.schoolYear : data.schoolYear,
      };
      delete payload.studentCode;

      await attachSemester(payload);
      const record = await TuitionFee.create(payload);
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
  const worksheet = workbook.addWorksheet('Hoc phi');

  worksheet.columns = [
    { header: 'Mã học viên', key: 'studentCode', width: 18 },
    { header: 'Năm học', key: 'schoolYear', width: 16 },
    { header: 'Học kỳ', key: 'semester', width: 12 },
    { header: 'Số tiền', key: 'totalAmount', width: 16 },
    { header: 'Nội dung', key: 'content', width: 34 },
    { header: 'Trạng thái', key: 'status', width: 18 },
  ];

  worksheet.addRows([
    {
      studentCode: 'HV001',
      schoolYear: '2025-2026',
      semester: 1,
      totalAmount: 4500000,
      content: 'Học phí học kỳ 1 năm học 2025-2026',
      status: 'UNPAID',
    },
    {
      studentCode: 'HV002',
      schoolYear: '2025-2026',
      semester: 2,
      totalAmount: 5000000,
      content: 'Học phí học kỳ 2 năm học 2025-2026',
      status: 'PAID',
    },
  ]);

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  worksheet.getColumn('semester').eachCell({ includeEmpty: false }, (cell, rowNumber) => {
    if (rowNumber > 1) cell.numFmt = '0';
  });
  worksheet.getColumn('totalAmount').numFmt = '#,##0';

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

    const studentCode = String(getCellValue(row, headerMap, ['Mã học viên', 'studentCode']) || '').trim();
    if (!studentCode) return;

    const totalAmount = parseAmount(getCellValue(row, headerMap, ['Số tiền', 'totalAmount']));
    items.push({
      studentCode,
      schoolYear: String(getCellValue(row, headerMap, ['Năm học', 'schoolYear']) || '').trim(),
      semester: String(getCellValue(row, headerMap, ['Học kỳ', 'semester']) || '').trim(),
      totalAmount,
      content: String(getCellValue(row, headerMap, ['Nội dung', 'content']) || '').trim(),
      status: normalizeStatus(getCellValue(row, headerMap, ['Trạng thái', 'status'])),
    });
  });

  if (!items.length) throw new BadRequestError('File Excel không có dòng học phí hợp lệ');

  return { items };
};
const getAll = async (query) => {
  const where = {};
  const studentWhere = {};
  const semesterWhere = {};
  const include = [
    { model: User, include: [{ model: db.profile, include: [{ model: University }] }] },
    { model: Semester, as: 'semesterInfo', include: [{ model: SchoolYear, as: 'schoolYearInfo' }] },
  ];

  if (query.semesterId) where.semesterId = query.semesterId;
  if (query.semester) where.semester = query.semester;
  if (query.schoolYear) where.schoolYear = query.schoolYear;
  if (query.status) where.status = query.status;
  if (query.userId) where.userId = query.userId;

  if (query.code) studentWhere.code = query.code;
  if (query.fullName) studentWhere.fullName = { [db.Sequelize.Op.like]: `%${query.fullName}%` };
  if (query.unit) studentWhere.unit = query.unit;
  if (query.semester) semesterWhere.code = Number(query.semester);

  if (Object.keys(studentWhere).length > 0) {
    include[0].include[0].where = studentWhere;
    include[0].include[0].required = true;
    include[0].required = true;
  }

  if (Object.keys(semesterWhere).length > 0) {
    include[1].where = semesterWhere;
    include[1].required = true;
  }

  return paginateQuery(TuitionFee, query, { where, include });
};

const getDetail = async (id) => {
  const record = await TuitionFee.findByPk(id, {
    include: [{ model: User, include: [{ model: db.profile }] }, { model: Semester, as: 'semesterInfo', include: [{ model: SchoolYear, as: 'schoolYearInfo' }] }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy học phí');
  return record;
};

const update = async (id, data, changedBy = null) => {
  const record = await getDetail(id);
  const oldStatus = record.status;
  const oldAmount = record.totalAmount;
  
  await attachSemester(data);
  const updated = await record.update(data);

  const notes = [];
  if (data.status && data.status !== oldStatus) notes.push('trạng thái');
  if (data.totalAmount !== undefined && Number(data.totalAmount) !== Number(oldAmount)) notes.push('số tiền');

  if (notes.length > 0) {
    await db.tuitionHistory.create({
      tuitionFeeId: id,
      changedBy,
      oldStatus,
      newStatus: data.status || oldStatus,
      note: `Cập nhật ${notes.join(' và ')} học phí`
    });
  }

  return updated;
};

const getHistories = async (id) => {
  const record = await TuitionFee.findByPk(id);
  if (!record) throw new NotFoundError('Không tìm thấy học phí');
  
  const histories = await db.tuitionHistory.findAll({
    where: { tuitionFeeId: id },
    include: [{ model: User, as: 'changer', attributes: ['id'], include: [{ model: db.profile, attributes: ['fullName', 'code'] }] }],
    order: [['createdAt', 'DESC']]
  });
  return histories;
};

const deleteRecord = async (id) => {
  const record = await getDetail(id);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, createBatch, parseExcelImport, createImportTemplate, getAll, getDetail, update, delete: deleteRecord, getHistories };
