const db = require('../models');
const User = db.user;
const { NotFoundError } = require('../utils/apiError');
const { paginateQuery } = require('../utils/response');

const SemesterResult = db.semesterResult;
const Student = db.profile;
const YearlyResult = db.yearlyResult;
const SubjectResult = db.subjectResult;

const create = async (data) => SemesterResult.create(data);
const getAll = async (query) => {
  const where = {};
  const studentWhere = {};
  const include = [
    { 
      model: User, 
      attributes: ['id', 'username'],
      include: [{ model: Student, as: 'Profile' }] 
    },
    { model: YearlyResult },
    { model: SubjectResult },
  ];

  if (query.semester) where.semester = query.semester;
  if (query.schoolYear) where.schoolYear = query.schoolYear;
  if (query.userId) where.userId = query.userId;

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
    studentWhere.fullName = { [db.Sequelize.Op.like]: `%${query.fullName}%` };
  }

  if (query.unit) {
    studentWhere.unit = query.unit;
  }

  if (Object.keys(studentWhere).length > 0) {
    include[0].include[0].where = studentWhere;
    include[0].include[0].required = true;
    include[0].required = true;
  }

  if (query.excludeId) {
    where.id = {
      ...(where.id || {}),
      [db.Sequelize.Op.ne]: query.excludeId,
    };
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

  return paginateQuery(SemesterResult, query, { where, include });
};

const getDetail = async (id) => {
  const record = await SemesterResult.findByPk(id, {
    include: [
      { 
        model: User, 
        attributes: ['id', 'username'],
        include: [{ model: Student, as: 'Profile' }] 
      },
      { model: YearlyResult },
      { model: SubjectResult },
    ],
  });
  if (!record) throw new NotFoundError('Không tìm thấy kết quả học kỳ');
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

module.exports = { create, getAll, getDetail, update, delete: deleteRecord };
