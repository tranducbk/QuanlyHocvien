# Tài liệu mô tả chức năng hệ thống

Thư mục này chứa tài liệu chi tiết cho từng tính năng của hệ thống, được tổ chức theo nhóm người dùng.

## Cấu trúc thư mục

```
doc/
├── README.md                          # File này
├── SPEC.md                            # Đặc tả chức năng hệ thống
├── DATABASE.md                        # Thiết kế database (21 bảng)
├── hoc-vien/                          # Chức năng dành cho Học viên
│   ├── HV-01-dang-nhap-quan-ly-tai-khoan.md
│   ├── HV-02-xem-thong-tin-ca-nhan.md
│   ├── HV-03-xem-ket-qua-hoc-tap.md
│   ├── HV-04-de-xuat-ket-qua-hoc-tap.md
│   ├── HV-05-theo-doi-trang-thai-de-xuat.md
│   ├── HV-06-quan-ly-lich-hoc.md
│   ├── HV-07-xem-lich-cat-com-tu-dong.md
│   ├── HV-08-xem-thanh-tich-va-hoc-phi.md
│   └── HV-09-thong-bao.md
├── chi-huy/                           # Chức năng dành cho Chỉ huy
│   ├── CH-01-quan-ly-tai-khoan-nguoi-dung.md
│   ├── CH-02-quan-ly-co-so-dao-tao.md
│   ├── CH-03-quan-ly-ho-so-hoc-vien.md
│   ├── CH-04-phe-duyet-de-xuat.md
│   ├── CH-05-quan-ly-thanh-tich.md
│   ├── CH-06-quan-ly-lich-hoc-cat-com.md
│   ├── CH-07-quan-ly-hoc-phi.md
│   ├── CH-08-quan-ly-hoc-ky.md
│   ├── CH-09-thong-ke-bao-cao.md
│   ├── CH-10-phan-cong-lich-truc.md
│   └── CH-11-tien-ich-ho-tro.md
└── quan-tri-vien/                     # Chức năng dành cho Quản trị viên
    ├── QTV-01-phan-quyen-nguoi-dung.md
    └── QTV-02-quan-tri-tai-khoan-toan-he-thong.md
```

## Danh sách chức năng

### Học viên
| Mã | Tên chức năng | Mô tả |
|:---|:---|:---|
| HV-01 | Đăng nhập & quản lý tài khoản | Đăng nhập, đổi mật khẩu, bảo mật tài khoản |
| HV-02 | Xem thông tin cá nhân | Xem toàn bộ thông tin cơ bản, học tập, quân nhân |
| HV-03 | Xem kết quả học tập | Bảng điểm chi tiết, CPA, tín chỉ tích lũy, tín chỉ nợ |
| HV-04 | Đề xuất kết quả học tập | Tạo yêu cầu thêm/sửa/xóa điểm + upload minh chứng |
| HV-05 | Theo dõi trạng thái đề xuất | Xem trạng thái: Chờ duyệt / Đã duyệt / Từ chối |
| HV-06 | Xem lịch học | Xem lịch học do Chỉ huy nhập; học viên không tự thêm/sửa/xóa |
| HV-07 | Xem lịch cắt cơm tự động | Tự động tính toán lịch cắt cơm (06:00, 11:00, 17:30) |
| HV-08 | Xem thành tích và học phí | Thành tích, đề tài khoa học, sáng kiến; học phí theo đợt |
| HV-09 | Thông báo | Nhận thông báo tự động: điểm, đề xuất, cắt cơm, sự kiện |

### Chỉ huy
| Mã | Tên chức năng | Mô tả |
|:---|:---|:---|
| CH-01 | Quản lý tài khoản người dùng | Quản lý toàn bộ tài khoản (học viên, chỉ huy) |
| CH-02 | Quản lý cơ sở đào tạo | CRUD trường, chuyên ngành, trình độ đào tạo, lớp; thời gian đi lại |
| CH-03 | Quản lý hồ sơ học viên | Thêm/sửa/xóa/tìm kiếm; tự động tạo tài khoản và xóa dữ liệu |
| CH-04 | Phê duyệt đề xuất | Duyệt/từ chối yêu cầu cập nhật điểm, tự động tính lại CPA |
| CH-05 | Quản lý thành tích | Thành tích học tập, rèn luyện, đề tài, sáng kiến, giải thưởng |
| CH-06 | Quản lý lịch học & cắt cơm | Nhập/cập nhật lịch học cho học viên, tạo/reset/cập nhật lịch cắt cơm; xuất Excel |
| CH-07 | Quản lý học phí | Cập nhật học phí, trạng thái thanh toán, tìm kiếm, xuất Word/PDF |
| CH-08 | Quản lý học kỳ | Thêm/sửa/xóa học kỳ; tìm kiếm theo tên/năm học |
| CH-09 | Thống kê & Báo cáo | Kết quả học tập, thành tích, xếp loại, học phí, chính trị nội bộ |
| CH-10 | Phân công lịch trực | Phân công lịch trực cho chỉ huy, quản lý ca trực và nhiệm vụ |
| CH-11 | Tiện ích hỗ trợ | Chuyển đổi điểm 4/10/chữ, tính điểm TB, xem thông tin điểm |

### Quản trị viên
| Mã | Tên chức năng | Mô tả |
|:---|:---|:---|
| QTV-01 | Phân quyền người dùng | Tạo vai trò (Role), gán quyền (Permission) cho từng tài khoản |
| QTV-02 | Quản trị tài khoản toàn hệ thống | Cấp phát tài khoản mới, CRUD, backup, giám sát |

## Quy trình nghiệp vụ tiêu biểu

### Quy trình cập nhật điểm
```
Học viên gửi yêu cầu → Đính kèm minh chứng → Chỉ huy kiểm tra → Phê duyệt
→ Hệ thống tự động:
   1. Cập nhật điểm vào subject_results
   2. Tính lại GPA semester_results
   3. Tính lại CPA yearly_results
   4. Cập nhật current_cpa4/10 trong students
   5. Gửi thông báo cho học viên
```

### Quy trình cắt cơm
```
Chỉ huy cập nhật lịch học → Hệ thống quét điều kiện thời gian
→ Tự động ghi danh vào danh sách cắt cơm ngày tương ứng
→ Đánh dấu is_auto_generated = true
→ Gửi thông báo cho học viên
```
