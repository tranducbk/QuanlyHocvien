# Đặc tả mở rộng Hệ thống Quản lý Học viên

## 1. Mục tiêu và phạm vi

Mở rộng hệ thống để quản lý ba hệ đào tạo độc lập:

1. **Hệ ngoài (`EXTERNAL`)**: quân nhân được cử đi học tại trường bên ngoài.
2. **Hệ nội bộ quân sự (`MILITARY`)**.
3. **Hệ nội bộ dân sự (`CIVILIAN`)**.

Bổ sung quản lý lớp, môn học, quy trình đề xuất/duyệt điểm quân sự, Excel, báo cáo, thông báo và audit log. Dữ liệu đào tạo, môn học và điểm của ba hệ phải nằm trong các bảng vật lý riêng để không lẫn dữ liệu.

## 2. Quyết định nghiệp vụ đã thống nhất

- Mỗi học viên chỉ thuộc một hệ và không được chuyển sang hệ khác.
- Học viên có thể chuyển lớp trong cùng hệ; Chỉ huy thực hiện và hệ thống lưu lịch sử.
- Mã học viên duy nhất trên toàn hệ thống.
- Mỗi tài khoản chỉ có một role.
- Mỗi hệ có một Chỉ huy; mỗi học viên có một Chỉ huy.
- Chỉ huy xem toàn bộ học viên thuộc hệ mình.
- Hệ ngoài và hệ dân sự: Chỉ huy đúng hệ trực tiếp nhập điểm.
- Hệ quân sự có hai luồng: Chỉ huy nhập điểm trực tiếp, hoặc Học viên tự nhập bảng điểm và gửi đề xuất để Chỉ huy duyệt/từ chối.
- Điểm quân sự được ghi chính thức khi Chỉ huy nhập trực tiếp hoặc khi đề xuất được duyệt.
- Chỉ huy trực tiếp quản lý lớp, môn học và học kỳ của hệ mình.
- Điểm chính thức không có chức năng chỉnh sửa, mở khóa hoặc xóa.
- Mỗi hệ có danh mục môn học riêng.
- Hệ dân sự giai đoạn đầu chỉ xây dựng model và API CRUD, chưa làm quản lý lớp và giao diện hoàn chỉnh.
- Khi người dùng ngừng sử dụng: khóa tài khoản, không xóa hồ sơ, điểm hoặc lịch sử.
- Dữ liệu hiện tại phải được giữ nguyên; backend và frontend nâng cấp đồng thời.

## 3. Tài khoản, hồ sơ và đào tạo

### 3.1. `users`

Chuẩn hóa `role` thành:

- `ADMIN`
- `COMMANDER`
- `STUDENT`

Bổ sung `system_type`: `EXTERNAL`, `MILITARY`, `CIVILIAN` hoặc `NULL`.

- `system_type` bắt buộc với `STUDENT` và `COMMANDER`.
- `system_type` để `NULL` với `ADMIN`.
- `is_active` dùng để khóa/mở tài khoản.

### 3.2. Hồ sơ

“Thông tin cá nhân” gồm họ tên, ngày sinh, giới tính, CCCD, quê quán, địa chỉ, điện thoại và email. “Thông tin quân nhân” gồm cấp bậc, đơn vị, ngày nhập ngũ, chức vụ và thông tin Đảng.

#### `military_profiles`

Dùng chung cho học viên hệ ngoài và hệ quân sự; chứa thông tin cá nhân và quân nhân, không chứa trường/lớp/điểm.

#### `civilian_profiles`

Dùng riêng cho học viên dân sự; chỉ chứa thông tin cá nhân, không có trường quân sự.

Ràng buộc bắt buộc:

- `STUDENT + EXTERNAL/MILITARY` có đúng một `military_profile`.
- `STUDENT + CIVILIAN` có đúng một `civilian_profile`.
- Một user không được đồng thời có hai loại hồ sơ.
- Middleware đăng nhập phải tải đúng hồ sơ theo `system_type`.
- Học viên chỉ xem hồ sơ, không tự sửa trực tiếp.

### 3.3. Hồ sơ đào tạo

Thông tin đào tạo tách khỏi hồ sơ cá nhân:

