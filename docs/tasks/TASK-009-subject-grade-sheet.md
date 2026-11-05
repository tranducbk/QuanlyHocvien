# TASK-009: Nhập điểm theo bảng học viên của môn

- Phạm vi Hệ 1/3/4/7, không thay đổi Hệ 5. Chỉ huy chọn Lớp → Học kỳ → Môn → Lần thi.
- Hiện toàn bộ học viên trong lớp, gồm học viên chưa có điểm. Điểm 0 khác chưa nhập.
- Chọn môn sẽ tự mở bảng điểm trong modal rộng, nền phía sau làm mờ; không dựng bảng bên dưới bộ chọn. Có nút Mở bảng điểm để mở lại cùng phạm vi.
- Chốt điểm đặt trên thanh công cụ trong modal, dùng lớp/học kỳ đang chọn; bỏ khối chốt riêng bên ngoài. Xác nhận nêu rõ chốt toàn bộ kỳ của lớp, gồm mọi môn. Phải lưu/hủy bản nháp trước khi chốt.
- Đóng bằng nút đóng, Escape hoặc nền đều xác nhận khi có điểm chưa lưu; không đóng lúc đang lưu. Xem lịch sử ngay trong modal và quay lại bảng, không thay thế modal bằng một modal khác.
- Nhập/sửa giữa kỳ, cuối kỳ ngay trên dòng; xem trước tổng theo công thức 50/50 hiện hành.
- Lưu từng dòng hoặc Lưu tất cả các dòng đang thay đổi. Không xóa điểm.
- Dòng chưa có điểm nhưng có đề xuất PENDING dẫn tới Phê duyệt đề xuất, không tạo điểm đè lên đề xuất.
- Sau chốt, mỗi dòng ghi/sửa cần lý do. Tiếp tục dùng trigger audit của TASK-008.
- Batch được lưu trong một transaction, lỗi một dòng thì rollback toàn bộ. API kiểm tra lớp, Hệ, học viên, môn/kỳ;
  không ghi đè nếu điểm đã thay đổi từ lúc tải bảng. Khi xung đột, giữ bản nháp để đối chiếu, người dùng hủy/tải lại trước khi nhập lại.
- Đổi bộ chọn bị khóa khi có bản nháp. Đổi tab có xác nhận bỏ thay đổi; đóng/tải lại trình duyệt cảnh báo điểm chưa lưu.
- Không có migration mới. Cần migration TASK-008 đã được áp dụng; người dùng tự build và kiểm tra trên database thật.

## Hoàn thiện giao diện

- Theo các component và màu sắc hiện có, hỗ trợ bố cục responsive và dark mode.
- Bộ chọn phạm vi có hướng dẫn ngắn; khu vực chốt điểm thu gọn mặc định để ưu tiên bảng nhập.
- Tìm học viên không dấu, badge trạng thái, đếm dòng chưa lưu; cố định tiêu đề bảng và cột học viên khi cuộn.
- Lỗi điểm/lý do hiện tại dòng; có nhãn cho trình đọc màn hình, caption và scope cho bảng.
- Dùng Map/Set để tra điểm và đề xuất thay vì tìm tuyến tính trên từng dòng; dùng chung kiểm tra điểm khi nhập/lưu.
- Modal sửa không lưu lại nếu điểm không thay đổi. Khóa tương tác liên quan trong lúc lưu.
- Chưa có kiểm tra trực quan trên phiên đăng nhập thật; không khẳng định đạt đầy đủ một chuẩn accessibility chỉ qua lint/type-check.

Kiểm tra: `node --test test/subjectGradeSheet.test.js test/gradeLifecycle.test.js test/trainingClassAcademic.test.js`,
Swagger check, frontend type-check và lint các file thay đổi. Test transaction dùng mock;
cần kiểm tra PostgreSQL thật để xác nhận rollback và trigger audit.
