# Đặc tả mở rộng Hệ thống Quản lý Học viên

## 1. Mục tiêu và phạm vi

Mở rộng hệ thống để quản lý ba hệ đào tạo độc lập:

1. **Hệ ngoài (`EXTERNAL`)**: quân nhân được cử đi học tại trường bên ngoài.
2. **Hệ nội bộ quân sự (`MILITARY`)**.
3. **Hệ nội bộ dân sự (`CIVILIAN`)**.

Bổ sung cổng Giảng viên, Phòng đào tạo, quản lý môn học, phân công giảng dạy, nhập/chốt/mở khóa điểm, Excel, báo cáo, thông báo và audit log. Dữ liệu đào tạo, môn học và điểm của ba hệ phải nằm trong các bảng vật lý riêng để không lẫn dữ liệu.

## 2. Quyết định nghiệp vụ đã thống nhất

- Mỗi học viên chỉ thuộc một hệ và không được chuyển sang hệ khác.
- Học viên có thể chuyển lớp trong cùng hệ; Chỉ huy thực hiện và hệ thống lưu lịch sử.
- Mã học viên duy nhất trên toàn hệ thống.
- Mỗi tài khoản chỉ có một role.
- Mỗi hệ có một Chỉ huy; mỗi học viên có một Chỉ huy.
- Chỉ huy xem toàn bộ học viên thuộc hệ mình.
- Giảng viên dạy hệ quân sự và dân sự, không dạy hệ ngoài.
- Phạm vi Giảng viên được xác định theo phân công, không theo một hệ cố định.
- Mỗi hệ có danh mục môn học riêng.
- Hệ dân sự giai đoạn đầu chỉ xây dựng model và API CRUD, chưa làm quản lý lớp và giao diện hoàn chỉnh.
- Khi người dùng ngừng sử dụng: khóa tài khoản, không xóa hồ sơ, điểm hoặc lịch sử.
- Dữ liệu hiện tại phải được giữ nguyên; backend và frontend nâng cấp đồng thời.

## 3. Tài khoản, hồ sơ và đào tạo

### 3.1. `users`

Chuẩn hóa `role` thành:

- `ADMIN`
- `COMMANDER`
- `ACADEMIC_OFFICER`
- `TEACHER`
- `STUDENT`

Bổ sung `system_type`: `EXTERNAL`, `MILITARY`, `CIVILIAN` hoặc `NULL`.

- `system_type` bắt buộc với `STUDENT` và `COMMANDER`.
- `system_type` để `NULL` với `ADMIN`, `ACADEMIC_OFFICER`, `TEACHER`.
- Giảng viên được giới hạn bằng bảng phân công.
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

## 4. Môn học, học kỳ và phân công

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

Môn chưa được sử dụng có thể xóa. Môn đã có phân công hoặc điểm chỉ được chuyển sang trạng thái ngừng sử dụng.

### 4.2. Phân công Giảng viên

Không tạo thực thể lớp học phần riêng. Phân công được xác định bằng tổ hợp môn, lớp và học kỳ:

- `military_teacher_assignments`
- `civilian_teacher_assignments`

Trường chính: `teacher_id`, `subject_id`, `semester_id`, `class_id`, trạng thái, người phân công và thời gian. Một môn/lớp/học kỳ có thể có nhiều Giảng viên. Giảng viên chỉ được nhập điểm trong phân công còn hiệu lực.

## 5. Kết quả học tập

### 5.1. Hệ ngoài

Giữ tương thích với `subject_results`, `semester_results`, `yearly_results` và `grade_requests`. Quy trình giữ nguyên: Học viên gửi đề xuất điểm kèm minh chứng, Chỉ huy hệ ngoài duyệt. Học viên hệ ngoài cũng được gửi yêu cầu chỉnh sửa lịch học.

### 5.2. Hệ quân sự

Tạo riêng `military_subject_results`, `military_semester_results`, `military_yearly_results`.

Kết quả môn gồm học viên, môn, lớp, học kỳ, phân công Giảng viên, điểm giữa kỳ, điểm cuối kỳ, điểm tổng kết, lần học/thi, trạng thái, người chốt và thời gian chốt. Trạng thái tối thiểu: `DRAFT`, `LOCKED`, `UNLOCK_REQUESTED`, `UNLOCKED`.

