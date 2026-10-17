# TASK-004: Ổn định baseline và khóa phân quyền điểm

**Trạng thái:** Hoàn tất ngày 16/10/2026.

## Mục tiêu

Đưa repository về trạng thái kiểm tra tĩnh có thể tin cậy và khóa các API kết quả học tập theo bất biến nghiệp vụ hiện hành: chỉ Chỉ huy được quản lý điểm, dữ liệu phải nằm trong phạm vi học viên được phân công và điểm chính thức không có API sửa/xóa công khai.

## Phạm vi

### Baseline

- Sửa lỗi lint và type-check hiện có.
- Bổ sung Swagger cho các endpoint đang thiếu tài liệu.
- Bảo đảm `swagger:check`, `lint`, `type-check` và production build chạy thành công.

### Kết quả học tập hệ ngoài hiện hành

- Chỉ `COMMANDER` được truy cập API quản lý kết quả môn, học kỳ, năm và duyệt đề xuất điểm.
- Danh sách, chi tiết, import và export phải scope theo `systemType` và `commanderId` của tài khoản đã xác thực.
- Loại bỏ `PUT`/`DELETE` công khai của kết quả môn và học kỳ.
- Loại bỏ thao tác sửa/xóa điểm khỏi frontend.
- Chỉ cho phép đề xuất `ADD` đối với môn chưa có điểm; không duyệt đề xuất sửa/xóa điểm chính thức.
- Việc duyệt đề xuất và tính lại kết quả tổng hợp phải nằm trong cùng transaction.
- Cập nhật kiểm thử API theo contract và phân quyền mới.

## Ngoài phạm vi

- Chuyển đổi `EXTERNAL/MILITARY` sang Hệ 1, 3, 4, 5 và 7; thuộc TASK-005.
- Xây dựng audit log mới.
- Thay đổi công thức GPA/CPA ngoài việc giữ nguyên công thức hiện có trong transaction.
- Migration phá vỡ dữ liệu hoặc xóa đề xuất lịch sử loại `UPDATE`/`DELETE`.

## Tiêu chí hoàn thành

1. Admin và Học viên nhận `403` tại API quản lý kết quả môn, học kỳ, năm và API Chỉ huy duyệt đề xuất.
2. Chỉ huy không đọc, nhập, import hoặc export dữ liệu của học viên ngoài phạm vi được phân công.
3. Không còn route hoặc Swagger `PUT`/`DELETE` cho kết quả môn và học kỳ.
4. Frontend không hiển thị nút sửa/xóa điểm chính thức.
5. Đề xuất mới chỉ có loại `ADD` và chỉ áp dụng cho môn chưa có điểm.
6. Duyệt đề xuất tạo điểm và cập nhật tổng hợp trong một transaction; lỗi giữa chừng phải rollback.
7. `npm run swagger:check`, `npm run lint`, `npm run type-check`, `npm run build` và `git diff --check` thành công.
8. Kiểm thử API xác nhận ma trận quyền mới khi backend/database test khả dụng.

## Kết quả kiểm tra

- `npm run swagger:check`: đạt, 224 route methods đã có tài liệu.
- `npm run lint`: đạt, không còn lỗi hoặc cảnh báo.
- `npm run type-check`: đạt.
- `npm run build`: đạt, 48 trang được sinh thành công.
- `npm run test:task004`: đạt 32/32 kiểm tra API chỉ đọc, gồm ma trận quyền, route sửa/xóa đã đóng và truy cập chéo Chỉ huy.
- `git diff --check`: đạt.
- Không chạy toàn bộ `npm run test:api` trên database Neon đang cấu hình vì script này tạo, sửa và xóa dữ liệu. Luồng ghi `ADD -> approve` đã được cập nhật trong `functionalTest.js` để chạy trên database test cô lập khi thực hiện full regression.

