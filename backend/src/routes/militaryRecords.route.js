const router = require('express').Router();
const controller = require('../controllers/militaryRecords.controller');
const {
  authMiddleware,
  requireRole,
  requireSystemType,
} = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/military/records/me/achievements": { "get": { "tags": ["Military"], "summary": "Thành tích của học viên quân sự", "responses": { "200": { "description": "Danh sách thành tích" } } } },
 *   "/military/records/achievements": { "get": { "tags": ["Military"], "summary": "Thành tích theo lớp quân sự", "responses": { "200": { "description": "Danh sách thành tích" } } } },
 *   "/military/records/classes/{classId}/achievements": { "post": { "tags": ["Military"], "summary": "Thêm thành tích cho học viên", "responses": { "201": { "description": "Thành tích đã thêm" } } } },
 *   "/military/records/achievements/{id}": {
 *     "put": { "tags": ["Military"], "summary": "Cập nhật thành tích", "responses": { "200": { "description": "Thành tích đã cập nhật" } } },
 *     "delete": { "tags": ["Military"], "summary": "Xóa thành tích", "responses": { "200": { "description": "Thành tích đã xóa" } } }
 *   },
 *   "/military/records/duty-schedules": { "get": { "tags": ["Military"], "summary": "Lịch trực theo lớp quân sự", "responses": { "200": { "description": "Danh sách lịch trực" } } } },
 *   "/military/records/classes/{classId}/duty-schedules": { "post": { "tags": ["Military"], "summary": "Phân công lịch trực trong lớp", "responses": { "201": { "description": "Lịch trực đã tạo" } } } },
 *   "/military/records/duty-schedules/{id}": {
 *     "put": { "tags": ["Military"], "summary": "Cập nhật lịch trực", "responses": { "200": { "description": "Lịch trực đã cập nhật" } } },
 *     "delete": { "tags": ["Military"], "summary": "Xóa lịch trực", "responses": { "200": { "description": "Lịch trực đã xóa" } } }
 *   }
 * }
 */

router.use(authMiddleware);
router.get(
  '/me/achievements',
  requireRole('STUDENT'),
  requireSystemType('MILITARY'),
  controller.myAchievements,
);
router.use(requireRole('COMMANDER'), requireSystemType('MILITARY'));
router.get('/achievements', controller.listAchievements);
router.post('/classes/:classId/achievements', controller.createAchievement);
router.put('/achievements/:id', controller.updateAchievement);
router.delete('/achievements/:id', controller.deleteAchievement);
router.get('/duty-schedules', controller.listDutySchedules);
router.post('/classes/:classId/duty-schedules', controller.createDutySchedule);
router.put('/duty-schedules/:id', controller.updateDutySchedule);
router.delete('/duty-schedules/:id', controller.deleteDutySchedule);

module.exports = router;
