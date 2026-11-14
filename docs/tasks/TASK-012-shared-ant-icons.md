# TASK-012: Đồng bộ icon frontend

## Phạm vi

- Chuẩn hóa icon toàn bộ frontend (Admin, Chỉ huy, Học viên và component dùng chung) về Ant Design từ react-icons/ai đã có trong dependency.
- Một đầu mối xuất icon tại frontend/library/icons/index.ts; các nơi sử dụng import từ @/library/icons.
- Chức năng tương đương dùng cùng icon: Eye xem, Plus thêm, Edit sửa, Delete xóa, Search tìm, Filter lọc, Control cột hiển thị, Download tải/xuất file, Upload nhập file, Team nhóm/lớp, User học viên/tài khoản.
- Thay import và tên icon, gộp import trùng và bỏ import icon không sử dụng. Giữ logic và quyền truy cập hiện tại.
- ActionButton dùng type=button và aria-label từ tooltip để có nhãn truy cập và tránh submit form ngoài ý muốn.
- Không thêm dependency, không sửa dữ liệu database.

## Kiểm tra

- Đối chiếu toàn bộ tên icon với export thực tế của react-icons/ai đã cài.
- Rà nguồn: chỉ module icon chung còn import trực tiếp react-icons.
- git diff --check; rà diff các thành phần dùng chung và menu.
- Chưa chạy lint, type-check, build hoặc giao diện theo yêu cầu trước của người dùng. Cần kiểm tra trực quan các màn hình sau khi tải lại.
