# TASK-007: Tự tạo học kỳ theo niên khóa

## Quyết định

- Niên khóa 2025–2029 có bốn năm học: 2025–2026 đến 2028–2029; mỗi năm có HK1, HK2.
- Tạo/cập nhật lớp sẽ bổ sung các kỳ thường trong cùng transaction. Không tạo trùng, không xóa hay đổi ID kỳ cũ khi sửa thời gian đào tạo.
- Hệ 1, 3, 4, 7 không tạo kỳ thủ công. Khóa cần có thời gian bắt đầu/kết thúc để tạo lớp và sinh kỳ.
- Hệ 5 hiện dùng năm học chung trong luồng học tập ngoài quân đội: tạo năm học tự tạo HK1 và HK2; chỉ thêm kỳ hè (code 3) khi phát sinh. Lớp đào tạo Hệ 5 có đủ niên khóa cũng sinh kỳ thường, nếu sử dụng API học kỳ theo lớp.
- Bỏ menu Quản lý học kỳ riêng. Đường dẫn cũ `/commander/semesters` chuyển tới Quản lý học tập; người dùng chọn kỳ ngay trong các luồng môn/lịch/điểm.
- Hệ 5 thêm năm học/kỳ hè ngay tại Quản lý học tập; không cần trang quản lý học kỳ riêng.
- Thời gian đào tạo phải có năm kết thúc lớn hơn năm bắt đầu. Không tự suy đoán niên khóa thiếu thông tin.

## Bổ sung dữ liệu hiện có

Người dùng chạy trong backend, kiểm tra dòng `Database:` trước khi apply:

```powershell
node src/utils/backfillDefaultSemesters.js --report
node src/utils/backfillDefaultSemesters.js --dry-run
node src/utils/backfillDefaultSemesters.js --apply
```

Có thể đặt `QLHV_EXPECT_DATABASE` để chặn chạy sai database. Script không đổi schema,
chỉ thêm các kỳ thường còn thiếu cho lớp có niên khóa hợp lệ và năm học chung hợp lệ.
Chạy lại an toàn nhờ unique constraint và ON CONFLICT DO NOTHING. Không sửa/xóa kỳ,
môn học, lịch học hoặc điểm cũ. Lớp thiếu niên khóa cần bổ sung thời gian khóa/lớp trước.

## Kiểm tra

- `node --test test/defaultSemesters.test.js test/trainingProgramAndClassCohort.test.js test/subjectCatalog.test.js`.
- Swagger coverage, frontend lint và type-check. Build/migration do người dùng tự chạy.
- Sau bổ sung dữ liệu: lớp 2025–2029 có 8 kỳ thường; chọn ngay trong trang Môn học;
  thêm kỳ hè Hệ 5; cập nhật lớp không làm thay đổi ID kỳ, môn hoặc điểm hiện có.