- `external_enrollments`: `user_id`, `military_profile_id`, trường, khoa/tổ chức, trình độ, lớp, Chỉ huy, khóa học và trạng thái.
- `military_enrollments`: `user_id`, `military_profile_id`, lớp quân sự, Chỉ huy, khóa học và trạng thái.
- `civilian_enrollments`: `user_id`, `civilian_profile_id`, khóa học và trạng thái; liên kết lớp để trống ở giai đoạn đầu.

Mỗi học viên chỉ có một enrollment đang hoạt động và enrollment phải cùng hệ với `users.system_type`.

### 3.4. Lớp và chuyển lớp

- Hệ ngoài giữ cây `universities → organizations → education_levels → classes`.
- Hệ quân sự chỉ có `MILITARY → military_classes`, không có cấp đơn vị trung gian.
- Chưa làm quản lý lớp dân sự.
- Tạo `student_class_histories` lưu học viên, hệ, lớp cũ/mới, Chỉ huy thực hiện, lý do và thời gian.

## 4. Môn học, học kỳ và quản lý lớp

### 4.1. Môn học

Tạo ba bảng riêng:

- `external_subjects`
- `military_subjects`
- `civilian_subjects`

Thông tin chung gồm mã môn, tên môn, số tín chỉ/học trình và trạng thái.

`military_subjects` có thêm:

- `midterm_weight`
- `final_weight`
- Tổng trọng số bắt buộc bằng 100%.
- Không được sửa trọng số sau khi đã phát sinh điểm.

Môn chưa được sử dụng có thể xóa. Môn đã được xếp vào lớp/học kỳ hoặc đã có điểm chỉ được chuyển sang trạng thái ngừng sử dụng.

### 4.2. Quyền quản lý

- Chỉ huy hệ ngoài quản lý trường ngoài, lớp, môn học và học kỳ của hệ ngoài.
- Chỉ huy hệ quân sự quản lý lớp quân sự, môn học và học kỳ quân sự.
- Chỉ huy hệ dân sự quản lý môn học và học kỳ dân sự; quản lý lớp dân sự được triển khai ở giai đoạn sau.
- Không có role, bảng phân công hoặc cổng làm việc dành cho Giảng viên.

## 5. Kết quả học tập

### 5.1. Hệ ngoài

Tiếp tục sử dụng `subject_results`, `semester_results` và `yearly_results`. Chỉ huy hệ ngoài trực tiếp nhập điểm cho học viên của hệ. `grade_requests` cũ chỉ được giữ để bảo toàn lịch sử; không tiếp nhận đề xuất điểm mới. Học viên hệ ngoài vẫn được gửi yêu cầu chỉnh sửa lịch học.

### 5.2. Hệ quân sự

Tạo riêng `military_subject_results`, `military_semester_results`, `military_yearly_results`.

Tạo thêm `military_grade_requests` và `military_grade_request_items` để lưu đề xuất bảng điểm cùng danh sách môn. Trạng thái đề xuất gồm `PENDING`, `APPROVED`, `REJECTED`.

- Học viên chỉ tạo đề xuất cho chính mình và đúng lớp/học kỳ/môn thuộc hệ quân sự.
- Sau khi gửi, đề xuất không được chỉnh sửa hoặc xóa.
- Nếu bị từ chối, Học viên tạo đề xuất mới; không sửa đề xuất cũ.
- Khi Chỉ huy duyệt, hệ thống kiểm tra lại toàn bộ dữ liệu và tạo kết quả chính thức trong một database transaction.
- Không được duyệt nếu kết quả cùng học viên/môn/học kỳ/lần thi đã tồn tại.

Kết quả chính thức gồm học viên, môn, lớp, học kỳ, điểm giữa kỳ, điểm cuối kỳ, điểm tổng kết, lần học/thi, nguồn tạo (`DIRECT` hoặc `APPROVED_REQUEST`), đề xuất nguồn nếu có, Chỉ huy tạo/duyệt và thời gian. Điểm được tạo ở trạng thái `FINALIZED`; không có trạng thái nháp, mở khóa hoặc chỉnh sửa.

### 5.3. Hệ dân sự

Tạo riêng `civilian_subject_results`, `civilian_semester_results`, `civilian_yearly_results`. Hệ dân sự dùng thang điểm 10. Chỉ huy hệ dân sự là người nhập điểm. Giai đoạn đầu xây dựng model và API tạo/xem; không cung cấp API sửa hoặc xóa điểm.

### 5.4. Quy tắc điểm quân sự

