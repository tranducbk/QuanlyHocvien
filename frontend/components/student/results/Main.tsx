"use client";

import { useState } from "react";
import { HiOutlineAcademicCap, HiOutlineDocumentAdd } from "react-icons/hi";
import PageContainer from "@/library/PageContainer";
import Tabs from "@/library/Tabs";
import AcademicResultsTab from "./academic-result/AcademicResultsTab";
import GradeRequestsTab from "./grade-request/GradeRequestsTab";

export default function Main() {
  const [activeTab, setActiveTab] = useState<"results" | "requests">("results");

  const handleTabChange = (id: string) => {
    setActiveTab(id as "results" | "requests");
  };

  const subtitleByTab = {
    results: "Theo dõi kết quả học tập, điểm từng môn và CPA theo từng học kỳ.",
    requests: "Theo dõi trạng thái đề xuất chỉnh sửa điểm và gửi yêu cầu mới khi cần.",
  } satisfies Record<typeof activeTab, string>;

  return (
    <PageContainer
      breadcrumb={[{ label: "Trang chủ", href: "/student" }, { label: "Kết quả học tập" }]}
      title="Kết quả học tập"
      subtitle={subtitleByTab[activeTab]}
      className="space-y-8"
    >
      <Tabs
        activeTab={activeTab}
        onChange={handleTabChange}
        fullWidth
        tabs={[
          {
            id: "results",
            label: "Kết quả học tập",
            icon: <HiOutlineAcademicCap />,
            content: <AcademicResultsTab />,
          },
          {
            id: "requests",
            label: "Đề xuất chỉnh sửa điểm",
            icon: <HiOutlineDocumentAdd />,
            content: <GradeRequestsTab />,
          },
        ]}
      />
    </PageContainer>
  );
}
