# HV-01 - Đăng nhập & quản lý tài khoản

## Thông tin chung
- **Nhóm người dùng:** Học viên
- **Mã chức năng:** HV-01
- **Tên chức năng:** Đăng nhập & quản lý tài khoản

## Mô tả
Đăng nhập bằng tài khoản được cấp, đổi mật khẩu, bảo mật tài khoản.

## Module liên quan
- Auth Module
- User Module
- Security Middleware

## Luồng hoạt động chi tiết
1. Người dùng truy cập màn hình đăng nhập và nhập tên đăng nhập/mật khẩu.
2. Hệ thống xác thực thông tin qua Auth Module.
3. Sau đăng nhập thành công, cấp JWT token và lưu session.
4. Học viên có thể vào trang cá nhân để đổi mật khẩu.
5. Mật khẩu được mã hóa (bcrypt) trước khi lưu vào DB.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `POST` | `/api/auth/login` | Không | Đăng nhập → nhận JWT token |
| 2 | `GET` | `/api/auth/me` | Token | Xem thông tin người dùng hiện tại |
| 3 | `POST` | `/api/auth/change-password` | Token | Đổi mật khẩu |
| 4 | `POST` | `/api/auth/refresh-token` | Không | Làm mới token khi hết hạn |

### Luồng nghiệp vụ
```
1. POST /api/auth/login  → Nhận accessToken + refreshToken
2. GET  /api/auth/me     → Xác nhận đăng nhập thành công
3. POST /api/auth/change-password → Đổi mật khẩu (tùy chọn)
```

## Dữ liệu & Database
- Bảng: `users`
- Cột: `username`, `password` (bcrypt), `role`, `refreshToken`, `studentId`, `commanderId`

## Lưu ý bảo mật / Quyền hạn
- *(Cập nhật theo phân quyền chi tiết)*
