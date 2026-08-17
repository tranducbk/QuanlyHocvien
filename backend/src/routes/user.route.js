const router = require('express').Router();
const controller = require('../controllers/user.controller');
const { authMiddleware, requireRole, requireStudent, requireAdmin } = require('../middlewares/auth.middleware');
const { uploadExcel, uploadImage } = require('../middlewares/upload.middleware');

/**
 * @swagger
 * {
 *   "/users/academic-results": {
 *     "get": {
 *       "tags": [
 *         "Profile"
 *       ],
 *       "summary": "HV-03: Xem kết quả học tập",
 *       "description": "Có phân trang. KQHT theo năm học, kèm semester→subject. Filter: ?page=&limit=&schoolYear=",
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
 *         },
 *         {
 *           "name": "fetchAll",
 *           "in": "query",
 *           "schema": {
 *             "type": "boolean"
 *           }
 *         },
 *         {
 *           "name": "schoolYear",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "example": "2024-2025"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "YearlyResult[] + pagination"
 *         }
 *       }
 *     }
 *   },
 *   "/users/time-table": {
 *     "get": {
 *       "tags": [
 *         "Profile"
 *       ],
 *       "summary": "HV-06: Học viên xem lịch học",
 *       "description": "Có phân trang. Filter: ?page=&limit=&semesterId=&semester=&schoolYear=",
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
 *         },
 *         {
 *           "name": "semesterId",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
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
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "TimeTable[] + pagination"
 *         }
 *       }
 *     },
 *     "post": {
 *       "tags": [
 *         "Profile"
 *       ],
 *       "summary": "HV-06: Học viên không được nhập lịch học",
 *       "responses": {
 *         "403": {
 *           "description": "Chỉ chỉ huy mới được nhập và cập nhật lịch học"
 *         }
 *       }
 *     }
 *   },
 *   "/users/time-table-semesters": {
 *     "get": {
 *       "tags": [
 *         "Profile"
 *       ],
 *       "summary": "List semesters that have a timetable for the current student",
 *       "responses": {
 *         "200": {
 *           "description": "Semester[]"
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/403"
 *         }
 *       }
 *     }
 *   },
 *   "/users/time-table/{id}": {
 *     "put": {
 *       "tags": [
 *         "Profile"
 *       ],
 *       "summary": "HV-06: Học viên không được sửa lịch học",
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
 *         "403": {
 *           "description": "Chỉ chỉ huy mới được nhập và cập nhật lịch học"
 *         }
 *       }
 *     },
 *     "delete": {
 *       "tags": [
 *         "Profile"
 *       ],
 *       "summary": "HV-06: Học viên không được xóa lịch học",
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
 *         "403": {
 *           "description": "Chỉ chỉ huy mới được nhập và cập nhật lịch học"
 *         }
 *       }
 *     }
 *   },
 *   "/users/cut-rice": {
 *     "get": {
 *       "tags": [
 *         "Cut Rice"
 *       ],
 *       "summary": "HV-07: Xem lịch cắt cơm",
 *       "responses": {
 *         "200": {
 *           "description": "OK"
 *         }
 *       }
 *     },
 *     "put": {
 *       "tags": [
 *         "Cut Rice"
 *       ],
 *       "summary": "HV-07: Cập nhật lịch cắt cơm",
 *       "requestBody": {
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "properties": {
 *                 "weekly": {
 *                   "type": "object"
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
 *   "/users/achievements": {
 *     "get": {
 *       "tags": [
 *         "Profile"
 *       ],
 *       "summary": "HV-08: Xem thành tích",
 *       "description": "Có phân trang cho achievements và yearlyAchievements. Filter: ?page=&limit=",
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
 *           "description": "{ achievements, achievementsPagination, profile, yearlyAchievements, yearlyAchievementsPagination }"
 *         }
 *       }
 *     }
 *   },
 *   "/users/tuition-fees": {
 *     "get": {
 *       "tags": [
 *         "Profile"
 *       ],
 *       "summary": "HV-08: Xem học phí",
 *       "description": "Có phân trang. Filter: ?page=&limit=&semesterId=&semester=&schoolYear=&status=",
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
 *         },
 *         {
 *           "name": "semesterId",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
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
 *           "name": "status",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "PAID",
 *               "UNPAID"
 *             ]
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "TuitionFee[] + pagination"
 *         }
 *       }
 *     }
 *   },
 *   "/users/profile": {
 *     "get": {
 *       "tags": [
 *         "Profile"
 *       ],
 *       "summary": "HV-02: Xem hồ sơ cá nhân",
 *       "description": "STUDENT/COMMANDER role.",
 *       "responses": {
 *         "200": {
 *           "description": "Profile"
 *         }
 *       }
 *     },
 *     "put": {
 *       "tags": [
 *         "Profile"
 *       ],
 *       "summary": "HV-02: Cập nhật hồ sơ cá nhân",
 *       "description": "Cập nhật mọi field của Profile.",
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
 *   "/users/avatar": {
 *     "post": {
 *       "tags": [
 *         "Profile"
 *       ],
 *       "summary": "HV-02: Upload avatar",
 *       "requestBody": {
 *         "content": {
 *           "multipart/form-data": {
 *             "schema": {
 *               "type": "object",
 *               "properties": {
 *                 "avatar": {
 *                   "type": "string",
 *                   "format": "binary"
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
 *   "/users/profiles/export": {
 *     "get": {
 *       "tags": [
 *         "Profiles"
 *       ],
 *       "summary": "CH-03: Xuất Excel danh sách hồ sơ",
 *       "parameters": [
 *         {
 *           "name": "fields",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "unit",
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
 *           "name": "code",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "File Excel (.xlsx)"
 *         }
 *       }
 *     }
 *   },
 *   "/users/profiles/graduation/batch": {
 *     "post": {
 *       "tags": [
 *         "Profiles"
 *       ],
 *       "summary": "COMMANDER: Xác nhận học viên ra trường hàng loạt",
 *       "description": "Có thể truyền studentCodes kèm graduationDate chung, hoặc students nếu mỗi học viên có ngày ra trường riêng.",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "properties": {
 *                 "graduationDate": {
 *                   "type": "string",
 *                   "format": "date",
 *                   "example": "2026-06-01"
 *                 },
 *                 "studentCodes": {
 *                   "type": "array",
 *                   "items": {
 *                     "type": "string"
 *                   },
 *                   "example": [
 *                     "HV001",
 *                     "HV002"
 *                   ]
 *                 },
 *                 "students": {
 *                   "type": "array",
 *                   "items": {
 *                     "type": "object",
 *                     "required": [
 *                       "code",
 *                       "graduationDate"
 *                     ],
 *                     "properties": {
 *                       "code": {
 *                         "type": "string",
 *                         "example": "HV001"
 *                       },
 *                       "graduationDate": {
 *                         "type": "string",
 *                         "format": "date",
 *                         "example": "2026-06-01"
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
 *           "description": "Batch result"
 *         }
 *       }
 *     }
 *   },
 *   "/users/profiles": {
 *     "get": {
 *       "tags": [
 *         "Profiles"
 *       ],
 *       "summary": "CH-03: Danh sách hồ sơ",
 *       "description": "Filter: ?code=&fullName=&gender=&unit=&rank=&classId=&organizationId=&universityId=",
 *       "parameters": [
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
 *           "name": "unit",
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
 *           "description": "Profile[]"
 *         }
 *       }
 *     }
 *   },
 *   "/users/profiles/{id}": {
 *     "get": {
 *       "tags": [
 *         "Profiles"
 *       ],
 *       "summary": "CH-03: Chi tiết hồ sơ",
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
 *         "Profiles"
 *       ],
 *       "summary": "CH-03: Cập nhật hồ sơ",
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
 *         "Profiles"
 *       ],
 *       "summary": "ADMIN: Xóa hồ sơ",
 *       "description": "**Admin only.**",
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
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/403"
 *         }
 *       }
 *     }
 *   },
 *   "/users/cut-rice/generate/{userId}": {
 *     "post": {
 *       "tags": [
 *         "Cut Rice"
 *       ],
 *       "summary": "CH-06: Tạo lịch cắt cơm cho 1 user",
 *       "parameters": [
 *         {
 *           "name": "userId",
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
 *   "/users/cut-rice/generate-all": {
 *     "post": {
 *       "tags": [
 *         "Cut Rice"
 *       ],
 *       "summary": "CH-06: Tạo lịch cắt cơm cho TẤT CẢ",
 *       "responses": {
 *         "200": {
 *           "description": "{success, skipped}"
 *         }
 *       }
 *     }
 *   },
 *   "/users/reports/academic": {
 *     "get": {
 *       "tags": [
 *         "Reports"
 *       ],
 *       "summary": "CH-09: Báo cáo KQHT",
 *       "parameters": [
 *         {
 *           "name": "schoolYear",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "{detail, summary}"
 *         }
 *       }
 *     }
 *   },
 *   "/users/reports/party-training": {
 *     "get": {
 *       "tags": [
 *         "Reports"
 *       ],
 *       "summary": "CH-09: Báo cáo Xếp loại Đảng/Rèn luyện",
 *       "parameters": [
 *         {
 *           "name": "schoolYear",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "{detail, partySummary, trainingSummary}"
 *         }
 *       }
 *     }
 *   },
 *   "/users/reports/achievements": {
 *     "get": {
 *       "tags": [
 *         "Reports"
 *       ],
 *       "summary": "CH-09: Báo cáo Thành tích",
 *       "responses": {
 *         "200": {
 *           "description": "{achievements, yearlyAchievements, summary}"
 *         }
 *       }
 *     }
 *   },
 *   "/users/reports/tuition": {
 *     "get": {
 *       "tags": [
 *         "Reports"
 *       ],
 *       "summary": "CH-09: Báo cáo Học phí",
 *       "parameters": [
 *         {
 *           "name": "schoolYear",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "semester",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "{detail, summary}"
 *         }
 *       }
 *     }
 *   },
 *   "/users/batch-profiles": {
 *     "put": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "Cập nhật hàng loạt profile theo mã code",
 *       "description": "**Admin + Commander.** Cập nhật thông tin hồ sơ hàng loạt dựa trên mã code.",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "array",
 *               "items": {
 *                 "type": "object",
 *                 "required": [
 *                   "code"
 *                 ],
 *                 "properties": {
 *                   "code": {
 *                     "type": "string",
 *                     "description": "Mã HV/CH để xác định hồ sơ"
 *                   },
 *                   "fullName": {
 *                     "type": "string"
 *                   },
 *                   "email": {
 *                     "type": "string"
 *                   },
 *                   "phoneNumber": {
 *                     "type": "string"
 *                   },
 *                   "gender": {
 *                     "type": "string"
 *                   },
 *                   "birthday": {
 *                     "type": "string",
 *                     "format": "date"
 *                   },
 *                   "hometown": {
 *                     "type": "string"
 *                   },
 *                   "ethnicity": {
 *                     "type": "string"
 *                   },
 *                   "religion": {
 *                     "type": "string"
 *                   },
 *                   "currentAddress": {
 *                     "type": "string"
 *                   },
 *                   "placeOfBirth": {
 *                     "type": "string"
 *                   },
 *                   "cccd": {
 *                     "type": "string"
 *                   },
 *                   "partyMemberCardNumber": {
 *                     "type": "string"
 *                   },
 *                   "unit": {
 *                     "type": "string"
 *                   },
 *                   "rank": {
 *                     "type": "string"
 *                   },
 *                   "positionGovernment": {
 *                     "type": "string"
 *                   },
 *                   "positionParty": {
 *                     "type": "string"
 *                   },
 *                   "fullPartyMember": {
 *                     "type": "string",
 *                     "format": "date"
 *                   },
 *                   "probationaryPartyMember": {
 *                     "type": "string",
 *                     "format": "date"
 *                   },
 *                   "dateOfEnlistment": {
 *                     "type": "string",
 *                     "format": "date"
 *                   },
 *                   "enrollment": {
 *                     "type": "integer"
 *                   },
 *                   "graduationDate": {
 *                     "type": "string",
 *                     "format": "date"
 *                   },
 *                   "currentCpa4": {
 *                     "type": "number"
 *                   },
 *                   "currentCpa10": {
 *                     "type": "number"
 *                   },
 *                   "classId": {
 *                     "type": "string",
 *                     "format": "uuid"
 *                   },
 *                   "organizationId": {
 *                     "type": "string",
 *                     "format": "uuid"
 *                   },
 *                   "universityId": {
 *                     "type": "string",
 *                     "format": "uuid"
 *                   },
 *                   "educationLevelId": {
 *                     "type": "string",
 *                     "format": "uuid"
 *                   }
 *                 }
 *               }
 *             },
 *             "example": [
 *               {
 *                 "code": "HV001",
 *                 "phoneNumber": "0987654321",
 *                 "currentAddress": "123 Đường Mới"
 *               },
 *               {
 *                 "code": "HV002",
 *                 "email": "updated@example.com",
 *                 "rank": "Thượng sĩ"
 *               }
 *             ]
 *           },
 *           "multipart/form-data": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "file"
 *               ],
 *               "properties": {
 *                 "file": {
 *                   "type": "string",
 *                   "format": "binary",
 *                   "description": "File Excel .xlsx/.xls theo mẫu cập nhật học viên"
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "200": {
 *           "description": "[{ code, status }]"
 *         },
 *         "400": {
 *           "$ref": "#/components/responses/400"
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
 *   "/users/batch-profiles/template": {
 *     "get": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "Tải file mẫu cập nhật học viên hàng loạt",
 *       "responses": {
 *         "200": {
 *           "description": "Excel template",
 *           "content": {
 *             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
 *               "schema": {
 *                 "type": "string",
 *                 "format": "binary"
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "/users": {
 *     "get": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "CH-01: Danh sách tài khoản",
 *       "parameters": [
 *         {
 *           "name": "username",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "role",
 *           "in": "query",
 *           "schema": {
 *             "type": "string",
 *             "enum": [
 *               "STUDENT",
 *               "COMMANDER",
 *               "ADMIN"
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
 *           "description": "User[] + Profile (nested University/Class/Org/EduLevel)"
 *         }
 *       }
 *     },
 *     "post": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "ADMIN: Tạo tài khoản + tự động tạo Profile",
 *       "description": "**Admin only.** Nếu role=STUDENT/COMMANDER và có fullName → tự tạo Profile. code tự sinh nếu không cung cấp.",
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
 *                   "type": "string"
 *                 },
 *                 "classId": {
 *                   "type": "string"
 *                 },
 *                 "organizationId": {
 *                   "type": "string"
 *                 },
 *                 "universityId": {
 *                   "type": "string"
 *                 },
 *                 "educationLevelId": {
 *                   "type": "string"
 *                 },
 *                 "phoneNumber": {
 *                   "type": "string"
 *                 },
 *                 "unit": {
 *                   "type": "string"
 *                 },
 *                 "rank": {
 *                   "type": "string"
 *                 },
 *                 "enrollment": {
 *                   "type": "integer"
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
 *   "/users/export": {
 *     "get": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "ADMIN: Xuất Excel danh sách tài khoản",
 *       "parameters": [
 *         {
 *           "name": "username",
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
 *           "name": "code",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "role",
 *           "in": "query",
 *           "schema": {
 *             "type": "string"
 *           }
 *         },
 *         {
 *           "name": "isActive",
 *           "in": "query",
 *           "schema": {
 *             "type": "boolean"
 *           }
 *         }
 *       ],
 *       "responses": {
 *         "200": {
 *           "description": "File Excel danh sách tài khoản",
 *           "content": {
 *             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
 *               "schema": {
 *                 "type": "string",
 *                 "format": "binary"
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "/users/{id}": {
 *     "get": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "Chi tiết tài khoản (kèm Profile + nested)",
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
 *         "Users"
 *       ],
 *       "summary": "Cập nhật tài khoản + Profile",
 *       "description": "**Admin + Commander (chỉ STUDENT).** Commander không thể sửa ADMIN/COMMANDER.",
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
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/403"
 *         }
 *       }
 *     },
 *     "delete": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "ADMIN: Xóa tài khoản (soft delete)",
 *       "description": "**Admin only.**",
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
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/403"
 *         }
 *       }
 *     }
 *   },
 *   "/users/batch": {
 *     "post": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "ADMIN: Tạo hàng loạt",
 *       "description": "**Admin only.** Mỗi user có thể kèm fullName/email để tự tạo Profile.",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "properties": {
 *                 "users": {
 *                   "type": "array",
 *                   "items": {
 *                     "type": "object",
 *                     "properties": {
 *                       "username": {
 *                         "type": "string"
 *                       },
 *                       "password": {
 *                         "type": "string"
 *                       },
 *                       "role": {
 *                         "type": "string"
 *                       },
 *                       "fullName": {
 *                         "type": "string"
 *                       },
 *                       "email": {
 *                         "type": "string"
 *                       },
 *                       "code": {
 *                         "type": "string"
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
 *           "description": "Created [{username, status}]"
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/403"
 *         }
 *       }
 *     }
 *   },
 *   "/users/batch-users": {
 *     "post": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "ADMIN: Tạo hàng loạt user + profile",
 *       "description": "**Admin only.** Tạo danh sách tài khoản kèm hồ sơ học viên.",
 *       "requestBody": {
 *         "required": true,
 *         "content": {
 *           "application/json": {
 *             "schema": {
 *               "type": "object",
 *               "required": [
 *                 "users"
 *               ],
 *               "properties": {
 *                 "users": {
 *                   "type": "array",
 *                   "items": {
 *                     "type": "object",
 *                     "required": [
 *                       "username"
 *                     ],
 *                     "properties": {
 *                       "username": {
 *                         "type": "string",
 *                         "description": "Tên đăng nhập"
 *                       },
 *                       "password": {
 *                         "type": "string",
 *                         "description": "Mật khẩu (mặc định 123456)"
 *                       },
 *                       "role": {
 *                         "type": "string",
 *                         "enum": [
 *                           "STUDENT",
 *                           "COMMANDER",
 *                           "ADMIN"
 *                         ],
 *                         "default": "STUDENT"
 *                       },
 *                       "fullName": {
 *                         "type": "string",
 *                         "description": "Họ tên"
 *                       },
 *                       "email": {
 *                         "type": "string"
 *                       },
 *                       "code": {
 *                         "type": "string",
 *                         "description": "Mã HV/CH (tự sinh nếu không cung cấp)"
 *                       },
 *                       "phoneNumber": {
 *                         "type": "string"
 *                       },
 *                       "gender": {
 *                         "type": "string"
 *                       },
 *                       "birthday": {
 *                         "type": "string",
 *                         "format": "date"
 *                       },
 *                       "hometown": {
 *                         "type": "string"
 *                       },
 *                       "enrollment": {
 *                         "type": "integer"
 *                       },
 *                       "classId": {
 *                         "type": "string",
 *                         "format": "uuid"
 *                       },
 *                       "organizationId": {
 *                         "type": "string",
 *                         "format": "uuid"
 *                       },
 *                       "universityId": {
 *                         "type": "string",
 *                         "format": "uuid"
 *                       },
 *                       "educationLevelId": {
 *                         "type": "string",
 *                         "format": "uuid"
 *                       }
 *                     }
 *                   }
 *                 }
 *               }
 *             },
 *             "example": {
 *               "users": [
 *                 {
 *                   "username": "hv001",
 *                   "password": "123456",
 *                   "role": "STUDENT",
 *                   "fullName": "Nguyễn Văn A",
 *                   "email": "a@example.com",
 *                   "code": "HV001",
 *                   "phoneNumber": "0123456789",
 *                   "gender": "Nam",
 *                   "birthday": "2000-01-01",
 *                   "hometown": "Hà Nội",
 *                   "enrollment": 2024
 *                 }
 *               ]
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "201": {
 *           "description": "[{ id, username, profileId, status }]"
 *         },
 *         "400": {
 *           "$ref": "#/components/responses/400"
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
 *   "/users/import-template": {
 *     "get": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "ADMIN: Tải file mẫu nhập tài khoản",
 *       "responses": {
 *         "200": {
 *           "description": "Excel template",
 *           "content": {
 *             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
 *               "schema": {
 *                 "type": "string",
 *                 "format": "binary"
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "/users/import": {
 *     "post": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "ADMIN: Tạo tài khoản từ file Excel",
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
 *                   "format": "binary",
 *                   "description": "File Excel .xlsx/.xls theo mẫu"
 *                 }
 *               }
 *             }
 *           }
 *         }
 *       },
 *       "responses": {
 *         "201": {
 *           "description": "[{ id, username, profileId, status }]"
 *         }
 *       }
 *     }
 *   },
 *   "/users/{id}/reset-password": {
 *     "post": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "ADMIN: Reset mật khẩu",
 *       "description": "**Admin only.** Commander không thể reset password của ADMIN/COMMANDER.",
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
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/403"
 *         }
 *       }
 *     }
 *   },
 *   "/users/{id}/toggle-active": {
 *     "post": {
 *       "tags": [
 *         "Users"
 *       ],
 *       "summary": "ADMIN: Khóa/Mở khóa",
 *       "description": "**Admin only.** Commander không thể toggle ADMIN/COMMANDER.",
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
 *         },
 *         "403": {
 *           "$ref": "#/components/responses/403"
 *         }
 *       }
 *     }
 *   }
 * }
 */

