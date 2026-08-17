# CH-04 - Phê duyệt đề xuất kết quả học tập

## Thông tin chung
- **Nhóm người dùng:** Chỉ huy
- **Mã chức năng:** CH-04
- **Tên chức năng:** Phê duyệt đề xuất kết quả học tập

## Mô tả
Chỉ huy xem, phê duyệt hoặc từ chối các đề xuất cập nhật điểm từ học viên. Khi phê duyệt, hệ thống tự động cập nhật điểm và tính lại CPA.

## Module liên quan
- Grade Request Module
- Subject Result Module
- Semester Result Module
- Yearly Result Module
- Notification Module

## Luồng hoạt động

### 1. Xem danh sách đề xuất
1. Danh sách đề xuất sắp xếp mới nhất trước, có phân trang.
2. Có thể lọc theo trạng thái (`PENDING`, `APPROVED`, `REJECTED`).
3. Có thể lọc theo học viên (`?userId=`), loại đề xuất (`?requestType=`), họ tên (`?fullName=`), đơn vị (`?unit=`), học kỳ (`?semester=`), năm học (`?schoolYear=`).

### 2. Xem chi tiết
1. Xem thông tin học viên, môn học, điểm hiện tại vs điểm đề xuất.
2. Xem file minh chứng đính kèm.

### 3. Phê duyệt
1. Chỉ huy chọn "Phê duyệt".
2. Nhập ghi chú phê duyệt (tùy chọn).
3. Hệ thống thực hiện:
   - Cập nhật `subject_result` với điểm mới
   - Tính lại GPA cho `semester_result`
   - Tính lại CPA cho `yearly_result`
   - Cập nhật `currentCpa4`, `currentCpa10` trên bảng `students`
   - Gửi thông báo cho học viên: "Đề xuất của bạn đã được phê duyệt"

### 4. Từ chối
1. Chỉ huy chọn "Từ chối".
2. Nhập lý do từ chối (`reviewNote`) bắt buộc.
3. Hệ thống:
   - Cập nhật trạng thái đề xuất thành `REJECTED`
   - Gửi thông báo cho học viên: "Đề xuất của bạn đã bị từ chối. Lý do: ..."

### 5. Tự động tính toán CPA (khi phê duyệt)
```
1. UPDATE subject_result: letterGrade, gradePoint4, gradePoint10
2. Tìm semester_result chứa subject_result
3. Tính lại toàn bộ subject_result trong semester:
   - totalCredits = SUM(credits)
   - averageGrade4 = SUM(gradePoint4 * credits) / totalCredits
   - averageGrade10 = SUM(gradePoint10 * credits) / totalCredits
   - passedSubjects, failedSubjects, debtCredits
4. UPDATE semester_result với giá trị mới
5. Tìm yearly_result chứa semester_result
6. Tính lại toàn bộ semester_result trong năm:
   - cumulativeGrade4, cumulativeGrade10, cumulativeCredits
   - totalCredits, totalSubjects, passedSubjects, failedSubjects, debtCredits
7. UPDATE yearly_result với giá trị mới
8. UPDATE students: currentCpa4, currentCpa10
```

## API

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `GET` | `/api/commanders/grade-requests?page=1&limit=10` | ADMIN, COMMANDER | Danh sách đề xuất, có phân trang và filter |
| `GET` | `/api/commanders/grade-requests/:id` | ADMIN, COMMANDER | Chi tiết đề xuất |
| `POST` | `/api/commanders/grade-requests/:id/approve` | ADMIN, COMMANDER | Phê duyệt đề xuất |
| `POST` | `/api/commanders/grade-requests/:id/reject` | ADMIN, COMMANDER | Từ chối đề xuất |

### Query danh sách
Ví dụ:
```
GET /api/commanders/grade-requests?status=PENDING&userId=<studentUserId>&page=1&limit=10
GET /api/commanders/grade-requests?fullName=An&unit=Đại đội 1&page=1&limit=10
```

### POST /approve body
```json
{ "reviewNote": "Đồng ý cập nhật" }
```

### POST /reject body
```json
{ "reviewNote": "Không đủ minh chứng" }
```

## Validation
- `reviewNote`: string, bắt buộc khi từ chối

## Lưu ý
- CPA tính lại là atomic transaction
- Chỉ đề xuất ở trạng thái PENDING mới được duyệt/từ chối
- Lịch sử phê duyệt được ghi log
