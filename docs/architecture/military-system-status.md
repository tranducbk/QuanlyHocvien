# Hệ quân sự — trạng thái triển khai

Quyết định ngày 01/10/2026 thay thế quyết định hủy phân hệ ngày 29/09/2026. Hệ quân sự triển khai trước; hệ thứ hai chưa nằm trong phạm vi.

## Đã thêm vào source

- `User.systemType` với `EXTERNAL`, `MILITARY`; tài khoản Admin không gán hệ. Hệ thứ hai đang hoãn.
- Bảng `military_classes`, `military_semesters`, `military_subjects`, `military_time_tables`.
- `Profile.militaryClassId` tách việc xếp lớp quân sự khỏi `classId` hệ ngoài.
- Admin tạo/sửa/xóa lớp quân sự và phân công Chỉ huy; Chỉ huy xem lớp được giao, xếp/chuyển học viên bằng mã, quản lý môn, học kỳ và lịch học theo lớp.
- API học viên quân sự xem lịch học của lớp.
- Route hệ ngoài chặn tài khoản quân sự truy cập lớp, học kỳ, lịch học, kết quả, học phí, cắt cơm và cơ sở đào tạo.

## Đã bổ sung theo yêu cầu mới

- Bảng riêng `military_subject_results`, `military_grade_proposals`, `military_achievements` và `military_duty_schedules`.
- Chỉ huy ghi điểm mới; học viên gửi đề xuất; Chỉ huy duyệt hoặc từ chối. Điểm chính thức không có API sửa/xóa.
- Giao diện Chỉ huy quản lý kết quả, duyệt đề xuất, thành tích và lịch trực theo lớp.
- Học viên quân sự xem lịch học chung của lớp, điểm chính thức, trạng thái đề xuất và thành tích cá nhân.
- Hệ quân sự không cung cấp cắt cơm hoặc học phí.

## Chạy migration

Sau khi sao lưu và xác nhận đúng database, chạy `npm run migrate:military-system` trong `backend/`. Migration thêm schema và gán tài khoản hiện có vào hệ ngoài; không chạy tự động khi ứng dụng khởi động.

## Còn thiếu

- Nhập/xuất Excel và báo cáo tổng hợp cho các nghiệp vụ quân sự.
- Dashboard và thông báo theo lớp cho các sự kiện quân sự.
- Hệ đào tạo thứ hai đang hoãn.