router.use(authMiddleware);

// ===================== Student: Học tập =====================
router.get('/academic-results', requireStudent, controller.getAcademicResults);

// ===================== Student: Thời khóa biểu =====================
router.get('/time-table', requireStudent, controller.getMyTimeTable);
router.get('/time-table-semesters', requireStudent, controller.getMyTimeTableSemesters);
router.post('/time-table', requireStudent, controller.denyMyTimeTableMutation);
router.put('/time-table/:id', requireStudent, controller.denyMyTimeTableMutation);
router.delete('/time-table/:id', requireStudent, controller.denyMyTimeTableMutation);

// ===================== Student: Cắt cơm =====================
router.get('/cut-rice', requireStudent, controller.getMyCutRice);
router.put('/cut-rice', requireStudent, controller.updateMyCutRice);
router.get('/cut-rice/requests', requireStudent, controller.getMyCutRiceRequests);
router.post('/cut-rice/requests', requireStudent, controller.createMyCutRiceRequest);

// ===================== Student: Thành tích & Học phí =====================
router.get('/achievements', requireStudent, controller.getMyAchievements);
router.get('/tuition-fees', requireStudent, controller.getMyTuitionFees);

// ===================== Profile (cá nhân) =====================
router.get('/profile', requireRole('STUDENT', 'COMMANDER'), controller.getMyProfile);
router.put('/profile', requireRole('STUDENT', 'COMMANDER'), controller.updateMyProfile);
router.post('/avatar', requireRole('STUDENT', 'COMMANDER'), uploadImage('avatar'), controller.uploadAvatar);

