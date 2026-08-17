# Đặc tả chức năng hệ thống

## I. Đối với Học viên

### 1. Đăng nhập và quản lý tài khoản
Học viên phải đăng nhập bằng tài khoản được cấp mới có thể truy cập và sử dụng các chức năng của hệ thống. Học viên có thể xem và cập nhật thông tin cá nhân, thay đổi mật khẩu để bảo đảm an toàn tài khoản.

### 2. Xem thông tin cá nhân
Học viên có thể xem toàn bộ thông tin cá nhân của mình bao gồm thông tin cơ bản (họ tên, ngày sinh, giới tính, CMND/CCCD, số điện thoại, email, địa chỉ), thông tin học tập (mã học viên, lớp, khóa học, ngành học, trường đào tạo), và thông tin quân nhân (quân hàm, chức vụ).

### 3. Quản lý kết quả học tập

#### + Xem kết quả học tập
Học viên có thể xem kết quả học tập của mình theo từng học kỳ và năm học, bao gồm danh sách môn học với điểm số chi tiết, điểm trung bình học kỳ, điểm trung bình tích lũy (CPA), số tín chỉ đã tích lũy, số tín chỉ nợ, và các chỉ tiêu đánh giá khác.

#### + Đề xuất thêm kết quả học tập
Học viên có thể tạo đề xuất thêm kết quả học tập mới cho một học kỳ, bao gồm danh sách môn học với điểm số, và đính kèm file minh chứng nếu cần. Đề xuất sẽ được gửi đến chỉ huy để phê duyệt.

#### + Đề xuất cập nhật kết quả học tập
Học viên có thể yêu cầu cập nhật kết quả học tập đã được duyệt trước đó, với lý do và file minh chứng. Đề xuất cập nhật cũng cần được chỉ huy phê duyệt.

#### + Đề xuất xóa kết quả học tập
Trong trường hợp cần thiết, học viên có thể yêu cầu xóa kết quả học tập đã được duyệt, kèm theo lý do và file minh chứng.

#### + Xem trạng thái đề xuất
Học viên có thể theo dõi trạng thái các đề xuất của mình (đang chờ duyệt, đã được duyệt, bị từ chối) và xem ghi chú từ chỉ huy nếu có.

### 4. Quản lý lịch học

#### + Xem lịch học
Học viên có thể xem lịch học của mình theo tuần, bao gồm các môn học, thời gian, địa điểm và các thông tin liên quan.

#### + Quyền nhập lịch học
Học viên không tự thêm, chỉnh sửa hoặc xóa lịch học. Lịch học của học viên do Chỉ huy nhập và cập nhật.

#### + Cập nhật lịch học
Khi Chỉ huy cập nhật lịch học của học viên, hệ thống có thể tự động cập nhật lại lịch cắt cơm tương ứng.

#### + Xem lịch cắt cơm tự động
Hệ thống tự động tính toán và hiển thị lịch cắt cơm dựa trên lịch học, thời gian đi lại và các giờ ăn cố định (sáng 06:00, trưa 11:00, tối 17:30).

### 5. Xem thành tích
Học viên có thể xem danh sách các thành tích của mình bao gồm thành tích học tập, thành tích rèn luyện, các đề tài khoa học, sáng kiến và các giải thưởng đã đạt được.

### 6. Xem thông tin học phí
Học viên có thể xem thông tin học phí của mình theo từng đợt, từng học kỳ, bao gồm số tiền cần nộp, trạng thái thanh toán và lịch sử thanh toán.

### 7. Xem thông báo
Học viên có thể xem các thông báo từ hệ thống, từ chỉ huy hoặc từ Chỉ huy, bao gồm thông báo về kết quả học tập được phê duyệt, thông báo về các sự kiện, hoạt động và các thông tin quan trọng khác.

---

## II. Đối với Chỉ huy

