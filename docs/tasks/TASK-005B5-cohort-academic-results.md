# TASK-005B5: Kết quả học tập và đề xuất điểm của Hệ 1/3/4/7

## Mục tiêu

Mở luồng nhập điểm, xem kết quả và phê duyệt đề xuất điểm cho lớp `training_classes` của Hệ 1/3/4/7. Hệ 5 tiếp tục dùng luồng hiện tại. Các hệ nội bộ dùng chung API và giao diện, dữ liệu được giới hạn theo Hệ và lớp của tài khoản đã xác thực.

## Quy tắc đã chốt

- Chỉ huy chỉ nhập và xem kết quả học viên trong lớp được giao, cùng Hệ.
- Học viên chỉ xem kết quả và đề xuất của bản thân. Admin không xem điểm.
- Điểm chính thức bất biến: không có API sửa, xóa hoặc mở khóa.
- Duyệt đề xuất tạo điểm chính thức trong cùng transaction; duyệt lại không tạo bản ghi thứ hai.
- Lưu lần học/thi và ngăn trùng học viên, môn, học kỳ, lần thi.
- Giữa kỳ 50% và cuối kỳ 50% cho cả Hệ 1/3/4/7; hai điểm đều bắt buộc, mỗi điểm trong thang 0–10. Backend tính tổng và làm tròn hai chữ số, không nhận tổng điểm do client tự tính làm nguồn sự thật.
- Không tạo dữ liệu mẫu, không chạy migration trên database đang sử dụng thay người dùng.

## Việc cần làm

1. Áp dụng công thức giữa kỳ 50%, cuối kỳ 50% đã được người dùng chốt; lưu bản chụp trọng số cùng kết quả.
2. Tạo migration cộng thêm và model cho kết quả, đề xuất; thêm unique constraint và bảo vệ bất biến điểm.
3. Xây API Chỉ huy nhập/xem, duyệt/từ chối; API Học viên xem và gửi đề xuất. Mọi truy vấn phải kiểm tra Hệ, lớp, học viên, môn và học kỳ ở backend.
4. Nối giao diện Chỉ huy và Học viên qua service/React Query; chỉ bật menu khi API và migration được kiểm tra.
5. Kiểm tra quyền chéo Hệ/lớp, trùng điểm, duyệt lặp, điểm thành phần thiếu hoặc ngoài thang 0–10, tính tổng và bất biến điểm.

## Kiểm tra triển khai

- Chạy `node src/utils/migrateTrainingClassResults.js --report`, tiếp theo `--dry-run`, rồi `--apply` sau khi xác nhận đúng database. Người dùng tự chạy migration; script không tạo dữ liệu mẫu.
- Chạy `node --test test/trainingClassAcademic.test.js` và `npm run swagger:check` trong `backend/`.
- Chạy `npm run lint`, `npm run type-check` và `npm run build` trong `frontend/`.
- Trên dữ liệu thật: Chỉ huy cùng Hệ nhập điểm một lần, thử nhập trùng và truy cập lớp Hệ khác; Học viên chỉ thấy điểm/đề xuất của mình; duyệt đề xuất tạo một kết quả, duyệt lần hai bị từ chối; Admin không truy cập API điểm.

## Mâu thuẫn tài liệu

Mục `SubjectResult` và `GradeCorrectionRequest` trong TASK-005 đề xuất sửa điểm đã ghi. `AGENTS.md` và đầu `QLHV.md` cấm sửa/xóa/mở khóa điểm chính thức; task này theo quyết định hiện hành và chỉ cho đề xuất điểm chưa có kết quả chính thức.

