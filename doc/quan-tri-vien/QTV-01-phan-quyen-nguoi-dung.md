# QTV-01 - Phân quyền người dùng

## Thông tin chung
- **Nhóm người dùng:** Quản trị viên
- **Mã chức năng:** QTV-01
- **Tên chức năng:** Phân quyền người dùng

## Mô tả
Quản trị viên có thể phân quyền cho từng tài khoản, xác định vai trò và quyền truy cập phù hợp.

## Module liên quan
- RBAC Module
- User Module
- Auth Module

## Luồng hoạt động chi tiết
1. Tạo và quản lý các vai trò (Role).
2. Gán quyền (Permission) chi tiết cho từng vai trò.
3. Phân quyền cho từng tài khoản người dùng, xác định vai trò và quyền truy cập phù hợp.

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
| `ADMIN` | Toàn quyền (users, students, commanders, báo cáo, cấu hình) |
| `COMMANDER` | Quản lý học viên, phê duyệt đề xuất, báo cáo, học phí, lịch trực |
| `STUDENT` | Chỉ xem và quản lý dữ liệu của chính mình |

## Dữ liệu & Database
- Bảng: `users`
- Cột phân quyền: `role` (ADMIN/COMMANDER/STUDENT), `isAdmin`

## Lưu ý bảo mật / Quyền hạn
- Chỉ Quản trị viên mới có quyền phân quyền người dùng.
