import { Metadata } from "next";
import Main from "@/components/commander/profile/Main";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | Hệ thống quản lý học viên",
  description: "Quản lý thông tin cá nhân của chỉ huy",
};

export default function ProfilePage() {
  return <Main />;
}
