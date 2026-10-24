# TASK-005B4: Giao diện Chỉ huy theo từng Hệ

## Mục tiêu

Thay trang thông báo tạm của Chỉ huy Hệ 1/3/4/7 bằng Tổng quan và Lớp được giao. Hiển thị đầy đủ nhóm menu nghiệp vụ chung theo yêu cầu người dùng; chức năng chưa chuyển sang mô hình năm Hệ phải hiện rõ trạng thái chưa khả dụng. Hệ 5 giữ giao diện hiện có. Bốn Hệ nội bộ dùng chung component và API; tên Hệ, chương trình và lớp lấy từ dữ liệu của tài khoản đăng nhập.

## Kế thừa và khác biệt so với Hệ 5

- Dùng chung: xác thực, layout, thông tin chính trị nội bộ, kiểu lớp đào tạo mới và cách gọi API qua service/React Query.
- Riêng Hệ 5: cơ sở đào tạo ngoài quân đội, ngành/trình độ tại trường ngoài, học phí, cắt cơm và luồng môn/kỳ cá nhân. Không đưa các mục này vào menu Hệ 1/3/4/7.
- Hệ 1/3/4/7: lớp gắn chương trình/phiên bản; Hệ 1 và 7 dùng đúng cùng giao diện và xử lý, chỉ khác dữ liệu chương trình.

## Phạm vi

- `GET /training-classes/mine`: chỉ Chỉ huy Hệ 1/3/4/7, lọc lớp theo cả `commander_id` và `training_system_id` từ tài khoản đã xác thực.
- `/commander`: tổng quan Hệ 1/3/4/7 với tên Hệ và số lớp được giao; Hệ 5 giữ dashboard cũ.
- `/commander/training-classes`: danh sách lớp được giao và thông tin chương trình; chỉ mở cho Chỉ huy Hệ 1/3/4/7.
- Hồ sơ học viên dùng lại trang chung ở chế độ quân sự, dựa trên API hồ sơ đã phân quyền theo Chỉ huy và Hệ.
- Sidebar hiện đủ các mục chung: lớp, hồ sơ, phê duyệt, thành tích, lịch học, học tập, học kỳ và lịch trực. Những mục chưa có API đúng mô hình mới ở trạng thái vô hiệu hóa; route quân sự legacy vẫn đóng.

## Ngoài phạm vi

- Chưa hỗ trợ chuyển lớp hoặc chuyển Hệ.
- Chưa mở thao tác điểm/kết quả và phê duyệt đề xuất khi mô hình kết quả mới chưa hoàn tất.
- Không thay đổi giao diện Admin hoặc Chỉ huy Hệ 5, không tạo dữ liệu mẫu.

## Nghiệm thu

- Chỉ huy Hệ 1/3/4/7 mở được tổng quan, lớp, hồ sơ, học kỳ, môn, lịch học, thành tích và lịch trực; thấy đúng phạm vi Chỉ huy/Hệ. Điểm và đề xuất vẫn ghi rõ chưa khả dụng.
- Chỉ huy Hệ 5 vẫn ở dashboard và menu cũ; không vào trang dành cho COHORT.
- Admin/Học viên/Chỉ huy Hệ 5 bị từ chối tại API `mine`; mọi route cũ chưa scope vẫn bị chặn.

## Các bước tiếp theo theo yêu cầu mở đủ nghiệp vụ chung

Không mở lại các trang `/commander/military/*` cũ: service hiện còn đọc `militaryClassId` và bảng `military_*`, trong khi Admin đang tạo lớp thật trong `training_classes`. Các mục trong menu chỉ được bật khi API mới đã được kiểm tra quyền theo `trainingSystemId`, `commanderId` và lớp được giao.

1. Tạo quan hệ học viên–`training_classes` qua `profiles.training_class_id`, xếp học viên cùng Hệ do Chỉ huy hiện tại quản lý vào lớp được giao; giữ nguyên lịch sử dữ liệu hiện có, không làm chuyển lớp/chuyển Hệ trong giai đoạn này. Migration `migrateTrainingClassStudents.js` phải được chạy trước khi dùng API xếp lớp.
2. Chuyển danh mục học kỳ, môn và lịch học sang lớp/chương trình mới. Học kỳ lớp dùng `training_class_semesters`; Chỉ huy nhập môn cho từng lớp/học kỳ vào `training_class_subjects` theo quyết định của người dùng. Lịch học dùng `training_class_time_tables` và chỉ tham chiếu môn cùng lớp/học kỳ. Chạy migration học kỳ, môn, lịch theo thứ tự trước khi dùng. Hệ 1 và 7 dùng cùng xử lý, khác chương trình được gán cho lớp.
3. Chuyển kết quả học tập và đề xuất nhập điểm. Điểm chính thức đã ghi nhận vẫn bất biến theo `AGENTS.md` và đầu `QLHV.md`; không dùng phần cho sửa điểm trong TASK-005 khi chưa chốt lại bất biến.
4. Chuyển thành tích và lịch trực theo lớp/Hệ mới qua `training_class_achievements` và `training_class_duty_schedules`; Chỉ huy đã có API/giao diện đọc, thêm, sửa, xóa. Chạy `migrateTrainingClassRecords.js` trước khi dùng và kiểm tra truy cập chéo Hệ/lớp.
5. Mở từng mục menu khi API và kiểm thử truy cập chéo Hệ của mục đó đạt. Hệ 5 tiếp tục dùng luồng riêng cho trường ngoài, học phí và cắt cơm.

Lỗi kết nối PostgreSQL `ECONNRESET`/`ETIMEDOUT` trên máy chạy backend cần được xử lý trước khi kiểm thử tích hợp bằng dữ liệu thật; đây là lỗi kết nối mạng tới máy chủ database, không phải kết quả của menu frontend.
