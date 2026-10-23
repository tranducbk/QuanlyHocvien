const yup = require('yup');

const create = yup.object({
  trainingSystemId: yup.string().uuid().required(),
  code: yup.string().trim().max(50).required(),
  name: yup.string().trim().max(255).required(),
  commanderId: yup.string().uuid().nullable(),
  educationProviderId: yup.string().uuid().nullable(),
  trainingProgramId: yup.string().uuid().nullable(),
  curriculumVersionId: yup.string().uuid().nullable(),
  startYear: yup.number().integer().min(1900).max(2200).nullable(),
  endYear: yup.number().integer().min(1900).max(2200).nullable(),
}).noUnknown();

const commander = yup.object({ commanderId: yup.string().uuid().nullable().defined() }).noUnknown();
const params = yup.object({ id: yup.string().uuid().required() });

module.exports = { create, commander, params };
