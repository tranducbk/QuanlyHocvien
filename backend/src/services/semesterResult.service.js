const db = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const SemesterResult = db.semesterResult;
const User = db.user;
const Profile = db.profile;
const YearlyResult = db.yearlyResult;
const SubjectResult = db.subjectResult;

const CREATE_FIELDS = [
  'userId', 'semester', 'schoolYear', 'yearlyResultId', 'totalCredits',
  'averageGrade4', 'averageGrade10', 'cumulativeCredits', 'cumulativeGrade4',
  'cumulativeGrade10', 'debtCredits', 'failedSubjects',
];

const pickFields = (data, fields) => fields.reduce((acc, key) => {
  if (data[key] !== undefined) acc[key] = data[key];
  return acc;
}, {});

const create = async (data, requester) => db.sequelize.transaction(async (transaction) => {
  const student = await User.findOne({
    where: {
      id: data.userId,
      role: 'STUDENT',
      systemType: requester.systemType,
    },
    transaction,
  });
  if (!student) {
    throw new BadRequestError('Học viên không thuộc phạm vi quản lý');
  }

  const yearlyResult = await YearlyResult.findOne({
    where: {
      id: data.yearlyResultId,
      userId: data.userId,
      schoolYear: data.schoolYear,
    },
    transaction,
  });
  if (!yearlyResult) {
    throw new BadRequestError('Kết quả năm học không thuộc học viên hoặc năm học đã chọn');
  }

  const existing = await SemesterResult.findOne({
    where: {
      userId: data.userId,
      schoolYear: data.schoolYear,
      semester: data.semester,
    },
    transaction,
  });
  if (existing) {
    throw new BadRequestError('Kết quả học kỳ này đã tồn tại');
  }

  return SemesterResult.create(pickFields(data, CREATE_FIELDS), { transaction });
});

const buildIncludes = (requester, profileFilters = {}) => [{
  model: User,
  attributes: ['id', 'username'],
  where: {
    role: 'STUDENT',
    systemType: requester.systemType,
  },
  required: true,
  include: [{
    model: Profile,
    as: 'Profile',
    ...(Object.keys(profileFilters).length ? { where: profileFilters, required: true } : { required: false }),
  }],
}, {
  model: YearlyResult,
}, {
  model: SubjectResult,
}];

const getAll = async (query, requester) => {
  const where = {};
  const profileFilters = {};

  if (query.semester) where.semester = query.semester;
  if (query.schoolYear) where.schoolYear = query.schoolYear;
  if (query.userId) where.userId = query.userId;

  if (query.gpaFrom !== undefined || query.gpaTo !== undefined) {
    where.averageGrade4 = {};
    if (query.gpaFrom !== undefined) where.averageGrade4[db.Sequelize.Op.gte] = Number(query.gpaFrom);
    if (query.gpaTo !== undefined) where.averageGrade4[db.Sequelize.Op.lte] = Number(query.gpaTo);
  }

  if (query.cpaFrom !== undefined || query.cpaTo !== undefined) {
    where.cumulativeGrade4 = {};
    if (query.cpaFrom !== undefined) where.cumulativeGrade4[db.Sequelize.Op.gte] = Number(query.cpaFrom);
    if (query.cpaTo !== undefined) where.cumulativeGrade4[db.Sequelize.Op.lte] = Number(query.cpaTo);
  }

  if (query.fullName) {
    profileFilters.fullName = { [db.Sequelize.Op.iLike]: `%${query.fullName}%` };
  }
  if (query.unit) {
    profileFilters.unit = { [db.Sequelize.Op.iLike]: `%${query.unit}%` };
  }

  if (query.excludeId) {
    where.id = { [db.Sequelize.Op.ne]: query.excludeId };
  }

  if (query.latestOnly === 'true' || query.latestOnly === true) {
    where.id = {
      ...(where.id || {}),
      [db.Sequelize.Op.eq]: db.sequelize.literal(`(
        SELECT sr2.id
        FROM semester_results sr2
        WHERE sr2.user_id = "SemesterResult"."user_id"
        ORDER BY sr2.school_year DESC, sr2.semester DESC
        LIMIT 1
      )`),
    };
  }

  return paginateQuery(SemesterResult, query, {
    where,
    include: buildIncludes(requester, profileFilters),
  });
};

const getDetail = async (id, requester) => {
  const record = await SemesterResult.findOne({
    where: { id },
    include: buildIncludes(requester),
  });
  if (!record) throw new NotFoundError('Không tìm thấy kết quả học kỳ trong phạm vi quản lý');
  return record;
};

module.exports = { create, getAll, getDetail };
