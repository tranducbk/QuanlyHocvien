const router = require('express').Router();
const controller = require('../../controllers/training-program/university.controller.js');
const { authMiddleware, requireRole, requireTrainingSystem } = require('../../middlewares/auth.middleware.js');

/**
 * @swagger
 * {
 *   "/universities/hierarchy": {
 *     "get": {
 *       "tags": [
 *         "Universities"
 *       ],
 *       "summary": "CH-02: Cây phân cấp (Uni → Org → EduLevel → Class)",
 *       "responses": {
 *         "200": {
 *           "description": "OK"
 *         }
 *       }
 *     }
 *   },
 *   "/universities": {
 *     "post": {
 *       "tags": [
 *         "Universities"
 *       ],
 *       "summary": "Thêm trường",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "properties": {
 *                 "universityCode": {
 *                   "type": "string"
 *                 },
 *                 "universityName": {
 *                   "type": "string"
 *                 },
 *                 "status": {
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
 *         "Universities"
 *       ],
 *       "summary": "Danh sách trường",
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
 *   "/universities/{id}": {
 *     "get": {
 *       "tags": [
 *         "Universities"
 *       ],
 *       "summary": "Chi tiết trường",
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
 *         "Universities"
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
 *         "Universities"
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
router.use(requireRole('COMMANDER'));
router.use(requireTrainingSystem('HE_5'));

router.get('/hierarchy', controller.getHierarchy);
/**
 * @swagger
 * /universities/{id}/available-students:
 *   get:
 *     summary: Tìm học viên Hệ 5 chưa có trường
 *     tags: [Universities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Danh sách học viên chưa có trường }
 * /universities/{id}/students:
 *   post:
 *     summary: Thêm học viên Hệ 5 chưa có trường vào trường
 *     tags: [Universities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileIds]
 *             properties:
 *               profileIds:
 *                 type: array
 *                 items: { type: string, format: uuid }
 *     responses:
 *       200: { description: Đã thêm học viên }
 */
router.get('/:id/available-students', controller.availableStudents);
router.post('/:id/students', controller.addStudents);
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getDetail);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
