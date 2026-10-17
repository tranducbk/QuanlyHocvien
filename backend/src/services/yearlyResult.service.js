const db = require('../models');
const User = db.user;
const { NotFoundError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const YearlyResult = db.yearlyResult;
const University = db.university;
const Class = db.class;
const SemesterResult = db.semesterResult;

const buildQueryParts = (query = {}, { includeSemesters = false } = {}) => {
  const where = {};
  const profileWhere = {};

  if (query.schoolYear) where.schoolYear = query.schoolYear;
  if (query.userId) where.userId = query.userId;
  if (query.academicStatus) where.academicStatus = query.academicStatus;
  if (query.partyRating) where.partyRating = query.partyRating;
  if (query.trainingRating) where.trainingRating = query.trainingRating;

  if (query.gpaFrom !== undefined || query.gpaTo !== undefined) {
    where.averageGrade4 = {};
    if (query.gpaFrom !== undefined) where.averageGrade4[db.Sequelize.Op.gte] = parseFloat(query.gpaFrom);
    if (query.gpaTo !== undefined) where.averageGrade4[db.Sequelize.Op.lte] = parseFloat(query.gpaTo);
  }

  if (query.cpaFrom !== undefined || query.cpaTo !== undefined) {
    where.cumulativeGrade4 = {};
    if (query.cpaFrom !== undefined) where.cumulativeGrade4[db.Sequelize.Op.gte] = parseFloat(query.cpaFrom);
    if (query.cpaTo !== undefined) where.cumulativeGrade4[db.Sequelize.Op.lte] = parseFloat(query.cpaTo);
  }

  if (query.fullName) {
    profileWhere.fullName = { [db.Sequelize.Op.iLike]: `%${query.fullName}%` };
  }

  if (query.unit) {
    profileWhere.unit = { [db.Sequelize.Op.iLike]: `%${query.unit}%` };
  }

  if (query.isPartyMember === 'true') {
    profileWhere[db.Sequelize.Op.or] = [
      { probationaryPartyMember: { [db.Sequelize.Op.ne]: null } },
      { fullPartyMember: { [db.Sequelize.Op.ne]: null } },
    ];
  } else if (query.isPartyMember === 'false') {
    profileWhere.probationaryPartyMember = null;
    profileWhere.fullPartyMember = null;
  }

  const profileInclude = {
    model: db.profile,
    as: 'Profile',
    attributes: ['id', 'code', 'fullName', 'unit', 'universityId', 'classId'],
    include: [
      { model: University, attributes: ['id', 'universityName'] },
      { model: Class, attributes: ['id', 'className'] },
    ],
    required: true,
  };
  if (Object.keys(profileWhere).length > 0) {
    profileInclude.where = profileWhere;
  }

  const include = [{
    model: User,
    attributes: ['id'],
    where: { role: 'STUDENT' },
    include: [profileInclude],
    required: true,
  }];

  if (includeSemesters) {
    include.push({
      model: SemesterResult,
      attributes: [
        'id', 'userId', 'yearlyResultId', 'semester', 'schoolYear',
        'totalCredits', 'averageGrade4', 'averageGrade10',
        'cumulativeCredits', 'cumulativeGrade4', 'cumulativeGrade10',
        'debtCredits', 'failedSubjects',
      ],
      separate: true,
      order: [['semester', 'ASC']],
    });
  }

  return { where, include };
};

const getAll = async (query) => {
  const { where, include } = buildQueryParts(query);
  return paginateQuery(YearlyResult, query, { where, include });
};

const getDetail = async (id) => {
  const { include } = buildQueryParts({}, { includeSemesters: true });
  const record = await YearlyResult.findByPk(id, {
    include,
  });
  if (!record) throw new NotFoundError('Không tìm thấy kết quả năm học');
  return record;
};

// ===================== Export Excel =====================

const HEADERS = {
  'student.unit': 'Đơn vị',
  'student.fullName': 'Họ và tên',
  'student.code': 'Mã học viên',
  'student.university.universityName': 'Cơ sở đào tạo',
  'student.class.className': 'Lớp',
  'schoolYear': 'Năm học',
  'averageGrade4': 'GPA',
  'averageGrade10': 'GPA hệ 10',
  'cumulativeGrade4': 'CPA',
  'cumulativeGrade10': 'CPA hệ 10',
  'totalCredits': 'Tín chỉ',
  'cumulativeCredits': 'TC tích lũy',
  'passedSubjects': 'Số môn đạt',
  'failedSubjects': 'Số môn không đạt',
  'debtCredits': 'Môn nợ',
  'academicStatus': 'Xếp loại học tập',
  'partyRating': 'Xếp loại Đảng viên',
  'trainingRating': 'Xếp loại rèn luyện',
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

const exportYearlyResults = async (query) => {
  const { where, include } = buildQueryParts(query);

  const sortBy = query.sortBy || 'schoolYear';
  const sortOrder = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
  const order = [[sortBy, sortOrder]];

  const results = await YearlyResult.findAll({ where, include, order });

  const fields = query.fields ? query.fields.split(',').map(f => f.trim()).filter(f => HEADERS[f]) : Object.keys(HEADERS);

  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Thống kê năm học');

  worksheet.addRow(fields.map(f => HEADERS[f]));

  for (const r of results) {
    const plain = r.get({ plain: true });
    if (plain.User) {
      const profile = plain.User.Profile || {};
      plain.student = {
        ...profile,
        university: profile.University,
        class: profile.Class,
      };
      delete plain.User;
    }
    worksheet.addRow(fields.map(f => resolveField(plain, f)));
  }

  worksheet.columns.forEach(col => { col.width = 22; });
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  return workbook.xlsx.writeBuffer();
};

module.exports = { getAll, getDetail, exportYearlyResults };
