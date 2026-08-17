const router = require('express').Router();
const controller = require('../controllers/semester.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/semesters/grade-convert": {
 *     "post": {
 *       "tags": [
 *         "Semesters"
 *       ],
 *       "summary": "CH-11: Chuyển đổi 1 điểm",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "value",
 *                 "from",
 *                 "to"
 *               ],
 *               "properties": {
 *                 "value": {
 *                   "type": "string"
 *                 },
 *                 "from": {
 *                   "type": "string",
 *                   "enum": [
 *                     "10",
 *                     "4",
 *                     "letter"
 *                   ]
 *                 },
 *                 "to": {
 *                   "type": "string",
 *                   "enum": [
 *                     "10",
 *                     "4",
 *                     "letter"
 *                   ]
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
 *     }
 *   },
 *   "/semesters/grade-convert/batch": {
 *     "post": {
 *       "tags": [
 *         "Semesters"
 *       ],
 *       "summary": "CH-11: Chuyển đổi hàng loạt",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "properties": {
 *                 "grades": {
 *                   "type": "array",
 *                   "items": {
 *                     "type": "string"
 *                   }
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
 *     }
 *   },
 *   "/semesters/grade-convert/gpa": {
 *     "post": {
 *       "tags": [
 *         "Semesters"
 *       ],
 *       "summary": "CH-11: Tính GPA",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "properties": {
 *                 "grades": {
 *                   "type": "array",
 *                   "items": {
 *                     "type": "object",
 *                     "properties": {
 *                       "point10": {
 *                         "type": "number"
 *                       },
 *                       "credits": {
 *                         "type": "integer"
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
 *         "200": {
 *           "description": "{gpa4, gpa10, totalCredits}"
 *         }
 *       }
 *     }
 *   },
 *   "/semesters/grade-convert/table": {
 *     "get": {
 *       "tags": [
 *         "Semesters"
 *       ],
 *       "summary": "CH-11: Bảng quy đổi điểm",
 *       "responses": {
 *         "200": {
 *           "description": "OK"
 *         }
 *       }
 *     }
 *   },
 *   "/semesters/school-years": {
 *     "post": {
 *       "tags": [
 *         "Semesters"
 *       ],
 *       "summary": "CH-08: Tạo năm học",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "schoolYear"
 *               ],
 *               "properties": {
 *                 "schoolYear": {
 *                   "type": "string",
 *                   "example": "2024-2025"
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
 *         "Semesters"
 *       ],
 *       "summary": "CH-08: Danh sách năm học",
 *       "parameters": [
 *         {
 *           "name": "schoolYear",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "example": "2024-2025"
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
 *           "description": "SchoolYear[] + pagination"
 *         }
 *       }
 *     }
 *   },
 *   "/semesters/terms": {
 *     "post": {
 *       "tags": [
 *         "Semesters"
 *       ],
 *       "summary": "CH-08: Tạo học kỳ thuộc năm học",
 *       "description": "Tạo học kỳ 1 hoặc 2 sau khi đã tạo năm học.",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "term"
 *               ],
 *               "properties": {
 *                 "schoolYearId": {
 *                   "type": "string",
 *                   "format": "uuid",
 *                   "description": "Ưu tiên dùng id của bảng school_years"
 *                 },
 *                 "schoolYear": {
 *                   "type": "string",
 *                   "example": "2024-2025",
 *                   "description": "Có thể truyền thay schoolYearId để tương thích"
 *                 },
 *                 "term": {
 *                   "type": "integer",
 *                   "enum": [
 *                     1,
 *                     2
 *                   ],
 *                   "example": 1
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
 *     }
 *   },
 *   "/semesters": {
 *     "post": {
 *       "tags": [
 *         "Semesters"
 *       ],
 *       "summary": "CH-08: Thêm học kỳ",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/SemesterInput"
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
 *         "Semesters"
 *       ],
 *       "summary": "CH-08: Danh sách học kỳ",
 *       "parameters": [
 *         {
 *           "name": "code",
 *           "in": "query",
 *           "schema": {
 *             "type": "integer"
 *           }
 *         },
 *         {
 *           "name": "schoolYearId",
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
 *   "/semesters/{id}": {
 *     "get": {
 *       "tags": [
 *         "Semesters"
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
 *         "Semesters"
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
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/SemesterInput"
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
 *         "Semesters"
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

router.post('/grade-convert', controller.convertGrade);

router.post('/grade-convert/batch', controller.convertMultipleGrades);

router.post('/grade-convert/gpa', controller.calculateGpa);

router.get('/grade-convert/table', controller.getGradeTable);

// Năm học -> Học kỳ
router.post('/school-years', controller.createSchoolYear);
router.get('/school-years', controller.getSchoolYears);
router.post('/terms', controller.createTerm);

// CRUD Học kỳ
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getDetail);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
