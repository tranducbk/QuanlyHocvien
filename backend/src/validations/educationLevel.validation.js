const yup = require('yup');

const create = yup.object({
  levelName: yup.string().max(255).required('Trường này là bắt buộc'),
  organizationId: yup.string().uuid('Mã đơn vị không hợp lệ').nullable(),
});

const update = yup.object({
  levelName: yup.string().max(255).nullable(),
  organizationId: yup.string().uuid('Mã đơn vị không hợp lệ').nullable(),
});

module.exports = { create, update };
