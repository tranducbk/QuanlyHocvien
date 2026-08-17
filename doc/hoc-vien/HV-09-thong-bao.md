# HV-09 - Thông báo

## Thông tin chung
- **Nhóm ngườ dùng:** Học viên
- **Mã chức năng:** HV-09
- **Tên chức năng:** Nhận thông báo

## Mô tả
Học viên nhận thông báo tự động từ hệ thống khi có sự kiện quan trọng: điểm được cập nhật, đề xuất được phê duyệt/từ chối, lịch cắt cơm thay đổi...

## Module liên quan
- Notification Module
- Student Module

## Luồng hoạt động chi tiết

### 1. Nhận thông báo tự động
Hệ thống tự động gửi thông báo khi:
1. Điểm được cập nhật sau phê duyệt (CH-04).
2. Đề xuất cập nhật điểm được phê duyệt hoặc từ chối (HV-05).
3. Lịch cắt cơm được tạo/cập nhật tự động (HV-07).
4. Có khen thưởng mới được ghi nhận (CH-05).
5. Có thông báo chung từ chỉ huy/đơn vị.

### 2. Xem danh sách thông báo
1. Danh sách thông báo sắp xếp theo thời gian, mới nhất lên đầu.
2. Phân loại: chưa đọc / đã đọc.
3. Lọc theo loại: điểm, đề xuất, cắt cơm, khen thưởng, chung.

### 3. Đánh dấu đã đọc
1. Click vào thông báo để xem chi tiết.
2. Tự động đánh dấu `is_read = true`.
3. Có thể đánh dấu đọc tất cả một lúc.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/auth/notifications` | Token | Danh sách thông báo |
| 2 | `GET` | `/api/auth/notifications?type=CUT_RICE` | Token | Lọc theo loại |
| 3 | `GET` | `/api/auth/notifications?isRead=false` | Token | Lọc chưa đọc |
| 4 | `GET` | `/api/auth/notifications/:id` | Token | Xem chi tiết (tự động đánh dấu đã đọc) |
| 5 | `PUT` | `/api/auth/notifications/:id/read` | Token | Đánh dấu 1 thông báo đã đọc |
| 6 | `PUT` | `/api/auth/notifications/read-all` | Token | Đánh dấu tất cả đã đọc |
| 7 | `DELETE` | `/api/auth/notifications/:id` | Token | Xóa thông báo |

### Luồng nghiệp vụ
```
1. GET  /api/auth/notifications           → Xem danh sách (mới nhất lên đầu)
2. GET  /api/auth/notifications?isRead=false → Lọc thông báo chưa đọc
3. GET  /api/auth/notifications/:id       → Click vào → tự động mark read
4. PUT  /api/auth/notifications/read-all  → Đánh dấu tất cả đã đọc
```

### Loại thông báo (type)
| Type | Mô tả |
|------|-------|
| `GRADE` | Điểm được cập nhật sau phê duyệt |
| `CUT_RICE` | Lịch cắt cơm thay đổi |
| `ACHIEVEMENT` | Khen thưởng mới |
| `TUITION` | Nhắc học phí |
| `GENERAL` | Thông báo chung |

## Dữ liệu & Database
- Bảng: `notifications`
- Cột: `title`, `content`, `type`, `link`, `is_read`, `student_id`

## Lưu ý bảo mật / Quyền hạn
- Học viên chỉ xem thông báo của chính mình.
- Thông báo không thể chỉnh sửa hoặc xóa bởi học viên.
