const router = require('express').Router();
const controller = require('../controllers/class.controller');
const { authMiddleware, requireRole, requireAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/classes": {
 *     "post": {
 *       "tags": [
 *         "Classes"
 *       ],
 *       "summary": "Tạo lớp",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "className",
 *                 "educationLevelId"
 *               ],
 *               "properties": {
 *                 "className": {
 *                   "type": "string"
 *                 },
 *                 "studentCount": {
 *                   "type": "integer"
 *                 },
 *                 "educationLevelId": {
 *                   "type": "string"
 *                 }
 *               }
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
 *         "Classes"
 *       ],
 *       "summary": "Danh sách lớp",
 *       "description": "Trả về className, studentCount, levelName, organizationName, universityName. Có thể lọc và sắp xếp theo thông tin lớp/trình độ/đơn vị/trường.",
 *       "parameters": [
 *         {
 *           "in": "query",
 *           "name": "className",
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Tìm kiếm theo tên lớp"
 *         },
 *         {
 *           "in": "query",
 *           "name": "educationLevelId",
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Lọc theo trình độ đào tạo"
 *         },
 *         {
 *           "in": "query",
 *           "name": "organizationId",
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Lọc theo đơn vị/ngành"
 *         },
 *         {
 *           "in": "query",
 *           "name": "universityId",
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Lọc theo trường"
 *         },
 *         {
 *           "in": "query",
 *           "name": "universityName",
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Lọc theo tên trường"
 *         },
 *         {
 *           "in": "query",
 *           "name": "organizationName",
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Lọc theo tên đơn vị"
 *         },
 *         {
 *           "in": "query",
 *           "name": "levelName",
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Lọc theo tên trình độ"
 *         },
 *         {
 *           "in": "query",
 *           "name": "sortBy",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "className",
 *               "studentCount",
 *               "createdAt",
 *               "levelName",
 *               "organizationName",
 *               "universityName"
 *             ]
 *           }
 *         },
 *         {
 *           "in": "query",
 *           "name": "sortOrder",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "asc",
 *               "desc"
 *             ]
 *           }
 *         },
 *         {
 *           "in": "query",
 *           "name": "page",
 *           "schema": {
 *             "type": "integer"
 *           }
 *         },
 *         {
 *           "in": "query",
 *           "name": "limit",
 *           "schema": {
 *             "type": "integer"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Class[] + pagination"
 *         }
 *       }
 *     }
 *   },
 *   "/classes/{id}/students": {
 *     "post": {
 *       "tags": [
 *         "Classes"
 *       ],
 *       "summary": "Thêm học viên vào lớp hàng loạt",
 *       "parameters": [
 *         {
 *           "in": "path",
 *           "name": "id",
 *           "required": true,
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Mã lớp"
 *         }
 *       ],
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "userIds"
 *               ],
 *               "properties": {
 *                 "userIds": {
 *                   "type": "array",
 *                   "items": {
 *                     "type": "string",
 *                     "format": "uuid"
 *                   },
 *                   "description": "Danh sách userId của học viên"
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "200": {
 *           "description": "classId, updated, studentCount"
 *         }
 *       }
 *     },
 *     "delete": {
 *       "tags": [
 *         "Classes"
 *       ],
 *       "summary": "Bỏ học viên khỏi lớp hàng loạt",
 *       "parameters": [
 *         {
 *           "in": "path",
 *           "name": "id",
 *           "required": true,
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Mã lớp"
 *         }
 *       ],
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "userIds"
 *               ],
 *               "properties": {
 *                 "userIds": {
 *                   "type": "array",
 *                   "items": {
 *                     "type": "string",
 *                     "format": "uuid"
 *                   },
 *                   "description": "Danh sách userId của học viên"
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "200": {
 *           "description": "classId, updated, studentCount"
 *         }
 *       }
 *     },
 *     "get": {
 *       "tags": [
 *         "Classes"
 *       ],
 *       "summary": "Danh sách học viên trong lớp",
 *       "description": "Vào bên trong lớp xem danh sách học viên. Filter theo code, fullName, gender, enrollment, unit, rank.",
 *       "parameters": [
 *         {
 *           "in": "path",
 *           "name": "id",
 *           "required": true,
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Mã lớp"
 *         },
 *         {
 *           "in": "query",
 *           "name": "code",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "in": "query",
 *           "name": "fullName",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "in": "query",
 *           "name": "gender",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "in": "query",
 *           "name": "enrollment",
 *           "schema": {
 *             "type": "integer"
 *           }
 *         },
 *         {
 *           "in": "query",
 *           "name": "unit",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "in": "query",
 *           "name": "rank",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "in": "query",
 *           "name": "page",
 *           "schema": {
 *             "type": "integer"
 *           }
 *         },
 *         {
 *           "in": "query",
 *           "name": "limit",
 *           "schema": {
 *             "type": "integer"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "Profile[] + pagination"
 *         }
 *       }
 *     }
 *   },
 *   "/classes/{id}/students/batch": {
 *     "post": {
 *       "tags": [
 *         "Classes"
 *       ],
 *       "summary": "Thêm học viên vào lớp hàng loạt theo mã học viên",
 *       "parameters": [
 *         {
 *           "in": "path",
 *           "name": "id",
 *           "required": true,
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Mã lớp"
 *         }
 *       ],
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "studentCodes"
 *               ],
 *               "properties": {
 *                 "studentCodes": {
 *                   "type": "array",
 *                   "items": {
 *                     "type": "string"
 *                   },
 *                   "example": [
 *                     "HV001",
 *                     "HV002"
 *                   ]
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "200": {
 *           "description": "classId, updated, studentCount, studentCodes"
 *         }
 *       }
 *     }
 *   },
 *   "/classes/{id}/students/{userId}": {
 *     "delete": {
 *       "tags": [
 *         "Classes"
 *       ],
 *       "summary": "Bỏ một học viên khỏi lớp",
 *       "parameters": [
 *         {
 *           "in": "path",
 *           "name": "id",
 *           "required": true,
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Mã lớp"
 *         },
 *         {
 *           "in": "path",
 *           "name": "userId",
 *           "required": true,
 *           "schema": {
 *             "type": "string",
 *             "format": "uuid"
 *           },
 *           "description": "userId của học viên"
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "classId, userId, updated, studentCount"
 *         }
 *       }
 *     }
 *   },
 *   "/classes/{id}": {
 *     "get": {
 *       "tags": [
 *         "Classes"
 *       ],
 *       "summary": "Chi tiết lớp",
 *       "parameters": [
 *         {
 *           "in": "path",
 *           "name": "id",
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
 *         "Classes"
 *       ],
 *       "summary": "Cập nhật lớp",
 *       "parameters": [
 *         {
 *           "in": "path",
 *           "name": "id",
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
 *               "type": "object",
 *               "properties": {
 *                 "className": {
 *                   "type": "string"
 *                 },
 *                 "studentCount": {
 *                   "type": "integer"
 *                 },
 *                 "educationLevelId": {
 *                   "type": "string"
 *                 }
 *               }
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
 *         "Classes"
 *       ],
 *       "summary": "Xóa lớp",
 *       "parameters": [
 *         {
 *           "in": "path",
 *           "name": "id",
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

router.post('/', requireAdmin, controller.create);
router.get('/', controller.getAll);
router.post('/:id/students/batch', requireAdmin, controller.assignStudentsBatch);
router.post('/:id/students', requireAdmin, controller.assignStudents);
router.delete('/:id/students', requireAdmin, controller.removeStudents);
router.delete('/:id/students/:userId', requireAdmin, controller.removeStudent);
router.get('/:id/students', controller.getStudents);
router.get('/:id', controller.getDetail);
router.put('/:id', requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.delete);

module.exports = router;
