"use client";

import { useState } from "react";
import { HiOutlineCalendar, HiOutlineClipboardList } from "react-icons/hi";
import PageContainer from "@/library/PageContainer";
import Tabs from "@/library/Tabs";
import CutRiceSchedulesTab from "./CutRiceSchedulesTab";
import CutRiceRequestsTab from "./CutRiceRequestsTab";

export default function CutRiceMain() {
  const [activeTab, setActiveTab] = useState<"schedules" | "requests">("schedules");

  const subtitleByTab = {
    schedules: "Theo dõi lịch cắt cơm, tạo tự động và xuất báo cáo Excel.",
    requests: "Quản lý và phê duyệt các yêu cầu cắt cơm từ học viên.",
  } satisfies Record<typeof activeTab, string>;

  return (
    <PageContainer
      breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Cắt cơm" }]}
      title="Cắt cơm"
      subtitle={subtitleByTab[activeTab]}
      className="space-y-8"
    >
      <Tabs
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as "schedules" | "requests")}
        fullWidth
        tabs={[
          {
            id: "schedules",
            label: "Lịch cắt cơm",
            icon: <HiOutlineCalendar />,
            content: <CutRiceSchedulesTab />,
          },
          {
            id: "requests",
            label: "Yêu cầu cắt cơm",
            icon: <HiOutlineClipboardList />,
            content: <CutRiceRequestsTab />,
          },
        ]}
      />
    </PageContainer>
  );
}
