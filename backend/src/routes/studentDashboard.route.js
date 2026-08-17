const router = require('express').Router();
const controller = require('../controllers/dashboard.controller');
const { authMiddleware, requireStudent } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/students/dashboard": {
 *     "get": {
 *       "tags": [
 *         "Reports"
 *       ],
 *       "summary": "HV: Thống kê dashboard học viên",
 *       "description": "Tổng hợp số liệu cá nhân của học viên: học tập, lịch học, cắt cơm, học phí và thông báo.",
 *       "responses": {
 *         "200": {
 *           "description": "Dữ liệu dashboard học viên"
 *         }
 *       }
 *     }
 *   }
 * }
 */

router.get('/dashboard', authMiddleware, requireStudent, controller.getStudentDashboard);

module.exports = router;
