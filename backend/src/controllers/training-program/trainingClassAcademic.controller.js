const asyncHandler = require('express-async-handler');
const service = require('../../services/training-program/trainingClassAcademic.service.js');
const validation = require('../../validations/training-program/trainingClassAcademic.validation.js');
const { success, validateOrThrow } = require('../../utils/response');

const listClassResults = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classParams, req.params);
  await validateOrThrow(validation.resultQuery, req.query);
  return success(res, await service.listClassResults(req.params.id, req.query.semesterId, req.user));
});
const getClassSummary = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classParams, req.params);
  return success(res, await service.getClassSummary(req.params.id, req.user));
});
const exportYearlySummary = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classParams, req.params);
  await validateOrThrow(validation.reportQuery, req.query);
  const buffer = await service.exportYearlySummary(req.params.id, req.query, req.user);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="bao-cao-ket-qua-nam-hoc.xlsx"');
  return res.send(buffer);
});
const createResult = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classParams, req.params);
  await validateOrThrow(validation.createResult, req.body);
  return success(res, await service.createResult(req.params.id, req.body, req.user), 'Đã ghi điểm chính thức', 201);
});
const listClassProposals = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.classParams, req.params);
  await validateOrThrow(validation.proposalQuery, req.query);
  return success(res, await service.listClassProposals(req.params.id, req.query.status, req.user));
});
const reviewProposal = (status) => asyncHandler(async (req, res) => {
  await validateOrThrow(validation.proposalParams, req.params);
  await validateOrThrow(validation.review, req.body);
  return success(res, await service.reviewProposal(req.params.id, req.params.proposalId, status, req.body.reviewNote, req.user),
    status === 'APPROVED' ? 'Đã duyệt đề xuất' : 'Đã từ chối đề xuất');
});
const listMySubjects = asyncHandler(async (req, res) => success(res, await service.listMySubjects(req.user)));
const listMyTimeTables = asyncHandler(async (req, res) => success(res, await service.listMyTimeTables(req.user)));
const listMyAchievements = asyncHandler(async (req, res) => success(res, await service.listMyAchievements(req.user)));
const listMyResults = asyncHandler(async (req, res) => success(res, await service.listMyResults(req.user)));
const listMyProposals = asyncHandler(async (req, res) => success(res, await service.listMyProposals(req.user)));
const createProposal = asyncHandler(async (req, res) => {
  await validateOrThrow(validation.createProposal, req.body);
  return success(res, await service.createProposal(req.body, req.user), 'Đã gửi đề xuất điểm', 201);
});

module.exports = { listClassResults, getClassSummary, exportYearlySummary, createResult, listClassProposals, approveProposal: reviewProposal('APPROVED'), rejectProposal: reviewProposal('REJECTED'), listMySubjects, listMyTimeTables, listMyAchievements, listMyResults, listMyProposals, createProposal };
