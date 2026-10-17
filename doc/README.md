# Tài liệu mô tả hệ thống

## Phạm vi hiện hành

Tài liệu phạm vi hệ thống nằm tại [SPEC.md](SPEC.md). Hệ thống gồm **Hệ 1, Hệ 3, Hệ 4, Hệ 5 và Hệ 7**. Hệ 1 và Hệ 7 dùng chung nghiệp vụ, khác chương trình đào tạo. Hệ 5 quản lý học viên tại cơ sở đào tạo ngoài quân đội, gồm cơ sở đào tạo, học tập, học phí và lịch cắt cơm.

## Lưu ý về tài liệu chi tiết

Các file trong `hoc-vien/`, `chi-huy/` và `quan-tri-vien/` mô tả luồng theo vai trò. Phạm vi hệ, quyền truy cập và dữ liệu phải tuân theo [SPEC.md](SPEC.md).

## Cấu trúc thư mục

```
doc/
├── README.md
├── SPEC.md                 # Phạm vi Hệ 1/3/4/5/7 và định hướng phát triển
├── DATABASE.md             # Bảng, cột và kiểu dữ liệu hiện có cùng định hướng schema năm hệ
├── hoc-vien/               # Luồng nghiệp vụ học viên
├── chi-huy/                # Luồng nghiệp vụ chỉ huy
└── quan-tri-vien/          # Luồng nghiệp vụ Admin
```

## Công nghệ của dự án

- Backend: Node.js, Express, Sequelize và PostgreSQL.
- Frontend: Next.js, React và TypeScript.
- Mọi dữ liệu nghiệp vụ thuộc một trong năm hệ và được backend giới hạn theo tài khoản đã xác thực.
- Thông tin chính trị nội bộ dùng chung model `Profile`.
