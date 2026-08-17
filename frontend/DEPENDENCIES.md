# Giải thích các package trong `frontend/package.json`

> Lưu ý: `package.json` là JSON chuẩn nên không hỗ trợ comment `//`. Vì vậy phần giải thích được đặt ở file Markdown này để vẫn giữ file cấu hình hợp lệ.

## `dependencies`

| Package | Mục đích |
|---|---|
| `@dnd-kit/react` | Hỗ trợ kéo thả (drag & drop) cho các phần tử giao diện. |
| `@floating-ui/react` | Định vị các phần tử nổi như tooltip, dropdown, popover. |
| `@hookform/resolvers` | Kết nối `react-hook-form` với các thư viện validate như `zod`. |
| `@tanstack/react-query` | Quản lý fetch dữ liệu, cache, đồng bộ và refetch từ API. |
| `@tanstack/match-sorter-utils` | Hỗ trợ tìm kiếm/fuzzy filter và xếp hạng kết quả phù hợp, dùng cho các bộ lọc client-side như `Select`. |
| `@tanstack/react-table` | Xây dựng bảng dữ liệu linh hoạt theo kiểu headless. |

| `axios` | Gửi request HTTP tới backend API. |
| `js-cookie` | Đọc, ghi và xoá cookie trên trình duyệt. |
| `jwt-decode` | Giải mã nội dung của JWT token để lấy thông tin bên trong. |
| `motion` | Tạo animation và hiệu ứng chuyển động cho UI. |
| `next` | Framework React dùng để xây dựng ứng dụng web production với Next.js. |
| `react` | Thư viện lõi để xây dựng giao diện người dùng. |
| `react-dom` | Kết nối React với DOM của trình duyệt. |
| `react-hook-form` | Quản lý form hiệu quả, ít re-render, dễ validate. |
| `react-icons` | Cung cấp bộ icon phong phú cho giao diện. |
| `zod` | Xác thực dữ liệu theo schema, thường dùng cho form và API. |
| `zustand` | Quản lý state toàn cục đơn giản, nhẹ và dễ dùng. |

## `devDependencies`

| Package | Mục đích |
|---|---|
| `@tailwindcss/postcss` | Plugin PostCSS để tích hợp Tailwind CSS. |
| `@types/js-cookie` | TypeScript types cho `js-cookie`. |
| `@types/node` | TypeScript types cho Node.js. |
| `@types/react` | TypeScript types cho React. |
| `@types/react-dom` | TypeScript types cho React DOM. |
| `eslint` | Kiểm tra lỗi và chuẩn hoá code style. |
| `eslint-config-next` | Bộ cấu hình ESLint tối ưu cho Next.js. |
| `eslint-config-prettier` | Tắt các rule ESLint xung đột với Prettier. |
| `prettier` | Format code tự động. |
| `tailwindcss` | Framework CSS utility-first để dựng giao diện nhanh. |
| `typescript` | Bổ sung kiểu tĩnh cho JavaScript. |

