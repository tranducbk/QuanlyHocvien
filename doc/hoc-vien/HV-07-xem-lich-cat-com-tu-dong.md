# HV-07 - Xem lịch cắt cơm tự động

## Thông tin chung
- **Nhóm người dùng:** Học viên
- **Mã chức năng:** HV-07
- **Tên chức năng:** Xem lịch cắt cơm tự động

## Mô tả
Hệ thống tự động tính toán và hiển thị lịch cắt cơm dựa trên lịch học, thời gian đi lại và các giờ ăn cố định. Lịch cắt cơm được cập nhật tự động mỗi khi có thay đổi về lịch học.

## Module liên quan
- Meal Schedule Module
- Schedule Module
- Cut Rice Module

## Luồng hoạt động chi tiết

### 1. Giờ ăn cố định
Hệ thống sử dụng các giờ ăn cố định sau để tính toán lịch cắt cơm:
- **Sáng:** 06:00
- **Trưa:** 11:00
- **Tối:** 17:30

### 2. Tự động tạo lịch cắt cơm
1. Dựa vào lịch học (`time_tables.schedules`) để xác định ca cắt cơm.
2. Tính toán thời gian đi lại từ đơn vị tổ chức.
3. So sánh với các giờ ăn cố định để xác định bữa ăn cần cắt.
4. Hiển thị theo tuần: sáng, trưa, tối.
5. Cập nhật tự động khi lịch học thay đổi.
6. Đánh dấu `is_auto_generated = true`.

## Giao diện & API
- `GET /api/student/cut-rice` — Xem lịch cắt cơm tuần hiện tại

## Dữ liệu & Database
- Bảng: `cut_rice`
- Cột: `weekly` (JSONB), `is_auto_generated`, `last_updated`

## Lưu ý bảo mật / Quyền hạn
- Học viên chỉ xem lịch cắt cơm của chính mình.
- Lịch cắt cơm được quản lý tự động bởi hệ thống, học viên không thể tự điều chỉnh thủ công.
