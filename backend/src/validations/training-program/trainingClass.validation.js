const yup = require('yup');

const create = yup.object({
  code: yup.string().trim().max(50),
  name: yup.string().trim().max(255).required(),
  educationProviderId: yup.string().uuid().nullable(),
  trainingProgramId: yup.string().uuid().nullable(),
  curriculumVersionId: yup.string().uuid().nullable(),
  startYear: yup.number().integer().min(1900).max(2200).nullable(),
  endYear: yup.number().integer().min(1900).max(2200).nullable(),
}).noUnknown();

const update = yup.object({
  code: yup.string().trim().min(1, 'Mã lớp không được để trống').max(50),
  name: yup.string().trim().min(1, 'Tên lớp không được để trống').max(255),
  educationProviderId: yup.string().uuid().nullable(),
  trainingProgramId: yup.string().uuid().nullable(),
  curriculumVersionId: yup.string().uuid().nullable(),
  startYear: yup.number().integer().min(1900).max(2200).nullable(),
  endYear: yup.number().integer().min(1900).max(2200).nullable(),
}).noUnknown().test('has-field', 'Cần cung cấp ít nhất một trường cần cập nhật', (value) =>
  Object.keys(value || {}).length > 0
);
const status = yup.object({ status: yup.string().oneOf(['ACTIVE', 'INACTIVE']).required() }).noUnknown();
const params = yup.object({ id: yup.string().uuid().required() });
const student = yup.object({ studentCode: yup.string().trim().max(50).required() }).noUnknown();
const availableStudentsQuery = yup.object({
  search: yup.string().trim().max(100).nullable(),
}).noUnknown();
const semester = yup.object({
  code: yup.number().integer().min(1).max(4).required(),
  schoolYear: yup.string().trim().matches(/^\d{4}-\d{4}$/).required(),
}).noUnknown();
const semesterParams = yup.object({ id: yup.string().uuid().required(), semesterId: yup.string().uuid().required() });
const subject = yup.object({
  catalogSubjectId: yup.string().uuid(),
  subjectCode: yup.string().trim().max(50).when('catalogSubjectId', { is: undefined, then: (schema) => schema.required() }),
  subjectName: yup.string().trim().max(255).when('catalogSubjectId', { is: undefined, then: (schema) => schema.required() }),
  credits: yup.number().integer().min(0).max(100).when('catalogSubjectId', { is: undefined, then: (schema) => schema.required() }),
}).noUnknown();
const timeTable = yup.object({
  schedules: yup.array().of(yup.object({
    subjectId: yup.string().uuid().required(),
    day: yup.number().integer().min(1).max(7).required(),
    startTime: yup.string().matches(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
    endTime: yup.string().matches(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
    room: yup.string().trim().max(100).nullable(),
    week: yup.array().of(yup.number().integer().min(1).max(60)).max(60),
  }).noUnknown()).max(500).required(),
}).noUnknown();

module.exports = { create, update, status, params, student, availableStudentsQuery, semester, semesterParams, subject, timeTable };
