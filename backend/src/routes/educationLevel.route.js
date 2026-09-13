const router = require('express').Router();
const controller = require('../controllers/educationLevel.controller');
const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/education-levels": {
 *     "post": {
 *       "tags": [
 *         "Education Levels"
 *       ],
 *       "summary": "Thêm",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "properties": {
 *                 "levelName": {
 *                   "type": "string"
 *                 },
 *                 "organizationId": {
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
 *         "Education Levels"
 *       ],
 *       "summary": "Danh sách trình độ",
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
 *   "/education-levels/{id}": {
 *     "get": {
 *       "tags": [
 *         "Education Levels"
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
 *         "Education Levels"
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
 *         "Education Levels"
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

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getDetail);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
