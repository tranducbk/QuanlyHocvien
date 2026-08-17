const yup = require('yup');

const create = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').required('Trường này là bắt buộc'),
  totalYears: yup.number().integer().min(0).nullable(),
  totalAdvancedSoldier: yup.number().integer().min(0).nullable(),
  totalCompetitiveSoldier: yup.number().integer().min(0).nullable(),
  totalScientificTopics: yup.number().integer().min(0).nullable(),
  totalScientificInitiatives: yup.number().integer().min(0).nullable(),
  eligibleForMinistryReward: yup.boolean().nullable(),
  eligibleForNationalReward: yup.boolean().nullable(),
});

const update = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').nullable(),
  totalYears: yup.number().integer().min(0).nullable(),
  totalAdvancedSoldier: yup.number().integer().min(0).nullable(),
  totalCompetitiveSoldier: yup.number().integer().min(0).nullable(),
  totalScientificTopics: yup.number().integer().min(0).nullable(),
  totalScientificInitiatives: yup.number().integer().min(0).nullable(),
  eligibleForMinistryReward: yup.boolean().nullable(),
  eligibleForNationalReward: yup.boolean().nullable(),
});

module.exports = { create, update };
