const router = require('express').Router();
const controller = require('../../controllers/training-program/trainingClass.controller.js');
const recordsController = require('../../controllers/training-program/trainingClassRecords.controller.js');
const academicController = require('../../controllers/training-program/trainingClassAcademic.controller.js');
const { uploadExcel } = require('../../middlewares/upload.middleware.js');
const { authMiddleware, requireAdmin, requireRole, requireTrainingSystem } = require('../../middlewares/auth.middleware.js');

/**
 * @swagger
 * /training-classes/options:
 *   get:
 *     tags: [Training Classes]
 *     summary: Admin lấy Chỉ huy và cơ sở đào tạo để tạo lớp
 *     responses:
 *       200:
 *         description: Danh sách lựa chọn
 * /training-classes/mine:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem lớp được giao trong Hệ của mình
 *     responses:
 *       200:
 *         description: Danh sách lớp trong phạm vi Chỉ huy
 * /training-classes/{id}/students:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem học viên trong lớp được giao cùng Hệ
 *     responses:
 *       200:
 *         description: Danh sách học viên
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xếp học viên đang quản lý vào lớp được giao
 *     responses:
 *       200:
 *         description: Học viên đã được xếp lớp
 * /training-classes/{id}/semesters:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem học kỳ trong lớp được giao cùng Hệ
 *     responses:
 *       200:
 *         description: Danh sách học kỳ
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy tạo học kỳ cho lớp được giao cùng Hệ
 *     responses:
 *       201:
 *         description: Học kỳ đã tạo
 * /training-classes/{id}/semesters/{semesterId}/subjects:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem môn học trong học kỳ của lớp được giao
 *     responses:
 *       200:
 *         description: Danh sách môn học
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy thêm môn học trong học kỳ của lớp được giao
 *     responses:
 *       201:
 *         description: Môn học đã tạo
 * /training-classes/{id}/semesters/{semesterId}/time-table:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem lịch học của học kỳ trong lớp được giao
 *     responses:
 *       200:
 *         description: Lịch học
 *   put:
 *     tags: [Training Classes]
 *     summary: Chỉ huy lưu lịch học của học kỳ trong lớp được giao
 *     responses:
 *       200:
 *         description: Lịch học đã lưu
 * /training-classes/{id}/achievements:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem thành tích học viên trong lớp được giao
 *     responses:
 *       200:
 *         description: Danh sách thành tích
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy thêm thành tích cho học viên trong lớp được giao
 *     responses:
 *       201:
 *         description: Thành tích đã tạo
 * /training-classes/{id}/results/summary:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem tổng hợp điểm học kỳ và năm theo trung bình đều các môn
 *     responses:
 *       200:
 *         description: Kết quả học kỳ và năm của lớp được giao
 * /training-classes/{id}/results/export:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xuất báo cáo Excel kết quả năm học của lớp được giao
 *     responses:
 *       200:
 *         description: File báo cáo Excel
 * /training-classes/{id}/achievements/{recordId}:
 *   put:
 *     tags: [Training Classes]
 *     summary: Chỉ huy sửa thành tích trong lớp được giao
 *     responses:
 *       200:
 *         description: Thành tích đã cập nhật
 *   delete:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xóa thành tích trong lớp được giao
 *     responses:
 *       200:
 *         description: Thành tích đã xóa
 * /training-classes/{id}/achievements/template:
 *   get:
 *     tags: [Training Classes]
 *     summary: Tải mẫu Excel nhập thành tích cho lớp được giao
 *     responses:
 *       200:
 *         description: File Excel mẫu
 * /training-classes/{id}/achievements/import:
 *   post:
 *     tags: [Training Classes]
 *     summary: Nhập thành tích từ Excel cho lớp được giao
 *     responses:
 *       201:
 *         description: Số thành tích đã nhập
 * /training-classes/{id}/achievements/export:
 *   get:
 *     tags: [Training Classes]
 *     summary: Xuất báo cáo Excel thành tích lớp được giao
 *     responses:
 *       200:
 *         description: File báo cáo Excel
 * /training-classes/{id}/duty-schedules:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem lịch trực của lớp được giao
 *     responses:
 *       200:
 *         description: Danh sách lịch trực
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy phân công lịch trực cho học viên trong lớp được giao
 *     responses:
 *       201:
 *         description: Lịch trực đã tạo
 * /training-classes/{id}/duty-schedules/{recordId}:
 *   put:
 *     tags: [Training Classes]
 *     summary: Chỉ huy sửa lịch trực trong lớp được giao
 *     responses:
 *       200:
 *         description: Lịch trực đã cập nhật
 *   delete:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xóa lịch trực trong lớp được giao
 *     responses:
 *       200:
 *         description: Lịch trực đã xóa
 * /training-classes/{id}/results:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem điểm chính thức trong lớp được giao
 *     responses:
 *       200:
 *         description: Danh sách kết quả
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy ghi điểm lần đầu cho một lần thi
 *     responses:
 *       201:
 *         description: Điểm chính thức đã ghi, không thể sửa hoặc xóa
 * /training-classes/{id}/grade-proposals:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem đề xuất điểm của lớp được giao
 *     responses:
 *       200:
 *         description: Danh sách đề xuất
 * /training-classes/{id}/grade-proposals/{proposalId}/approve:
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy duyệt đề xuất và tạo điểm chính thức trong transaction
 *     responses:
 *       200:
 *         description: Đã duyệt đề xuất
 * /training-classes/{id}/grade-proposals/{proposalId}/reject:
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy từ chối đề xuất điểm
 *     responses:
 *       200:
 *         description: Đã từ chối đề xuất
 * /training-classes:
 *   get:
 *     tags: [Training Classes]
 *     summary: Admin xem lớp của năm Hệ
 *     responses:
 *       200:
 *         description: Danh sách lớp
 *   post:
 *     tags: [Training Classes]
 *     summary: Admin tạo lớp trong Hệ đã chọn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [trainingSystemId, code, name]
 *             properties:
 *               trainingSystemId: { type: string, format: uuid }
 *               code: { type: string }
 *               name: { type: string }
 *               commanderId: { type: string, format: uuid, nullable: true }
 *               educationProviderId: { type: string, format: uuid, nullable: true }
 *               trainingProgramId: { type: string, format: uuid, nullable: true }
 *               curriculumVersionId: { type: string, format: uuid, nullable: true }
 *               startYear: { type: integer, nullable: true }
 *               endYear: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Đã tạo lớp
 * /training-classes/{id}/commander:
 *   put:
 *     tags: [Training Classes]
 *     summary: Admin phân công Chỉ huy cùng Hệ
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [commanderId]
 *             properties:
 *               commanderId: { type: string, format: uuid, nullable: true }
 *     responses:
 *       200:
 *         description: Đã cập nhật Chỉ huy
 */
