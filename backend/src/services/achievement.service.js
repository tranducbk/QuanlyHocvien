const db = require('../models');
const User = db.user;
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const { findStudentUserByCode } = require('../utils/studentLookup');

const Model = db.achievement;
const Student = db.profile;

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

const create = async (data) => Model.create(data);

const createBatch = async (data) => {
  const items = data.items || [];
  const results = [];

  for (const item of items) {
    const studentCode = item.studentCode;
    try {
      const { user } = await findStudentUserByCode(studentCode);
      const payload = { ...item, userId: user.id };
      delete payload.studentCode;

      const record = await Model.create(payload);
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
  const worksheet = workbook.addWorksheet('Thanh tich');

  worksheet.columns = [
    { header: 'Mã học viên', key: 'studentCode', width: 18 },
    { header: 'Năm học', key: 'schoolYear', width: 16 },
    { header: 'Học kỳ', key: 'semester', width: 12 },
    { header: 'Năm', key: 'year', width: 10 },
    { header: 'Tên thành tích', key: 'title', width: 34 },
    { header: 'Danh hiệu', key: 'award', width: 24 },
    { header: 'Nội dung', key: 'content', width: 42 },
    { header: 'Mô tả', key: 'description', width: 42 },
  ];

  worksheet.addRows([
    {
      studentCode: 'HV001',
      schoolYear: '2024-2025',
      semester: 1,
      year: 2025,
      title: 'Chiến sĩ tiên tiến',
      award: 'Chiến sĩ tiên tiến',
      content: 'Hoàn thành tốt nhiệm vụ học tập và rèn luyện',
      description: 'Ghi nhận cấp đơn vị',
    },
    {
      studentCode: 'HV002',
      schoolYear: '2024-2025',
      semester: 2,
      year: 2025,
      title: 'Giải thưởng nghiên cứu khoa học',
      award: 'Giải ba',
      content: 'Đạt giải trong cuộc thi nghiên cứu khoa học sinh viên',
      description: 'Đề tài cấp trường',
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

  const items = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const studentCode = toText(getCellValue(row, headerMap, ['Mã học viên', 'studentCode']));
    if (!studentCode) return;

    items.push({
      studentCode,
      schoolYear: toText(getCellValue(row, headerMap, ['Năm học', 'schoolYear'])),
      semester: toText(getCellValue(row, headerMap, ['Học kỳ', 'semester'])),
      year: toNumber(getCellValue(row, headerMap, ['Năm', 'year'])),
      title: toText(getCellValue(row, headerMap, ['Tên thành tích', 'Thành tích', 'title'])),
      award: toText(getCellValue(row, headerMap, ['Danh hiệu', 'award'])),
      content: toText(getCellValue(row, headerMap, ['Nội dung', 'content'])),
      description: toText(getCellValue(row, headerMap, ['Mô tả', 'description'])),
    });
  });

  if (!items.length) throw new BadRequestError('File Excel không có dòng thành tích hợp lệ');
  return { items };
};

const exportExcel = async (query = {}) => {
  const result = await getAll({ ...query, fetchAll: true });
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Bao cao thanh tich');

  worksheet.columns = [
    { header: 'Mã học viên', key: 'code', width: 16 },
    { header: 'Họ và tên', key: 'fullName', width: 28 },
    { header: 'Đơn vị', key: 'unit', width: 22 },
    { header: 'Lớp', key: 'className', width: 20 },
    { header: 'Năm học', key: 'schoolYear', width: 16 },
    { header: 'Học kỳ', key: 'semester', width: 12 },
    { header: 'Năm', key: 'year', width: 10 },
    { header: 'Tên thành tích', key: 'title', width: 34 },
    { header: 'Danh hiệu', key: 'award', width: 24 },
    { header: 'Nội dung', key: 'content', width: 42 },
    { header: 'Mô tả', key: 'description', width: 42 },
    { header: 'Ngày cập nhật', key: 'updatedAt', width: 22 },
  ];

  for (const row of result.rows) {
    const plain = row.get ? row.get({ plain: true }) : row;
    const user = plain.User || plain.user || {};
    const profile = user.Profile || user.profile || {};
    worksheet.addRow({
      code: profile.code || '',
      fullName: profile.fullName || user.username || '',
      unit: profile.unit || '',
      className: profile.Class?.className || profile.class?.className || '',
      schoolYear: plain.schoolYear || '',
      semester: plain.semester || '',
      year: plain.year || '',
      title: plain.title || '',
      award: plain.award || '',
      content: plain.content || '',
      description: plain.description || '',
      updatedAt: plain.updatedAt || '',
    });
  }

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getColumn('updatedAt').numFmt = 'dd/mm/yyyy hh:mm:ss';

  return workbook.xlsx.writeBuffer();
};
const getAll = async (query) => {
  const where = {};
  const studentWhere = {};
  const include = [
    {
      model: User,
      include: [{ model: Student, include: [{ model: db.class }] }],
    },
  ];

  if (query.userId) where.userId = query.userId;
  if (query.semester) where.semester = { [db.Sequelize.Op.iLike]: `%${query.semester}%` };
  if (query.schoolYear) where.schoolYear = { [db.Sequelize.Op.iLike]: `%${query.schoolYear}%` };
  if (query.year) where.year = query.year;
  if (query.award) where.award = { [db.Sequelize.Op.iLike]: `%${query.award}%` };

  if (query.fullName) studentWhere.fullName = { [db.Sequelize.Op.iLike]: `%${query.fullName}%` };
  if (query.unit) studentWhere.unit = query.unit;

  if (Object.keys(studentWhere).length > 0) {
    include[0].include[0].where = studentWhere;
    include[0].include[0].required = true;
    include[0].required = true;
  }

  return paginateQuery(Model, query, { where, include });
};

const getDetail = async (id) => {
  const record = await Model.findByPk(id, {
    include: [{
      model: User,
      include: [{ model: Student }],
    }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy thành tích');
  return record;
};

const update = async (id, data) => {
  const record = await getDetail(id);
  return record.update(data);
};

const deleteRecord = async (id) => {
  const record = await getDetail(id);
  await record.destroy();
  return { deleted: true };
};

module.exports = { create, createBatch, parseExcelImport, createImportTemplate, exportExcel, getAll, getDetail, update, delete: deleteRecord };
