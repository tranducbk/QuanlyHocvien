const yup = require('yup');

const SCHOOL_YEAR_REGEX = /^\d{4}-\d{4}$/;
const SEMESTER_CODE_REGEX = /^\d+$/;
const STUDENT_CODE_REGEX = /^[A-Za-z0-9._-]+$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const trimString = () => yup.string().trim();

const schoolYear = () => trimString()
  .matches(SCHOOL_YEAR_REGEX, 'Năm học phải có dạng YYYY-YYYY')
  .test('consecutive-school-year', 'Năm học phải gồm 2 năm liên tiếp', (value) => {
    if (!value) return true;
    const [startYear, endYear] = value.split('-').map(Number);
    return endYear === startYear + 1;
  });

const semesterCode = () => yup.number()
  .typeError('Mã học kỳ phải là số')
  .integer('Mã học kỳ phải là số nguyên')
  .min(1, 'Mã học kỳ phải lớn hơn 0');

const studentCode = () => trimString()
  .max(50, 'Mã học viên tối đa 50 ký tự')
  .matches(STUDENT_CODE_REGEX, 'Mã học viên chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang');

const year = () => yup.number()
  .typeError('Năm phải là số')
  .integer('Năm phải là số nguyên')
  .min(1900, 'Năm không hợp lệ')
  .max(2100, 'Năm không hợp lệ');

const money = () => yup.number()
  .typeError('Số tiền phải là số')
  .min(0, 'Số tiền không được âm');

const time = () => trimString()
  .matches(TIME_REGEX, 'Giờ phải có dạng HH:mm');

const timeToMinutes = (value) => {
  const [hours, minutes] = String(value || '').split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const isEndAfterStart = (value) => {
  if (!value?.startTime || !value?.endTime) return true;
  const start = timeToMinutes(value.startTime);
  const end = timeToMinutes(value.endTime);
  if (start === null || end === null) return true;
  return end > start;
};

const hasUniqueValues = (items = [], getValue) => {
  const seen = new Set();
  for (const item of items || []) {
    const rawValue = getValue(item);
    if (!rawValue) continue;
    const value = String(rawValue).trim().toUpperCase();
    if (seen.has(value)) return false;
    seen.add(value);
  }
  return true;
};

const uniqueArray = (message) => (items = []) => hasUniqueValues(items, (item) => item);
const uniqueBy = (getValue, message) => ({
  name: 'unique-values',
  message,
  test: (items = []) => hasUniqueValues(items, getValue),
});

module.exports = {
  schoolYear,
  semesterCode,
  studentCode,
  year,
  money,
  time,
  isEndAfterStart,
  uniqueArray,
  uniqueBy,
};