router.use(authMiddleware);
router.get('/mine', requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7'), controller.listMine);
router.get('/:id/students', requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7'), controller.listStudents);
router.post('/:id/students', requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7'), controller.assignStudent);
router.get('/:id/semesters', requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7'), controller.listSemesters);
router.post('/:id/semesters', requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7'), controller.createSemester);
router.get('/:id/semesters/:semesterId/subjects', requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7'), controller.listSubjects);
router.post('/:id/semesters/:semesterId/subjects', requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7'), controller.createSubject);
router.get('/:id/semesters/:semesterId/time-table', requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7'), controller.getTimeTable);
router.put('/:id/semesters/:semesterId/time-table', requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7'), controller.saveTimeTable);
const cohortCommander = [requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7')];
router.get('/:id/achievements', ...cohortCommander, recordsController.listAchievements);
router.post('/:id/achievements', ...cohortCommander, recordsController.createAchievement);
router.get('/:id/achievements/template', ...cohortCommander, recordsController.achievementTemplate);
router.post('/:id/achievements/import', ...cohortCommander, uploadExcel('file'), recordsController.importAchievements);
router.get('/:id/achievements/export', ...cohortCommander, recordsController.exportAchievements);
router.put('/:id/achievements/:recordId', ...cohortCommander, recordsController.updateAchievement);
router.delete('/:id/achievements/:recordId', ...cohortCommander, recordsController.deleteAchievement);
router.get('/:id/duty-schedules', ...cohortCommander, recordsController.listDutySchedules);
router.post('/:id/duty-schedules', ...cohortCommander, recordsController.createDutySchedule);
router.put('/:id/duty-schedules/:recordId', ...cohortCommander, recordsController.updateDutySchedule);
router.delete('/:id/duty-schedules/:recordId', ...cohortCommander, recordsController.deleteDutySchedule);
router.get('/:id/results', ...cohortCommander, academicController.listClassResults);
router.post('/:id/results', ...cohortCommander, academicController.createResult);
router.get('/:id/results/summary', ...cohortCommander, academicController.getClassSummary);
router.get('/:id/results/export', ...cohortCommander, academicController.exportYearlySummary);
router.get('/:id/grade-proposals', ...cohortCommander, academicController.listClassProposals);
router.post('/:id/grade-proposals/:proposalId/approve', ...cohortCommander, academicController.approveProposal);
router.post('/:id/grade-proposals/:proposalId/reject', ...cohortCommander, academicController.rejectProposal);
router.use(requireAdmin);
router.get('/options', controller.listOptions);
router.get('/', controller.list);
router.post('/', controller.create);
router.put('/:id/commander', controller.assignCommander);

module.exports = router;
