const yup = require('yup');
const LEVEL_NAMES = ['Cử nhân', 'Kỹ sư'];

const create = yup.object({
  levelName: yup.string().oneOf(LEVEL_NAMES).required('Chọn trình độ Cử nhân hoặc Kỹ sư'),
  organizationId: yup.string().uuid('Mã đơn vị không hợp lệ').nullable(),
});

const update = yup.object({
  levelName: yup.string().oneOf(LEVEL_NAMES).nullable(),
  organizationId: yup.string().uuid('Mã đơn vị không hợp lệ').nullable(),
});

module.exports = { create, update };
