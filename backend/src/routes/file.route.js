const router = require('express').Router();
const controller = require('../controllers/file.controller');

/**
 * @swagger
 * {
 *   "/files/{bucket}/*": {
 *     "get": {
 *       "tags": [
 *         "Resources"
 *       ],
 *       "summary": "Tải file đã lưu trong MinIO",
 *       "parameters": [
 *         {
 *           "name": "bucket",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "*",
 *           "in": "path",
 *           "required": true,
 *           "schema": {
 *             "type": "string"
 *           },
 *           "description": "Đường dẫn object trong MinIO, ví dụ avatars/user-id/file.webp"
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "File stream"
 *         }
 *       }
 *     }
 *   }
 * }
 */

router.get('/:bucket/*', controller.getFile);

module.exports = router;