### 5.3. Hệ dân sự

Tạo riêng `civilian_subject_results`, `civilian_semester_results`, `civilian_yearly_results`. Hệ dân sự dùng thang điểm 10. Giai đoạn đầu chỉ xây dựng model và API CRUD.

### 5.4. Quy tắc điểm quân sự

- Điểm giữa kỳ và cuối kỳ từ 0 đến 10, chỉ nhận theo bước 0,5.
- Không được chốt nếu thiếu một điểm thành phần.
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
- Duyệt đề xuất điểm và xử lý yêu cầu chỉnh lịch học.

### 6.3. Chỉ huy hệ quân sự

- Quản lý lớp; nhập hồ sơ, xếp học viên và chuyển lớp.
- Xem toàn bộ học viên và điểm đã chốt.
- Không nhập, sửa, chốt hoặc mở khóa điểm.

### 6.4. Chỉ huy hệ dân sự

Có khung quyền tương tự Chỉ huy quân sự nhưng chưa triển khai quản lý lớp ở giai đoạn đầu. Không được sửa điểm.

### 6.5. Phòng đào tạo

Role `ACADEMIC_OFFICER`, dùng chung cho hệ quân sự và dân sự:

- Quản lý học kỳ và danh mục môn học.
- Phân công Giảng viên.
- Xem điểm nội bộ.
- Duyệt hoặc từ chối yêu cầu mở khóa.
- Xuất báo cáo theo lớp, môn và học kỳ.

### 6.6. Giảng viên

- Xem môn/lớp/học kỳ và học viên thuộc phân công.
- Nhập/sửa điểm nháp, import/export Excel và chốt điểm.
- Gửi yêu cầu mở khóa cho một học viên, kèm lý do và minh chứng.
- Không tự tạo môn, học kỳ hoặc phân công.
- Không xem ngoài phân công và không nhập điểm hệ ngoài.

### 6.7. Học viên

- Chỉ xem hồ sơ của mình và không tự sửa trực tiếp.
- Chỉ xem điểm sau khi Giảng viên chốt.
- Hệ ngoài tiếp tục gửi đề xuất điểm và yêu cầu chỉnh lịch học.

## 7. Quy trình điểm nội bộ

### 7.1. Nhập và chốt

```text
Phòng đào tạo tạo môn, học kỳ và phân công
→ Giảng viên nhập điểm nháp
→ Hệ thống kiểm tra và tính tổng kết
→ Giảng viên chốt
→ Điểm bị khóa
→ Học viên, Chỉ huy và Phòng đào tạo được xem
```

Điểm nháp không hiển thị cho Học viên hoặc Chỉ huy.

### 7.2. Mở khóa

```text
Giảng viên gửi yêu cầu cho một học viên, có lý do và minh chứng
→ Phòng đào tạo duyệt hoặc từ chối, có ghi lý do
→ Nếu duyệt, Giảng viên sửa điểm
→ Giảng viên chốt lại
→ Hệ thống khóa và tính lại kết quả tổng hợp
```

Phải lưu toàn bộ phiên bản điểm trước/sau mỗi lần sửa, không cập nhật đè làm mất lịch sử.

### 7.3. Import Excel

- Chỉ import trong đúng phân công.
- Kiểm tra mã học viên, phạm vi điểm, bước 0,5 và trạng thái khóa.
- Chạy toàn bộ lô trong database transaction.
- Một dòng sai thì không ghi một phần; trả lỗi cụ thể theo dòng.

## 8. Audit log và thông báo

### 8.1. Audit log

Tạo `audit_logs`, lưu người thực hiện, role, hệ, hành động, loại/ID đối tượng, dữ liệu trước/sau, lý do, request ID, IP và thời gian.

Bắt buộc audit:

- Chốt, mở khóa và sửa điểm.
- Duyệt/từ chối yêu cầu mở khóa.
- Chuyển lớp.
- Khóa/mở tài khoản.
- Thay đổi role hoặc hệ.
- Xóa hoặc ngừng sử dụng dữ liệu.

Audit log không được sửa/xóa qua API thông thường. Vì Admin không được xem điểm, API audit dành cho Admin không được trả nội dung điểm cũ/mới.

