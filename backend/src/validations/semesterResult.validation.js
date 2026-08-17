const yup = require('yup');
const { semesterCode } = require('./common');

const create = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').required('Trường này là bắt buộc'),
  semester: semesterCode().required('Trường này là bắt buộc'),
  schoolYear: yup.string().max(50).required('Trường này là bắt buộc'),
  yearlyResultId: yup.string().uuid('Mã kết quả năm không hợp lệ').required('Trường này là bắt buộc'),
  totalCredits: yup.number().integer().min(0).nullable(),
  averageGrade4: yup.number().min(0).max(4).nullable(),
  averageGrade10: yup.number().min(0).max(10).nullable(),
  cumulativeCredits: yup.number().integer().min(0).nullable(),
  cumulativeGrade4: yup.number().min(0).max(4).nullable(),
  cumulativeGrade10: yup.number().min(0).max(10).nullable(),
  debtCredits: yup.number().integer().min(0).nullable(),
  failedSubjects: yup.number().integer().min(0).nullable(),
});

const update = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').nullable(),
  semester: semesterCode().nullable(),
  schoolYear: yup.string().max(50).nullable(),
  yearlyResultId: yup.string().uuid('Mã kết quả năm không hợp lệ').nullable(),
  totalCredits: yup.number().integer().min(0).nullable(),
  averageGrade4: yup.number().min(0).max(4).nullable(),
  averageGrade10: yup.number().min(0).max(10).nullable(),
  cumulativeCredits: yup.number().integer().min(0).nullable(),
  cumulativeGrade4: yup.number().min(0).max(4).nullable(),
  cumulativeGrade10: yup.number().min(0).max(10).nullable(),
  debtCredits: yup.number().integer().min(0).nullable(),
  failedSubjects: yup.number().integer().min(0).nullable(),
});

module.exports = { create, update };
