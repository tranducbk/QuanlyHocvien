const router = require('express').Router();
const { authMiddleware, requireRole, requireStudent, requireSystemType } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/gradeRequest.controller');

/**
 * @swagger
 * {
 *   "/students/grade-requests": {
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
router.get('/students/grade-requests', authMiddleware, requireStudent, requireSystemType('EXTERNAL'), ctrl.getMyRequests);
router.get('/students/grade-requests/:id', authMiddleware, requireStudent, requireSystemType('EXTERNAL'), ctrl.getMyRequestDetail);

// ===================== Commander =====================
router.get('/commanders/grade-requests', authMiddleware, requireRole('COMMANDER'), requireSystemType('EXTERNAL'), ctrl.getAll);
router.get('/commanders/grade-requests/:id', authMiddleware, requireRole('COMMANDER'), requireSystemType('EXTERNAL'), ctrl.getDetail);
router.post('/commanders/grade-requests/:id/reject', authMiddleware, requireRole('COMMANDER'), requireSystemType('EXTERNAL'), ctrl.reject);

module.exports = router;
