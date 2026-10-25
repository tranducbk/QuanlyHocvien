import Main from "@/components/academic-results/commander/detail/Main";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi tiết điểm học kỳ - Hệ thống quản lý Học viên",
};

export default async function SemesterDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <Main semesterResultId={resolvedParams.id} />;
}
