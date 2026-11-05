const router = require('express').Router();
const controller = require('../../controllers/training-program/trainingClass.controller.js');
const catalogController = require('../../controllers/training-program/subjectCatalog.controller.js');
const recordsController = require('../../controllers/training-program/trainingClassRecords.controller.js');
const academicController = require('../../controllers/training-program/trainingClassAcademic.controller.js');
const { uploadExcel } = require('../../middlewares/upload.middleware.js');
const { authMiddleware, requireRole, requireTrainingSystem } = require('../../middlewares/auth.middleware.js');

/**
 * @swagger
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
 * /training-classes/{id}/students/available:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy tìm học viên chưa xếp lớp do mình quản lý
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema: { type: string, maxLength: 100 }
 *     responses:
 *       200:
 *         description: Học viên cùng Hệ, thuộc Chỉ huy hiện tại và chưa được xếp lớp
 * /training-classes/{id}/semesters:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem học kỳ trong lớp được giao cùng Hệ
 *     responses:
 *       200:
 *         description: Danh sách học kỳ
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy Hệ 5 thêm kỳ hè cho lớp; HK1 và HK2 được tạo tự động theo niên khóa
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [catalogSubjectId]
 *                 properties:
 *                   catalogSubjectId: { type: string, format: uuid }
 *               - type: object
 *                 required: [subjectCode, subjectName, credits]
 *                 properties:
 *                   subjectCode: { type: string, maxLength: 50 }
 *                   subjectName: { type: string, maxLength: 255 }
 *                   credits: { type: integer, minimum: 0, maximum: 100 }
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
 *     summary: Chỉ huy xem lớp do mình quản lý trong Hệ được giao
 *     responses:
 *       200:
 *         description: Danh sách lớp
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy tạo lớp trong Hệ được giao
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name]
 *             properties:
 *               code: { type: string }
 *               name: { type: string }
 *               educationProviderId: { type: string, format: uuid, nullable: true }
 *               trainingProgramId: { type: string, format: uuid, nullable: true }
 *               curriculumVersionId: { type: string, format: uuid, nullable: true }
 *               startYear: { type: integer, nullable: true }
 *               endYear: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Đã tạo lớp
 * /training-classes/{id}:
 *   put:
 *     tags: [Training Classes]
 *     summary: Chỉ huy cập nhật lớp do mình quản lý
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string }
 *               name: { type: string }
 *               educationProviderId: { type: string, format: uuid, nullable: true }
 *               trainingProgramId: { type: string, format: uuid, nullable: true }
 *               curriculumVersionId: { type: string, format: uuid, nullable: true }
 *               startYear: { type: integer, nullable: true }
 *               endYear: { type: integer, nullable: true }
 *     responses:
 *       200:
 *         description: Đã cập nhật lớp đào tạo
 *
 * /training-classes/{id}/status:
 *   patch:
 *     tags: [Training Classes]
 *     summary: Chỉ huy kích hoạt hoặc ngừng lớp
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Đã cập nhật trạng thái lớp
 */
/**
 * @swagger
 * /training-classes/subject-catalog:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem danh mục môn riêng của Hệ 1, 3, 4, 7
 *     responses:
 *       200:
 *         description: Danh mục môn trong Hệ đã xác thực
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy tạo môn trong danh mục của Hệ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subjectCode, subjectName, credits]
 *             properties:
 *               subjectCode: { type: string, maxLength: 50 }
 *               subjectName: { type: string, maxLength: 255 }
 *               credits: { type: integer, minimum: 0, maximum: 100 }
 *     responses:
 *       201:
 *         description: Môn đã tạo
 * /training-classes/subject-catalog/{subjectId}:
 *   put:
 *     tags: [Training Classes]
 *     summary: Sửa danh mục cùng Hệ, không đổi môn đã gán vào lớp hoặc điểm cũ
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subjectCode, subjectName, credits]
 *             properties:
 *               subjectCode: { type: string, maxLength: 50 }
 *               subjectName: { type: string, maxLength: 255 }
 *               credits: { type: integer, minimum: 0, maximum: 100 }
 *     responses:
 *       200:
 *         description: Danh mục đã cập nhật
 */
