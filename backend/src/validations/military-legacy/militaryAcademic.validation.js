const yup = require('yup');

const semester = yup.object({
  code: yup.number().integer().min(1).max(4).required(),
  schoolYear: yup.string().trim().max(50).required(),
});
const subject = yup.object({
  subjectCode: yup.string().trim().max(50).required(),
  subjectName: yup.string().trim().max(255).required(),
  credits: yup.number().integer().min(0).required(),
  semesterId: yup.string().uuid().required(),
});
const timetable = yup.object({
  semesterId: yup.string().uuid().required(),
  schedules: yup.array().of(yup.object({
    subjectName: yup.string().max(255).required(),
    day: yup.number().integer().min(1).max(7).required(),
    startTime: yup.string().matches(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
    endTime: yup.string().matches(/^([01]\d|2[0-3]):[0-5]\d$/).required(),
    room: yup.string().max(100).nullable(),
    week: yup.array().of(yup.number().integer().min(1).max(60)),
  })).required(),
});
const query = yup.object({
  page: yup.number().integer().min(1),
  limit: yup.number().integer().min(1).max(100),
  sortBy: yup.string().oneOf(['code', 'schoolYear', 'subjectCode', 'subjectName', 'credits', 'createdAt']),
  sortOrder: yup.string().oneOf(['asc', 'desc']),
  semesterId: yup.string().uuid(),
});

module.exports = { semester, subject, timetable, query };