### 8.2. Thông báo

Gửi thông báo khi phân công/hủy phân công Giảng viên, chốt điểm, gửi yêu cầu mở khóa, duyệt/từ chối yêu cầu và chốt lại điểm sau chỉnh sửa.

## 9. Backend API và bảo mật

Tổ chức API theo phạm vi:

```text
/api/external/...
/api/military/...
/api/civilian/...
/api/teacher/...
/api/academic-office/...
```

Yêu cầu bắt buộc:

- Backend tự xác định phạm vi từ user đăng nhập và bảng phân công.
- Không tin `systemType`, `teacherId` hoặc `commanderId` client gửi để quyết định quyền.
- Mọi truy vấn danh sách/chi tiết phải lọc theo hệ và phạm vi.
- Kiểm tra quyền ở route và service.
- Cập nhật validation, Swagger và mã lỗi cho role mới.
- Giữ tương thích API hệ ngoài trong quá trình chuyển đổi.
- API dân sự giai đoạn đầu chỉ gồm model và CRUD cơ bản; chưa có quản lý lớp.

## 10. Frontend

### 10.1. Teacher Portal

Tạo `frontend/app/teacher`:

- Dashboard phân công.
- Danh sách môn/lớp/học kỳ và học viên.
- Nhập điểm trực tiếp, import/export Excel.
- Chốt điểm và gửi/theo dõi yêu cầu mở khóa.

### 10.2. Academic Office Portal

Tạo `frontend/app/academic-office`:

- Quản lý học kỳ, môn học và phân công.
- Xem điểm nội bộ.
- Duyệt/từ chối mở khóa.
- Báo cáo và export.

### 10.3. Commander Portal

- Hệ ngoài: trường, lớp, hồ sơ, lịch học và duyệt đề xuất điểm.
- Hệ quân sự: lớp, hồ sơ và xem điểm đã chốt.
- Hệ dân sự: chỉ dựng khung cần thiết ở giai đoạn đầu.

### 10.4. Admin Portal

Chỉ quản lý tài khoản, role, trạng thái và danh mục kỹ thuật; không gọi hoặc hiển thị API hồ sơ/điểm.

### 10.5. Student Portal

Chỉ hiển thị dữ liệu của chính học viên, không hiển thị điểm nháp. Hệ ngoài giữ chức năng đề xuất điểm và yêu cầu chỉnh lịch học.

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
3. Lớp, môn, học kỳ và phân công hệ quân sự.
4. Điểm quân sự và Teacher Portal.
5. Academic Office Portal, chốt/mở khóa và lịch sử điểm.
6. Excel, báo cáo, thông báo và audit log.
7. Khung model/API hệ dân sự.

## 13. Kế hoạch kiểm thử

### Kiểm thử bắt buộc

- Ma trận `role × system × endpoint`.
- Admin không thể xem hồ sơ hoặc điểm.
- Chỉ huy không thể xem dữ liệu hệ khác.
- Giảng viên không thể xem/nhập điểm ngoài phân công.
- Học viên không thể xem điểm nháp.
- Không thể chốt khi thiếu điểm thành phần.
- Điểm đúng phạm vi 0–10 và bước 0,5.
- Trọng số bằng 100% và không sửa được sau khi có điểm.
- Mở khóa đúng một học viên và lưu đủ phiên bản.
- Học/thi lại lưu mọi lần và lấy kết quả cao nhất.
- Import Excel rollback toàn bộ khi có dòng lỗi.
- Chuyển lớp lưu lịch sử.
- Khóa tài khoản không làm mất dữ liệu.
- Migration giữ nguyên dữ liệu cũ.
- API hệ ngoài tiếp tục hoạt động.

### Tiêu chí nghiệm thu

1. Không API nào làm lộ hồ sơ hoặc điểm chéo hệ.
2. Admin không truy cập được dữ liệu nghiệp vụ bị cấm.
3. Giảng viên chỉ thao tác trên đúng phân công.
4. Điểm đã chốt không thể sửa nếu chưa được Phòng đào tạo mở khóa.
5. Mọi thay đổi điểm đều truy vết được.
6. Dữ liệu hệ ngoài hiện tại được bảo toàn.
