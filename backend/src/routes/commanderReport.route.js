const router = require('express').Router();
const controller = require('../controllers/user.controller');
const dashboardController = require('../controllers/dashboard.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/commanders/dashboard": {
 *     "get": {
 *       "tags": [
 *         "Reports"
 *       ],
 *       "summary": "CH-09: Thống kê dashboard chỉ huy",
 *       "description": "Tổng hợp số liệu, biểu đồ và cảnh báo để hiển thị dashboard.",
 *       "responses": {
 *         "200": {
 *           "description": "Dữ liệu dashboard",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean"
 *                   },
 *                   "data": {
 *                     "type": "object",
 *                     "properties": {
 *                       "overview": {
 *                         "type": "object"
 *                       },
 *                       "charts": {
 *                         "type": "object"
 *                       },
 *                       "alerts": {
 *                         "type": "object"
 *                       },
 *                       "recent": {
 *                         "type": "object"
 *                       }
 *                     }
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "/commanders/reports/tuition": {
 *     "get": {
 *       "tags": [
 *         "Reports"
 *       ],
 *       "summary": "CH-09: Xuất báo cáo học phí",
 *       "description": "Admin/Commander tải file Excel báo cáo học phí. Filter: ?schoolYear=&semester=&semesterId=",
 *       "parameters": [
 *         {
 *           "name": "schoolYear",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "example": "2025-2026"
 *           }
 *         },
 *         {
 *           "name": "semester",
 *           "in": "query",
 *           "schema": {
 *             "type": "integer",
 *             "example": 1
 *           }
 *         },
 *         {
 *           "name": "semesterId",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "format": "uuid"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "File báo cáo học phí",
 *           "content": {
 *             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
 *               "schema": {
 *                 "type": "string",
 *                 "format": "binary"
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */

router.get('/dashboard', authMiddleware, requireRole('COMMANDER'), dashboardController.getCommanderDashboard);
router.get('/reports/tuition', authMiddleware, requireRole('ADMIN', 'COMMANDER'), controller.exportTuitionReport);

module.exports = router;
