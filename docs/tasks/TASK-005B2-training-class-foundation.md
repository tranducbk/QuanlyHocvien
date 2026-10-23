# TASK-005B2: Nền dữ liệu lớp đào tạo

## Trạng thái

Đã chuẩn bị model và migration. Theo output chủ dự án cung cấp, `--dry-run` trên `neondb` tạo thử bảng rỗng rồi rollback; sau `--apply`, `--report` xác nhận `training_classes` tồn tại với 0 bản ghi. Chưa có kiểm thử API/UI cho lớp mới.

## Mục tiêu

Thêm mô hình lớp dùng chung cho năm Hệ, làm nền cho API quản lý lớp ở lát cắt sau của Phase 005B.

## Phạm vi

- Thêm `training_classes` với Hệ, mã/tên lớp, Chỉ huy, cơ sở đào tạo ngoài quân đội (khi có), chương trình, phiên bản, năm bắt đầu/kết thúc và trạng thái.
- Ràng buộc khóa ngoại ngăn lớp dùng chương trình khác Hệ và phiên bản khác chương trình. Mã lớp duy nhất trong từng Hệ.
- Thêm model Sequelize và quan hệ tương ứng. Migration chỉ thêm bảng/index; không tạo dữ liệu mẫu, không chuyển hoặc xóa dữ liệu lớp cũ.

## Quyết định dữ liệu

Hệ 1/3/4/7 dùng chương trình và phiên bản chung theo lớp. Hệ 5 học theo chương trình cá nhân; lớp Hệ 5 có thể chưa gắn chương trình/phiên bản. Hai cột này cùng có giá trị hoặc cùng `NULL`. Service tạo lớp sẽ kiểm tra chính sách từng Hệ ở lát cắt API tiếp theo. `commander_id` nullable vì lớp có thể được tạo trước khi phân công Chỉ huy.

`QLHV.md` yêu cầu lớp thuộc đơn vị/cơ sở đào tạo; danh sách field chính của `TASK-005` chưa nêu quan hệ này. Lát cắt này thêm `education_provider_id` trỏ tới `universities` cho Hệ 5. Quan hệ với đơn vị quân sự của các Hệ còn lại phải chốt khi xây dựng danh mục đơn vị trong task tiếp theo, vì source hiện chưa có model đơn vị chuẩn theo năm Hệ. Không suy diễn từ chuỗi `Profile.unit`.

## Ngoài phạm vi

- Chưa có API/UI tạo lớp hoặc xếp học viên vào lớp; chưa chuyển luồng lớp legacy.
- Chưa xử lý chuyển lớp hoặc chuyển Hệ. Theo quyết định hiện hành trong `QLHV.md`, học viên không chuyển Hệ. `TrainingClassHistory` trong task tổng là thiết kế dự kiến, chưa triển khai ở lát cắt này; chỉ mở lại khi nghiệp vụ chuyển lớp được xác nhận.
- Chưa tạo `StudentProgramEnrollment`, `AcademicTerm`, `StudentTermEnrollment` hay `CurriculumSubject`.
- Không ghi vào database đang dùng khi chuẩn bị mã nguồn.

## Nghiệm thu

1. `--report` chỉ đọc cho biết tên database và số bản ghi bảng mới.
2. `--dry-run` tạo cấu trúc trong transaction và rollback. `--apply` trên database người vận hành lựa chọn có thể chạy lặp; bảng cũ và dữ liệu cũ giữ nguyên.
3. Khóa ngoại, mã lớp duy nhất theo Hệ và thứ tự năm hoạt động; không có bản ghi mẫu.
4. Model khớp tên cột migration; các luồng legacy tiếp tục dùng bảng cũ cho đến task chuyển đổi riêng.

Trong `backend/`, chạy lần lượt `node src/utils/migrateTrainingClasses.js --report` rồi `node src/utils/migrateTrainingClasses.js --dry-run`. Chỉ chạy `--apply` sau khi xác nhận đúng tên database trong dòng `Database:` và kết quả dry-run đạt. Sau đó chạy lại `--report`. Không dùng `db:refresh`.
