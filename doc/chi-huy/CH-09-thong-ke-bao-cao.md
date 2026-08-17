# CH-09 - Thống kê & Báo cáo

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-09
- **Tên chức năng:** Thống kê & Báo cáo

## Mô tả
Xem các báo cáo thống kê tổng hợp về học viên, kết quả học tập, thành tích, học phí. Xuất báo cáo dưới dạng Word, Excel hoặc PDF.

## Module liên quan
- Report Module
- Chart Module
- Export Module
- Achievement Module
- Tuition Module

## Luồng hoạt động chi tiết

### 1. Thống kê kết quả học tập
1. Xem thống kê kết quả học tập theo học kỳ, năm học.
2. Xem danh sách học viên có kết quả tốt nhất.
3. Xem phân loại học tập.
4. Biểu đồ: cột, tròn, đường.
5. Xuất báo cáo kết quả học tập dạng **PDF**.

### 2. Thống kê thành tích
1. Xem danh sách đề xuất khen thưởng.
2. Xem danh sách học viên có thành tích tốt nhất theo năm hoặc học kỳ.
3. Thống kê theo năm, theo loại (khen thưởng Bộ, khen thưởng Nhà nước).
4. Phân loại: tiên tiến, thi đua, đề tài NCKH.

### 3. Thống kê xếp loại
1. Thống kê về xếp loại Đảng viên và xếp loại rèn luyện của học viên.
2. Xếp loại Đảng viên: dựa trên `party_rating` trong `yearly_results`.
3. Xếp loại rèn luyện: dựa trên `training_rating` trong `yearly_results`.
4. Phân loại: Xuất sắc, Khá, Trung bình, Yếu.

### 4. Thống kê học phí
1. Thống kê từ `tuition_fees`.
2. Phân loại: Đã thanh toán, Chưa thanh toán.
3. Xuất báo cáo học phí dạng **Word**.

### 5. Xuất báo cáo đa định dạng
Xuất các loại báo cáo theo định dạng cụ thể:
- Báo cáo kết quả học tập: **PDF**
- Báo cáo học phí: **Word**
- Báo cáo lịch cắt cơm: **Excel**
- Báo cáo quản lý chính trị nội bộ: **Excel**

## Giao diện & API
- `GET /api/commander/reports/academic` — Báo cáo học tập
- `GET /api/commander/reports/achievements` — Báo cáo thành tích
- `GET /api/commander/reports/party-training` — Báo cáo xếp loại Đảng/Rèn luyện
- `GET /api/commander/reports/tuition` — Báo cáo học phí
- `GET /api/commander/reports/export` — Xuất báo cáo (Word/Excel/PDF)

## Dữ liệu & Database
- Bảng: `yearly_results` (party_rating, training_rating), `achievements`, `yearly_achievements`, `tuition_fees`

## Lưu ý bảo mật / Quyền hạn
- Chỉ chỉ huy được phép xem báo cáo toàn đơn vị.
- Báo cáo xuất có watermark và số trang.
