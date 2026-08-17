# CH-07 - Quản lý học phí

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-07
- **Tên chức năng:** Quản lý học phí

## Mô tả
Cập nhật thông tin học phí cho từng học viên theo từng học kỳ; cập nhật trạng thái thanh toán; xem danh sách, tìm kiếm và lọc; xuất báo cáo Word hoặc PDF.

## Module liên quan
- Tuition Module
- Report Module
- Export Module

## Luồng hoạt động chi tiết

### 1. Cập nhật thông tin học phí
1. Ghi nhận và cập nhật thông tin học phí cho từng học viên theo từng học kỳ.
2. Bao gồm số tiền cần nộp và trạng thái thanh toán.

### 2. Cập nhật trạng thái thanh toán
1. Cập nhật trạng thái thanh toán học phí của học viên khi nhận được thanh toán.

### 3. Xem danh sách học phí
1. Xem danh sách tất cả học phí của học viên.
2. Tìm kiếm và lọc theo nhiều tiêu chí.

### 4. Xuất báo cáo học phí
1. Xuất báo cáo học phí dưới dạng file PDF hoặc Word.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/tuition-fees` | Token | Xem danh sách học phí |
| 2 | `GET` | `/api/tuition-fees?studentId=...` | Token | Lọc theo học viên |
| 3 | `GET` | `/api/tuition-fees?schoolYear=...` | Token | Lọc theo năm học |
| 4 | `GET` | `/api/tuition-fees?status=UNPAID` | Token | Lọc theo trạng thái |
| 5 | `POST` | `/api/tuition-fees` | Token | Ghi nhận học phí mới |
| 6 | `PUT` | `/api/tuition-fees/:id` | Token | Cập nhật trạng thái thanh toán |
| 7 | `DELETE` | `/api/tuition-fees/:id` | Token | Xóa bản ghi học phí |
| 8 | `GET` | `/api/commanders/reports/tuition` | Token | Báo cáo tổng hợp học phí |

### Luồng nghiệp vụ
```
1. GET  /api/tuition-fees                → Xem danh sách
2. POST /api/tuition-fees                → Ghi nhận học phí mới
   Body: { studentId, totalAmount, semester, schoolYear, content, status }
3. PUT  /api/tuition-fees/:id            → Cập nhật trạng thái (UNPAID → PAID)
4. GET  /api/commanders/reports/tuition  → Xuất báo cáo tổng hợp
```

## Dữ liệu & Database
- Bảng: `tuition_fees`
- Cột: `studentId`, `totalAmount` (DECIMAL), `semester`, `schoolYear`, `content`, `status` (PAID/UNPAID)

## Lưu ý bảo mật / Quyền hạn
- Chỉ chỉ huy mới được quản lý và cập nhật học phí.
