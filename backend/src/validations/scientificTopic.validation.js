const yup = require('yup');

const create = yup.object({
  yearlyAchievementId: yup.string().uuid('Mã thành tích năm không hợp lệ').required('Trường này là bắt buộc'),
  title: yup.string().max(255).required('Trường này là bắt buộc'),
  description: yup.string().nullable(),
  year: yup.number().integer().min(0).nullable(),
  status: yup.string().max(50).nullable(),
});

const update = yup.object({
  yearlyAchievementId: yup.string().uuid('Mã thành tích năm không hợp lệ').nullable(),
  title: yup.string().max(255).nullable(),
  description: yup.string().nullable(),
  year: yup.number().integer().min(0).nullable(),
  status: yup.string().max(50).nullable(),
});

module.exports = { create, update };
