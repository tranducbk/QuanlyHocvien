const yup = require('yup');

const create = yup.object({
  className: yup.string().trim().max(255).required(),
  classCode: yup.string().trim().max(50).required(),
  commanderId: yup.string().uuid().required(),
});

const update = yup
  .object({
    className: yup.string().trim().max(255),
    classCode: yup.string().trim().max(50),
    commanderId: yup.string().uuid(),
  })
  .noUnknown()
  .test('has-fields', 'Cần có thông tin cập nhật', (value) => Object.keys(value || {}).length > 0);

const query = yup.object({
  page: yup.number().integer().min(1),
  limit: yup.number().integer().min(1).max(100),
  className: yup.string().max(255),
  sortBy: yup.string().oneOf(['className', 'classCode', 'createdAt']),
  sortOrder: yup.string().oneOf(['asc', 'desc']),
});
const assignStudents = yup.object({
  userIds: yup.array().of(yup.string().uuid().required()).min(1).required(),
});
const assignStudentsByCode = yup.object({
  studentCodes: yup.array().of(yup.string().trim().max(50).required()).min(1).required(),
});

module.exports = {
  create,
  update,
  query,
  assignStudents,
  assignStudentsByCode,
};
