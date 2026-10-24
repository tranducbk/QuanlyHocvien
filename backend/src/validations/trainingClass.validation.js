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
const student = yup.object({ studentCode: yup.string().trim().max(50).required() }).noUnknown();
const semester = yup.object({
  code: yup.number().integer().min(1).max(4).required(),
  schoolYear: yup.string().trim().matches(/^\d{4}-\d{4}$/).required(),
}).noUnknown();
const semesterParams = yup.object({ id: yup.string().uuid().required(), semesterId: yup.string().uuid().required() });
const subject = yup.object({
  subjectCode: yup.string().trim().max(50).required(),
  subjectName: yup.string().trim().max(255).required(),
  credits: yup.number().integer().min(0).max(100).required(),
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

module.exports = { create, commander, params, student, semester, semesterParams, subject, timeTable };
