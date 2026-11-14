"use client";

import PageContainer from "@/library/PageContainer";
import TimeTablesTab from "./TimeTablesTab";

export default function TimeTablesMain() {
  return (
    <PageContainer
      breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Lịch học" }]}
      title="Lịch học"
      subtitle="Nhập, cập nhật và theo dõi thời khóa biểu học viên theo tuần."
      className="space-y-8"
    >
      <TimeTablesTab />
    </PageContainer>
  );
}
