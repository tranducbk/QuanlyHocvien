const router = require('express').Router();
const controller = require('../controllers/subjectResult.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');
const { uploadExcel } = require('../middlewares/upload.middleware');

/**
 * @swagger
 * {
 *   "/subject-results": {
 *     "post": {
 *       "tags": ["Academic Results"],
 *       "summary": "Chỉ huy: Ghi nhận kết quả môn học mới",
 *       "requestBody": {
 *         "required": true,
 *         "content": { "application/json": { "schema": { "$ref": "#/components/schemas/SubjectResult" } } }
 *       },
 *       "responses": {
 *         "201": { "description": "Kết quả môn học đã được ghi nhận" },
 *         "403": { "description": "Không có quyền truy cập" }
 *       }
 *     },
 *     "get": {
 *       "tags": ["Academic Results"],
 *       "summary": "Chỉ huy: Danh sách kết quả môn học trong phạm vi quản lý",
 *       "parameters": [
 *         { "name": "page", "in": "query", "schema": { "type": "integer", "minimum": 1 } },
 *         { "name": "limit", "in": "query", "schema": { "type": "integer", "minimum": 1 } },
 *         { "name": "semesterResultId", "in": "query", "schema": { "type": "string", "format": "uuid" } }
 *       ],
 *       "responses": {
 *         "200": { "description": "Danh sách kết quả môn học" },
 *         "403": { "description": "Không có quyền truy cập" }
 *       }
 *     }
 *   },
 *   "/subject-results/import": {
 *     "post": {
 *       "tags": ["Academic Results"],
 *       "summary": "Chỉ huy: Nhập kết quả môn học từ Excel",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "multipart/form-data": {
 *             "schema": {
 *               "type": "object",
 *               "required": ["file", "semesterResultId"],
 *               "properties": {
 *                 "file": { "type": "string", "format": "binary" },
 *                 "semesterResultId": { "type": "string", "format": "uuid" }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "responses": { "200": { "description": "Kết quả import" } }
 *     }
 *   },
 *   "/subject-results/template/download": {
 *     "get": {
 *       "tags": ["Academic Results"],
 *       "summary": "Chỉ huy: Tải mẫu Excel nhập kết quả môn học",
 *       "responses": { "200": { "description": "File Excel mẫu" } }
 *     }
 *   },
 *   "/subject-results/{id}": {
 *     "get": {
 *       "tags": ["Academic Results"],
 *       "summary": "Chỉ huy: Chi tiết kết quả môn học trong phạm vi quản lý",
 *       "parameters": [
 *         { "name": "id", "in": "path", "required": true, "schema": { "type": "string", "format": "uuid" } }
 *       ],
 *       "responses": {
 *         "200": { "description": "Chi tiết kết quả môn học" },
 *         "404": { "description": "Không tìm thấy trong phạm vi quản lý" }
 *       }
 *     }
 *   }
 * }
 */

router.use(authMiddleware);
router.use(requireRole('COMMANDER'));

router.get('/template/download', controller.downloadTemplate);
router.post('/import', uploadExcel('file'), controller.importExcel);
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getDetail);

module.exports = router;
