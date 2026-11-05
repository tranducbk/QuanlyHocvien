# TASK-006: Danh mục môn học cho Hệ 1, 3, 4, 7

## Phạm vi đã chốt

- Mỗi Hệ 1, 3, 4, 7 có danh mục môn riêng. Chỉ huy trong cùng Hệ được xem, tạo và sửa danh mục; Admin, Học viên và Hệ 5 không truy cập API danh mục này.
- Môn gồm mã, tên và tín chỉ. Mã môn không trùng trong một Hệ; các Hệ có thể dùng cùng mã.
- Trang Môn học có hai chế độ: Danh mục môn học và Môn học của lớp.
- Chỉ huy chọn môn có sẵn để thêm vào học kỳ của lớp được giao. Không nhập lại mã/tên/tín chỉ.
- Môn trong lớp lưu snapshot mã/tên/tín chỉ và tham chiếu danh mục. Sửa danh mục không thay đổi môn đã gán, lịch học hoặc điểm cũ.
- Không thêm xóa danh mục; không thay đổi nghiệp vụ Hệ 5 hoặc điểm bất biến.
- API thêm môn vẫn nhận payload cũ để tương thích client hiện có; payload mới dùng `catalogSubjectId`, backend lấy thông tin môn từ đúng Hệ đã xác thực.

## Migration

Trong `backend/`, người dùng chạy lần lượt:

```powershell
node src/utils/migrateSubjectCatalog.js --report
node src/utils/migrateSubjectCatalog.js --dry-run
node src/utils/migrateSubjectCatalog.js --apply
```

Kiểm tra dòng `Database:` trước khi apply; có thể đặt `QLHV_EXPECT_DATABASE` để chặn chạy sai database.
Migration chỉ thêm bảng `subject_catalogs`, cột nullable `catalog_subject_id` và unique index.
Không tự chạy migration trên database thật, không seed dữ liệu mẫu hoặc tự hợp nhất các môn cũ có mã/tên không đồng nhất.
Môn cũ vẫn hiển thị, điểm và ID cũ được giữ nguyên; danh mục ban đầu cần được Chỉ huy tạo.

## Kiểm tra

- `node --test test/subjectCatalog.test.js` trong backend.
- `npm run swagger:check` trong backend; lint và type-check trong frontend.
- UI/API sau migration: tạo môn, sửa môn, chọn vào hai lớp/học kỳ; chặn thêm trùng trong một kỳ.
- Không đọc/sửa/chọn môn của Hệ khác; không thêm môn vào lớp ngoài phạm vi Chỉ huy.
- Sửa danh mục không đổi snapshot/điểm đã có; Hệ 5 giữ nguyên luồng hiện hành.
