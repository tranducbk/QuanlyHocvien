const yup = require('yup');
const { schoolYear: schoolYearSchema, semesterCode } = require('./common');

const create = yup.object({
  code: semesterCode().required('Mã học kỳ là bắt buộc'),
  schoolYearId: yup.string().uuid('Mã năm học không hợp lệ').nullable(),
  schoolYear: schoolYearSchema().nullable(),
}).test('has-school-year', 'Cần truyền schoolYearId hoặc schoolYear', (value) => Boolean(value?.schoolYearId || value?.schoolYear));

const update = yup.object({
  code: semesterCode().nullable(),
  schoolYearId: yup.string().uuid('Mã năm học không hợp lệ').nullable(),
  schoolYear: schoolYearSchema().nullable(),
});


const createSchoolYear = yup.object({
  schoolYear: schoolYearSchema().required('Năm học là bắt buộc'),
});

const createTerm = yup.object({
  schoolYearId: yup.string().uuid('Mã năm học không hợp lệ').nullable(),
  schoolYear: schoolYearSchema().nullable(),
  term: yup.number()
    .typeError('Kỳ học phải là số')
    .integer('Kỳ học phải là số nguyên')
    .oneOf([1, 2], 'Kỳ học chỉ gồm 1 hoặc 2')
    .required('Kỳ học là bắt buộc'),
}).test('has-school-year', 'Cần truyền schoolYearId hoặc schoolYear', (value) => Boolean(value?.schoolYearId || value?.schoolYear));

const gradeConvert = yup.object({
  value: yup.string().required('Trường này là bắt buộc'),
  from: yup.string().oneOf(['10', '4', 'letter']).required('Trường này là bắt buộc'),
  to: yup.string().oneOf(['10', '4', 'letter']).required('Trường này là bắt buộc'),
});

const gpaCalculate = yup.object({
  grades: yup.array().of(
    yup.object({
      point10: yup.number().min(0).max(10).required('Trường này là bắt buộc'),
      credits: yup.number().integer().min(0).required('Trường này là bắt buộc'),
    }),
  ).required('Trường này là bắt buộc'),
});

module.exports = { create, update, createSchoolYear, createTerm, gradeConvert, gpaCalculate };
