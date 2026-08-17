const router = require('express').Router();
const controller = require('../controllers/achievement.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');
const { uploadExcel } = require('../middlewares/upload.middleware');

/**
 * @swagger
 * {
 *   "/achievements": {
 *     "post": {
 *       "tags": [
 *         "Achievements"
 *       ],
 *       "summary": "CH-05: Thêm thành tích",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/Achievement"
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
 *         "Achievements"
 *       ],
 *       "summary": "CH-05: Danh sách thành tích",
 *       "parameters": [
 *         {
 *           "name": "userId",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "format": "uuid"
 *           }
 *         },
 *         {
 *           "name": "semester",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
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
 *           "name": "year",
 *           "in": "query",
 *           "schema": {
 *             "type": "integer"
 *           }
 *         },
 *         {
 *           "name": "award",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "fullName",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "unit",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
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
 *   "/achievements/batch": {
 *     "post": {
 *       "tags": [
 *         "Achievements"
 *       ],
 *       "summary": "COMMANDER: Nhập thành tích hàng loạt theo mã học viên",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "items"
 *               ],
 *               "properties": {
 *                 "items": {
 *                   "type": "array",
 *                   "items": {
 *                     "$ref": "#/components/schemas/AchievementBatchItem"
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "201": {
 *           "description": "Batch result"
 *         }
 *       }
 *     }
 *   },
 *   "/achievements/import": {
 *     "post": {
 *       "tags": [
 *         "Achievements"
 *       ],
 *       "summary": "Nhập thành tích từ Excel",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "multipart/form-data": {
 *             "schema": {
 *               "type": "object",
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
 *           "description": "Batch result"
 *         }
 *       }
 *     }
 *   },
 *   "/achievements/template": {
 *     "get": {
 *       "tags": [
 *         "Achievements"
 *       ],
 *       "summary": "Tải file mẫu nhập thành tích",
 *       "responses": {
 *         "200": {
 *           "description": "Excel template"
 *         }
 *       }
 *     }
 *   },
 *   "/achievements/export": {
 *     "get": {
 *       "tags": [
 *         "Achievements"
 *       ],
 *       "summary": "Xuất báo cáo thành tích Excel",
 *       "parameters": [
 *         {
 *           "name": "fullName",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "unit",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
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
 *         },
 *         {
 *           "name": "award",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Excel report"
 *         }
 *       }
 *     }
 *   },
 *   "/achievements/{id}": {
 *     "get": {
 *       "tags": [
 *         "Achievements"
 *       ],
 *       "summary": "Chi tiết thành tích",
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
 *         "Achievements"
 *       ],
 *       "summary": "Cập nhật thành tích",
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
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/Achievement"
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "200": {
 *           "description": "OK"
 *         }
 *       }
 *     },
 *     "delete": {
 *       "tags": [
 *         "Achievements"
 *       ],
 *       "summary": "Xóa thành tích",
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
router.post('/batch', controller.createBatch);
router.post('/import', uploadExcel('file'), controller.importExcel);
router.get('/template', controller.downloadTemplate);
router.get('/export', controller.exportExcel);
router.get('/', controller.getAll);
router.get('/:id', controller.getDetail);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
