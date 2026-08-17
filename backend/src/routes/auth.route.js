const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * {
 *   "/auth/login": {
 *     "post": {
 *       "tags": [
 *         "Auth"
 *       ],
 *       "summary": "HV-01: Đăng nhập",
 *       "security": [],
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "username",
 *                 "password"
 *               ],
 *               "properties": {
 *                 "username": {
 *                   "type": "string",
 *                   "example": "hv001"
 *                 },
 *                 "password": {
 *                   "type": "string",
 *                   "example": "hocvien123"
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "200": {
 *           "description": "accessToken + refreshToken + user"
 *         }
 *       }
 *     }
 *   },
 *   "/auth/me": {
 *     "get": {
 *       "tags": [
 *         "Auth"
 *       ],
 *       "summary": "HV-01: Thông tin người dùng hiện tại",
 *       "description": "User kèm Profile + nested University, Class, Organization, EducationLevel.",
 *       "responses": {
 *         "200": {
 *           "description": "OK"
 *         }
 *       }
 *     }
 *   },
 *   "/auth/profile": {
 *     "get": {
 *       "tags": [
 *         "Auth",
 *         "Profile"
 *       ],
 *       "summary": "HV-02: Xem hồ sơ cá nhân",
 *       "responses": {
 *         "200": {
 *           "description": "OK"
 *         }
 *       }
 *     },
 *     "put": {
 *       "tags": [
 *         "Auth",
 *         "Profile"
 *       ],
 *       "summary": "HV-02: Cập nhật hồ sơ cá nhân",
 *       "description": "Tất cả role đều có quyền. Cập nhật mọi field của Profile (trừ code).",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "$ref": "#/components/schemas/Profile"
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
 *   "/auth/register": {
 *     "post": {
 *       "tags": [
 *         "Auth"
 *       ],
 *       "summary": "ADMIN: Đăng ký tài khoản mới",
 *       "description": "**Admin only.** Tạo tài khoản STUDENT/COMMANDER/ADMIN.",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "username",
 *                 "password"
 *               ],
 *               "properties": {
 *                 "username": {
 *                   "type": "string"
 *                 },
 *                 "password": {
 *                   "type": "string",
 *                   "minLength": 6
 *                 },
 *                 "role": {
 *                   "type": "string",
 *                   "enum": [
 *                     "STUDENT",
 *                     "COMMANDER",
 *                     "ADMIN"
 *                   ]
 *                 },
 *                 "fullName": {
 *                   "type": "string"
 *                 },
 *                 "email": {
 *                   "type": "string"
 *                 },
 *                 "code": {
 *                   "type": "string",
 *                   "description": "Mã HV/CH"
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "201": {
 *           "description": "Created"
 *         },
 *         "401": {
 *           "$ref": "#/components/responses/401"
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/403"
 *         }
 *       }
 *     }
 *   },
 *   "/auth/refresh-token": {
 *     "post": {
 *       "tags": [
 *         "Auth"
 *       ],
 *       "summary": "HV-01: Làm mới token",
 *       "security": [],
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "refreshToken"
 *               ],
 *               "properties": {
 *                 "refreshToken": {
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
 *   "/auth/change-password": {
 *     "post": {
 *       "tags": [
 *         "Auth"
 *       ],
 *       "summary": "HV-01: Đổi mật khẩu",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "oldPassword",
 *                 "newPassword"
 *               ],
 *               "properties": {
 *                 "oldPassword": {
 *                   "type": "string"
 *                 },
 *                 "newPassword": {
 *                   "type": "string",
 *                   "minLength": 6
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
 *   "/auth/notifications": {
 *     "get": {
 *       "tags": [
 *         "Notifications"
 *       ],
 *       "summary": "HV-09: Danh sách thông báo",
 *       "parameters": [
 *         {
 *           "name": "type",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "GRADE",
 *               "CUT_RICE",
 *               "ACHIEVEMENT",
 *               "TUITION",
 *               "GENERAL"
 *             ]
 *           }
 *         },
 *         {
 *           "name": "isRead",
 *           "in": "query",
 *           "schema": {
 *             "type": "boolean"
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
 *   "/auth/notifications/{id}": {
 *     "get": {
 *       "tags": [
 *         "Notifications"
 *       ],
 *       "summary": "HV-09: Chi tiết thông báo (tự động đánh dấu đọc)",
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
 *         "Notifications"
 *       ],
 *       "summary": "HV-09: Xóa thông báo",
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
 *   "/auth/notifications/{id}/read": {
 *     "put": {
 *       "tags": [
 *         "Notifications"
 *       ],
 *       "summary": "HV-09: Đánh dấu 1 thông báo đã đọc",
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
 *   "/auth/notifications/read-all": {
 *     "put": {
 *       "tags": [
 *         "Notifications"
 *       ],
 *       "summary": "HV-09: Đánh dấu tất cả đã đọc",
 *       "responses": {
 *         "200": {
 *           "description": "OK"
 *         }
 *       }
 *     }
 *   }
 * }
 */

router.post('/login', ctrl.login);
router.get('/me', authMiddleware, ctrl.me);
router.get('/profile', authMiddleware, ctrl.me);
router.put('/profile', authMiddleware, ctrl.updateProfile);
router.post('/register', authMiddleware, requireAdmin, ctrl.register);
router.post('/refresh-token', ctrl.refreshToken);
router.post('/change-password', authMiddleware, ctrl.changePassword);

// Notifications (dùng chung cho mọi role)
router.get('/notifications', authMiddleware, ctrl.getMyNotifications);
router.get('/notifications/:id', authMiddleware, ctrl.getMyNotificationDetail);
router.put('/notifications/:id/read', authMiddleware, ctrl.markNotificationRead);
router.put('/notifications/read-all', authMiddleware, ctrl.markAllNotificationsRead);
router.delete('/notifications/:id', authMiddleware, ctrl.deleteMyNotification);

module.exports = router;
