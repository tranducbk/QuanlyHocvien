const router = require('express').Router();
const controller = require('../controllers/timeTable.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');
const { uploadExcel } = require('../middlewares/upload.middleware');

/**
 * @swagger
 * {
 *   "/time-tables": {
 *     "post": {
 *       "tags": [
 *         "Time Tables"
 *       ],
 *       "summary": "Chỉ huy thêm TKB cho học viên",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/TimeTable"
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
 *         "Time Tables"
 *       ],
 *       "summary": "Danh sách TKB",
 *       "parameters": [
 *         {
 *           "name": "semesterId",
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
 *           "name": "code",
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
 *   "/time-tables/import": {
 *     "post": {
 *       "tags": [
 *         "Time Tables"
 *       ],
 *       "summary": "COMMANDER: Nhập thời khóa biểu từ file Excel",
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
 *   "/time-tables/template": {
 *     "get": {
 *       "tags": [
 *         "Time Tables"
 *       ],
 *       "summary": "Tải file mẫu nhập thời khóa biểu",
 *       "responses": {
 *         "200": {
 *           "description": "Excel template"
 *         }
 *       }
 *     }
 *   },
 *   "/time-tables/export": {
 *     "get": {
 *       "tags": [
 *         "Time Tables"
 *       ],
 *       "summary": "Xuất báo cáo thời khóa biểu Excel",
 *       "responses": {
 *         "200": {
 *           "description": "Excel report"
 *         }
 *       }
 *     }
 *   },
 *   "/time-tables/batch": {
 *     "post": {
 *       "tags": [
 *         "Time Tables"
 *       ],
 *       "summary": "COMMANDER: Nhập thời khóa biểu hàng loạt theo mã học viên",
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
 *                 "semesterId": {
 *                   "type": "string",
 *                   "format": "uuid"
 *                 },
 *                 "items": {
 *                   "type": "array",
 *                   "items": {
 *                     "type": "object",
 *                     "required": [
 *                       "studentCode",
 *                       "schedules"
 *                     ],
 *                     "properties": {
 *                       "studentCode": {
 *                         "type": "string",
 *                         "example": "HV001"
 *                       },
 *                       "semesterId": {
 *                         "type": "string",
 *                         "format": "uuid"
 *                       },
 *                       "schedules": {
 *                         "type": "array",
 *                         "items": {
 *                           "type": "object",
 *                           "required": [
 *                             "day",
 *                             "startTime",
 *                             "endTime",
 *                             "room"
 *                           ],
 *                           "properties": {
 *                             "day": {
 *                               "type": "string",
 *                               "example": "Thứ 2"
 *                             },
 *                             "startTime": {
 *                               "type": "string",
 *                               "example": "07:00"
 *                             },
 *                             "endTime": {
 *                               "type": "string",
 *                               "example": "09:00"
 *                             },
 *                             "room": {
 *                               "type": "string",
 *                               "example": "P101"
 *                             },
 *                             "subjectName": {
 *                               "type": "string"
 *                             },
 *                             "week": {
 *                               "oneOf": [
 *                                 {
 *                                   "type": "integer",
 *                                   "example": 1
 *                                 },
 *                                 {
 *                                   "type": "array",
 *                                   "items": {
 *                                     "type": "integer"
 *                                   },
 *                                   "example": [
 *                                     1,
 *                                     2,
 *                                     3,
 *                                     4
 *                                   ]
 *                                 }
 *                               ]
 *                             }
 *                           }
 *                         }
 *                       }
 *                     }
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
 *   "/time-tables/report": {
 *     "get": {
 *       "tags": [
 *         "Time Tables"
 *       ],
 *       "summary": "Báo cáo TKB",
 *       "responses": {
 *         "200": {
 *           "description": "OK"
 *         }
 *       }
 *     }
 *   },
 *   "/time-tables/{id}": {
 *     "get": {
 *       "tags": [
 *         "Time Tables"
 *       ],
 *       "summary": "Chi tiết TKB",
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
 *         "Time Tables"
 *       ],
 *       "summary": "Cập nhật TKB",
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
 *         "Time Tables"
 *       ],
 *       "summary": "Xóa TKB",
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
router.get('/report', controller.getReport);
router.get('/:id', controller.getDetail);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
