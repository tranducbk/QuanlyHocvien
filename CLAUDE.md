# CLAUDE.md

Hướng dẫn làm việc với dự án Hệ thống Quản lý Học viên.

## Context và phạm vi

- Tuân thủ `AGENTS.md`; chỉ đọc task, tài liệu và source liên quan đến yêu cầu.
- Không đọc lại nội dung đã có trong phiên nếu file chưa thay đổi.
- Dùng `rg -n` hoặc `rg --files` có giới hạn thư mục để định vị code, rồi đọc quanh symbol cần sửa.
- Không nạp toàn bộ source, log, lockfile hoặc tài liệu nghiệp vụ chỉ để tìm một hàm.
- Khi tài liệu mâu thuẫn, nêu rõ; dùng task đã chốt để xác định phạm vi và source để xác nhận hành vi hiện tại.

## Triển khai

- Kiểm tra Git status trước khi sửa, bảo vệ các thay đổi đang có.
- Giải pháp nhỏ nhất đáp ứng yêu cầu; tái sử dụng helper, hook và component hiện có.
- Giữ kiến trúc backend `route -> controller -> service -> model`; nghiệp vụ và transaction ở service.
- Frontend gọi API qua service, dùng React Query cho server state và Zustand cho auth/UI state.
- Giữ phân quyền theo hệ ở backend. Hệ 1/3/4/7 cho Chỉ huy sửa điểm, lưu lịch sử mọi lần sửa; sau chốt lớp/học kỳ bắt buộc lý do. Không xóa điểm hoặc lịch sử. Hệ 5 giữ luồng hiện tại.
- Không tự thêm dependency, refactor diện rộng, đổi API contract, reset database hoặc đưa secret vào source.
- Chỉ hỏi lại khi thiếu quyết định nghiệp vụ quan trọng, có mâu thuẫn hoặc cần thao tác ảnh hưởng dữ liệu.

## Kiểm chứng và bàn giao

- Nêu plan ngắn khi task có nhiều bước; kiểm tra đúng phạm vi thay đổi theo `AGENTS.md`.
- Review diff và `git diff --check`; không coi kiểm tra chưa chạy là đã pass.
- Không tự commit hoặc push.
- Trả lời bằng tiếng Việt, ngắn gọn: thay đổi chính, kiểm tra đã chạy và giới hạn còn lại.
- Khi chuyển phiên, tóm tắt mục tiêu, file/symbol, quyết định và bước tiếp theo; không chép nguyên log/source.
