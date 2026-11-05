const yup = require('yup');

const subject = yup.object({
  subjectCode: yup.string().trim().max(50).required(),
  subjectName: yup.string().trim().max(255).required(),
  credits: yup.number().integer().min(0).max(100).required(),
}).noUnknown();
const params = yup.object({ subjectId: yup.string().uuid().required() });

module.exports = { subject, params };
