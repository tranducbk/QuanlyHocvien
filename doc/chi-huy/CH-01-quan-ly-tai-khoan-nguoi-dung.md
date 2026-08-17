# CH-01 - Quản lý tài khoản người dùng

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-01
- **Tên chức năng:** Quản lý tài khoản người dùng

## Mô tả
Chỉ huy có thể quản lý toàn bộ tài khoản người dùng trong hệ thống, bao gồm tài khoản của học viên, chỉ huy và các chỉ huy khác. Chỉ huy có thể tạo tài khoản mới, cập nhật thông tin, vô hiệu hóa hoặc xóa tài khoản khi cần thiết.

## Module liên quan
- User Module
- Auth Module
- Admin Panel

## Luồng hoạt động chi tiết
1. Tạo tài khoản mới cho học viên hoặc chỉ huy.
2. Cập nhật thông tin tài khoản.
3. Vô hiệu hóa hoặc xóa tài khoản khi cần thiết.
4. Reset mật khẩu cho người dùng.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/users` | Token | Xem danh sách tài khoản |
| 2 | `POST` | `/api/users` | Token | Tạo tài khoản mới |
| 3 | `GET` | `/api/users/:id` | Token | Xem chi tiết tài khoản |
| 4 | `PUT` | `/api/users/:id` | Token | Cập nhật thông tin tài khoản |
| 5 | `POST` | `/api/users/:id/reset-password` | Token | Reset mật khẩu |
| 6 | `POST` | `/api/users/:id/toggle-active` | Token | Vô hiệu hóa / Kích hoạt tài khoản |
| 7 | `DELETE` | `/api/users/:id` | Token | Xóa tài khoản |
| 8 | `POST` | `/api/users/batch` | Token | Tạo hàng loạt tài khoản |

### Luồng nghiệp vụ
```
1. GET  /api/users                → Xem danh sách (phân trang)
2. POST /api/users                → Tạo tài khoản mới
   Body: { username, password, role, email, fullName }
3. PUT  /api/users/:id            → Cập nhật thông tin
4. POST /api/users/:id/reset-password → Reset mật khẩu
   Body: { newPassword }
5. POST /api/users/:id/toggle-active  → Khóa / Mở khóa
6. DEL  /api/users/:id            → Xóa (soft delete)

## Dữ liệu & Database
- Bảng: `users`
- Cột: `username`, `password` (bcrypt), `role` (ADMIN/COMMANDER/STUDENT), `isAdmin`, `studentId`, `commanderId`, `deleteAt` (soft delete)

## Lưu ý bảo mật / Quyền hạn
- *(Cập nhật theo phân quyền chi tiết)*
