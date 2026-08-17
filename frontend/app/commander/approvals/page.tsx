import { Metadata } from "next";
import Main from "@/components/commander/approvals/Main";

export const metadata: Metadata = {
  title: "Phê duyệt đề xuất | Student Manager",
  description:
    "Trang chỉ huy phê duyệt, từ chối và theo dõi các đề xuất chỉnh sửa kết quả học tập của học viên.",
};

export default function CommanderApprovalsPage() {
  return <Main />;
}
