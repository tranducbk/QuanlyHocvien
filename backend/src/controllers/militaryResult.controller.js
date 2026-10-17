const asyncHandler = require('express-async-handler');
const service = require('../services/militaryResult.service');
const validation = require('../validations/militaryResult.validation');
const { success, validateOrThrow } = require('../utils/response');

const classResults = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classQuery, req.query);
  return success(
    res,
    await service.listClassResults(req.params.classId, req.query.semesterId, req.userId),
  );
});
const createResult = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.createResult, req.body);
  return success(
    res,
    await service.createResult(req.params.classId, req.body, req.userId),
    'Điểm đã được ghi nhận',
    201,
  );
});
const studentResults = asyncHandler(async (req, res) =>
  success(res, await service.listStudentResults(req.userId)),
);
const createProposal = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.createProposal, req.body);
  return success(
    res,
    await service.createProposal(req.userId, req.body),
    'Đã gửi đề xuất điểm',
    201,
  );
});
const studentProposals = asyncHandler(async (req, res) =>
  success(res, await service.listStudentProposals(req.userId)),
);
const classProposals = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.proposalQuery, req.query);
  return success(
    res,
    await service.listClassProposals(req.query.classId, req.query.status, req.userId),
  );
});
const review = (status) =>
  asyncHandler(async (req, res) => {
    await validateOrThrow(validation.review, req.body);
    return success(
      res,
      await service.reviewProposal(req.params.id, req.userId, status, req.body.reviewNote),
      status === 'APPROVED' ? 'Đã phê duyệt đề xuất' : 'Đã từ chối đề xuất',
    );
  });

module.exports = {
  classResults,
  createResult,
  studentResults,
  createProposal,
  studentProposals,
  classProposals,
  approve: review('APPROVED'),
  reject: review('REJECTED'),
};
