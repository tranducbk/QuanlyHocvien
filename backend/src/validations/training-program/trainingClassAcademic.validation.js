const yup = require('yup');

const classParams = yup.object({ id: yup.string().uuid().required() });
const proposalParams = yup.object({ id: yup.string().uuid().required(), proposalId: yup.string().uuid().required() });
const scores = {
  subjectId: yup.string().uuid().required(),
  attemptNo: yup.number().integer().min(1).max(20).required(),
  midtermScore: yup.number().min(0).max(10).required(),
  finalScore: yup.number().min(0).max(10).required(),
};
const createResult = yup.object({ profileId: yup.string().uuid().required(), ...scores }).noUnknown();
const createProposal = yup.object({ ...scores, reason: yup.string().trim().min(5).max(2000).required() }).noUnknown();
const resultQuery = yup.object({ semesterId: yup.string().uuid().optional() });
const reportQuery = yup.object({ student: yup.string().trim().max(100), unit: yup.string().trim().max(255), schoolYear: yup.string().trim().max(50) }).noUnknown();
const proposalQuery = yup.object({ status: yup.string().oneOf(['PENDING', 'APPROVED', 'REJECTED']).optional() });
const review = yup.object({ reviewNote: yup.string().trim().max(2000).optional() }).noUnknown();

module.exports = { classParams, proposalParams, createResult, createProposal, resultQuery, reportQuery, proposalQuery, review };
