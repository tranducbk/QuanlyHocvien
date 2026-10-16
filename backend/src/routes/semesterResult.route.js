const router = require('express').Router();
const controller = require('../controllers/semesterResult.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/semester-results": {
 *     "post": {
 *       "tags": ["Academic Results"],
 *       "summary": "Chỉ huy: Tạo kết quả học kỳ cho học viên trong phạm vi quản lý",
 *       "requestBody": {
 *         "required": true,
 *         "content": { "application/json": { "schema": { "$ref": "#/components/schemas/SemesterResult" } } }
 *       },
 *       "responses": {
 *         "201": { "description": "Kết quả học kỳ đã được tạo" },
 *         "400": { "description": "Học viên hoặc kết quả năm không thuộc phạm vi quản lý" },
 *         "403": { "description": "Không có quyền truy cập" }
 *       }
 *     },
 *     "get": {
 *       "tags": ["Academic Results"],
 *       "summary": "Chỉ huy: Danh sách kết quả học kỳ trong phạm vi quản lý",
 *       "parameters": [
 *         { "name": "page", "in": "query", "schema": { "type": "integer", "minimum": 1 } },
 *         { "name": "limit", "in": "query", "schema": { "type": "integer", "minimum": 1 } },
 *         { "name": "userId", "in": "query", "schema": { "type": "string", "format": "uuid" } },
 *         { "name": "schoolYear", "in": "query", "schema": { "type": "string" } },
 *         { "name": "semester", "in": "query", "schema": { "type": "string" } }
 *       ],
 *       "responses": {
 *         "200": { "description": "Danh sách kết quả học kỳ" },
 *         "403": { "description": "Không có quyền truy cập" }
 *       }
 *     }
 *   },
 *   "/semester-results/{id}": {
 *     "get": {
 *       "tags": ["Academic Results"],
 *       "summary": "Chỉ huy: Chi tiết kết quả học kỳ trong phạm vi quản lý",
 *       "parameters": [
 *         { "name": "id", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
 *       ],
 *       "responses": {
 *         "200": { "description": "Chi tiết kết quả học kỳ" },
 *         "404": { "description": "Không tìm thấy trong phạm vi quản lý" }
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
