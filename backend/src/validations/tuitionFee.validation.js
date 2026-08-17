const yup = require('yup');
const { semesterCode } = require('./common');

const tuitionStatus = () => yup.string().oneOf(['PAID', 'UNPAID'], 'Trạng thái học phí không hợp lệ');
const tuitionAmount = () => yup.number().typeError('Số tiền phải là số').min(0, 'Số tiền không được âm').nullable();

const create = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').required('Trường này là bắt buộc'),
  semesterId: yup.string().uuid('Mã học kỳ không hợp lệ').nullable(),
  totalAmount: tuitionAmount(),
  semester: semesterCode().nullable(),
  schoolYear: yup.string().max(50).nullable(),
  content: yup.string().max(255).nullable(),
  status: tuitionStatus().nullable(),
});

const update = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').nullable(),
  semesterId: yup.string().uuid('Mã học kỳ không hợp lệ').nullable(),
  totalAmount: tuitionAmount(),
  semester: semesterCode().nullable(),
  schoolYear: yup.string().max(50).nullable(),
  content: yup.string().max(255).nullable(),
  status: tuitionStatus().nullable(),
});

const batchItem = yup.object({
  studentCode: yup.string().max(50).required('Mã học viên là bắt buộc'),
  semesterId: yup.string().uuid('Mã học kỳ không hợp lệ').nullable(),
  totalAmount: tuitionAmount(),
  semester: semesterCode().nullable(),
  schoolYear: yup.string().max(50).nullable(),
  content: yup.string().max(255).nullable(),
  status: tuitionStatus().nullable(),
});

const batch = yup.object({
  semesterId: yup.string().uuid('Mã học kỳ không hợp lệ').nullable(),
  semester: semesterCode().nullable(),
  schoolYear: yup.string().max(50).nullable(),
  items: yup.array().of(batchItem).min(1, 'Danh sách học phí không được rỗng').required('Danh sách học phí là bắt buộc'),
});

module.exports = { create, update, batch };
