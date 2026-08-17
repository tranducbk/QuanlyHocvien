# CH-08 - Quản lý học kỳ

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-08
- **Tên chức năng:** Quản lý học kỳ

## Mô tả
Thêm, chỉnh sửa, xóa các học kỳ trong hệ thống, bao gồm tên học kỳ, năm học và các thông tin liên quan.

## Module liên quan
- Semester Module
- Academic Year Module

## Luồng hoạt động chi tiết

### 1. Thêm học kỳ
1. Tạo học kỳ mới với tên học kỳ, năm học và các thông tin liên quan.

### 2. Chỉnh sửa học kỳ
1. Cập nhật thông tin học kỳ khi có thay đổi.

### 3. Xóa học kỳ
1. Xóa học kỳ khỏi hệ thống khi cần thiết.

### 4. Xem danh sách học kỳ
1. Xem danh sách tất cả học kỳ.
2. Tìm kiếm theo tên hoặc năm học.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/semesters` | Token | Xem danh sách học kỳ |
| 2 | `GET` | `/api/semesters?schoolYear=2024-2025` | Token | Tìm kiếm theo năm học |
| 3 | `GET` | `/api/semesters/:id` | Token | Xem chi tiết học kỳ |
| 4 | `POST` | `/api/semesters` | Token | Thêm học kỳ mới |
| 5 | `PUT` | `/api/semesters/:id` | Token | Cập nhật học kỳ |
| 6 | `DELETE` | `/api/semesters/:id` | Token | Xóa học kỳ |

### Luồng nghiệp vụ
```
1. GET  /api/semesters                    → Xem danh sách
2. POST /api/semesters                    → Thêm học kỳ
   Body: { code, schoolYear }
3. GET  /api/semesters?schoolYear=X       → Tìm kiếm theo năm học
4. PUT  /api/semesters/:id                → Chỉnh sửa
5. DEL  /api/semesters/:id                → Xóa
```

## Dữ liệu & Database
- Bảng: `semesters`
- Cột: `code` (unique, vd: "2024-2025-HK1"), `schoolYear`

## Lưu ý bảo mật / Quyền hạn
- Chỉ chỉ huy mới được quản lý học kỳ.
