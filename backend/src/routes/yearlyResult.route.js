const router = require('express').Router();
const controller = require('../controllers/yearlyResult.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/yearly-results": {
 *     "get": {
 *       "tags": ["Academic Results"],
 *       "summary": "Danh sách kết quả học tập theo năm",
 *       "description": "Chỉ Chỉ huy được tra cứu kết quả tổng hợp theo năm học.",
 *       "parameters": [
 *         { "name": "page", "in": "query", "schema": { "type": "integer", "minimum": 1 } },
 *         { "name": "limit", "in": "query", "schema": { "type": "integer", "minimum": 1, "maximum": 100 } },
 *         { "name": "schoolYear", "in": "query", "schema": { "type": "string" } },
 *         { "name": "userId", "in": "query", "schema": { "type": "string", "format": "uuid" } },
 *         { "name": "fullName", "in": "query", "schema": { "type": "string" } },
 *         { "name": "unit", "in": "query", "schema": { "type": "string" } },
 *         { "name": "gpaFrom", "in": "query", "schema": { "type": "number", "minimum": 0, "maximum": 4 } },
 *         { "name": "gpaTo", "in": "query", "schema": { "type": "number", "minimum": 0, "maximum": 4 } },
 *         { "name": "cpaFrom", "in": "query", "schema": { "type": "number", "minimum": 0, "maximum": 4 } },
 *         { "name": "cpaTo", "in": "query", "schema": { "type": "number", "minimum": 0, "maximum": 4 } },
 *         { "name": "sortBy", "in": "query", "schema": { "type": "string" } },
 *         { "name": "sortOrder", "in": "query", "schema": { "type": "string", "enum": ["asc", "desc"] } }
 *       ],
 *       "responses": {
 *         "200": { "description": "Danh sách kết quả năm và thông tin phân trang" },
 *         "403": { "description": "Không có quyền truy cập" }
 *       }
 *     }
 *   },
 *   "/yearly-results/export": {
 *     "get": {
 *       "tags": ["Academic Results"],
 *       "summary": "Xuất Excel kết quả học tập theo năm",
 *       "responses": {
 *         "200": { "description": "File Excel" },
 *         "403": { "description": "Không có quyền truy cập" }
 *       }
 *     }
 *   },
 *   "/yearly-results/{id}": {
 *     "get": {
 *       "tags": ["Academic Results"],
 *       "summary": "Chi tiết kết quả học tập theo năm",
 *       "parameters": [
 *         { "name": "id", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
 *       ],
 *       "responses": {
 *         "200": { "description": "Kết quả năm và các học kỳ cấu thành" },
 *         "404": { "description": "Không tìm thấy kết quả năm" }
 *       }
 *     }
 *   }
 * }
 */

router.use(authMiddleware);
router.use(requireRole('COMMANDER'));

router.get('/', controller.getAll);
router.get('/export', controller.exportYearlyResults);
router.get('/:id', controller.getDetail);

module.exports = router;
