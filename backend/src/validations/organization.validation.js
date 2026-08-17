const yup = require('yup');

const create = yup.object({
  organizationName: yup.string().max(255).required('Trường này là bắt buộc'),
  travelTime: yup.number().integer().min(0).nullable(),
  totalStudents: yup.number().integer().min(0).nullable(),
  status: yup.string().max(50).nullable(),
  universityId: yup.string().uuid('Mã trường không hợp lệ').nullable(),
});

const update = yup.object({
  organizationName: yup.string().max(255).nullable(),
  travelTime: yup.number().integer().min(0).nullable(),
  totalStudents: yup.number().integer().min(0).nullable(),
  status: yup.string().max(50).nullable(),
  universityId: yup.string().uuid('Mã trường không hợp lệ').nullable(),
});

module.exports = { create, update };
