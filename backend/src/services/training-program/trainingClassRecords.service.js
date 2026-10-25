const db = require('../../models');
const ExcelJS = require('exceljs');
const { BadRequestError, NotFoundError } = require('../../utils/apiError');
const { achievementCreate } = require('../../validations/training-program/trainingClassRecords.validation.js');

const ensureWorkDay = (value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new BadRequestError('Ngày trực không hợp lệ');
  }
};

const ownClass = async (classId, commander) => {
  const record = await db.trainingClass.findOne({
    where: { id: classId, trainingSystemId: commander.trainingSystemId, commanderId: commander.id },
  });
  if (!record) throw new NotFoundError('Không tìm thấy lớp được giao trong Hệ của bạn');
  return record;
};

const ensureStudent = async (classId, studentUserId, commander) => {
  const student = await db.user.findOne({
    where: { id: studentUserId, role: 'STUDENT', trainingSystemId: commander.trainingSystemId, isActive: true },
    include: [{ model: db.profile, where: { trainingClassId: classId, commanderId: commander.id }, required: true }],
  });
  if (!student) throw new BadRequestError('Học viên không thuộc lớp được giao và Hệ của Chỉ huy');
  return student;
};

const getRecord = async (model, classId, recordId, commander) => {
  await ownClass(classId, commander);
  const record = await model.findOne({ where: { id: recordId, trainingClassId: classId } });
  if (!record) throw new NotFoundError('Không tìm thấy bản ghi trong lớp được giao');
  return record;
};

const getStudentNames = async (classId, commander) => {
  const students = await db.user.findAll({
    where: { role: 'STUDENT', trainingSystemId: commander.trainingSystemId },
    attributes: ['id'],
    include: [{ model: db.profile, where: { trainingClassId: classId, commanderId: commander.id }, required: true, attributes: ['code', 'fullName', 'unit'] }],
  });
  return new Map(students.map((student) => [student.id, { code: student.Profile.code, fullName: student.Profile.fullName, unit: student.Profile.unit }]));
};

const ensureAchievementSemester = async (classId, data) => {
  if (!data.semester) return;
  if (!data.schoolYear) throw new BadRequestError('Cần chọn năm học trước học kỳ');
  if (!await db.trainingClassSemester.findOne({ where: { trainingClassId: classId, schoolYear: data.schoolYear, code: Number(data.semester) } })) {
    throw new BadRequestError('Học kỳ không thuộc năm học của lớp được giao');
  }
};

const listAchievements = async (classId, commander) => {
  await ownClass(classId, commander);
  const rows = await db.trainingClassAchievement.findAll({ where: { trainingClassId: classId }, order: [['createdAt', 'DESC']] });
  const names = await getStudentNames(classId, commander);
  return rows.filter((row) => names.has(row.studentUserId)).map((row) => ({ ...row.get({ plain: true }), student: names.get(row.studentUserId) }));
};

const createAchievement = async (classId, data, commander) => {
  await ownClass(classId, commander);
  await ensureStudent(classId, data.studentUserId, commander);
  await ensureAchievementSemester(classId, data);
  return db.trainingClassAchievement.create({
    trainingClassId: classId,
    studentUserId: data.studentUserId,
    category: data.category,
    title: String(data.title).trim(),
    award: data.award == null ? null : String(data.award).trim() || null,
    schoolYear: data.schoolYear == null ? null : String(data.schoolYear).trim() || null,
    semester: data.semester == null ? null : String(data.semester).trim() || null,
    content: data.content == null ? null : String(data.content).trim() || null,
    year: data.year ?? null,
    description: data.description == null ? null : String(data.description).trim() || null,
  });
};

const updateAchievement = async (classId, recordId, data, commander) => {
  const record = await getRecord(db.trainingClassAchievement, classId, recordId, commander);
  await ensureStudent(classId, record.studentUserId, commander);
  await ensureAchievementSemester(classId, data);
  return record.update({
    category: data.category,
    title: String(data.title).trim(),
    award: data.award == null ? null : String(data.award).trim() || null,
    schoolYear: data.schoolYear == null ? null : String(data.schoolYear).trim() || null,
    semester: data.semester == null ? null : String(data.semester).trim() || null,
    content: data.content == null ? null : String(data.content).trim() || null,
    year: data.year ?? null,
    description: data.description == null ? null : String(data.description).trim() || null,
  });
};

