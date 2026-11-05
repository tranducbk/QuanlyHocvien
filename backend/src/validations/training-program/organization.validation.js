const yup = require('yup');

const create = yup.object({
  organizationName: yup.string().max(255).required('Tên ngành là bắt buộc'),
  travelTime: yup.number().integer().min(0).nullable(),
  totalStudents: yup.number().integer().min(0).nullable(),
  status: yup.string().max(50).nullable(),
  universityId: yup.string().uuid('Mã trường không hợp lệ').required('Trường này là bắt buộc'),
});

const update = yup.object({
  organizationName: yup.string().max(255).nullable(),
  travelTime: yup.number().integer().min(0).nullable(),
  totalStudents: yup.number().integer().min(0).nullable(),
  status: yup.string().max(50).nullable(),
  universityId: yup.string().uuid('Mã trường không hợp lệ'),
});

module.exports = { create, update };
