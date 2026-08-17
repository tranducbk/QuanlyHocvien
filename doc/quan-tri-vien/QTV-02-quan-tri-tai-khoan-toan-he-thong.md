# QTV-02 - Quản trị tài khoản toàn hệ thống

## Thông tin chung
- **Nhóm ngườ dùng:** Quản trị viên
- **Mã chức năng:** QTV-02
- **Tên chức năng:** Quản trị tài khoản toàn hệ thống

## Mô tả
Quản lý mọi tài khoản của cả Chỉ huy và Học viên, bao gồm cấp phát tài khoản mới.

## Module liên quan
- User Module
- Auth Module
- Admin Panel

## Luồng hoạt động chi tiết

### 1. Cấp phát tài khoản mới
1. Admin chọn loại tài khoản: Học viên hoặc Cán bộ/Chỉ huy.
2. Nhập thông tin cơ bản: username, email, role.
3. Hệ thống tự động sinh mật khẩu tạm thời và gửi qua email.
4. Liên kết với `student_id` (nếu là học viên) hoặc `commander_id` (nếu là cán bộ).
5. Tài khoản được kích hoạt ngay hoặc để trạng thái chờ kích hoạt.

### 2. Quản lý tài khoản hiện có
1. Toàn quyền xem, sửa, xóa, khóa mọi tài khoản.
2. Giám sát hoạt động đăng nhập (last_login_at).
3. Reset mật khẩu cho bất kỳ tài khoản nào.
4. Sao lưu và phục hồi dữ liệu tài khoản.

### 3. Quản lý trạng thái
1. Kích hoạt/Vô hiệu hóa tài khoản.
2. Xóa mềm (soft delete) — dữ liệu vẫn giữ lại trong DB.
3. Khôi phục tài khoản đã xóa mềm.

## Giao diện & API
- `POST /api/admin/users` — Tạo tài khoản mới
- `GET /api/admin/users` — Danh sách tài khoản
- `GET /api/admin/users/:id` — Chi tiết tài khoản
- `PUT /api/admin/users/:id` — Cập nhật tài khoản
- `DELETE /api/admin/users/:id` — Xóa mềm tài khoản
- `POST /api/admin/users/:id/reset-password` — Reset mật khẩu
- `POST /api/admin/users/:id/activate` — Kích hoạt/Vô hiệu hóa

## Dữ liệu & Database
- Bảng: `users`
- Cột: `username`, `password`, `email`, `role`, `is_admin`, `student_id`, `commander_id`, `status`, `delete_at`

## Lưu ý bảo mật / Quyền hạn
- Chỉ Admin mới có quyền truy cập API này.
- Mật khẩu tạm thời phải được thay đổi ngay lần đăng nhập đầu tiên.
- Log đầy đủ mọi thao tác quản trị (tạo, xóa, reset password).
