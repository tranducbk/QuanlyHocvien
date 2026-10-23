# TASK-005B1: Nền dữ liệu chương trình đào tạo

## Trạng thái

Mã nguồn và migration additive đã được chuẩn bị. Theo output chủ dự án cung cấp, migration đã tạo hai bảng rỗng trên PostgreSQL test cô lập `qlhv-training-program-test-6d701789`; chạy lần hai vẫn giữ hai bảng rỗng. Kiểm tra khóa ngoại, unique và thứ tự ngày đã đạt trong transaction rồi rollback. HTTP scope checks Phase 005A đã PASS trên database test `qlhv_scope_test_12350c0f` với cả năm Hệ, Excel, kết quả học tập và báo cáo có dữ liệu. Kiểm tra Phase 005B1 trên bản sao schema đầy đủ `qlhv_training_full_93d848dc` đã PASS: trước migration chưa có hai bảng, sau migration hai bảng rỗng, chạy lại không đổi và số bản ghi cũ giữ nguyên. Báo cáo chỉ đọc xác nhận database cấu hình trong `backend/.env` là `neondb` và đã có hai bảng rỗng; chưa xác định lần chạy nào đã tạo chúng. Không xóa bảng hoặc chạy thêm `--apply` trên `neondb`.

## Mục tiêu

Tạo `TrainingProgram` thuộc đúng một trong năm Hệ và `CurriculumVersion` thuộc đúng một chương trình. Đây là lát cắt đầu của Phase 005B trong `TASK-005-kien-truc-nam-he-va-dang-ky-mon-hoc.md`.

## Phạm vi

- Thêm bảng `training_programs` với `training_system_id`, `code`, `name`, `description`, `is_active`, timestamps. Mã chương trình duy nhất trong mỗi Hệ.
- Thêm bảng `curriculum_versions` với `training_program_id`, `version_code`, `name`, `effective_from`, `effective_to`, `status`, timestamps. Mã phiên bản duy nhất trong mỗi chương trình; ngày kết thúc không trước ngày bắt đầu.
- Thêm model Sequelize và quan hệ với `TrainingSystem`.
- Migration chỉ thêm cấu trúc, chạy lặp được, không tự tạo chương trình và không sửa dữ liệu legacy.

`status` của phiên bản bắt đầu ở `DRAFT`; chưa có API chuyển trạng thái hoặc gán phiên bản cho lớp trong lát cắt này. `CurriculumSubject` phụ thuộc `AcademicSubject` của Phase 005C nên triển khai sau khi danh mục môn chuẩn tồn tại. Admin được tự nhập chương trình và phiên bản qua màn hình quản trị; quyền gán chương trình cho lớp sẽ chốt trong task triển khai sau.

Sau khi chủ dự án chọn tự nhập dữ liệu thật, source đã bổ sung màn hình `/admin/training-programs` và API chỉ Admin để xem hệ, tạo chương trình, thêm phiên bản `DRAFT`. Không tạo bản ghi chương trình hoặc phiên bản tự động. Đây là luồng nhập dữ liệu tiếp theo, không thay đổi phạm vi migration B1.

## Ngoài phạm vi

- Không chuyển `classes` hoặc `military_classes` hiện tại sang bảng mới.
- Không tạo tài khoản, chương trình mẫu hoặc dữ liệu môn học.
- Không mở lại API quân sự legacy đang bị chặn.

## Kiểm tra và áp dụng

Với database đang sử dụng, chỉ chạy `node src/utils/migrateTrainingPrograms.js --report` để xem trạng thái. Có thể chạy `--dry-run` để thử DDL trong transaction rồi rollback; hai bảng phải lại vắng mặt ở báo cáo "Sau rollback". Chế độ này có thao tác DDL tạm thời và không thay thế nghiệm thu trên database test. Không chạy `--apply` trên database đang sử dụng ở giai đoạn này.

