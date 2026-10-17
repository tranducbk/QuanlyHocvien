# Đặc tả hệ thống Quản lý Học viên

## 1. Mô hình hệ thống

Hệ thống quản lý năm hệ độc lập:

| Hệ | Đối tượng và nghiệp vụ |
|:---|:---|
| Hệ 1 | Học viên sĩ quan theo chương trình đào tạo Hệ 1. Dùng quy trình quản lý chung với Hệ 7. |
| Hệ 3 | Học viên phân đội ngành Trinh sát kỹ thuật; có chương trình và nội dung rèn luyện phù hợp với ngành. |
| Hệ 4 | Học viên phân đội Ngôn ngữ Anh, Trung, Nga và Quan hệ quốc tế; có chương trình và nội dung rèn luyện phù hợp với ngành. |
| Hệ 5 | Học viên học tại cơ sở đào tạo ngoài quân đội; quản lý cơ sở, tổ chức/chuyên ngành, trình độ, lớp, học phí và lịch cắt cơm. |
| Hệ 7 | Học viên sĩ quan theo chương trình đào tạo Hệ 7. Nghiệp vụ giống Hệ 1; không có ngoại lệ giữa hai hệ. |

Hệ 1 và Hệ 7 khác nhau ở chương trình đào tạo. Chương trình là dữ liệu cấu hình theo hệ, không tạo nhánh nghiệp vụ riêng.

Mỗi tài khoản nghiệp vụ và mọi dữ liệu nghiệp vụ thuộc đúng một hệ. Học viên không chuyển hệ; học viên được chuyển lớp trong cùng hệ và lưu lịch sử chuyển lớp.

## 2. Vai trò và quyền

### Admin

- Xem và chỉnh sửa tài khoản thuộc mọi hệ, gồm role và trạng thái tài khoản.
- Chỉ xem thông tin chính trị nội bộ; không chỉnh sửa thông tin này.
- Không xem, sửa, xóa hoặc mở khóa điểm chính thức.
- Tạo/quản lý lớp và phân công Chỉ huy theo quy trình quản trị lớp của hệ.

### Chỉ huy

- Quản lý học viên và nghiệp vụ trong hệ mình phụ trách.
- Quản lý thông tin chính trị nội bộ của học viên trong phạm vi hệ.
- Quản lý lớp, môn, học kỳ, lịch học, kết quả và các nghiệp vụ thuộc hệ.
- Không sửa, xóa hoặc mở khóa điểm chính thức đã ghi nhận.

### Học viên

- Chỉ xem thông tin chính trị nội bộ, lịch, kết quả và nghiệp vụ của chính mình.
- Học viên thuộc các hệ có quy trình đề xuất điểm được phép gửi đề xuất của bản thân và theo dõi trạng thái xử lý.
- Không sửa hoặc xóa đề xuất đã gửi.

Backend xác định quyền và hệ từ tài khoản đã xác thực; không tin hệ, mã học viên hoặc mã Chỉ huy do client gửi.

## 3. Thông tin chính trị nội bộ và đào tạo

- Thông tin chính trị nội bộ dùng chung cho cả năm hệ và được gọi thống nhất bằng tên này trong giao diện, API docs và tài liệu.
- Thông tin đào tạo gồm hệ, khóa, chương trình, đơn vị/cơ sở đào tạo, lớp, môn, học kỳ, lịch và kết quả.
- Mỗi học viên có đúng một hệ; các bản ghi đào tạo phải cùng hệ với học viên.
- Admin chỉ có quyền đọc thông tin chính trị nội bộ. Chỉ huy được quản lý dữ liệu học viên trong hệ phụ trách; Học viên chỉ đọc dữ liệu của mình.

## 4. Nghiệp vụ theo hệ

### Hệ 1 và Hệ 7

- Quản lý học viên sĩ quan theo khóa, lớp và chương trình riêng của từng hệ.
- Dùng chung quy trình quản lý thông tin chính trị nội bộ, lớp, môn, học kỳ, lịch học, kết quả, thành tích, rèn luyện, khen thưởng, kỷ luật, lịch trực và đăng ký ra ngoài.
- Không tạo ngoại lệ nghiệp vụ giữa Hệ 1 và Hệ 7.

### Hệ 3

- Quản lý học viên phân đội ngành Trinh sát kỹ thuật theo khóa và lớp.
- Theo dõi học tập và rèn luyện theo chương trình của hệ.
- Nội dung thể lực mô tả trong phạm vi hiện tại gồm chạy 100 m, chạy 3.000 m đối với nam, xà, bơi 100 m, nhảy ba bước đối với nam và chống đẩy theo mức chưa đạt/đạt/khá/giỏi.
- Quản lý lịch đăng ký ra ngoài, thành tích, khen thưởng và kỷ luật theo quyền hạn của hệ.

### Hệ 4

