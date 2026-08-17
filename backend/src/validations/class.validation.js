const yup = require('yup');

const create = yup.object({
  className: yup.string().max(255).required('Trường này là bắt buộc'),
  studentCount: yup.number().integer().min(0).nullable(),
  educationLevelId: yup.string().uuid('Mã trình độ đào tạo không hợp lệ').nullable(),
});

const update = yup.object({
  className: yup.string().max(255).nullable(),
  studentCount: yup.number().integer().min(0).nullable(),
  educationLevelId: yup.string().uuid('Mã trình độ đào tạo không hợp lệ').nullable(),
});

const query = yup.object({
  page: yup.number().integer().min(1).nullable(),
  limit: yup.number().integer().min(1).max(100).nullable(),
  sortBy: yup.string().nullable(),
  sortOrder: yup.string().oneOf(['asc', 'desc']).nullable(),
  className: yup.string().max(255).nullable(),
  educationLevelId: yup.string().uuid('Mã trình độ đào tạo không hợp lệ').nullable(),
  organizationId: yup.string().uuid('Mã đơn vị trực thuộc không hợp lệ').nullable(),
  universityId: yup.string().uuid('Mã cơ sở đào tạo không hợp lệ').nullable(),
  universityName: yup.string().max(255).nullable(),
  organizationName: yup.string().max(255).nullable(),
  levelName: yup.string().max(255).nullable(),
});

const assignStudents = yup.object({
  userIds: yup.array().of(yup.string().uuid('Mã người dùng không hợp lệ')).min(1, 'Danh sách học viên không được rỗng').required('Danh sách học viên là bắt buộc'),
});

const assignStudentsByCodes = yup.object({
  studentCodes: yup.array().of(yup.string().max(50).required('Mã học viên là bắt buộc')).min(1, 'Danh sách học viên không được rỗng').required('Danh sách học viên là bắt buộc'),
});

const assignStudentsFlexible = yup.object({
  userIds: yup.array().of(yup.string().uuid('Mã người dùng không hợp lệ')).min(1, 'Danh sách học viên không được rỗng').nullable(),
  studentCodes: yup.array().of(yup.string().max(50).required('Mã học viên là bắt buộc')).min(1, 'Danh sách học viên không được rỗng').nullable(),
}).test('has-students', 'Cần truyền userIds hoặc studentCodes', (value) => {
  const hasUserIds = Array.isArray(value?.userIds) && value.userIds.length > 0;
  const hasStudentCodes = Array.isArray(value?.studentCodes) && value.studentCodes.length > 0;
  return hasUserIds || hasStudentCodes;
});

module.exports = {
  create,
  update,
  query,
  assignStudents: assignStudentsFlexible,
  assignStudentsByCodes,
  removeStudents: assignStudents,
};
