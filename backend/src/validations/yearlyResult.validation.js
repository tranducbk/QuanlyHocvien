const yup = require('yup');

const listQuery = yup.object({
  page: yup.number().integer().min(1).nullable(),
  limit: yup.number().integer().min(1).max(100).nullable(),
  schoolYear: yup.string().max(50).nullable(),
  userId: yup.string().uuid('Mã người dùng không hợp lệ').nullable(),
  fullName: yup.string().max(100).nullable(),
  unit: yup.string().max(255).nullable(),
  gpaFrom: yup.number().min(0).max(4).nullable(),
  gpaTo: yup.number().min(0).max(4).nullable(),
  cpaFrom: yup.number().min(0).max(4).nullable(),
  cpaTo: yup.number().min(0).max(4).nullable(),
  sortBy: yup.string().oneOf([
    'schoolYear',
    'averageGrade4',
    'averageGrade10',
    'cumulativeGrade4',
    'cumulativeGrade10',
    'totalCredits',
    'cumulativeCredits',
    'totalSubjects',
    'passedSubjects',
    'failedSubjects',
    'debtCredits',
    'academicStatus',
    'createdAt',
  ]).nullable(),
  sortOrder: yup.string().oneOf(['asc', 'desc']).nullable(),
});

module.exports = { listQuery };