Để thử riêng DDL trên PostgreSQL test mới bằng Docker, chạy `powershell -ExecutionPolicy Bypass -File test/runTrainingProgramMigration.ps1` trong `backend/`. Script tạo container test với tên duy nhất và để Docker chọn cổng localhost còn trống, đặt `DATABASE_URL` chỉ trong tiến trình script, tạo bảng nền `training_systems` tối thiểu rồi chạy report/apply/report. Script không xóa container hoặc sao chép dữ liệu đang dùng. Bài thử này chỉ xác nhận migration tạo bảng; chưa thay thế kiểm tra Phase 005A hoặc kiểm tra toàn bộ ứng dụng trên database test có schema đầy đủ.

Để kiểm tra chạy lặp và ràng buộc trên chính container test đã tạo, chạy `powershell -ExecutionPolicy Bypass -File test/verifyTrainingProgramMigration.ps1 -ContainerName qlhv-training-program-test-6d701789` trong `backend/`. Script chỉ kết nối container test có tên hợp lệ, chạy migration lần hai, thử khóa ngoại/unique/ngày trong transaction rồi rollback. Output chủ dự án cung cấp: lệnh chạy lần hai giữ cả hai bảng ở 0 bản ghi; các khối `DO` thành công và transaction thử đã `ROLLBACK`.

Để kiểm tra trên schema ứng dụng đầy đủ, chạy trong `backend/`:

```powershell
powershell -ExecutionPolicy Bypass -File .\test\runTrainingProgramFullSchemaMigration.ps1 -ContainerName qlhv-training-program-test-6d701789 -SourceDatabase qlhv_scope_test_12350c0f
```

Script sao chép schema và dữ liệu giả lập từ database test Phase 005A sang một database test mới trong cùng container, loại trừ hai bảng đích nếu đã có. Script chạy report, migration hai lần, rồi kiểm tra hai bảng mới và số lượng bản ghi `users`, `profiles`, `subject_results` không đổi. Bản script đã sửa chỉ ghi vào database test mới; database nguồn không bị sửa. Database test mới được giữ lại để kiểm tra nếu có lỗi. Output của chủ dự án xác nhận bản script đã sửa PASS trên `qlhv_training_full_93d848dc`.

Lưu ý từ lần thử trước: bản script đầu tiên đặt `DATABASE_URL` thành chuỗi rỗng trong PowerShell; Node đã nạp lại URL từ `backend/.env`. Output của lần chạy trên bản sao `qlhv_training_full_db750895` cho thấy Node nhìn thấy hai bảng từ trước trong khi `psql` kiểm tra bản sao thấy 0 bảng; số bản ghi cũ ở bản sao giữ nguyên `14|13|3`. Bản script hiện tại đặt URL PostgreSQL test rõ ràng và migration tự kiểm tra tên database được kỳ vọng trước khi chạy. Cần kiểm tra bằng `--report` (chỉ đọc) trên database cấu hình trong `.env` để ghi nhận trạng thái hai bảng ở đó; không suy đoán database này chưa từng bị tác động.

1. Trên database test riêng: `node src/utils/migrateTrainingPrograms.js --report`, sau đó `--apply`, rồi `--report` lần nữa trong `backend/`.
2. `--report` trước: hai bảng chưa có hoặc số bản ghi là 0. Sau `--apply`: hai bảng có, số bản ghi vẫn là 0; chạy `--apply` lần hai không thay đổi dữ liệu.
3. Xác minh khóa ngoại và ràng buộc unique theo Hệ/chương trình. Thử tạo hai chương trình cùng mã trong hai Hệ khác nhau được phép; cùng Hệ bị chặn. Thử tạo phiên bản thuộc chương trình không tồn tại bị chặn.
4. `npm run swagger:check` và kiểm tra backend khởi động khi migration đã áp dụng. Không chạy `db:refresh`.

## Rollback

Trước khi áp dụng cần backup database test. Nếu migration lỗi, transaction tự rollback. Sau khi commit, không xóa bảng nếu đã có bản ghi hoặc phụ thuộc; lập migration đảo chiều riêng sau khi đối soát dữ liệu và có yêu cầu rõ của chủ dự án.
