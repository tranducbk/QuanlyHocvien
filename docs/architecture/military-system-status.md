# Hệ quân sự — trạng thái triển khai

Quyết định ngày 01/10/2026 thay thế quyết định hủy phân hệ ngày 29/09/2026. Hệ quân sự triển khai trước; hệ thứ hai chưa nằm trong phạm vi.

## Đã thêm vào source

- `User.systemType` với `EXTERNAL`, `MILITARY`; tài khoản Admin không gán hệ. Hệ thứ hai đang hoãn.
- Bảng `military_classes`, `military_semesters`, `military_subjects`, `military_time_tables`.
- `Profile.militaryClassId` tách việc xếp lớp quân sự khỏi `classId` hệ ngoài.
- API và giao diện Chỉ huy để quản lý lớp, xếp/chuyển học viên bằng mã, quản lý môn, học kỳ và lịch học theo lớp.
- API học viên quân sự xem lịch học của lớp.
- Route hệ ngoài chặn tài khoản quân sự truy cập lớp, học kỳ, lịch học, kết quả, học phí, cắt cơm và cơ sở đào tạo.

## Chạy migration

Sau khi sao lưu và xác nhận đúng database, chạy `npm run migrate:military-system` trong `backend/`. Migration thêm schema và gán tài khoản hiện có vào hệ ngoài; không chạy tự động khi ứng dụng khởi động.

## Còn thiếu

- Kết quả học tập quân sự và quy trình đề xuất/duyệt điểm.
- Trang hồ sơ/portal học viên quân sự đầy đủ và báo cáo theo lớp.
- Kiểm soát scope của các feature chung còn lại như thành tích, thông báo và báo cáo.
- Hệ đào tạo thứ hai.