- Điểm giữa kỳ và cuối kỳ từ 0 đến 10.
- Không được lưu nếu thiếu một điểm thành phần.
- `Điểm tổng kết = giữa kỳ × trọng số giữa kỳ + cuối kỳ × trọng số cuối kỳ`.
- Điểm tổng kết làm tròn 2 chữ số.
- Dưới 5: Không đạt.
- Từ 5 đến dưới 6,5: Trung bình.
- Từ 6,5 đến dưới 8: Khá.
- Từ 8 đến 10: Giỏi.
- Khi học/thi lại, lưu tất cả các lần và dùng kết quả cao nhất để tổng hợp.

## 6. Phân quyền

### 6.1. Admin

Quản lý tài khoản, role, trạng thái và danh mục kỹ thuật chung. Không được xem/sửa hồ sơ, điểm, trường, lớp hoặc dữ liệu nghiệp vụ. Backend phải chặn quyền, không chỉ ẩn giao diện.

### 6.2. Chỉ huy hệ ngoài

- Quản lý trường ngoài và lớp; nhập hồ sơ, xếp học viên và chuyển lớp.
- Xem toàn bộ học viên hệ ngoài.
- Quản lý môn học, học kỳ và trực tiếp nhập/import điểm hệ ngoài.
- Xuất điểm và báo cáo theo lớp, môn, học kỳ.
- Xử lý yêu cầu chỉnh lịch học.
- Không được sửa hoặc xóa điểm đã nhập.

### 6.3. Chỉ huy hệ quân sự

- Quản lý lớp; nhập hồ sơ, xếp học viên và chuyển lớp.
- Quản lý môn học, học kỳ và lớp quân sự.
- Xem toàn bộ học viên trong hệ.
- Trực tiếp nhập điểm quân sự cho Học viên trong hệ.
- Xem, kiểm tra, duyệt hoặc từ chối đề xuất bảng điểm của Học viên.
- Điểm chính thức có thể được tạo từ thao tác nhập trực tiếp hoặc từ đề xuất đã duyệt.
- Xuất điểm và báo cáo.
- Không được sửa hoặc xóa đề xuất đã xử lý hay điểm chính thức.

### 6.4. Chỉ huy hệ dân sự

Quản lý môn học, học kỳ và trực tiếp nhập điểm hệ dân sự. Giai đoạn đầu chưa triển khai quản lý lớp. Không được sửa hoặc xóa điểm đã nhập.

### 6.5. Học viên

- Chỉ xem hồ sơ của mình và không tự sửa trực tiếp.
- Học viên quân sự tự nhập bảng điểm của mình và gửi đề xuất để Chỉ huy kiểm tra.
- Theo dõi trạng thái `PENDING`, `APPROVED`, `REJECTED` và lý do từ chối.
- Xem điểm quân sự chính thức sau khi Chỉ huy nhập trực tiếp hoặc sau khi đề xuất được duyệt.
- Không sửa hoặc xóa đề xuất đã gửi; nếu bị từ chối phải tạo đề xuất mới.
- Học viên hệ ngoài/dân sự xem điểm sau khi Chỉ huy nhập thành công.
- Hệ ngoài được gửi yêu cầu chỉnh lịch học, không gửi đề xuất điểm.

## 7. Quy trình điểm

### 7.1. Hệ ngoài và hệ dân sự

```text
Chỉ huy tạo lớp, môn và học kỳ trong hệ của mình
→ Chỉ huy chọn đúng hệ, lớp, môn và học viên
→ Chỉ huy nhập đầy đủ điểm
→ Hệ thống kiểm tra và tính tổng kết
→ Hệ thống lưu điểm chính thức, bất biến
→ Học viên và Chỉ huy được xem
```

Không có trạng thái nháp. Backend không cung cấp endpoint `PUT`, `PATCH` hoặc `DELETE` cho kết quả điểm. Nếu nhập sai, hệ thống không có luồng chỉnh sửa điểm; việc xử lý ngoại lệ nằm ngoài phạm vi đặc tả hiện tại.

### 7.2. Hệ quân sự

Luồng Chỉ huy nhập trực tiếp:

```text
Chỉ huy chọn lớp, học viên, môn và học kỳ
→ Chỉ huy nhập đầy đủ điểm
→ Hệ thống kiểm tra trùng và tính tổng kết
→ Hệ thống lưu điểm FINALIZED với nguồn DIRECT
```