const deleteAchievement = async (classId, recordId, commander) => {
  const record = await getRecord(db.trainingClassAchievement, classId, recordId, commander);
  await ensureStudent(classId, record.studentUserId, commander);
  await record.destroy();
  return { deleted: true };
};

const achievementColumns = [
  ['studentCode', 'Mã học viên'], ['schoolYear', 'Năm học'], ['semester', 'Học kỳ'],
  ['year', 'Năm'], ['category', 'Loại'], ['title', 'Tên thành tích'],
  ['award', 'Danh hiệu'], ['content', 'Nội dung'], ['description', 'Mô tả'],
];
const safeExcelText = (value) => typeof value === 'string' && /^[=+@\-\t\r]/.test(value) ? `'${value}` : value;
const buildAchievementWorkbook = (rows = [], includeGuide = false) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Thành tích');
  sheet.addRow(achievementColumns.map(([, header]) => header));
  for (const row of rows) sheet.addRow(achievementColumns.map(([field]) => safeExcelText(row[field] ?? '')));
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B7250' } };
  sheet.columns.forEach((column) => { column.width = 24; });
  if (includeGuide) {
    const guide = workbook.addWorksheet('Hướng dẫn');
    guide.addRow(['Loại', 'Giá trị điền vào cột Loại']);
    guide.addRow(['Khen thưởng', 'AWARD']);
    guide.addRow(['Đề tài khoa học', 'SCIENTIFIC_TOPIC']);
    guide.addRow(['Sáng kiến khoa học', 'SCIENTIFIC_INITIATIVE']);
    guide.getColumn(1).width = 28;
    guide.getColumn(2).width = 34;
  }
  return workbook.xlsx.writeBuffer();
};

const achievementTemplate = async (classId, commander) => {
  await ownClass(classId, commander);
  return buildAchievementWorkbook([], true);
};

const exportAchievements = async (classId, query, commander) => {
  const rows = await listAchievements(classId, commander);
  const normalize = (value) => String(value ?? '').normalize('NFD').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  const includes = (value, pattern) => !pattern || normalize(value).includes(normalize(pattern));
  const filtered = rows.filter((row) =>
    includes(`${row.student.fullName} ${row.student.code}`, query.student)
    && includes(row.title, query.title) && (!query.category || row.category === query.category)
    && includes(row.award, query.award) && includes(row.schoolYear, query.schoolYear)
    && includes(row.semester, query.semester) && includes(row.student.unit, query.unit)
    && includes(row.year, query.year));
  return buildAchievementWorkbook(filtered.map((row) => ({ ...row, studentCode: row.student.code })));
};

