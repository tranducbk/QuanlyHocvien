# QTV-02 - Quản trị tài khoản toàn hệ thống

## Thông tin chung
- **Nhóm ngườ dùng:** Quản trị viên
- **Mã chức năng:** QTV-02
- **Tên chức năng:** Quản trị tài khoản toàn hệ thống

## Mô tả
Quản lý tài khoản Admin, Chỉ huy và Học viên thuộc Hệ 1, 3, 4, 5 và 7; gồm tạo, xem, chỉnh sửa, khóa/mở và đặt lại mật khẩu.

## Module liên quan
- User Module
- Auth Module
- Admin Panel

## Luồng hoạt động chi tiết

### 1. Cấp phát tài khoản mới
1. Admin chọn role và hệ đào tạo cho tài khoản Chỉ huy hoặc Học viên; tài khoản Admin không gắn hệ.
2. Nhập thông tin tài khoản và liên kết với thông tin chính trị nội bộ tương ứng.
3. Tài khoản được kích hoạt hoặc để trạng thái chưa kích hoạt theo quyết định của Admin.

### 2. Quản lý tài khoản hiện có
1. Xem và chỉnh sửa tài khoản thuộc mọi hệ.
2. Gán role, hệ và trạng thái tài khoản theo quy định.
3. Đặt lại mật khẩu cho tài khoản.
4. Chỉ xem thông tin chính trị nội bộ; không chỉnh sửa nội dung này và không xem điểm.

### 3. Quản lý trạng thái
1. Kích hoạt/Vô hiệu hóa tài khoản.
2. Khóa tài khoản mà không xóa dữ liệu nghiệp vụ.

## Giao diện & API
- `POST /api/admin/users` — Tạo tài khoản mới
- `GET /api/admin/users` — Danh sách tài khoản
- `GET /api/admin/users/:id` — Chi tiết tài khoản
- `PUT /api/admin/users/:id` — Cập nhật tài khoản
- `POST /api/admin/users/:id/reset-password` — Reset mật khẩu
- `POST /api/admin/users/:id/activate` — Kích hoạt/Vô hiệu hóa

## Dữ liệu & Database
- Bảng: `users`
- Cột: tài khoản đăng nhập, role, hệ được gán, trạng thái và liên kết thông tin chính trị nội bộ.

## Lưu ý bảo mật / Quyền hạn
- Chỉ Admin mới có quyền truy cập API này.
- Admin không được sửa thông tin chính trị nội bộ, không được xem điểm và không được sửa/xóa/mở khóa điểm chính thức.
- Không xóa tài khoản hoặc dữ liệu nghiệp vụ; dùng trạng thái khóa tài khoản.
- Mật khẩu tạm thời phải được thay đổi ngay lần đăng nhập đầu tiên.
- Log đầy đủ mọi thao tác quản trị (tạo, xóa, reset password).
