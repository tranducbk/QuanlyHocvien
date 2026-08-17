const yup = require('yup');
const { isEndAfterStart, studentCode, time, uniqueBy } = require('./common');

const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const weekNumber = yup.number()
  .typeError('Tuần học phải là số')
  .integer('Tuần học phải là số nguyên')
  .min(1, 'Tuần học phải lớn hơn 0')
  .max(60, 'Tuần học tối đa là 60');

const scheduleItem = yup.object({
  day: yup.string().trim().oneOf(DAYS_OF_WEEK, 'Thứ học không hợp lệ').required('Thứ học là bắt buộc'),
  startTime: time().required('Giờ bắt đầu là bắt buộc'),
  endTime: time().required('Giờ kết thúc là bắt buộc'),
  room: yup.string().trim().max(50, 'Phòng học tối đa 50 ký tự').required('Phòng học là bắt buộc'),
  subjectName: yup.string().trim().max(255, 'Tên môn học tối đa 255 ký tự').nullable(),
  week: yup.lazy((value) => (
    Array.isArray(value)
      ? yup.array().of(weekNumber).min(1, 'Danh sách tuần học không được rỗng').nullable()
      : weekNumber.nullable()
  )),
}).test('end-after-start', 'Giờ kết thúc phải sau giờ bắt đầu', isEndAfterStart);

const create = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').required('Trường này là bắt buộc'),
  semesterId: yup.string().uuid('Mã học kỳ không hợp lệ').required('Học kỳ là bắt buộc'),
  schedules: yup.array().of(scheduleItem).min(1, 'Danh sách lịch học không được rỗng').required('Danh sách lịch học là bắt buộc'),
});

const update = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').nullable(),
  semesterId: yup.string().uuid('Mã học kỳ không hợp lệ').nullable(),
  schedules: yup.array().of(scheduleItem).min(1, 'Danh sách lịch học không được rỗng').nullable(),
});

const batchItem = yup.object({
  studentCode: studentCode().required('Mã học viên là bắt buộc'),
  semesterId: yup.string().uuid('Mã học kỳ không hợp lệ').nullable(),
  schedules: yup.array().of(scheduleItem).min(1, 'Danh sách lịch học không được rỗng').required('Danh sách lịch học là bắt buộc'),
});

const batch = yup.object({
  semesterId: yup.string().uuid('Mã học kỳ không hợp lệ').nullable(),
  items: yup.array()
    .of(batchItem)
    .min(1, 'Danh sách thời khóa biểu không được rỗng')
    .test(uniqueBy((item) => `${item?.studentCode || ''}-${item?.semesterId || ''}`, 'Mã học viên trong cùng học kỳ không được trùng'))
    .required('Danh sách thời khóa biểu là bắt buộc'),
});

module.exports = { create, update, batch };
