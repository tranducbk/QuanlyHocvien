const router = require('express').Router();
const controller = require('../../controllers/academic-results/semesterResult.controller.js');
const { authMiddleware, requireRole } = require('../../middlewares/auth.middleware.js');

/**
 * @swagger
 * {
 *   "/semester-results": {
 *     "post": {
 *       "tags": [
 *         "Academic Results"
 *       ],
 *       "summary": "Thêm KQ học kỳ",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/SemesterResult"
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
 *       "summary": "Danh sách KQ học kỳ",
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
 *   "/semester-results/{id}": {
 *     "get": {
 *       "tags": [
 *         "Academic Results"
 *       ],
 *       "summary": "Chi tiết KQ học kỳ",
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

module.exports = router;
