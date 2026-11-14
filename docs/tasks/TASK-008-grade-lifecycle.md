# TASK-008: Sửa điểm, chốt học kỳ và lưu lịch sử

## Quyết định hiện hành

- Áp dụng trước cho luồng lớp Hệ 1, 3, 4, 7 trong Quản lý học tập. Hệ 5 dùng cấu trúc điểm riêng, chưa thay đổi trong lần triển khai này.
- Chỉ huy chỉ được sửa điểm trong lớp được giao, cùng Hệ. Không đổi học viên, môn, kỳ hoặc lần thi của bản ghi khi sửa; thi lại vẫn là lần thi mới.
- Trước chốt: được sửa, lý do tùy chọn; mọi lần ghi/sửa có audit.
- Chốt theo một lớp và học kỳ. Có cảnh báo số cặp học viên/môn chưa có điểm và đề xuất PENDING; chỉ chốt khi xác nhận rõ nếu thiếu. Không chốt kỳ chưa có học viên/môn.
- Sau chốt: sửa hoặc bổ sung điểm trực tiếp/duyệt đề xuất tồn đọng cần lý do ít nhất 5 ký tự, tối đa 2000. Kỳ vẫn Đã chốt, điểm sửa có dấu Đã đính chính.
- Học viên không gửi đề xuất mới vào kỳ đã chốt; liên hệ Chỉ huy để ghi nhận/đính chính. Không cho Học viên tự sửa điểm.
- Không mở lại kỳ, không xóa điểm/lịch sử. Mọi thay đổi điểm lưu trước/sau, lý do, người và thời gian tại database trong cùng transaction với thao tác điểm.
- Kết quả học kỳ/năm và báo cáo tính từ điểm hiện tại, nên phản ánh điểm sau đính chính. Điểm 0 là đã có điểm, không phải thiếu.

## Migration

Chạy sau các migration nền cho lớp, học kỳ và điểm. Không chạy lại migration điểm cũ
`migrateTrainingClassResults.js` sau migration này vì nó cài lại trigger bất biến cũ.
Trong backend, người dùng tự chạy:

```powershell
node src/utils/migrateGradeLifecycle.js --report
node src/utils/migrateGradeLifecycle.js --dry-run
node src/utils/migrateGradeLifecycle.js --apply
```

Kiểm tra dòng Database trước apply; dùng `QLHV_EXPECT_DATABASE` nếu cần chặn sai database.
Migration thêm grade_closed_at/by, corrected_at và training_class_grade_revisions;
thay trigger chặn UPDATE bằng kiểm tra Chỉ huy/lý do và trigger audit INSERT/UPDATE.
Trigger vẫn chặn DELETE điểm và UPDATE/DELETE lịch sử. Không xóa/ghi lại điểm cũ.
Kỳ cũ mặc định chưa chốt. Không dựng lịch sử giả cho điểm cũ: lần sửa đầu tiên lưu cả giá trị trước sửa.

## UI và kiểm tra

- Quản lý học tập có hai tác vụ: Nhập điểm và Xem điểm. Cả hai cùng chọn lớp/học kỳ/môn/lần thi; Xem điểm chỉ đọc, không có luồng theo dõi riêng theo học kỳ/năm học.
- Nhập điểm: chọn lớp/kỳ để xem tình trạng và Chốt điểm; từng dòng có Sửa / Lịch sử.
- Ghi điểm sau chốt có trường lý do; duyệt đề xuất còn chờ sau chốt cần điền lý do vào ghi chú duyệt.
- Test service: `node --test test/gradeLifecycle.test.js test/trainingClassAcademic.test.js`.
- Chạy Swagger check, frontend type-check và lint các file liên quan. Người dùng tự build/migrate.
- Cần kiểm tra runtime sau migration: sửa trước chốt, chốt thiếu điểm có xác nhận, sửa sau chốt thiếu lý do bị chặn;
  sửa có lý do tạo lịch sử, tính lại tổng hợp và giữ trạng thái Đã chốt; truy cập chéo hệ/lớp bị từ chối.
- Bộ test service dùng model mock; chưa thay thế kiểm tra trigger/rollback đồng thời trên PostgreSQL thật.
