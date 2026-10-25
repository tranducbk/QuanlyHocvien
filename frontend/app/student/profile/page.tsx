import { Metadata } from "next";
import Main from "@/components/profiles/student/Main";

export const metadata: Metadata = {
  title: "Hồ sơ học viên | Hệ thống quản lý học viên",
  description: "Xem thông tin chính trị nội bộ của học viên",
};

export default function StudentProfilePage() {
  return <Main />;
}
