# CH-10 - Phân công lịch trực

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-10
- **Tên chức năng:** Phân công lịch trực

## Mô tả
Chỉ huy có thể phân công lịch trực cho các chỉ huy, quản lý các ca trực và nhiệm vụ được giao.

## Module liên quan
- Duty Roster Module
- User Module

## Luồng hoạt động chi tiết
1. Tạo lịch trực theo tuần/tháng.
2. Phân công ca trực cho các chỉ huy.
3. Quản lý các nhiệm vụ được giao trong ca trực.
4. Xuất bảng phân công.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/commander-duty-schedules` | Token | Xem danh sách lịch trực |
| 2 | `POST` | `/api/commander-duty-schedules` | Token | Phân công ca trực mới |
| 3 | `PUT` | `/api/commander-duty-schedules/:id` | Token | Cập nhật ca trực |
| 4 | `DELETE` | `/api/commander-duty-schedules/:id` | Token | Xóa ca trực |

### Luồng nghiệp vụ
```
1. GET  /api/commander-duty-schedules     → Xem lịch trực (theo tuần/tháng)
2. POST /api/commander-duty-schedules     → Phân công ca trực
   Body: { fullName, rank, phoneNumber, position, workDay }
3. PUT  /api/commander-duty-schedules/:id → Cập nhật nhiệm vụ được giao
4. DEL  /api/commander-duty-schedules/:id → Xóa ca trực
```

## Dữ liệu & Database
- Bảng: `commander_duty_schedules`
- Cột: `fullName`, `rank`, `phoneNumber`, `position`, `workDay`

## Lưu ý bảo mật / Quyền hạn
- Chỉ chỉ huy mới được phân công lịch trực.
