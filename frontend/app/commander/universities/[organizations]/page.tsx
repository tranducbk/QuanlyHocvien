import Main from "@/components/commander/universities/[organizations]/Main";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý chuyên ngành | Hệ thống quản lý học viên",
  description: "Quản lý thông tin các chuyên ngành, trình độ đào tạo và lớp học của trường đại học.",
};

interface Props {
  params: Promise<{ organizations: string }>;
}

export default async function OrganizationPage({ params }: Props) {
  const { organizations: universityId } = await params;
  return <Main universityId={universityId} />;
}
