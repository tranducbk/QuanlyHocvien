# Đặc tả phạm vi hệ thống quản lý học viên

## 1. Mục tiêu

Xây dựng hệ thống hỗ trợ quản lý học viên thuộc các đơn vị trong Học viện Khoa học Quân sự (HVKHQS), gồm quản lý tài khoản, thông tin chính trị nội bộ, lớp, học tập và các nghiệp vụ được xác nhận cho từng hệ.

## 2. Phạm vi các hệ

Tài liệu sử dụng tên nghiệp vụ **Hệ 1, Hệ 3, Hệ 4, Hệ 5 và Hệ 7**. Hệ 5 quản lý học viên học tại các cơ sở đào tạo ngoài quân đội.

| Hệ | Đối tượng và phạm vi |
|:---|:---|
| Hệ 1 | Học viên sĩ quan theo chương trình đào tạo của Hệ 1. |
| Hệ 3 | Học viên phân đội ngành Trinh sát kỹ thuật. |
| Hệ 4 | Học viên phân đội các ngành Ngôn ngữ Anh, Trung, Nga và Quan hệ quốc tế. |
| Hệ 5 | Học viên học tại cơ sở đào tạo ngoài quân đội. |
| Hệ 7 | Học viên sĩ quan theo chương trình đào tạo của Hệ 7. |

Hệ 1 và Hệ 7 cùng quản lý học viên sĩ quan. Các nghiệp vụ quản lý của hai hệ tương tự nhau; khác biệt nằm ở chương trình đào tạo.

### 2.1. Phân hệ tài khoản

Mỗi tài khoản Chỉ huy hoặc Học viên được gắn với một trong năm hệ. Admin không thuộc hệ đào tạo và có phạm vi quản trị toàn hệ thống. Backend xác định hệ theo tài khoản đã xác thực và áp dụng scope đó cho mọi API nghiệp vụ.

## 3. Nghiệp vụ theo hệ

### 3.1. Hệ 1 và Hệ 7

Hệ 1 và Hệ 7 cùng quản lý học viên sĩ quan. Các nghiệp vụ thông tin chính trị nội bộ, học tập và quản lý học viên tương tự nhau; mỗi hệ áp dụng chương trình đào tạo riêng. Những yêu cầu nghiệp vụ chung được mô tả tại mục này và áp dụng cho cả hai hệ, trừ nội dung thuộc riêng chương trình đào tạo.

- Quản lý học viên sĩ quan theo khóa, lớp và chương trình ngắn hạn/dài hạn.
- Quản lý thông tin chính trị nội bộ của học viên theo chức năng đã triển khai.
- Theo dõi học tập theo khóa, lớp và môn học.
- Nghiệp vụ rèn luyện dự kiến gồm chấp hành kỷ luật, điều lệnh đội ngũ và thể lực: chạy 100 m; chạy 1.500 m đối với nữ hoặc 3.000 m đối với nam; xà; bơi 100 m; nhảy xa đối với nữ hoặc nhảy ba bước đối với nam; chống đẩy theo mức chưa đạt, đạt, khá, giỏi.
- Nghiệp vụ đăng ký ra ngoài doanh trại dự kiến theo khung giờ đơn vị: tối thứ Tư đến 21 giờ; từ chiều thứ Sáu đến 18 giờ Chủ nhật.
- Quản lý khen thưởng và kỷ luật theo quy trình, quyền hạn được xác nhận.

### 3.2. Hệ 3

- Quản lý học viên phân đội ngành Trinh sát kỹ thuật theo khóa và lớp.
- Quản lý thông tin chính trị nội bộ của học viên theo chức năng đã triển khai.
- Theo dõi học tập theo khóa, lớp và môn học.
- Nghiệp vụ rèn luyện dự kiến gồm chấp hành kỷ luật, điều lệnh đội ngũ và thể lực: chạy 100 m; chạy 3.000 m đối với nam; xà; bơi 100 m; nhảy ba bước đối với nam; chống đẩy theo mức chưa đạt, đạt, khá, giỏi.
- Nghiệp vụ đăng ký ra ngoài doanh trại dự kiến theo khung giờ đơn vị: chiều thứ Ba từ 16 giờ 15 đến 17 giờ 30; Chủ nhật từ 7 giờ đến 16 giờ.
- Quản lý khen thưởng và kỷ luật theo quy trình, quyền hạn được xác nhận.

### 3.3. Hệ 4

