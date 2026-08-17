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

module.exports = { create, update };
