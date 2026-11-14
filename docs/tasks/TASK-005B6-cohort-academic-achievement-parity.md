# TASK-005B6: Bảng học tập và thành tích cho Hệ 1/3/4/7

## Quyết định nghiệp vụ

- Frontend Hệ 1/3/4/7 dùng lại `AchievementForm`, `ImportAchievementsForm`, `AchievementToolbarActions` và các thành phần bảng/tab cùng Hệ 5; dữ liệu vẫn đi qua API `training-classes` được giới hạn theo Hệ và lớp Chỉ huy được giao.
- Kết quả học kỳ và năm được tính từ điểm môn chính thức, chỉ lấy lần thi tốt nhất của từng môn. Điểm trung bình là **trung bình đều các môn**, không dùng tín chỉ làm trọng số. Điểm hệ 4 dùng các ngưỡng chuyển đổi đang có trong `gradeConversion.js`.
- Điểm môn chính thức vẫn bất biến; báo cáo học kỳ/năm là dữ liệu tính khi đọc, không ghi đè điểm.
- Thành tích của lớp có Năm học, Học kỳ, Nội dung, mẫu Excel chỉ có tiêu đề/hướng dẫn, nhập và xuất Excel. Chỉ mã học viên thuộc lớp được giao mới được nhập.
- Người dùng tự chạy migration và kiểm tra trên database thật; không tạo dữ liệu mẫu.
- Giao diện Chỉ huy hiển thị một bảng chung cho mọi lớp đang quản lý, giống cách Hệ 5 quản lý toàn bộ danh sách; lớp là cột và bộ lọc tùy chọn. Form thêm mới xác định lớp để gọi API hiện có. API vẫn kiểm tra Hệ và lớp ở backend.

## Migration

`migrateTrainingClassAchievementDetails.js` chỉ thêm ba cột nullable `school_year`, `semester`, `content` vào `training_class_achievements`; giữ dữ liệu cũ. Trong `backend/` chạy `--report`, `--dry-run`, rồi `--apply` khi đã xác nhận `Database:` đúng. Không cần migration cho bảng tổng hợp kết quả vì báo cáo được tính từ điểm đã có.

## Kiểm tra

- `node --test test/trainingClassAcademic.test.js`
- `npm run swagger:check`
- `npm run lint`, `npm run type-check`, `npm run build` trong `frontend/`
- UI: thử thêm thành tích và nhập/xuất Excel cho lớp được giao; mã học viên ngoài lớp phải bị từ chối; xem bảng điểm môn/học kỳ/năm và xuất năm học. Kiểm tra Chỉ huy Hệ khác và Admin không xem được API kết quả.