Luồng Học viên đề xuất:

```text
Học viên chọn học kỳ và nhập danh sách điểm môn học
→ Hệ thống kiểm tra dữ liệu và tạo đề xuất PENDING
→ Chỉ huy quân sự xem bảng điểm và thông tin Học viên
→ Chỉ huy duyệt hoặc từ chối, có ghi chú khi từ chối
→ Nếu duyệt, hệ thống tạo điểm chính thức trong transaction
→ Hệ thống tính kết quả tổng hợp và gửi thông báo
```

Chỉ huy không được thay đổi các giá trị điểm trong đề xuất. Chỉ có hai hành động xử lý: duyệt toàn bộ hoặc từ chối toàn bộ đề xuất.

### 7.3. Import Excel

- Chỉ huy hệ ngoài/dân sự được import điểm chính thức trong đúng hệ mình quản lý.
- Không được import trực tiếp điểm quân sự; điểm quân sự phải đi qua đề xuất của Học viên.
- Kiểm tra mã học viên, hệ, lớp, môn, phạm vi điểm và bước 0,5.
- Từ chối nếu cùng học viên/môn/học kỳ/lần thi đã tồn tại; không ghi đè. Học hoặc thi lại phải tạo `attempt_number` mới.
- Chạy toàn bộ lô trong database transaction.
- Một dòng sai thì không ghi một phần; trả lỗi cụ thể theo dòng.

## 8. Audit log và thông báo

### 8.1. Audit log

Tạo `audit_logs`, lưu người thực hiện, role, hệ, hành động, loại/ID đối tượng, dữ liệu trước/sau, lý do, request ID, IP và thời gian.

Bắt buộc audit:

- Tạo/import điểm trực tiếp ở hệ ngoài/dân sự.
- Tạo điểm quân sự trực tiếp bởi Chỉ huy.
- Tạo, duyệt hoặc từ chối đề xuất điểm quân sự.
- Tạo kết quả quân sự từ đề xuất đã duyệt.
- Mọi lần truy cập/xuất dữ liệu điểm của Chỉ huy.
- Chuyển lớp.
- Khóa/mở tài khoản.
- Thay đổi role hoặc hệ.
- Xóa hoặc ngừng sử dụng dữ liệu.

Audit log không được sửa/xóa qua API thông thường. Vì Admin không được xem điểm, API audit dành cho Admin không được trả nội dung điểm cũ/mới.

### 8.2. Thông báo

Gửi thông báo khi Chỉ huy chuyển lớp, Học viên quân sự gửi đề xuất, Chỉ huy duyệt/từ chối đề xuất và khi điểm chính thức được tạo. Không có thông báo sửa hoặc mở khóa điểm.

## 9. Backend API và bảo mật

Tổ chức API theo phạm vi:

```text
/api/external/...
/api/military/...
/api/civilian/...
/api/commander/...
```

Yêu cầu bắt buộc:

- Backend tự xác định phạm vi từ role và hệ của Chỉ huy/Học viên.
- Không tin `systemType` hoặc `commanderId` client gửi để quyết định quyền.
- Mọi truy vấn danh sách/chi tiết phải lọc theo hệ và phạm vi.
- Kiểm tra quyền ở route và service.
- Cập nhật validation, Swagger và mã lỗi cho `system_type` cùng phạm vi theo hệ.
- Giữ tương thích API đọc dữ liệu hệ ngoài trong quá trình chuyển đổi; ngừng endpoint đề xuất và sửa/xóa điểm.
- API dân sự giai đoạn đầu gồm CRUD cho hồ sơ/môn/học kỳ và chỉ `POST`/`GET` cho điểm; chưa có quản lý lớp.
- API quân sự cho phép Chỉ huy tạo điểm trực tiếp; Học viên tạo/xem đề xuất của mình; Chỉ huy xem/duyệt/từ chối đề xuất. Không có endpoint sửa đề xuất hoặc điểm chính thức.

## 10. Frontend

### 10.1. Commander Portal

- Hệ ngoài: trường, lớp, hồ sơ, lịch học, nhập/import điểm và báo cáo.
- Hệ quân sự: lớp, hồ sơ, môn, học kỳ, nhập điểm trực tiếp, danh sách đề xuất, duyệt/từ chối và báo cáo.
- Hệ dân sự: khung môn học và nhập điểm; chưa quản lý lớp ở giai đoạn đầu.
- Không có nút hoặc màn hình sửa/xóa điểm.

