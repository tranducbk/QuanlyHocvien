const yup = require('yup');
const params = yup.object({ yearId: yup.string().uuid().required() });
const profileIds = yup.array().of(yup.string().uuid().required()).min(1).max(500).required()
  .test('unique', 'Danh sách học viên bị trùng', value => !value || new Set(value).size === value.length);
const assign = yup.object({ profileIds, trainingClassId: yup.string().uuid().required() }).noUnknown();
const graduate = yup.object({ profileIds }).noUnknown();
module.exports = { params, assign, graduate };
