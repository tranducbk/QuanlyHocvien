const yup = require('yup');

const achievementFields = {
  userId: yup.string().uuid(),
  category: yup.string().oneOf(['AWARD', 'SCIENTIFIC_TOPIC', 'SCIENTIFIC_INITIATIVE']),
  title: yup.string().trim().max(255),
  award: yup.string().trim().max(255).nullable(),
  year: yup.number().integer().min(1900).max(2200).nullable(),
  schoolYear: yup.string().trim().max(50).nullable(),
  semester: yup.string().trim().max(50).nullable(),
  decisionNumber: yup.string().trim().max(100).nullable(),
  description: yup.string().trim().max(5000).nullable(),
};

module.exports = {
  achievementCreate: yup
    .object({
      ...achievementFields,
      userId: achievementFields.userId.required(),
      category: achievementFields.category.required(),
      title: achievementFields.title.required(),
    })
    .noUnknown(),
  achievementUpdate: yup
    .object(achievementFields)
    .noUnknown()
    .test('has-fields', 'Cần có dữ liệu cập nhật', (value) => Object.keys(value || {}).length > 0),
  dutyCreate: yup
    .object({
      userId: yup.string().uuid().required(),
      position: yup.string().trim().max(100).required(),
      workDay: yup.date().required(),
    })
    .noUnknown(),
  dutyUpdate: yup
    .object({
      userId: yup.string().uuid(),
      position: yup.string().trim().max(100),
      workDay: yup.date(),
    })
    .noUnknown()
    .test('has-fields', 'Cần có dữ liệu cập nhật', (value) => Object.keys(value || {}).length > 0),
  classQuery: yup.object({ classId: yup.string().uuid().required() }),
};
