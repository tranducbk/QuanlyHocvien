const yup = require('yup');

const scoreFields = {
  letterGrade: yup.string().trim().max(5).required(),
  gradePoint4: yup.number().min(0).max(4).required(),
  gradePoint10: yup.number().min(0).max(10).required(),
};

module.exports = {
  createResult: yup
    .object({
      profileId: yup.string().uuid().required(),
      militarySubjectId: yup.string().uuid().required(),
      ...scoreFields,
    })
    .noUnknown(),
  createProposal: yup
    .object({
      militarySubjectId: yup.string().uuid().required(),
      proposedLetterGrade: yup.string().trim().max(5).required(),
      proposedGradePoint4: yup.number().min(0).max(4).required(),
      proposedGradePoint10: yup.number().min(0).max(10).required(),
      reason: yup.string().trim().min(5).max(2000).required(),
    })
    .noUnknown(),
  classQuery: yup.object({ semesterId: yup.string().uuid() }),
  proposalQuery: yup.object({
    classId: yup.string().uuid().required(),
    status: yup.string().oneOf(['PENDING', 'APPROVED', 'REJECTED']),
  }),
  review: yup.object({ reviewNote: yup.string().trim().max(2000) }).noUnknown(),
};
