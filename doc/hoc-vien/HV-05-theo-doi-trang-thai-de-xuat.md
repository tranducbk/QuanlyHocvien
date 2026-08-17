# HV-05 - Theo dõi trạng thái đề xuất

## Thông tin chung
- **Nhóm người dùng:** Học viên
- **Mã chức năng:** HV-05
- **Tên chức năng:** Theo dõi trạng thái đề xuất

## Mô tả
Xem phản hồi phê duyệt/từ chối và ghi chú từ chỉ huy.

## Module liên quan
- Grade Request Module
- Notification Module

## Luồng hoạt động chi tiết
1. Danh sách các đề xuất đã gửi kèm trạng thái, có phân trang.
2. Trạng thái: Chờ duyệt, Đã duyệt, Từ chối.
3. Xem ghi chú/phản hồi chi tiết từ chỉ huy khi có quyết định.

## Giao diện & API

| Thứ tự | Method | Endpoint | Auth | Mô tả |
|--------|--------|----------|------|-------|
| 1 | `GET` | `/api/students/grade-requests?page=1&limit=10` | Token | Danh sách đề xuất của học viên, có phân trang |
| 2 | `GET` | `/api/students/grade-requests?status=PENDING&page=1&limit=10` | Token | Lọc theo trạng thái, có phân trang |
| 3 | `GET` | `/api/students/grade-requests/:id` | Token | Xem chi tiết đề xuất (kèm ghi chú từ chỉ huy) |

### Luồng nghiệp vụ
```
1. GET /api/students/grade-requests?page=1&limit=10                  → Xem tất cả đề xuất, có phân trang
2. GET /api/students/grade-requests?status=PENDING&page=1&limit=10   → Lọc trạng thái chờ duyệt
3. GET /api/students/grade-requests/:id                              → Xem chi tiết (reviewNote từ chỉ huy)
```

### Response danh sách
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Thành công",
  "data": [],
  "pagination": {
    "pageIndex": 1,
    "page": 1,
    "pageSize": 10,
    "limit": 10,
    "totalPages": 1,
    "total": 0,
    "fetchAll": false
  }
}
```

## Dữ liệu & Database
- Bảng: `grade_requests`
- Cột: `studentId`, `subjectResultId`, `requestType` (ADD/UPDATE/DELETE), `status` (PENDING/APPROVED/REJECTED), `reviewNote`, `reviewerId`, `reviewedAt`

## Lưu ý bảo mật / Quyền hạn
- *(Cập nhật theo phân quyền chi tiết)*
