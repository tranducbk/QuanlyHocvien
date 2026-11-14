const yup = require('yup');

const create = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').required('Trường này là bắt buộc'),
  year: yup.number().integer().min(0).required('Trường này là bắt buộc'),
  decisionNumber: yup.string().max(100).nullable(),
  decisionDate: yup.date().nullable(),
  title: yup.string().max(255).nullable(),
  hasMinistryReward: yup.boolean().nullable(),
  hasNationalReward: yup.boolean().nullable(),
  notes: yup.string().nullable(),
});

const scienceItem = yup.object({
  title: yup.string().max(255).required('Tên đề tài/sáng kiến là bắt buộc'),
  description: yup.string().nullable(),
  year: yup.number().integer().min(0).nullable(),
  status: yup.string().max(50).nullable(),
});

const createFull = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').nullable(),
  studentCode: yup.string().max(50).nullable(),
  year: yup.number().integer().min(0).required('Năm là bắt buộc'),
  decisionNumber: yup.string().max(100).nullable(),
  decisionDate: yup.date().nullable(),
  title: yup.string().max(255).nullable(),
  hasMinistryReward: yup.boolean().nullable(),
  hasNationalReward: yup.boolean().nullable(),
  notes: yup.string().nullable(),
  scientificTopics: yup.array().of(scienceItem).nullable(),
  scientificInitiatives: yup.array().of(scienceItem).nullable(),
}).test('has-student', 'Cần truyền userId hoặc studentCode', (value) => Boolean(value?.userId || value?.studentCode));

const update = yup.object({
  userId: yup.string().uuid('Mã người dùng không hợp lệ').nullable(),
  year: yup.number().integer().min(0).nullable(),
  decisionNumber: yup.string().max(100).nullable(),
  decisionDate: yup.date().nullable(),
  title: yup.string().max(255).nullable(),
  hasMinistryReward: yup.boolean().nullable(),
  hasNationalReward: yup.boolean().nullable(),
  notes: yup.string().nullable(),
});

module.exports = { create, createFull, update };