### 1. Quản lý tài khoản học viên
Thêm, chỉnh sửa, xóa tài khoản: Chỉ huy có thể quản lý toàn bộ tài khoản người dùng trong hệ thống, bao gồm tài khoản của học viên, chỉ huy và các Chỉ huy khác. Chỉ huy có thể tạo tài khoản mới, cập nhật thông tin, vô hiệu hóa hoặc xóa tài khoản khi cần thiết.

### 2. Quản lý cơ sở đào tạo

#### + Quản lý trường đại học
Chỉ huy có thể thêm, chỉnh sửa, xóa thông tin các trường đại học nơi học viên được gửi đi đào tạo. Chỉ huy có thể xem cấu trúc phân cấp của cơ sở đào tạo (Cơ sở đào tạo → Chuyên ngành → Trình độ đào tạo → Lớp). Mỗi đơn vị có thể có thông tin về thời gian đi lại để tính toán lịch cắt cơm tự động.

#### + Quản lý lớp học
Chỉ huy có thể quản lý các lớp học, liên kết lớp với trường, đơn vị và cấp đào tạo tương ứng. Hệ thống tự động đồng bộ số lượng học viên trong lớp khi có thay đổi.

### 3. Quản lý hồ sơ học viên

#### + Thêm học viên mới
Chỉ huy có thể thêm học viên mới vào hệ thống với đầy đủ thông tin cá nhân, thông tin học tập và thông tin quân nhân. Hệ thống sẽ tự động tạo tài khoản liên kết với học viên.

#### + Chỉnh sửa thông tin học viên
Chỉ huy có thể cập nhật thông tin của học viên khi có thay đổi, bao gồm thông tin cá nhân, học tập và quân nhân.

#### + Xóa học viên
Chỉ huy có thể xóa học viên khỏi hệ thống khi cần thiết, hệ thống sẽ tự động xóa các dữ liệu liên quan.

#### + Tìm kiếm học viên
Chỉ huy có thể tìm kiếm học viên theo nhiều tiêu chí như tên, mã học viên, lớp, trường đào tạo, khóa học.

### 4. Phân công lịch trực
Chỉ huy có thể phân công lịch trực cho các chỉ huy, quản lý các ca trực và nhiệm vụ được giao.

### 5. Quản lý kết quả học tập

#### + Xem và quản lý đề xuất
Chỉ huy có thể xem tất cả các đề xuất kết quả học tập, phê duyệt hoặc từ chối.

### 6. Quản lý thành tích

#### + Thêm, chỉnh sửa, xóa thành tích
Chỉ huy có thể quản lý toàn bộ thành tích của học viên, bao gồm thành tích học tập, thành tích rèn luyện, các đề tài khoa học, sáng kiến và giải thưởng.

#### + Xem danh sách thành tích
Chỉ huy có thể xem danh sách tất cả thành tích của học viên, tìm kiếm và lọc theo nhiều tiêu chí.

### 7. Quản lý lịch học và lịch cắt cơm

#### + Xem lịch học của học viên
Chỉ huy có thể xem lịch học của bất kỳ học viên nào trong hệ thống.

#### + Nhập và cập nhật lịch học của học viên
Chỉ huy có thể thêm, chỉnh sửa hoặc xóa lịch học cho học viên. Mỗi lịch học gồm học viên (`userId`) và danh sách ca học (`schedules`) với ngày học, giờ bắt đầu, giờ kết thúc, phòng học, tên môn học và tuần học.

#### + Quản lý lịch cắt cơm
Chỉ huy có thể xem, cập nhật lịch cắt cơm của học viên, tạo lịch cắt cơm tự động cho tất cả học viên hoặc cho từng học viên cụ thể, reset về lịch tự động, cập nhật lịch cắt cơm thủ công.

#### + Xuất báo cáo lịch học và lịch cắt cơm
Chỉ huy có thể xuất báo cáo lịch học kèm lịch cắt cơm dưới dạng file Excel.

### 8. Quản lý học phí

