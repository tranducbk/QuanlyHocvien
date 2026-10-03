# Mô hình nghiệp vụ theo hệ

## Các hệ

| Hệ | Đối tượng và phạm vi |
|:---|:---|
| Hệ 1 | Học viên sĩ quan theo chương trình đào tạo Hệ 1. |
| Hệ 3 | Học viên phân đội ngành Trinh sát kỹ thuật. |
| Hệ 4 | Học viên phân đội các ngành Ngôn ngữ Anh, Trung, Nga và Quan hệ quốc tế. |
| Hệ 5 | Học viên học tại cơ sở đào tạo ngoài quân đội. |
| Hệ 7 | Học viên sĩ quan theo chương trình đào tạo Hệ 7. |

Hệ 1 và Hệ 7 dùng chung nghiệp vụ quản lý học viên, thông tin chính trị nội bộ, lớp, học tập và các nghiệp vụ liên quan. Hai hệ khác nhau ở chương trình đào tạo, không có ngoại lệ nghiệp vụ giữa chúng.

## Nghiệp vụ theo nhóm hệ

### Hệ 1, 3, 4 và 7

- Quản lý học viên theo đơn vị, khóa và lớp.
- Quản lý thông tin chính trị nội bộ, môn học, học kỳ, lịch học và kết quả theo phạm vi hệ.
- Hệ 1 và Hệ 7 dùng chung quy trình; chương trình đào tạo được cấu hình riêng cho mỗi hệ.
- Hệ 3 và Hệ 4 áp dụng chương trình và nội dung rèn luyện riêng theo mô tả tại `doc/SPEC.md`.
- Quản lý thành tích, rèn luyện, khen thưởng, kỷ luật và đăng ký ra ngoài theo quy trình, quyền hạn của hệ.

### Hệ 5

- Quản lý học viên, cơ sở đào tạo, tổ chức/chuyên ngành, trình độ và lớp.
- Quản lý môn học, học kỳ, lịch học và kết quả học tập.
- Quản lý học phí và lịch cắt cơm.
- Áp dụng các nghiệp vụ khác được mô tả cho Hệ 5 tại `doc/SPEC.md`.

## Vai trò và phạm vi truy cập

- **Admin:** xem và chỉnh sửa tài khoản của mọi hệ; chỉ xem thông tin chính trị nội bộ; không xem, sửa, xóa hoặc mở khóa điểm chính thức.
- **Chỉ huy:** quản lý học viên và nghiệp vụ thuộc hệ được phân công.
- **Học viên:** xem thông tin chính trị nội bộ, lịch và kết quả của chính mình qua API dành cho Học viên.
- Backend xác định hệ từ tài khoản đã xác thực và giới hạn mọi API nghiệp vụ theo hệ; không tin hệ hoặc mã đơn vị do client gửi.

## Quy tắc kết quả học tập

- Chỉ Chỉ huy được truy cập API quản lý kết quả học tập.
- Điểm chính thức bất biến: không sửa, xóa hoặc mở khóa.
- Luồng nhập điểm và đề xuất/duyệt được áp dụng theo quy định của từng hệ tại `doc/SPEC.md`.

## Cấu trúc dữ liệu

- Tài khoản có một role và thuộc đúng một hệ; Admin không thuộc hệ đào tạo.
- Thông tin chính trị nội bộ dùng chung model `Profile`.
- Lớp, môn, học kỳ, lịch học, kết quả và các nghiệp vụ đặc thù được scope theo hệ.
- Chuyển lớp trong cùng hệ phải lưu lịch sử; không chuyển học viên sang hệ khác.
