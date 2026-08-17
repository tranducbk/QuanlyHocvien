const yup = require('yup');
const { semesterCode } = require('./common');

const create = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').required('Trường này là bắt buộc'),
  semester: semesterCode().nullable(),
  schoolYear: yup.string().max(50).nullable(),
  content: yup.string().nullable(),
  year: yup.number().integer().min(0).nullable(),
  title: yup.string().max(255).nullable(),
  description: yup.string().nullable(),
  award: yup.string().max(255).nullable(),
});

const update = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').nullable(),
  semester: semesterCode().nullable(),
  schoolYear: yup.string().max(50).nullable(),
  content: yup.string().nullable(),
  year: yup.number().integer().min(0).nullable(),
  title: yup.string().max(255).nullable(),
  description: yup.string().nullable(),
  award: yup.string().max(255).nullable(),
});

const batchItem = yup.object({
  studentCode: yup.string().max(50).required('Mã học viên là bắt buộc'),
  semester: semesterCode().nullable(),
  schoolYear: yup.string().max(50).nullable(),
  content: yup.string().nullable(),
  year: yup.number().integer().min(0).nullable(),
  title: yup.string().max(255).nullable(),
  description: yup.string().nullable(),
  award: yup.string().max(255).nullable(),
});

const batch = yup.object({
  items: yup.array().of(batchItem).min(1, 'Danh sách thành tích không được rỗng').required('Danh sách thành tích là bắt buộc'),
});

module.exports = { create, update, batch };
