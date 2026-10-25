const router = require('express').Router();
const controller = require('../../controllers/academic-results/subjectResult.controller.js');
const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware.js');
const { uploadExcel } = require('../../middlewares/upload.middleware.js');

/**
 * @swagger
 * {
 *   "/subject-results": {
 *     "post": {
 *       "tags": [
 *         "Academic Results"
 *       ],
 *       "summary": "Chỉ huy thêm KQ môn học",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/SubjectResult"
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "201": {
 *           "description": "Created"
 *         }
 *       }
 *     },
 *     "get": {
 *       "tags": [
 *         "Academic Results"
 *       ],
 *       "summary": "Danh sách KQ môn học",
 *       "parameters": [
 *         {
 *           "name": "page",
 *           "in": "query",
 *           "schema": {
 *             "type": "integer"
 *           }
 *         },
 *         {
 *           "name": "limit",
 *           "in": "query",
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
 *   },
 *   "/subject-results/{id}": {
 *     "get": {
 *       "tags": [
 *         "Academic Results"
 *       ],
 *       "summary": "Chi tiết KQ môn học",
 *       "parameters": [
 *         {
 *           "name": "id",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "string"
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

/**
 * @swagger
 * /subject-results/template/download:
 *   get:
 *     tags: [Academic Results]
 *     summary: Tải mẫu Excel nhập kết quả môn học
 *     responses:
 *       200:
 *         description: File Excel mẫu
 * /subject-results/import:
 *   post:
 *     tags: [Academic Results]
 *     summary: Nhập kết quả môn học từ Excel
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Kết quả nhập dữ liệu
 */
router.get('/template/download', controller.downloadTemplate);
router.post('/import', uploadExcel('file'), controller.importExcel);

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getDetail);

module.exports = router;
