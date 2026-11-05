const yup = require('yup');

const classParams = yup.object({ id: yup.string().uuid().required() });
const proposalParams = yup.object({ id: yup.string().uuid().required(), proposalId: yup.string().uuid().required() });
const scores = {
  subjectId: yup.string().uuid().required(),
  attemptNo: yup.number().integer().min(1).max(20).required(),
  midtermScore: yup.number().min(0).max(10).required(),
  finalScore: yup.number().min(0).max(10).required(),
};
const createResult = yup.object({ profileId: yup.string().uuid().required(), ...scores, reason: yup.string().trim().max(2000) }).noUnknown();
const updateResult = yup.object({ midtermScore: scores.midtermScore, finalScore: scores.finalScore, reason: yup.string().trim().max(2000) }).noUnknown();
const resultParams = yup.object({ id: yup.string().uuid().required(), resultId: yup.string().uuid().required() });
const semesterParams = yup.object({ id: yup.string().uuid().required(), semesterId: yup.string().uuid().required() });
const closeSemester = yup.object({ confirmIncomplete: yup.boolean().default(false) }).noUnknown();
const bulkGrades = yup.object({
  subjectId: yup.string().uuid().required(),
  attemptNo: scores.attemptNo,
  rows: yup.array().of(yup.object({
    profileId: yup.string().uuid().required(),
    resultId: yup.string().uuid(),
    midtermScore: scores.midtermScore,
    finalScore: scores.finalScore,
    reason: yup.string().trim().max(2000),
    expectedMidtermScore: yup.number().min(0).max(10).when('resultId', { is: (value) => Boolean(value), then: (schema) => schema.required() }),
    expectedFinalScore: yup.number().min(0).max(10).when('resultId', { is: (value) => Boolean(value), then: (schema) => schema.required() }),
  }).noUnknown()).min(1).max(500).required().test('unique-students', 'Mỗi học viên chỉ được có một dòng', (rows) => !rows || new Set(rows.map((row) => row.profileId)).size === rows.length),
}).noUnknown();
const createProposal = yup.object({ ...scores, reason: yup.string().trim().min(5).max(2000).required() }).noUnknown();
const resultQuery = yup.object({ semesterId: yup.string().uuid().optional() });
const reportQuery = yup.object({ student: yup.string().trim().max(100), unit: yup.string().trim().max(255), schoolYear: yup.string().trim().max(50) }).noUnknown();
const proposalQuery = yup.object({ status: yup.string().oneOf(['PENDING', 'APPROVED', 'REJECTED']).optional() });
const review = yup.object({ reviewNote: yup.string().trim().max(2000).optional() }).noUnknown();

module.exports = { bulkGrades, classParams, proposalParams, createResult, updateResult, resultParams, semesterParams, closeSemester, createProposal, resultQuery, reportQuery, proposalQuery, review };
