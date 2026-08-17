const router = require('express').Router();
const controller = require('../controllers/dashboard.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/admins/dashboard": {
 *     "get": {
 *       "tags": [
 *         "Reports"
 *       ],
 *       "summary": "QTV: Thống kê dashboard quản trị viên",
 *       "description": "Tổng hợp số liệu hệ thống, tài khoản, dữ liệu nền và cảnh báo vận hành.",
 *       "responses": {
 *         "200": {
 *           "description": "Dữ liệu dashboard admin"
 *         }
 *       }
 *     }
 *   }
 * }
 */

router.get('/dashboard', authMiddleware, requireAdmin, controller.getAdminDashboard);

module.exports = router;