- Quản lý học viên phân đội theo khóa, lớp và ngành: Ngôn ngữ Anh, Trung, Nga hoặc Quan hệ quốc tế.
- Quản lý thông tin chính trị nội bộ của học viên theo chức năng đã triển khai.
- Theo dõi học tập theo khóa, lớp và môn học.
- Nghiệp vụ rèn luyện dự kiến gồm chấp hành kỷ luật, điều lệnh đội ngũ và thể lực: chạy 100 m; chạy 1.500 m đối với nữ hoặc 3.000 m đối với nam; xà; bơi 100 m; nhảy xa đối với nữ hoặc nhảy ba bước đối với nam; chống đẩy theo mức chưa đạt, đạt, khá, giỏi.
- Nghiệp vụ đăng ký ra ngoài doanh trại dự kiến theo khung giờ đơn vị: chiều thứ Ba từ 16 giờ 15 đến 17 giờ 30; Chủ nhật từ 7 giờ đến 16 giờ.
- Quản lý khen thưởng và kỷ luật theo quy trình, quyền hạn được xác nhận.

### 3.4. Hệ 5

- Quản lý học viên theo khóa, lớp và cơ sở đào tạo ngoài quân đội.
- Quản lý thông tin cơ sở đào tạo, tổ chức/chuyên ngành, trình độ đào tạo và lớp.
- Theo dõi thông tin chính trị nội bộ, lịch học và kết quả học tập.
- Quản lý học phí và lịch cắt cơm.
- Nghiệp vụ thành tích, đề tài và sáng kiến theo phạm vi Hệ 5.

## 4. Vai trò và dữ liệu

- **Admin:** được xem và chỉnh sửa tài khoản của tất cả các hệ; chỉ được xem thông tin chính trị nội bộ, không được chỉnh sửa thông tin này hoặc xem điểm nghiệp vụ.
- **Chỉ huy:** quản lý học viên, lớp và nghiệp vụ của hệ được phân công.
- **Học viên:** xem thông tin chính trị nội bộ, lịch và kết quả của chính mình theo các API dành cho Học viên.
- Backend phải xác định hệ và phạm vi dữ liệu từ tài khoản đã xác thực; không tin `systemType` hoặc mã đơn vị do client tự gửi để cấp quyền.
- Thông tin chính trị nội bộ là tên nghiệp vụ dùng trong tài liệu; source hiện lưu dữ liệu này qua model `Profile`.
- Điểm chính thức ở mọi hệ là bất biến: không sửa, xóa hoặc mở khóa.
- Admin không được xem điểm chính thức.

## 5. Trạng thái và lộ trình phát triển

### Các năng lực của hệ thống

- Ba vai trò: `ADMIN`, `COMMANDER`, `STUDENT`.
- Thông tin chính trị nội bộ dùng chung model `Profile`.
- Hệ 1, 3, 4 và 7 quản lý học viên thuộc các đơn vị trong Học viện theo hệ, lớp và chương trình đào tạo.
- Hệ 5 quản lý học viên, cơ sở đào tạo ngoài quân đội, học tập, học phí và lịch cắt cơm.
- Lịch học, thành tích, kết quả và các chức năng rèn luyện được giới hạn theo hệ.

### Nguyên tắc triển khai

1. Mỗi bản ghi nghiệp vụ phải gắn với một hệ; mọi truy vấn phải giới hạn ở hệ của tài khoản đã xác thực.
2. Hệ 1 và Hệ 7 dùng cùng quy trình nghiệp vụ, chương trình đào tạo là cấu hình riêng.
3. Hệ 5 dùng các chức năng cơ sở đào tạo, học phí và lịch cắt cơm; các hệ nội bộ không sử dụng các chức năng đó.
4. Migration giữ nguyên dữ liệu và lịch sử; không reset cơ sở dữ liệu để đổi mô hình.

## 6. Công nghệ và kiến trúc

- Backend: Node.js CommonJS, Express 4, Sequelize 6, PostgreSQL, Yup và JWT.
- Frontend: Next.js App Router, React, TypeScript, TanStack React Query, Zustand và Axios.
- Backend tổ chức theo luồng `route → controller → service → model`; frontend gọi API qua service.
- PostgreSQL là cơ sở dữ liệu quan hệ. Sequelize là ORM; không dùng MongoDB/Mongoose.

## 7. Quy tắc cập nhật tài liệu

Các tài liệu chức năng và schema phải mô tả mô hình năm hệ này. Bảng, cột và kiểu dữ liệu hiện có được giữ đầy đủ trong `DATABASE.md`; khi đổi mô hình, ghi rõ cấu trúc mới thay thế hoặc bổ sung cấu trúc nào để không mất định nghĩa dữ liệu cần thiết.
