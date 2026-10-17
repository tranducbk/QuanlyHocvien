const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const ExcelJS = require('exceljs');

const SubjectResult = db.subjectResult;
const SemesterResult = db.semesterResult;
const User = db.user;
const Profile = db.profile;

const buildSemesterInclude = (requester) => ({
  model: SemesterResult,
  required: true,
  include: [{
    model: User,
    attributes: ['id'],
    where: {
      role: 'STUDENT',
      systemType: requester.systemType,
    },
    required: true,
    include: [{
      model: Profile,
      as: 'Profile',
      attributes: ['id', 'code', 'fullName', 'unit', 'commanderId'],
      required: false,
    }],
  }],
});

const ensureSemesterResult = async (semesterResultId, requester, transaction) => {
  const semesterResult = await SemesterResult.findOne({
    where: { id: semesterResultId },
    include: buildSemesterInclude(requester).include,
    transaction,
  });
  if (!semesterResult) {
    throw new BadRequestError('Không tìm thấy kết quả học kỳ trong phạm vi quản lý');
  }
  return semesterResult;
};

const CREATE_FIELDS = ['semesterResultId', 'subjectCode', 'subjectName', 'credits', 'letterGrade', 'gradePoint4', 'gradePoint10'];

const pickFields = (data, fields) => fields.reduce((acc, key) => {
  if (data[key] !== undefined) acc[key] = data[key];
  return acc;
}, {});

const create = async (data, requester) => {
  await ensureSemesterResult(data.semesterResultId, requester);
  return SubjectResult.create(pickFields(data, CREATE_FIELDS));
};

const getAll = async (query, requester) => paginateQuery(SubjectResult, query, {
  filterFields: ['semesterResultId', 'subjectCode', 'subjectName', 'letterGrade'],
  include: [buildSemesterInclude(requester)],
});

const getDetail = async (id, requester) => {
  const record = await SubjectResult.findOne({
    where: { id },
    include: [buildSemesterInclude(requester)],
  });
  if (!record) throw new NotFoundError('Không tìm thấy kết quả môn học trong phạm vi quản lý');
  return record;
};

const downloadTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Diem Mon Hoc');

  worksheet.columns = [
    { header: 'Mã môn học', key: 'subjectCode', width: 15 },
    { header: 'Tên môn học', key: 'subjectName', width: 30 },
    { header: 'Số tín chỉ', key: 'credits', width: 15 },
    { header: 'Điểm hệ 10', key: 'gradePoint10', width: 15 },
    { header: 'Điểm hệ 4', key: 'gradePoint4', width: 15 },
    { header: 'Điểm chữ', key: 'letterGrade', width: 15 },
  ];

  worksheet.addRow({
    subjectCode: 'IT3011',
    subjectName: 'Mạng máy tính',
    credits: 3,
    gradePoint10: 8.5,
    gradePoint4: 3.5,
    letterGrade: 'B+',
  });

  return workbook.xlsx.writeBuffer();
};

const importExcel = async (fileBuffer, semesterResultId, requester) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) throw new BadRequestError('File Excel không hợp lệ');

  const rows = [];
  const subjectCodes = new Set();
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const subjectCode = row.getCell(1).value?.toString()?.trim();
    const subjectName = row.getCell(2).value?.toString()?.trim();
    const credits = Number(row.getCell(3).value);
    const gradePoint10 = Number(row.getCell(4).value);
    const gradePoint4 = Number(row.getCell(5).value);
    const letterGrade = row.getCell(6).value?.toString()?.trim();

    if (!subjectCode || !subjectName || !Number.isFinite(credits) || !letterGrade) {
      throw new BadRequestError(`Dòng ${rowNumber}: Thiếu thông tin bắt buộc (mã môn, tên môn, tín chỉ, điểm chữ)`);
    }
    if (subjectCodes.has(subjectCode)) {
      throw new BadRequestError(`Dòng ${rowNumber}: Mã môn ${subjectCode} bị trùng trong file`);
    }
    subjectCodes.add(subjectCode);

    rows.push({
      semesterResultId,
      subjectCode,
      subjectName,
      credits,
      gradePoint10: Number.isFinite(gradePoint10) ? gradePoint10 : null,
      gradePoint4: Number.isFinite(gradePoint4) ? gradePoint4 : null,
      letterGrade,
    });
  });

  if (rows.length === 0) throw new BadRequestError('File Excel không có dữ liệu');

  return db.sequelize.transaction(async (transaction) => {
    await ensureSemesterResult(semesterResultId, requester, transaction);
    return SubjectResult.bulkCreate(rows, { transaction });
  });
};

module.exports = { create, getAll, getDetail, downloadTemplate, importExcel };
