const router = require('express').Router();
const controller = require('../controllers/cutRice.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');
const { uploadExcel } = require('../middlewares/upload.middleware');

/**
 * @swagger
 * {
 *   "/cut-rice": {
 *     "post": {
 *       "tags": [
 *         "Cut Rice"
 *       ],
 *       "summary": "Thêm lịch cắt cơm",
 *       "responses": {
 *         "201": {
 *           "description": "Created"
 *         }
 *       }
 *     },
 *     "get": {
 *       "tags": [
 *         "Cut Rice"
 *       ],
 *       "summary": "Danh sách lịch cắt cơm (admin)",
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
 *   "/cut-rice/import": {
 *     "post": {
 *       "tags": [
 *         "Cut Rice"
 *       ],
 *       "summary": "Nhập Excel lịch cắt cơm",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "multipart/form-data": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "file"
 *               ],
 *               "properties": {
 *                 "file": {
 *                   "type": "string",
 *                   "format": "binary"
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "201": {
 *           "description": "Import result"
 *         }
 *       }
 *     }
 *   },
 *   "/cut-rice/template": {
 *     "get": {
 *       "tags": [
 *         "Cut Rice"
 *       ],
 *       "summary": "Tải file mẫu nhập lịch cắt cơm",
 *       "responses": {
 *         "200": {
 *           "description": "File Excel mẫu"
 *         }
 *       }
 *     }
 *   },
 *   "/cut-rice/export": {
 *     "get": {
 *       "tags": [
 *         "Cut Rice"
 *       ],
 *       "summary": "Xuất Excel lịch cắt cơm",
 *       "responses": {
 *         "200": {
 *           "description": "File Excel"
 *         }
 *       }
 *     }
 *   },
 *   "/cut-rice/{id}": {
 *     "get": {
 *       "tags": [
 *         "Cut Rice"
 *       ],
 *       "summary": "Chi tiết",
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
 *         "Cut Rice"
 *       ],
 *       "summary": "Cập nhật",
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
 *         "Cut Rice"
 *       ],
 *       "summary": "Xóa",
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

router.post('/', controller.create);
router.get('/', controller.getAll);
router.post('/import', uploadExcel('file'), controller.importExcel);
router.get('/template', controller.downloadTemplate);
router.get('/export', controller.exportCutRice);
router.get('/requests', controller.getRequests);
router.post('/requests/:id/approve', controller.approveRequest);
router.post('/requests/:id/reject', controller.rejectRequest);
router.get('/:id', controller.getDetail);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