- Quản lý học viên phân đội theo khóa, lớp và ngành Ngôn ngữ Anh, Trung, Nga hoặc Quan hệ quốc tế.
- Theo dõi học tập và rèn luyện theo chương trình của hệ.
- Nội dung thể lực mô tả trong phạm vi hiện tại gồm chạy 100 m, chạy 1.500 m đối với nữ hoặc 3.000 m đối với nam, xà, bơi 100 m, nhảy xa đối với nữ hoặc nhảy ba bước đối với nam và chống đẩy theo mức chưa đạt/đạt/khá/giỏi.
- Quản lý lịch đăng ký ra ngoài, thành tích, khen thưởng và kỷ luật theo quyền hạn của hệ.

### Hệ 5

- Quản lý cơ sở đào tạo ngoài quân đội, tổ chức/chuyên ngành, trình độ, lớp và hồ sơ học tập.
- Quản lý môn, học kỳ, lịch học và kết quả học tập.
- Quản lý học phí, lịch cắt cơm, thành tích, đề tài và sáng kiến.
- Áp dụng quy trình nhập điểm và báo cáo riêng của Hệ 5.

## 5. Lớp, lịch học và chuyển lớp

- Lớp thuộc duy nhất một hệ, đơn vị/cơ sở và chương trình đào tạo phù hợp.
- Học viên chỉ được xếp vào lớp thuộc hệ của mình.
- Chỉ huy xem và quản lý lớp thuộc hệ mình phụ trách.
- Lịch học của lớp thuộc lớp và học kỳ; học viên trong cùng lớp xem cùng lịch.
- Mỗi lần chuyển lớp lưu học viên, lớp cũ/mới, người thực hiện, lý do và thời gian.

## 6. Kết quả học tập

- Kết quả gắn với học viên, hệ, lớp, môn, học kỳ, lần học/thi và người ghi nhận.
- Chỉ Chỉ huy được truy cập API quản lý kết quả. Học viên chỉ xem kết quả của mình; Admin không xem điểm.
- Điểm chính thức bất biến: không có thao tác hoặc API sửa, xóa hay mở khóa.
- Hệ thống lưu mọi lần học/thi; khi tổng hợp dùng kết quả cao nhất theo quy định.
- Không lưu kết quả nếu thiếu điểm thành phần bắt buộc hoặc trùng học viên/môn/học kỳ/lần thi.
- Điểm thành phần theo thang 0–10; điểm tổng kết tính theo trọng số và làm tròn hai chữ số.
- Phân loại: dưới 5 không đạt; từ 5 đến dưới 6,5 trung bình; từ 6,5 đến dưới 8 khá; từ 8 đến 10 giỏi.
- Luồng nhập trực tiếp và đề xuất/duyệt điểm tuân theo quy trình của từng hệ. Khi duyệt đề xuất, toàn bộ kết quả được tạo trong một transaction.

## 7. Rèn luyện và nghiệp vụ khác

- Chỉ huy quản lý rèn luyện, thành tích, khen thưởng, kỷ luật, lịch trực và đăng ký ra ngoài trong đúng phạm vi hệ.
- Hệ 5 có thêm cơ sở đào tạo, học phí và lịch cắt cơm; các hệ khác không dùng các chức năng này.
- Thông báo được gửi theo sự kiện nghiệp vụ và tới đúng người nhận.
- Audit log ghi người thực hiện, hệ, hành động, đối tượng, thời gian và request ID. Audit log không được sửa/xóa qua API thông thường; dữ liệu điểm trong audit không hiển thị cho Admin.

## 8. Kiến trúc và API

- Backend theo luồng `route → controller → service → model`; validation nằm trong `backend/src/validations`.
- Controller điều phối request/response; nghiệp vụ và transaction nằm trong service.
- API nghiệp vụ được scope theo một trong năm hệ tại route và service.
- Frontend gọi API qua `frontend/services`, endpoint tập trung tại `frontend/constants/endpoints.ts`.
- Server state dùng React Query; Zustand dành cho xác thực và state UI dùng chung.

## 9. Migration và bảo toàn dữ liệu

- Migration dùng phiên bản, có thể chạy lặp an toàn và không xóa dữ liệu nghiệp vụ.
- Bảo toàn tài khoản, thông tin chính trị nội bộ, lớp, lịch sử học tập, điểm và lịch sử thao tác.
- Mỗi bản ghi hiện có phải được ánh xạ chính xác vào một trong năm hệ trước khi chuyển đổi.
- Không dùng `sequelize.sync({ force: true })` hoặc reset database để thay đổi mô hình.

## 10. Kiểm tra nghiệm thu

- Kiểm thử ma trận role × hệ × API; không đọc/ghi chéo hệ.
- Admin chỉnh sửa được tài khoản mọi hệ, chỉ đọc thông tin chính trị nội bộ và không xem điểm.
- Chỉ huy chỉ quản lý đúng hệ; Học viên chỉ đọc dữ liệu của mình.
- Hệ 1 và Hệ 7 theo cùng quy trình, chương trình đào tạo được phân biệt.
- Học viên chỉ vào lớp cùng hệ; chuyển lớp có lịch sử.
- Điểm chính thức không thể sửa, xóa hoặc mở khóa; quy trình đề xuất/duyệt chống trùng và tạo kết quả nguyên tử.
- Chức năng học phí và cắt cơm chỉ xuất hiện trong Hệ 5.
- Migration bảo toàn dữ liệu và API không nhận phạm vi quyền từ client.
