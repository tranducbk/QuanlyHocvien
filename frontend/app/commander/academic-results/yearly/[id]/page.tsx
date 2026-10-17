import type { Metadata } from "next";
import Main from "@/components/commander/academic-results/yearly-detail/Main";

export const metadata: Metadata = {
  title: "Chi tiết kết quả năm học - Hệ thống quản lý Học viên",
};

export default async function YearlyResultDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Main yearlyResultId={id} />;
}
