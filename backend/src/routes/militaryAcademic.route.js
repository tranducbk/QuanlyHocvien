const router = require('express').Router();
const controller = require('../controllers/militaryAcademic.controller');
const { authMiddleware, requireRole, requireSystemType } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/military/academic/me/time-table": { "get": { "tags": ["Military"], "summary": "Lịch học của học viên quân sự đăng nhập", "responses": { "200": { "description": "Lịch học theo lớp" } } } },
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
router.get('/me/time-table', requireRole('STUDENT'), requireSystemType('MILITARY'), controller.studentTimeTable);
router.use(requireRole('COMMANDER'), requireSystemType('MILITARY'));
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
