const yup = require('yup');

const create = yup.object({
  semesterResultId: yup.string().uuid('Mã kết quả học kỳ không hợp lệ').required('Trường này là bắt buộc'),
  subjectCode: yup.string().max(50).required('Trường này là bắt buộc'),
  subjectName: yup.string().max(255).required('Trường này là bắt buộc'),
  credits: yup.number().integer().min(0).nullable(),
  letterGrade: yup.string().max(5).nullable(),
  gradePoint4: yup.number().min(0).max(4).nullable(),
  gradePoint10: yup.number().min(0).max(10).nullable(),
});

const update = yup.object({
  semesterResultId: yup.string().uuid('Mã kết quả học kỳ không hợp lệ').nullable(),
  subjectCode: yup.string().max(50).nullable(),
  subjectName: yup.string().max(255).nullable(),
  credits: yup.number().integer().min(0).nullable(),
  letterGrade: yup.string().max(5).nullable(),
  gradePoint4: yup.number().min(0).max(4).nullable(),
  gradePoint10: yup.number().min(0).max(10).nullable(),
});

module.exports = { create, update };
