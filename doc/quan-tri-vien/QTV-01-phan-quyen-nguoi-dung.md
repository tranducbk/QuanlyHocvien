# QTV-01 - Phân quyền người dùng

## Thông tin chung
- **Nhóm người dùng:** Quản trị viên
- **Mã chức năng:** QTV-01
- **Tên chức năng:** Phân quyền người dùng

## Mô tả
Admin quản lý role và hệ được gán cho tài khoản. Ba role nghiệp vụ là Admin, Chỉ huy và Học viên; mỗi Chỉ huy/Học viên thuộc một trong năm hệ.

## Module liên quan
- RBAC Module
- User Module
- Auth Module

## Luồng hoạt động chi tiết
1. Gán một role cho tài khoản.
2. Gán hệ cho tài khoản Chỉ huy hoặc Học viên; tài khoản Admin không thuộc hệ.
3. Backend scope API theo role và hệ của tài khoản đã xác thực.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/users` | Token | Xem danh sách tài khoản |
| 2 | `GET` | `/api/users/:id` | Token | Xem chi tiết tài khoản (role, quyền) |
| 3 | `PUT` | `/api/users/:id` | Token | Gán role cho tài khoản |

### Luồng nghiệp vụ
```
1. GET /api/users      → Xem danh sách tài khoản (kèm role hiện tại)
2. PUT /api/users/:id  → Phân quyền (gán role: ADMIN / COMMANDER / STUDENT)
   Body: { role: "COMMANDER" }
```

### Role hệ thống
| Role | Quyền |
|------|-------|
| `ADMIN` | Xem/chỉnh sửa tài khoản mọi hệ; chỉ xem thông tin chính trị nội bộ; không xem điểm |
| `COMMANDER` | Quản lý học viên và nghiệp vụ trong hệ được phân công |
| `STUDENT` | Chỉ xem thông tin chính trị nội bộ và dữ liệu cá nhân của mình |

## Dữ liệu & Database
- Bảng: `users`
- Cột phân quyền: `role` (ADMIN/COMMANDER/STUDENT), `isAdmin`

## Lưu ý bảo mật / Quyền hạn
- Chỉ Admin mới được quản lý tài khoản và gán role/hệ.
- Không cấp quyền truy cập điểm cho Admin; điểm chính thức không thể sửa, xóa hoặc mở khóa.
