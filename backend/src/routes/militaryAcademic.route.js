const router = require('express').Router();
const controller = require('../controllers/militaryAcademic.controller');
const resultController = require('../controllers/militaryResult.controller');
const {
  authMiddleware,
  requireRole,
  requireSystemType,
} = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/military/academic/me/time-table": { "get": { "tags": ["Military"], "summary": "Lịch học của học viên quân sự đăng nhập", "responses": { "200": { "description": "Lịch học theo lớp" } } } },
 *   "/military/academic/me/subjects": { "get": { "tags": ["Military"], "summary": "Danh sách môn học của lớp học viên", "responses": { "200": { "description": "Danh sách môn học" } } } },
 *   "/military/academic/me/results": { "get": { "tags": ["Military"], "summary": "Kết quả học tập của học viên quân sự", "responses": { "200": { "description": "Danh sách điểm chính thức" } } } },
 *   "/military/academic/me/grade-proposals": {
 *     "get": { "tags": ["Military"], "summary": "Lịch sử đề xuất điểm của học viên", "responses": { "200": { "description": "Danh sách đề xuất" } } },
 *     "post": { "tags": ["Military"], "summary": "Gửi đề xuất điểm quân sự", "responses": { "201": { "description": "Đề xuất đã gửi" } } }
 *   },
 *   "/military/academic/classes/{classId}/results": {
 *     "get": { "tags": ["Military"], "summary": "Xem điểm của lớp quân sự", "responses": { "200": { "description": "Danh sách điểm" } } },
 *     "post": { "tags": ["Military"], "summary": "Ghi nhận điểm chính thức cho học viên", "responses": { "201": { "description": "Điểm đã ghi nhận" } } }
 *   },
 *   "/military/academic/grade-proposals": { "get": { "tags": ["Military"], "summary": "Danh sách đề xuất điểm theo lớp", "responses": { "200": { "description": "Danh sách đề xuất" } } } },
 *   "/military/academic/grade-proposals/{id}/approve": { "post": { "tags": ["Military"], "summary": "Phê duyệt đề xuất điểm", "responses": { "200": { "description": "Đề xuất đã duyệt" } } } },
 *   "/military/academic/grade-proposals/{id}/reject": { "post": { "tags": ["Military"], "summary": "Từ chối đề xuất điểm", "responses": { "200": { "description": "Đề xuất đã từ chối" } } } },
 *   "/military/academic/semesters": {
 *     "get": { "tags": ["Military"], "summary": "Danh sách học kỳ quân sự", "responses": { "200": { "description": "Danh sách học kỳ" } } },
 *     "post": { "tags": ["Military"], "summary": "Tạo học kỳ quân sự", "responses": { "201": { "description": "Học kỳ đã tạo" } } }
 *   },
 *   "/military/academic/semesters/{id}": {
 *     "get": { "tags": ["Military"], "summary": "Chi tiết học kỳ quân sự", "responses": { "200": { "description": "Thông tin học kỳ" } } },
 *     "put": { "tags": ["Military"], "summary": "Cập nhật học kỳ quân sự", "responses": { "200": { "description": "Học kỳ đã cập nhật" } } },
 *     "delete": { "tags": ["Military"], "summary": "Xóa học kỳ quân sự không có dữ liệu phụ thuộc", "responses": { "200": { "description": "Học kỳ đã xóa" } } }
 *   },
 *   "/military/academic/classes/{classId}/subjects": {
 *     "get": { "tags": ["Military"], "summary": "Danh sách môn theo lớp quân sự", "responses": { "200": { "description": "Danh sách môn" } } },
 *     "post": { "tags": ["Military"], "summary": "Thêm môn vào lớp và học kỳ", "responses": { "201": { "description": "Môn đã tạo" } } }
 *   },
 *   "/military/academic/classes/{classId}/subjects/{id}": {
 *     "put": { "tags": ["Military"], "summary": "Cập nhật môn học", "responses": { "200": { "description": "Môn đã cập nhật" } } },
 *     "delete": { "tags": ["Military"], "summary": "Xóa môn học", "responses": { "200": { "description": "Môn đã xóa" } } }
 *   },
 *   "/military/academic/classes/{classId}/time-table": {
 *     "get": { "tags": ["Military"], "summary": "Xem lịch học của lớp", "responses": { "200": { "description": "Lịch học lớp và học kỳ" } } },
 *     "put": { "tags": ["Military"], "summary": "Lưu lịch học của lớp", "responses": { "200": { "description": "Lịch học đã lưu" } } }
 *   }
 * }
 */

router.use(authMiddleware);
router.get(
  '/me/time-table',
  requireRole('STUDENT'),
  requireSystemType('MILITARY'),
  controller.studentTimeTable,
);
router.get(
  '/me/subjects',
  requireRole('STUDENT'),
  requireSystemType('MILITARY'),
  controller.studentSubjects,
);
router.get(
  '/me/results',
  requireRole('STUDENT'),
  requireSystemType('MILITARY'),
  resultController.studentResults,
);
router.get(
  '/me/grade-proposals',
  requireRole('STUDENT'),
  requireSystemType('MILITARY'),
  resultController.studentProposals,
);
router.post(
  '/me/grade-proposals',
  requireRole('STUDENT'),
  requireSystemType('MILITARY'),
  resultController.createProposal,
);
router.use(requireRole('COMMANDER'), requireSystemType('MILITARY'));
router.get('/classes/:classId/results', resultController.classResults);
router.post('/classes/:classId/results', resultController.createResult);
router.get('/grade-proposals', resultController.classProposals);
router.post('/grade-proposals/:id/approve', resultController.approve);
router.post('/grade-proposals/:id/reject', resultController.reject);
router.get('/semesters', controller.listSemesters);
router.post('/semesters', controller.createSemester);
router.get('/semesters/:id', controller.getSemester);
router.put('/semesters/:id', controller.updateSemester);
router.delete('/semesters/:id', controller.deleteSemester);
router.get('/classes/:classId/subjects', controller.listSubjects);
router.post('/classes/:classId/subjects', controller.createSubject);
router.put('/classes/:classId/subjects/:id', controller.updateSubject);
router.delete('/classes/:classId/subjects/:id', controller.deleteSubject);
router.get('/classes/:classId/time-table', controller.getTimeTable);
router.put('/classes/:classId/time-table', controller.saveTimeTable);

module.exports = router;
