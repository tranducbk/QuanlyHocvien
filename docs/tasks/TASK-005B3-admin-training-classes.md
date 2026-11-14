# TASK-005B3: Admin tạo lớp đào tạo theo năm Hệ

## Trạng thái

Đã chuẩn bị API và giao diện trong source. Chủ dự án xác nhận tạo một lớp qua giao diện Admin và thấy một dòng mới trong `neondb.public.training_classes` qua pgAdmin. Chưa có kết quả lint, type-check, build, Swagger check hoặc kiểm tra quyền chéo Hệ. Chủ dự án tự chạy các lệnh kiểm tra theo quy ước làm việc hiện tại.

## Mục tiêu

Admin tạo và xem lớp thật trong `training_classes`, đồng thời phân công Chỉ huy đúng Hệ. Không dùng bảng lớp legacy cho luồng mới.

## Phạm vi

- API Admin lấy danh sách lớp và lựa chọn Chỉ huy/cơ sở đào tạo; tạo lớp; gán hoặc đổi Chỉ huy của lớp.
- Với Hệ 1/3/4/7, yêu cầu chương trình và phiên bản cùng Hệ. Với Hệ 5, yêu cầu cơ sở đào tạo ngoài quân đội; chương trình và phiên bản là tùy chọn theo chính sách học cá nhân.
- Chỉ chọn Chỉ huy đang hoạt động, có `trainingSystemId` đúng với lớp. Mã lớp duy nhất trong từng Hệ.
- Trang Admin riêng `/admin/training-classes` dùng API mới. Chỉ nhập dữ liệu thật do người dùng chọn.

## Ngoài phạm vi

- Không sửa/xóa lớp, xếp học viên, chuyển lớp hoặc chuyển Hệ.
- Không thay đổi `/admin/classes` và API lớp legacy.
- Chưa liên kết đơn vị quân sự vì chưa có danh mục đơn vị chuẩn theo năm Hệ.

## Nghiệm thu

- Admin tạo và xem lớp theo từng Hệ, gán/đổi Chỉ huy cùng Hệ.
- Chỉ huy khác Hệ, chương trình/phiên bản khác Hệ, thiếu cơ sở đào tạo Hệ 5 và mã lớp trùng bị từ chối ở backend.
- COMMANDER/STUDENT không truy cập được API quản trị mới.
- `npm run swagger:check`, frontend lint/type-check/build và kiểm tra thủ công do chủ dự án chạy.
