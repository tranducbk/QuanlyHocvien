const yup = require('yup');

const classParams = yup.object({ id: yup.string().uuid().required() });
const recordParams = yup.object({ id: yup.string().uuid().required(), recordId: yup.string().uuid().required() });
const achievementFields = {
  category: yup.string().oneOf(['AWARD', 'SCIENTIFIC_TOPIC', 'SCIENTIFIC_INITIATIVE']).required(),
  title: yup.string().trim().max(255).required(),
  award: yup.string().trim().max(255).nullable(),
  schoolYear: yup.string().trim().matches(/^\d{4}-\d{4}$/).nullable(),
  semester: yup.string().trim().matches(/^[1-4]$/).nullable(),
  content: yup.string().trim().max(5000).nullable(),
  year: yup.number().integer().min(1900).max(2200).nullable(),
  description: yup.string().trim().max(5000).nullable(),
};
const achievementCreate = yup.object({ studentUserId: yup.string().uuid().required(), ...achievementFields }).noUnknown();
const achievementUpdate = yup.object(achievementFields).noUnknown();
const achievementExportQuery = yup.object({
  student: yup.string().trim().max(100), title: yup.string().trim().max(255),
  category: yup.string().oneOf(['AWARD', 'SCIENTIFIC_TOPIC', 'SCIENTIFIC_INITIATIVE']),
  award: yup.string().trim().max(255), schoolYear: yup.string().trim().max(50),
  semester: yup.string().trim().max(50), unit: yup.string().trim().max(255),
  year: yup.string().trim().max(4),
}).noUnknown();
const dutyFields = {
  position: yup.string().trim().max(100).required(),
  workDay: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/).required(),
};
const dutyCreate = yup.object({ studentUserId: yup.string().uuid().required(), ...dutyFields }).noUnknown();
const dutyUpdate = yup.object(dutyFields).noUnknown();

module.exports = { classParams, recordParams, achievementCreate, achievementUpdate, achievementExportQuery, dutyCreate, dutyUpdate };