// ===================== Admin/Commander: Quản lý hồ sơ =====================
router.use(requireRole('ADMIN', 'COMMANDER'));

router.get('/profiles/export', controller.exportProfiles);
router.post('/profiles/graduation/batch', controller.graduateBatchProfiles);
router.get('/profiles', controller.getAllProfiles);
router.get('/profiles/:id', controller.getProfileDetail);
router.put('/profiles/:id', controller.updateProfile);
router.delete('/profiles/:id', requireAdmin, controller.deleteProfile);

// ===================== Commander: Cắt cơm hàng loạt =====================
router.post('/cut-rice/generate/:userId', controller.generateCutRice);
router.post('/cut-rice/generate-all', controller.generateAllCutRice);

// ===================== Commander: Báo cáo =====================
router.get('/reports/academic', controller.getAcademicReport);
router.get('/reports/party-training', controller.getPartyTrainingReport);
router.get('/reports/achievements', controller.getAchievementReport);
router.get('/reports/tuition', controller.getTuitionReport);

// ===================== Admin/Commander: User CRUD (read + update) =====================
router.get('/batch-profiles/template', controller.downloadBatchProfilesTemplate);
router.put('/batch-profiles', uploadExcel('file'), controller.updateBatchProfiles);
router.get('/import-template', requireAdmin, controller.downloadImportTemplate);
router.post('/import', requireAdmin, uploadExcel('file'), controller.importUsers);
router.get('/export', requireAdmin, controller.exportUsers);
router.get('/', controller.getAll);
router.get('/:id', controller.getDetail);
router.put('/:id', controller.update);

// ===================== Admin only =====================
router.use(requireAdmin);

router.post('/', controller.create);
router.post('/batch', controller.createBatchUsers);
router.post('/batch-users', controller.createBatchUsersProfiles);
router.post('/:id/reset-password', controller.resetPassword);
router.post('/:id/toggle-active', controller.toggleActive);
router.delete('/:id', controller.delete);

module.exports = router;
