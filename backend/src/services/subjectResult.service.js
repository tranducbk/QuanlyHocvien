const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');
const ExcelJS = require('exceljs');
const { getManagedSemesterResultIds, assertManagedStudent } = require('./legacyAcademicScope.service');

const SubjectResult = db.subjectResult;
const SemesterResult = db.semesterResult;
const User = db.user;

const ensureSemesterResult = async (semesterResultId, requester) => {
  const semesterResult = await SemesterResult.findByPk(semesterResultId);
  if (!semesterResult) throw new BadRequestError('Không tìm thấy kết quả học kỳ');
  const user = await User.findByPk(semesterResult.userId);
  if (!user || user.role !== 'STUDENT') {
    throw new BadRequestError('Chỉ được nhập môn học cho học viên');
  }
  await assertManagedStudent(requester, user.id);
};

const create = async (data, requester) => {
  await ensureSemesterResult(data.semesterResultId, requester);
  const duplicate = await SubjectResult.findOne({ where: { semesterResultId: data.semesterResultId, subjectCode: data.subjectCode } });
  if (duplicate) throw new BadRequestError('Môn học này đã có điểm');
  return SubjectResult.create(data);
};
const getAll = async (query, requester) => {
  const semesterIds = await getManagedSemesterResultIds(requester);
  const allowedIds = query.semesterResultId ? semesterIds.filter((id) => id === query.semesterResultId) : semesterIds;
  return paginateQuery(SubjectResult, query, {
    where: { semesterResultId: { [db.Sequelize.Op.in]: allowedIds } },
    filterFields: ['subjectCode', 'subjectName', 'letterGrade'],
    include: [{ model: SemesterResult }],
  });
};

const getDetail = async (id, requester) => {
  const semesterIds = await getManagedSemesterResultIds(requester);
  const record = await SubjectResult.findOne({
    where: { id, semesterResultId: { [db.Sequelize.Op.in]: semesterIds } },
    include: [{ model: SemesterResult }],
  });
  if (!record) throw new NotFoundError('Không tìm thấy kết quả môn học');
  return record;
};

const update = async (id, data) => {
  const record = await getDetail(id);
  if (data.semesterResultId) await ensureSemesterResult(data.semesterResultId);
  return record.update(data);
};

const deleteRecord = async (id) => {
  const record = await getDetail(id);
  await record.destroy();
  return { deleted: true };
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
  await ensureSemesterResult(semesterResultId, requester);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);
  
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) throw new BadRequestError('File Excel không hợp lệ');

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const subjectCode = row.getCell(1).value?.toString()?.trim();
    const subjectName = row.getCell(2).value?.toString()?.trim();
    const credits = parseFloat(row.getCell(3).value);
    const gradePoint10 = parseFloat(row.getCell(4).value);
    const gradePoint4 = parseFloat(row.getCell(5).value);
    const letterGrade = row.getCell(6).value?.toString()?.trim();

    if (!subjectCode || !subjectName || isNaN(credits) || !letterGrade) {
      throw new BadRequestError(`Dòng ${rowNumber}: Thiếu thông tin bắt buộc (mã môn, tên môn, tín chỉ, điểm chữ)`);
    }

    rows.push({
      semesterResultId,
      subjectCode,
      subjectName,
      credits,
      gradePoint10: isNaN(gradePoint10) ? null : gradePoint10,
      gradePoint4: isNaN(gradePoint4) ? null : gradePoint4,
      letterGrade,
    });
  });

  if (rows.length === 0) throw new BadRequestError('File Excel không có dữ liệu');
  const codes = rows.map((row) => row.subjectCode);
  if (new Set(codes).size !== codes.length) throw new BadRequestError('File Excel có mã môn học trùng nhau');

  return db.sequelize.transaction(async (t) => {
    const existing = await SubjectResult.findOne({
      where: { semesterResultId, subjectCode: { [db.Sequelize.Op.in]: codes } },
      transaction: t,
    });
    if (existing) throw new BadRequestError('Môn học đã có điểm');
    return SubjectResult.bulkCreate(rows, { transaction: t });
  });
};

module.exports = { create, getAll, getDetail, update, delete: deleteRecord, downloadTemplate, importExcel };
