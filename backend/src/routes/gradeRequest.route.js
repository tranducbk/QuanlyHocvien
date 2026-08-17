const router = require('express').Router();
const { authMiddleware, requireRole, requireStudent } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/gradeRequest.controller');

/**
 * @swagger
 * {
 *   "/students/grade-requests": {
 *     "post": {
 *       "tags": [
 *         "Grade Requests"
 *       ],
 *       "summary": "HV-04: Tạo đề xuất",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "subjectResultId",
 *                 "requestType",
 *                 "reason"
 *               ],
 *               "properties": {
 *                 "subjectResultId": {
 *                   "type": "string"
 *                 },
 *                 "requestType": {
 *                   "type": "string",
 *                   "enum": [
 *                     "ADD",
 *                     "UPDATE",
 *                     "DELETE"
 *                   ]
 *                 },
 *                 "reason": {
 *                   "type": "string"
 *                 },
 *                 "proposedLetterGrade": {
 *                   "type": "string"
 *                 },
 *                 "proposedGradePoint4": {
 *                   "type": "number"
 *                 },
 *                 "proposedGradePoint10": {
 *                   "type": "number"
 *                 },
 *                 "attachmentUrl": {
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
 *         "Grade Requests"
 *       ],
 *       "summary": "HV-05: Danh sách đề xuất của tôi (phân trang)",
 *       "parameters": [
 *         {
 *           "name": "status",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "PENDING",
 *               "APPROVED",
 *               "REJECTED"
 *             ]
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
 *   "/students/grade-requests/{id}": {
 *     "get": {
 *       "tags": [
 *         "Grade Requests"
 *       ],
 *       "summary": "HV-05: Chi tiết đề xuất",
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
 *   },
 *   "/commanders/grade-requests": {
 *     "get": {
 *       "tags": [
 *         "Grade Requests"
 *       ],
 *       "summary": "CH-04: Tất cả đề xuất (phân trang)",
 *       "parameters": [
 *         {
 *           "name": "status",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "PENDING",
 *               "APPROVED",
 *               "REJECTED"
 *             ]
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
 *   "/commanders/grade-requests/{id}": {
 *     "get": {
 *       "tags": [
 *         "Grade Requests"
 *       ],
 *       "summary": "CH-04: Chi tiết đề xuất",
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
 *   },
 *   "/commanders/grade-requests/{id}/approve": {
 *     "post": {
 *       "tags": [
 *         "Grade Requests"
 *       ],
 *       "summary": "CH-04: Phê duyệt",
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
 *               "type": "object",
 *               "properties": {
 *                 "reviewNote": {
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
 *     }
 *   },
 *   "/commanders/grade-requests/{id}/reject": {
 *     "post": {
 *       "tags": [
 *         "Grade Requests"
 *       ],
 *       "summary": "CH-04: Từ chối",
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
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "reviewNote"
 *               ],
 *               "properties": {
 *                 "reviewNote": {
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
 *     }
 *   }
 * }
 */

// ===================== Student (chỉ STUDENT) =====================
const { uploadEvidence } = require('../middlewares/upload.middleware');
router.post('/students/grade-requests', authMiddleware, requireStudent, ctrl.create);
router.post('/students/grade-requests/evidence', authMiddleware, requireStudent, uploadEvidence('file'), ctrl.uploadEvidence);
router.get('/students/grade-requests', authMiddleware, requireStudent, ctrl.getMyRequests);
router.get('/students/grade-requests/:id', authMiddleware, requireStudent, ctrl.getMyRequestDetail);

// ===================== Commander/Admin =====================
router.get('/commanders/grade-requests', authMiddleware, requireRole('ADMIN', 'COMMANDER'), ctrl.getAll);
router.get('/commanders/grade-requests/:id', authMiddleware, requireRole('ADMIN', 'COMMANDER'), ctrl.getDetail);
router.post('/commanders/grade-requests/:id/approve', authMiddleware, requireRole('ADMIN', 'COMMANDER'), ctrl.approve);
router.post('/commanders/grade-requests/:id/reject', authMiddleware, requireRole('ADMIN', 'COMMANDER'), ctrl.reject);

module.exports = router;