router.use(authMiddleware);
const catalogCommander = [requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_7')];
router.get('/subject-catalog', ...catalogCommander, catalogController.list);
router.post('/subject-catalog', ...catalogCommander, catalogController.create);
router.put('/subject-catalog/:subjectId', ...catalogCommander, catalogController.update);
const commander = [requireRole('COMMANDER'), requireTrainingSystem('HE_1', 'HE_3', 'HE_4', 'HE_5', 'HE_7')];
router.get('/mine', ...commander, controller.listMine);
router.get('/:id/students/available', ...commander, controller.listAvailableStudents);
router.get('/:id/students', ...commander, controller.listStudents);
router.post('/:id/students', ...commander, controller.assignStudent);
router.get('/:id/semesters', ...commander, controller.listSemesters);
router.post('/:id/semesters', ...commander, controller.createSemester);
router.get('/:id/semesters/:semesterId/subjects', ...commander, controller.listSubjects);
router.post('/:id/semesters/:semesterId/subjects', ...commander, controller.createSubject);
router.get('/:id/semesters/:semesterId/time-table', ...commander, controller.getTimeTable);
router.put('/:id/semesters/:semesterId/time-table', ...commander, controller.saveTimeTable);
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
/**
 * @swagger
 * /training-classes/{id}/results/{resultId}:
 *   put:
 *     tags: [Training Classes]
 *     summary: Chỉ huy sửa điểm trong lớp được giao; sau chốt bắt buộc lý do, luôn lưu lịch sử
 *     responses:
 *       200:
 *         description: Điểm và lịch sử được lưu trong cùng transaction
 * /training-classes/{id}/results/{resultId}/history:
 *   get:
 *     tags: [Training Classes]
 *     summary: Chỉ huy xem lịch sử điểm trước/sau và lý do sửa trong lớp được giao
 *     responses:
 *       200:
 *         description: Lịch sử chỉ đọc
 * /training-classes/{id}/semesters/{semesterId}/grade-status:
 *   get:
 *     tags: [Training Classes]
 *     summary: Trạng thái chốt và số môn còn thiếu điểm/đề xuất chờ duyệt
 *     responses:
 *       200:
 *         description: Trạng thái điểm của lớp và học kỳ
 * /training-classes/{id}/semesters/{semesterId}/close-grades:
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy chốt điểm học kỳ của lớp, xác nhận nếu còn thiếu dữ liệu
 *     responses:
 *       200:
 *         description: Học kỳ đã chốt; đính chính sau đó yêu cầu lý do
 */
/**
 * @swagger
 * /training-classes/{id}/semesters/{semesterId}/subject-grades:
 *   post:
 *     tags: [Training Classes]
 *     summary: Chỉ huy lưu nhiều dòng điểm của một môn/lần thi, nguyên tử và có lịch sử
 *     responses:
 *       200:
 *         description: Toàn bộ dòng điểm hợp lệ đã lưu; nếu lỗi một dòng thì rollback tất cả
 */
router.post('/:id/semesters/:semesterId/subject-grades', ...cohortCommander, academicController.saveSubjectGrades);
router.get('/:id/results', ...cohortCommander, academicController.listClassResults);
router.put('/:id/results/:resultId', ...cohortCommander, academicController.updateResult);
router.get('/:id/results/:resultId/history', ...cohortCommander, academicController.resultHistory);
router.get('/:id/semesters/:semesterId/grade-status', ...cohortCommander, academicController.semesterStatus);
router.post('/:id/semesters/:semesterId/close-grades', ...cohortCommander, academicController.closeSemester);
router.post('/:id/results', ...cohortCommander, academicController.createResult);
router.get('/:id/results/summary', ...cohortCommander, academicController.getClassSummary);
router.get('/:id/results/export', ...cohortCommander, academicController.exportYearlySummary);
router.get('/:id/grade-proposals', ...cohortCommander, academicController.listClassProposals);
router.post('/:id/grade-proposals/:proposalId/approve', ...cohortCommander, academicController.approveProposal);
router.post('/:id/grade-proposals/:proposalId/reject', ...cohortCommander, academicController.rejectProposal);
router.get('/', ...commander, controller.listMine);
router.post('/', ...commander, controller.create);
router.put('/:id', ...commander, controller.update);
router.patch('/:id/status', ...commander, controller.updateStatus);

module.exports = router;
