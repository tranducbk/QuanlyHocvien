const yup = require('yup');

const create = yup.object({
  universityCode: yup.string().max(50).required('Trường này là bắt buộc'),
  universityName: yup.string().max(255).required('Trường này là bắt buộc'),
  totalStudents: yup.number().integer().min(0).nullable(),
  status: yup.string().max(50).nullable(),
  organizations: yup.array().of(
    yup.object({
      organizationName: yup.string().max(255).required('Tên khoa/ngành là bắt buộc'),
      educationLevels: yup.string().nullable()
    })
  ).nullable(),
});

const update = yup.object({
  universityCode: yup.string().max(50).nullable(),
  universityName: yup.string().max(255).nullable(),
  totalStudents: yup.number().integer().min(0).nullable(),
  status: yup.string().max(50).nullable(),
});

const params = yup.object({ id: yup.string().uuid().required() });
const availableStudents = yup.object({
  search: yup.string().trim().max(100),
  fullName: yup.string().trim().max(100),
  code: yup.string().trim().max(50),
  gender: yup.string().oneOf(['MALE', 'FEMALE', 'OTHER']),
  page: yup.number().integer().min(1),
  limit: yup.number().integer().min(1).max(100),
  sortBy: yup.string().oneOf(['fullName', 'code', 'gender']),
  sortOrder: yup.string().oneOf(['asc', 'desc']),
}).noUnknown();
const addStudents = yup.object({
  profileIds: yup.array().of(yup.string().uuid().required()).min(1).max(500).required()
    .test('unique', 'Danh sách học viên bị trùng', (ids) => !ids || new Set(ids).size === ids.length),
}).noUnknown();

module.exports = { create, update, params, availableStudents, addStudents };
