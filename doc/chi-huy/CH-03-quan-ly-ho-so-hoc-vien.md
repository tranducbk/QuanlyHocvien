# CH-03 - Quản lý hồ sơ học viên

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-03
- **Tên chức năng:** Quản lý hồ sơ học viên

## Mô tả
Thêm mới, chỉnh sửa, xóa và tìm kiếm học viên theo nhiều tiêu chí. Hệ thống tự động tạo tài khoản liên kết và xóa dữ liệu liên quan khi cần.

## Module liên quan
- Student Record Module
- User Module
- Search Module

## Luồng hoạt động chi tiết

### 1. Thêm học viên mới
1. Nhập đầy đủ thông tin cá nhân, thông tin học tập và thông tin quân nhân.
2. Hệ thống tự động tạo tài khoản liên kết với học viên.

### 2. Chỉnh sửa thông tin học viên
1. Cập nhật thông tin của học viên khi có thay đổi.
2. Bao gồm thông tin cá nhân, học tập và quân nhân.

### 3. Xóa học viên
1. Xóa học viên khỏi hệ thống khi cần thiết.
2. Hệ thống tự động xóa các dữ liệu liên quan.

### 4. Tìm kiếm học viên
1. Tìm kiếm theo nhiều tiêu chí: tên, mã học viên, lớp, trường đào tạo, khóa học.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/students` | Token | Xem danh sách học viên (phân trang) |
| 2 | `GET` | `/api/students?fullName=...` | Token | Tìm kiếm học viên theo tên |
| 3 | `GET` | `/api/students?studentId=...` | Token | Tìm kiếm theo mã học viên |
| 4 | `GET` | `/api/students/:id` | Token | Xem chi tiết hồ sơ học viên |
| 5 | `POST` | `/api/students` | Token | Thêm học viên mới (tự động tạo tài khoản) |
| 6 | `PUT` | `/api/students/:id` | Token | Cập nhật thông tin học viên |
| 7 | `DELETE` | `/api/students/:id` | Token | Xóa học viên (tự động xóa dữ liệu liên quan) |

### Luồng nghiệp vụ
```
1. GET  /api/students                    → Xem danh sách
2. GET  /api/students?fullName=Nguyễn    → Tìm kiếm theo tên
3. POST /api/students                    → Thêm học viên (tự động tạo user)
   Body: { studentId, fullName, gender, birthday, classId, ... }
4. GET  /api/students/:id                → Xem chi tiết (kèm class, university, organization)
5. PUT  /api/students/:id                → Cập nhật thông tin
6. DEL  /api/students/:id                → Xóa (tự động xóa: user, yearlyResult, semesterResult,
                                           subjectResult, timeTable, cutRice, tuitionFee, achievement, ...)
```

## Dữ liệu & Database
- Bảng: `students`
- Cột chính: `studentId` (mã HV), `fullName`, `gender`, `birthday`, `cccdNumber`, `phoneNumber`, `email`, `currentAddress`, `enrollment`, `rank`, `positionGovernment`, `positionParty`, `classId`, `universityId`, `organizationId`, `educationLevelId`, `currentCpa4`, `currentCpa10`

## Lưu ý bảo mật / Quyền hạn
- Chỉ chỉ huy mới được quản lý hồ sơ học viên.
- Khi xóa học viên, hệ thống tự động xóa tất cả dữ liệu liên quan.
