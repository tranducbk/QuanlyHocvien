import type { Metadata } from "next";
import Main from "@/components/Main";

export const metadata: Metadata = {
  title: "Nền tảng Quản lý Học viên Thông minh | HVKHQS",
  description:
    "Giải pháp công nghệ tiên tiến cho việc quản lý sinh viên toàn diện tại Học viện Khoa học Quân sự. Tối ưu hóa quy trình hành chính, nâng cao chất lượng đào tạo và trải nghiệm học tập.",
};

export default function Page() {
  return <Main />;
}