const importAchievements = async (classId, file, commander) => {
  await ownClass(classId, commander);
  if (!file?.buffer) throw new BadRequestError('Chưa chọn file Excel');
  const workbook = new ExcelJS.Workbook();
  try { await workbook.xlsx.load(file.buffer); } catch { throw new BadRequestError('File Excel không hợp lệ; chỉ hỗ trợ .xlsx'); }
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new BadRequestError('File Excel không có trang dữ liệu');
  const headers = achievementColumns.map(([, header]) => header);
  if (headers.some((header, index) => sheet.getRow(1).getCell(index + 1).text.trim() !== header)) {
    throw new BadRequestError('Cột Excel không đúng mẫu thành tích');
  }
  const students = await getStudentNames(classId, commander);
  const byCode = new Map([...students].map(([userId, student]) => [student.code?.trim(), userId]));
  const items = [];
  for (let rowNo = 2; rowNo <= sheet.rowCount; rowNo += 1) {
    const row = sheet.getRow(rowNo);
    if (achievementColumns.every((_, index) => !row.getCell(index + 1).text.trim())) continue;
    const values = Object.fromEntries(achievementColumns.map(([field], index) => [field, row.getCell(index + 1).text.trim()]));
    const studentUserId = byCode.get(values.studentCode);
    if (!studentUserId) throw new BadRequestError(`Dòng ${rowNo}: mã học viên không thuộc lớp được giao`);
    const data = {
      studentUserId, category: values.category || 'AWARD', title: values.title,
      schoolYear: values.schoolYear || null, semester: values.semester || null,
      year: values.year ? Number(values.year) : null, award: values.award || null,
      content: values.content || null, description: values.description || null,
    };
    try { items.push({ rowNo, data: await achievementCreate.validate(data, { abortEarly: false, stripUnknown: true }) }); }
    catch { throw new BadRequestError(`Dòng ${rowNo}: dữ liệu thành tích không hợp lệ`); }
  }
  if (!items.length) throw new BadRequestError('File Excel không có thành tích để nhập');
  if (items.length > 1000) throw new BadRequestError('Mỗi lần chỉ nhập tối đa 1000 thành tích');
  const validSemesters = await db.trainingClassSemester.findAll({ where: { trainingClassId: classId }, attributes: ['schoolYear', 'code'] });
  const semesterSet = new Set(validSemesters.map((semester) => `${semester.schoolYear}:${semester.code}`));
  for (const item of items) {
    if (item.data.semester && !semesterSet.has(`${item.data.schoolYear}:${Number(item.data.semester)}`)) {
      throw new BadRequestError(`Dòng ${item.rowNo}: học kỳ không thuộc lớp được giao`);
    }
  }
  await db.sequelize.transaction(async (transaction) => {
    await db.trainingClassAchievement.bulkCreate(items.map(({ data: { studentUserId, ...data } }) => ({
      trainingClassId: classId, studentUserId, ...data,
    })), { transaction, validate: true });
  });
  return { created: items.length };
};

const listDutySchedules = async (classId, commander) => {
  await ownClass(classId, commander);
  const rows = await db.trainingClassDutySchedule.findAll({ where: { trainingClassId: classId }, order: [['workDay', 'ASC']] });
  const names = await getStudentNames(classId, commander);
  return rows.filter((row) => names.has(row.studentUserId)).map((row) => ({ ...row.get({ plain: true }), student: names.get(row.studentUserId) }));
};

const createDutySchedule = async (classId, data, commander) => {
  await ownClass(classId, commander);
  await ensureStudent(classId, data.studentUserId, commander);
  ensureWorkDay(data.workDay);
  if (await db.trainingClassDutySchedule.findOne({ where: { trainingClassId: classId, studentUserId: data.studentUserId, workDay: data.workDay } })) {
    throw new BadRequestError('Học viên đã được phân công trong ngày này');
  }
  try {
    return await db.trainingClassDutySchedule.create({ trainingClassId: classId, studentUserId: data.studentUserId, position: String(data.position).trim(), workDay: data.workDay });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Học viên đã được phân công trong ngày này');
    throw error;
  }
};

const updateDutySchedule = async (classId, recordId, data, commander) => {
  const record = await getRecord(db.trainingClassDutySchedule, classId, recordId, commander);
  await ensureStudent(classId, record.studentUserId, commander);
  ensureWorkDay(data.workDay);
  try {
    return await record.update({ position: String(data.position).trim(), workDay: data.workDay });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') throw new BadRequestError('Học viên đã được phân công trong ngày này');
    throw error;
  }
};

const deleteDutySchedule = async (classId, recordId, commander) => {
  const record = await getRecord(db.trainingClassDutySchedule, classId, recordId, commander);
  await ensureStudent(classId, record.studentUserId, commander);
  await record.destroy();
  return { deleted: true };
};

module.exports = { listAchievements, createAchievement, updateAchievement, deleteAchievement, achievementTemplate, exportAchievements, importAchievements, listDutySchedules, createDutySchedule, updateDutySchedule, deleteDutySchedule };