#### + Cập nhật thông tin học phí
Chỉ huy có thể ghi nhận và cập nhật thông tin học phí cho từng học viên theo từng học kỳ, bao gồm số tiền cần nộp và trạng thái thanh toán.

#### + Cập nhật trạng thái thanh toán
Chỉ huy có thể cập nhật trạng thái thanh toán học phí của học viên khi nhận được thanh toán.

#### + Xem danh sách học phí
Chỉ huy có thể xem danh sách tất cả học phí của học viên, tìm kiếm và lọc theo nhiều tiêu chí.

#### + Xuất báo cáo học phí
Chỉ huy có thể xuất báo cáo học phí dưới dạng file PDF hoặc Word.

### 9. Quản lý học kỳ

#### + Thêm, chỉnh sửa, xóa học kỳ
Chỉ huy có thể quản lý các học kỳ trong hệ thống, bao gồm tên học kỳ, năm học và các thông tin liên quan.

#### + Xem danh sách học kỳ
Chỉ huy có thể xem danh sách tất cả học kỳ, tìm kiếm theo tên hoặc năm học.

### 10. Thống kê và báo cáo

#### + Xem báo cáo thống kê
Chỉ huy có thể xem các báo cáo thống kê tổng hợp về học viên, kết quả học tập, thành tích, học phí.

#### + Thống kê kết quả học tập
Chỉ huy có thể xem thống kê kết quả học tập theo học kỳ, năm học, xem danh sách học viên có kết quả tốt nhất, xem phân loại học tập.

#### + Thống kê thành tích
Chỉ huy có thể xem danh sách đề xuất khen thưởng, danh sách học viên có thành tích tốt nhất theo năm hoặc học kỳ.

#### + Thống kê xếp loại
Chỉ huy có thể xem thống kê về xếp loại Đảng viên và xếp loại rèn luyện của học viên.

#### + Xuất báo cáo
Chỉ huy có thể xuất các báo cáo dưới dạng file Word, Excel hoặc PDF, bao gồm báo cáo kết quả học tập (PDF), báo cáo học phí (Word), báo cáo lịch cắt cơm (Excel), báo cáo quản lý chính trị nội bộ (Excel).

### 11. Các tính năng tiện ích

#### + Chuyển đổi điểm
Hệ thống hỗ trợ chuyển đổi giữa các hệ điểm (điểm chữ, điểm hệ 4, điểm hệ 10) để hỗ trợ nhập liệu và tính toán.

#### + Tính điểm trung bình
Hệ thống hỗ trợ tính điểm trung bình từ danh sách điểm cho trước.

#### + Xem thông tin điểm
Hệ thống cung cấp thông tin chi tiết về từng loại điểm (điểm chữ) bao gồm điểm hệ 4 và điểm hệ 10 tương ứng.

### 12. Tính năng tự động hóa

#### + Tự động tính toán điểm trung bình tích lũy (CPA)
Hệ thống tự động tính toán điểm trung bình tích lũy cho từng học kỳ và năm học khi có thay đổi về kết quả học tập.

#### + Tự động tạo lịch cắt cơm
Hệ thống tự động tạo lịch cắt cơm dựa trên lịch học, thời gian đi lại từ đơn vị tổ chức và các giờ ăn cố định (sáng 06:00, trưa 11:00, tối 17:30). Lịch cắt cơm được cập nhật tự động mỗi khi có thay đổi về lịch học.

---

## III. Đối với Quản trị viên

### 1. Phân quyền người dùng
Quản trị viên có thể phân quyền cho từng tài khoản, xác định vai trò và quyền truy cập phù hợp.

### 2. Quản lý tài khoản người dùng
Thêm, chỉnh sửa, xóa tài khoản: Quản trị viên có thể quản lý toàn bộ tài khoản người dùng trong hệ thống, bao gồm tài khoản của học viên và chỉ huy. Quản trị viên có thể tạo tài khoản mới, cập nhật thông tin hoặc xóa tài khoản khi cần thiết.
