# CH-06 - Quản lý lịch học & cắt cơm

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-06
- **Tên chức năng:** Quản lý lịch học & cắt cơm

## Mô tả
Xem, nhập và cập nhật lịch học của học viên; quản lý lịch cắt cơm (xem, cập nhật, tạo tự động, reset, cập nhật thủ công); xuất báo cáo lịch học và lịch cắt cơm dưới dạng Excel.

## Module liên quan
- Schedule Module
- Meal Schedule Module
- Export Module
- Cut Rice Module

## Luồng hoạt động chi tiết

### 1. Xem lịch học của học viên
1. Xem lịch học của bất kỳ học viên nào trong hệ thống.
2. Hiển thị theo tuần, bao gồm các môn học, thời gian, địa điểm.

### 2. Nhập và cập nhật lịch học
1. Chỉ huy nhập lịch học cho từng học viên.
2. Mỗi lịch học gồm `userId` của học viên và danh sách `schedules`.
3. Mỗi phần tử `schedules` gồm: ngày học, giờ bắt đầu, giờ kết thúc, phòng học, tên môn học và tuần học.
4. Hệ thống chỉ cho phép nhập lịch học cho tài khoản có vai trò `STUDENT`.

### 3. Quản lý lịch cắt cơm
1. Xem lịch cắt cơm của học viên.
2. Tạo lịch cắt cơm tự động cho tất cả học viên hoặc cho từng học viên cụ thể.
3. Reset về lịch tự động.
4. Cập nhật lịch cắt cơm thủ công khi cần.

### 4. Tự động tạo lịch cắt cơm
Hệ thống tự động tính toán lịch cắt cơm dựa trên lịch học, thời gian đi lại từ đơn vị và các giờ ăn cố định:
- Sáng: 06:00
- Trưa: 11:00
- Tối: 17:30

Khi Chỉ huy cập nhật lịch học:
1. Hệ thống quét điều kiện thời gian từ `time_tables.schedules`.
2. So sánh với giờ ăn cố định và thời gian đi lại.
3. Tự động ghi danh vào danh sách cắt cơm ngày tương ứng trong `cut_rice.weekly`.
4. Đánh dấu `is_auto_generated = true`.

### 5. Xuất báo cáo
1. Xuất báo cáo lịch học kèm lịch cắt cơm dưới dạng file Excel.
2. Phân loại: theo đơn vị, theo ca.

## Giao diện & API
- `GET /api/time-tables?page=1&limit=10` — Danh sách lịch học
- `GET /api/time-tables?userId=<studentUserId>` — Lọc lịch học theo học viên
- `POST /api/time-tables` — Nhập lịch học cho học viên
- `PUT /api/time-tables/:id` — Cập nhật lịch học
- `DELETE /api/time-tables/:id` — Xóa lịch học
- `GET /api/time-tables/report` — Báo cáo lịch học
- `GET /api/cut-rice` — Xem lịch cắt cơm
- `POST /api/users/cut-rice/generate/:userId` — Tạo lịch cắt cơm tự động cho một học viên
- `POST /api/users/cut-rice/generate-all` — Tạo lịch cắt cơm tự động cho tất cả học viên
- `PUT /api/cut-rice/:id` — Cập nhật lịch cắt cơm thủ công
- `GET /api/cut-rice/export` — Xuất Excel lịch học kèm cắt cơm

## Dữ liệu & Database
- Bảng: `time_tables` (schedules JSONB), `cut_rice` (weekly JSONB)
- Cập nhật: `cut_rice.weekly`, `is_auto_generated`, `last_updated`

## Lưu ý bảo mật / Quyền hạn
- Chỉ Chỉ huy và Quản trị viên mới được quản lý lịch học và lịch cắt cơm.
- Học viên chỉ được xem lịch học của chính mình qua `/api/users/time-table`.
- Reset lịch cắt cơm sẽ xóa các điều chỉnh thủ công và tạo lại theo lịch tự động.
