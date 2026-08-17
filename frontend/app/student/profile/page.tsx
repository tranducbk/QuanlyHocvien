import { Metadata } from "next";
import Main from "@/components/student/profile/Main";

export const metadata: Metadata = {
  title: "Hồ sơ học viên | Hệ thống quản lý học viên",
  description: "Xem và cập nhật thông tin cá nhân, học tập và quân nhân của học viên",
};

export default function StudentProfilePage() {
  return <Main />;
}
