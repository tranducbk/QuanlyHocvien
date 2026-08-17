# HV-04 - Đề xuất kết quả học tập

## Thông tin chung
- **Nhóm người dùng:** Học viên
- **Mã chức năng:** HV-04
- **Tên chức năng:** Đề xuất kết quả học tập

## Mô tả
Học viên tạo yêu cầu thêm mới, cập nhật hoặc xóa kết quả môn học. Đề xuất được gửi đến Chỉ huy để phê duyệt.

## Module liên quan
- Grade Request Module
- Subject Result Module
- Notification Module

## Luồng hoạt động

### 1. Tạo đề xuất
1. Học viên chọn môn học (`subjectResultId`) cần đề xuất.
2. Chọn loại đề xuất: `ADD` (thêm mới), `UPDATE` (cập nhật), `DELETE` (xóa).
3. Nhập điểm đề xuất:
   - `proposedLetterGrade`: điểm chữ (A+, A, B+, ...)
   - `proposedGradePoint4`: điểm hệ 4 (tùy chọn)
   - `proposedGradePoint10`: điểm hệ 10 (tùy chọn)
4. Nhập lý do (`reason`) bắt buộc.
5. Đính kèm file minh chứng (`attachmentUrl`) nếu có.
6. Gửi đề xuất, trạng thái ban đầu: `PENDING`.
7. Hệ thống tự động gửi thông báo đến Chỉ huy.

### 2. Xem danh sách đề xuất của mình
1. Danh sách tất cả đề xuất, sắp xếp mới nhất trước và có phân trang.
2. Có thể lọc theo trạng thái: `PENDING`, `APPROVED`, `REJECTED`.
3. Mỗi đề xuất hiển thị: môn học, loại, điểm đề xuất, trạng thái, ngày tạo.

### 3. Xem chi tiết đề xuất
1. Xem toàn bộ thông tin đề xuất.
2. Nếu đã được phê duyệt/từ chối: xem tên người duyệt, ghi chú, ngày duyệt.

## API

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `POST` | `/api/students/grade-requests` | STUDENT | Tạo đề xuất mới |
| `GET` | `/api/students/grade-requests?page=1&limit=10` | STUDENT | Danh sách đề xuất của tôi, có phân trang và filter `?status=` |
| `GET` | `/api/students/grade-requests/:id` | STUDENT | Chi tiết đề xuất |

### Request Body (POST)
```json
{
  "subjectResultId": "uuid",
  "requestType": "UPDATE",
  "reason": "Điểm thi cuối kỳ bị nhập sai",
  "proposedLetterGrade": "B+",
  "proposedGradePoint4": 3.5,
  "proposedGradePoint10": 8.0,
  "attachmentUrl": "/uploads/evidence.pdf"
}
```

### Response
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Gửi đề xuất thành công",
  "data": {
    "id": "uuid",
    "studentId": "uuid",
    "subjectResultId": "uuid",
    "requestType": "UPDATE",
    "reason": "Điểm thi cuối kỳ bị nhập sai",
    "proposedLetterGrade": "B+",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Validation
- `subjectResultId`: UUID, bắt buộc, phải tồn tại trong DB
- `requestType`: bắt buộc, enum ['ADD', 'UPDATE', 'DELETE']
- `reason`: bắt buộc, text
- `proposedLetterGrade`: string, max 5
- `proposedGradePoint4`: number, 0-4
- `proposedGradePoint10`: number, 0-10
- `attachmentUrl`: string, max 500

## Lưu ý bảo mật
- Học viên chỉ được đề xuất cho môn học thuộc kết quả học tập của chính mình
- Học viên chỉ xem được đề xuất của chính mình
