# HV-06 - Xem lịch học

## Thông tin chung
- **Nhóm người dùng:** Học viên
- **Mã chức năng:** HV-06
- **Tên chức năng:** Xem lịch học

## Mô tả
Học viên xem lịch học cá nhân do Chỉ huy nhập và cập nhật. Học viên không có quyền thêm, chỉnh sửa hoặc xóa lịch học.

## Module liên quan
- Schedule Module
- Course Module
- Meal Schedule Module

## Luồng hoạt động chi tiết

### 1. Xem lịch học
1. Hiển thị lịch học theo tuần, dạng lưới hoặc danh sách.
2. Bao gồm các môn học với thời gian, địa điểm và các thông tin liên quan.

### 2. Quyền thêm/cập nhật lịch học
1. Chỉ huy nhập, cập nhật và xóa lịch học cho học viên qua nhóm API quản lý thời khóa biểu.
2. Khi lịch học thay đổi, hệ thống có thể dùng dữ liệu lịch học để tạo hoặc cập nhật lịch cắt cơm.
3. Học viên gọi các API ghi lịch học sẽ bị từ chối với mã `403`.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/users/time-table` | STUDENT | Xem lịch học của mình |
| 2 | `POST` | `/api/users/time-table` | STUDENT | Không cho phép, trả `403` |
| 3 | `PUT` | `/api/users/time-table/:id` | STUDENT | Không cho phép, trả `403` |
| 4 | `DELETE` | `/api/users/time-table/:id` | STUDENT | Không cho phép, trả `403` |

### Luồng nghiệp vụ
```
1. GET  /api/users/time-table        → Xem danh sách lịch học hiện tại
2. POST /api/users/time-table        → 403, chỉ Chỉ huy được nhập lịch học
3. PUT  /api/users/time-table/:id    → 403, chỉ Chỉ huy được cập nhật lịch học
4. DEL  /api/users/time-table/:id    → 403, chỉ Chỉ huy được xóa lịch học
```

## Dữ liệu & Database
- Bảng: `time_tables`
- Cột: `userId`, `schedules` (JSONB: [{ day, startTime, endTime, room, subjectName, week }])

## Lưu ý bảo mật / Quyền hạn
- Học viên chỉ được xem lịch học của chính mình.
- Chỉ huy hoặc quản trị viên nhập và cập nhật lịch học qua `/api/time-tables`.
