const yup = require('yup');

const create = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').required('Trường này là bắt buộc'),
  schoolYear: yup.string().max(50).required('Trường này là bắt buộc'),
  averageGrade4: yup.number().min(0).max(4).nullable(),
  averageGrade10: yup.number().min(0).max(10).nullable(),
  cumulativeGrade4: yup.number().min(0).max(4).nullable(),
  cumulativeGrade10: yup.number().min(0).max(10).nullable(),
  cumulativeCredits: yup.number().integer().min(0).nullable(),
  totalCredits: yup.number().integer().min(0).nullable(),
  totalSubjects: yup.number().integer().min(0).nullable(),
  passedSubjects: yup.number().integer().min(0).nullable(),
  failedSubjects: yup.number().integer().min(0).nullable(),
  debtCredits: yup.number().integer().min(0).nullable(),
  academicStatus: yup.string().max(50).nullable(),
  studentLevel: yup.number().integer().min(0).nullable(),
  semesterIds: yup.string().uuid('Mã học kỳ không hợp lệ').nullable(),
  partyRating: yup.string().max(50).nullable(),
  trainingRating: yup.string().max(50).nullable(),
  partyRatingDecisionNumber: yup.string().max(100).nullable(),
});

const update = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').nullable(),
  schoolYear: yup.string().max(50).nullable(),
  averageGrade4: yup.number().min(0).max(4).nullable(),
  averageGrade10: yup.number().min(0).max(10).nullable(),
  cumulativeGrade4: yup.number().min(0).max(4).nullable(),
  cumulativeGrade10: yup.number().min(0).max(10).nullable(),
  cumulativeCredits: yup.number().integer().min(0).nullable(),
  totalCredits: yup.number().integer().min(0).nullable(),
  totalSubjects: yup.number().integer().min(0).nullable(),
  passedSubjects: yup.number().integer().min(0).nullable(),
  failedSubjects: yup.number().integer().min(0).nullable(),
  debtCredits: yup.number().integer().min(0).nullable(),
  academicStatus: yup.string().max(50).nullable(),
  studentLevel: yup.number().integer().min(0).nullable(),
  semesterIds: yup.string().uuid('Mã học kỳ không hợp lệ').nullable(),
  partyRating: yup.string().max(50).nullable(),
  trainingRating: yup.string().max(50).nullable(),
  partyRatingDecisionNumber: yup.string().max(100).nullable(),
});

module.exports = { create, update };
