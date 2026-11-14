import { Metadata } from "next";
import Main from "@/components/academic-results/commander/approvals/Main";
import CohortMain from "@/components/training-program/commander/training-classes/GradeApprovals";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Phê duyệt đề xuất | Student Manager",
  description:
    "Trang chỉ huy phê duyệt, từ chối và theo dõi các đề xuất chỉnh sửa kết quả học tập của học viên.",
};

export default async function CommanderApprovalsPage() {
  const code = (await cookies()).get("trainingSystemCode")?.value;
  return code && ["HE_1", "HE_3", "HE_4", "HE_7"].includes(code) ? <CohortMain /> : <Main />;
}
