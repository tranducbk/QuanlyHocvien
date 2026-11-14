const router = require('express').Router();
const controller = require('../../controllers/schedules/commanderDutySchedule.controller.js');
const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware.js');

/**
 * @swagger
 * {
 *   "/commander-duty-schedules": {
 *     "post": {
 *       "tags": [
 *         "Duty Schedules"
 *       ],
 *       "summary": "CH-10: Phân công lịch trực",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/DutySchedule"
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "201": {
 *           "description": "Kết quả học kỳ đã được tạo"
 *         },
 *         "400": {
 *           "description": "Học viên hoặc kết quả năm không thuộc phạm vi quản lý"
 *         },
 *         "403": {
 *           "description": "Không có quyền truy cập"
 *         }
 *       }
 *     },
 *     "get": {
 *       "tags": [
 *         "Duty Schedules"
 *       ],
 *       "summary": "CH-10: Danh sách lịch trực",
 *       "parameters": [
 *         {
 *           "name": "page",
 *           "in": "query",
 *           "schema": {
 *             "type": "integer",
 *             "minimum": 1
 *           }
 *         },
 *         {
 *           "name": "limit",
 *           "in": "query",
 *           "schema": {
 *             "type": "integer",
 *             "minimum": 1
 *           }
 *         },
 *         {
 *           "name": "userId",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "format": "uuid"
 *           }
 *         },
 *         {
 *           "name": "schoolYear",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "semester",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Danh sách kết quả học kỳ"
 *         },
 *         "403": {
 *           "description": "Không có quyền truy cập"
 *         }
 *       }
 *     }
 *   },
 *   "/commander-duty-schedules/{id}": {
 *     "get": {
 *       "tags": [
 *         "Duty Schedules"
 *       ],
 *       "summary": "Chi tiết",
 *       "parameters": [
 *         {
 *           "name": "id",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "integer"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "OK"
 *         }
 *       }
 *     }
 *   }
 * }
 */

router.use(authMiddleware);
router.use(requireRole('COMMANDER'));

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getDetail);

module.exports = router;
