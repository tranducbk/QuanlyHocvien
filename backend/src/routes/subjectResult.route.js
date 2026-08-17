const router = require('express').Router();
const controller = require('../controllers/subjectResult.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');
const { uploadExcel } = require('../middlewares/upload.middleware');

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
 *     },
 *     "put": {
 *       "tags": [
 *         "Academic Results"
 *       ],
 *       "summary": "Cập nhật KQ môn học",
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
 *     },
 *     "delete": {
 *       "tags": [
 *         "Academic Results"
 *       ],
 *       "summary": "Xóa KQ môn học",
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
router.use(requireRole('ADMIN', 'COMMANDER'));

router.get('/template/download', controller.downloadTemplate);
router.post('/import', uploadExcel('file'), controller.importExcel);

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getDetail);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
