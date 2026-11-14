# TASK-011: Thêm học viên Hệ 5 vào trường

## Phạm vi đã chốt

- Tại Cơ sở đào tạo, mỗi trường đang hoạt động có thao tác Thêm học viên.
- Tìm trong toàn bộ học viên Hệ 5 đang hoạt động, chưa có trường; không giới hạn theo Chỉ huy quản lý.
- Tìm nhanh theo tên/mã học viên; có bộ lọc họ tên, mã học viên, giới tính và phân trang.
- Chọn nhiều học viên, giữ lựa chọn khi tìm kiếm/chuyển trang, có thể bỏ chọn trước khi lưu.
- Lưu universityId vào hồ sơ; cập nhật cache danh sách trường, cơ cấu trường và hồ sơ học viên.
- Không chuyển học viên đã có trường, không thay đổi lớp quản lý theo năm học.
- Backend giới hạn theo hệ tài khoản xác thực, kiểm tra lại điều kiện chưa có trường trong transaction và khóa bản ghi khi ghi.
- Không migration, không thêm dependency, không sửa dữ liệu hiện có thay người dùng.

## Triển khai

- GET `/universities/:id/available-students`: danh sách phân trang, chỉ trả mã/họ tên/giới tính và ID hồ sơ.
- POST `/universities/:id/students`: nhận `profileIds`, kiểm tra trường hoạt động và quan hệ đào tạo hiện có trước khi cập nhật đồng thời.
- Chỉ COMMANDER Hệ 5 được truy cập. Các API hồ sơ cũ giữ phạm vi quyền hiện tại.

## Kiểm tra

## Bổ sung: tạo ngành học tại chỗ

- Biểu mẫu thêm chương trình Hệ 5 có nút Tạo ngành học cạnh trường chọn ngành; mở modal tại trang hiện tại, không điều hướng.
- Tạo thành công cập nhật danh sách ngành, chọn sẵn ngành vừa tạo và tải trình độ của ngành đó; giữ dữ liệu biểu mẫu chương trình.
- Bảng Cơ sở đào tạo có nút Tạo ngành học tại từng trường hoạt động.
- Tái sử dụng form/API tạo Organization hiện có; giữ trường thời gian di chuyển và luồng backend tạo sẵn Cử nhân/Kỹ sư.
- Cập nhật cache ngành, trường và cơ cấu trường sau khi tạo.
- Chặn trùng tên ngành trong cùng trường khi tạo, đổi tên/chuyển trường và tạo ngành kèm trường mới. So sánh sau chuẩn hóa Unicode NFC, gộp khoảng trắng, không phân biệt hoa/thường; vẫn phân biệt dấu tiếng Việt. Khóa bản ghi trường trong transaction để các yêu cầu tạo đồng thời không tạo trùng. Không thay đổi ngành trùng đã có trong dữ liệu cũ.
- Dropdown ngành trong biểu mẫu tạo/sửa chương trình chỉ hiện một mục theo tên chuẩn hóa trong cùng trường, kể cả dữ liệu cũ đang trùng. Giữ ID ngành đã chọn khi chỉnh sửa để không đổi quan hệ trình độ/chương trình. Đây là xử lý hiển thị; chưa gộp hoặc xóa dữ liệu ngành cũ trong database.

## Kiểm tra sau bổ sung

- Theo yêu cầu gộp dữ liệu: đã chạy report, dry-run rollback và apply trên neondb bằng `backend/src/utils/mergeDuplicateMajors.js`. Gộp hai bản ghi Khoa học máy tính cùng trường, giữ bản tạo trước và chuyển khóa ngoại ngành/trình độ trước khi xóa bản dư. Transaction apply đã commit thành công. Lệnh report kiểm tra lại sau commit bị người dùng từ chối, nên chưa xác minh độc lập sau commit.

- Review source và `git diff --check`.
- Theo yêu cầu người dùng, chưa chạy ứng dụng, lint, type-check, build hoặc kiểm thử API/database. Cần kiểm tra UI/API thực tế, đặc biệt thêm nhiều học viên, tìm/lọc/phân trang và từ chối truy cập chéo hệ.
