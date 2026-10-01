const router = require('express').Router();
const controller = require('../controllers/militaryClass.controller');
const { authMiddleware, requireRole, requireSystemType } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/military/classes": {
 *     "get": { "tags": ["Military"], "summary": "Danh sách lớp quân sự của Chỉ huy đăng nhập", "responses": { "200": { "description": "Danh sách lớp và sĩ số" } } },
 *     "post": { "tags": ["Military"], "summary": "Tạo lớp quân sự", "responses": { "201": { "description": "Lớp đã tạo" } } }
 *   },
 *   "/military/classes/{id}": {
 *     "get": { "tags": ["Military"], "summary": "Chi tiết lớp quân sự", "responses": { "200": { "description": "Thông tin lớp" } } },
 *     "put": { "tags": ["Military"], "summary": "Cập nhật lớp quân sự", "responses": { "200": { "description": "Lớp đã cập nhật" } } },
 *     "delete": { "tags": ["Military"], "summary": "Xóa lớp quân sự rỗng", "responses": { "200": { "description": "Lớp đã xóa" } } }
 *   },
 *   "/military/classes/{id}/students": {
 *     "get": { "tags": ["Military"], "summary": "Danh sách học viên trong lớp", "responses": { "200": { "description": "Danh sách học viên" } } },
 *     "post": { "tags": ["Military"], "summary": "Xếp học viên quân sự vào lớp bằng user ID", "responses": { "200": { "description": "Kết quả xếp lớp" } } }
 *   },
 *   "/military/classes/{id}/students/by-code": { "post": { "tags": ["Military"], "summary": "Xếp học viên quân sự vào lớp bằng mã học viên", "responses": { "200": { "description": "Kết quả xếp lớp" } } } },
 *   "/military/classes/{id}/students/{userId}": { "delete": { "tags": ["Military"], "summary": "Chuyển học viên khỏi lớp quân sự", "responses": { "200": { "description": "Kết quả chuyển lớp" } } } }
 * }
 */

router.use(authMiddleware, requireRole('COMMANDER'), requireSystemType('MILITARY'));
router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/:id/students/:userId', controller.removeStudents);
router.get('/:id/students', controller.getStudents);
router.post('/:id/students/by-code', controller.assignStudentsByCode);
router.post('/:id/students', controller.assignStudents);
router.get('/:id', controller.getDetail);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