### 10.2. Admin Portal

Chỉ quản lý tài khoản, role, trạng thái và danh mục kỹ thuật; không gọi hoặc hiển thị API hồ sơ/điểm.

### 10.3. Student Portal

Chỉ hiển thị dữ liệu của chính học viên. Học viên quân sự có form nhập bảng điểm, gửi/theo dõi đề xuất và xem điểm chính thức do Chỉ huy nhập trực tiếp hoặc duyệt. Hệ ngoài giữ chức năng yêu cầu chỉnh lịch học nhưng không có đề xuất điểm.

## 11. Migration dữ liệu

Phải giữ nguyên dữ liệu hiện tại; backend và frontend được nâng cấp đồng thời.

1. Tạo bảng mới, constraint và index; chưa xóa cấu trúc cũ.
2. Backfill `system_type = EXTERNAL` cho dữ liệu hiện tại phù hợp.
3. Tách thông tin đào tạo hiện tại sang `external_enrollments`.
4. Chuyển/đổi tên hồ sơ hiện tại sang `military_profiles` bằng migration an toàn.
5. Đối chiếu số lượng, khóa ngoại và dữ liệu.
6. Triển khai backend/frontend mới đồng thời.
7. Chỉ ngừng dùng cột cũ sau khi xác minh hoàn tất.

Không sử dụng `sequelize.sync({ force: true })` hoặc reset database có dữ liệu thật. Mọi thay đổi schema phải dùng migration có phiên bản và phương án rollback.

## 12. Thứ tự triển khai

1. Role, `system_type`, middleware và phân quyền theo phạm vi.
2. Hồ sơ, enrollment và migration hệ ngoài hiện tại.
3. Lớp, môn và học kỳ hệ quân sự.
4. Điểm trực tiếp cho cả ba hệ và đề xuất/duyệt điểm quân sự.
5. Commander Portal theo từng hệ.
6. Excel, báo cáo, thông báo và audit log.
7. Khung model/API hệ dân sự.

## 13. Kế hoạch kiểm thử

### Kiểm thử bắt buộc

- Ma trận `role × system × endpoint`.
- Admin không thể xem hồ sơ hoặc điểm.
- Chỉ huy không thể xem dữ liệu hệ khác.
- Chỉ huy không thể nhập điểm cho hệ khác.
- Chỉ huy quân sự được nhập trực tiếp nhưng không thể thay đổi giá trị trong đề xuất của Học viên.
- Nhập trực tiếp và duyệt đề xuất đều phải chống trùng cùng học viên/môn/học kỳ/lần thi.
- Học viên quân sự không thể tạo đề xuất cho người khác hoặc ngoài hệ/lớp của mình.
- Đề xuất đã gửi không thể sửa/xóa; đề xuất đã xử lý không thể xử lý lại.
- Duyệt đề xuất tạo toàn bộ kết quả trong một transaction và chống trùng lần thi.
- Không thể lưu khi thiếu điểm thành phần.
- Điểm đúng phạm vi 0–10 và bước 0,5.
- Trọng số bằng 100% và không sửa được sau khi có điểm.
- API điểm không có `PUT`, `PATCH`, `DELETE` và từ chối ghi đè kết quả đã tồn tại.
- Học/thi lại lưu mọi lần và lấy kết quả cao nhất.
- Import Excel rollback toàn bộ khi có dòng lỗi.
- Chuyển lớp lưu lịch sử.
- Khóa tài khoản không làm mất dữ liệu.
- Migration giữ nguyên dữ liệu cũ.
- API hệ ngoài tiếp tục hoạt động.

### Tiêu chí nghiệm thu

1. Không API nào làm lộ hồ sơ hoặc điểm chéo hệ.
2. Admin không truy cập được dữ liệu nghiệp vụ bị cấm.
3. Chỉ Chỉ huy đúng hệ được tạo điểm trực tiếp; hệ quân sự còn có thể tạo điểm từ đề xuất được duyệt.
4. Điểm đã nhập là bất biến, không thể sửa, xóa hoặc mở khóa.
5. Mọi thao tác tạo, import, xem và xuất điểm đều truy vết được.
6. Dữ liệu hệ ngoài hiện tại được bảo toàn.
