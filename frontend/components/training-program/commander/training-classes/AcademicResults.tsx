"use client";

import { useState } from "react";
import Tabs from "@/library/Tabs";
import PageContainer from "@/library/PageContainer";
import useAssignedTrainingClass from "@/hooks/training-program/useAssignedTrainingClass";
import { useConfirmStore } from "@/store/useConfirmStore";
import SubjectGradeSheet from "./SubjectGradeSheet";

export default function AcademicResults() {
  const { commanderId, classes, assignedClasses } = useAssignedTrainingClass();
  const [activeTab, setActiveTab] = useState("entry");
  const [sheetDirty, setSheetDirty] = useState(false);
  const openConfirm = useConfirmStore((state) => state.openConfirm);
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);

  const tabs = [
    {
      id: "entry",
      label: "Nhập điểm",
      content: (
        <SubjectGradeSheet
          classes={assignedClasses}
          commanderId={commanderId}
          onDirtyChange={setSheetDirty}
        />
      ),
    },
    {
      id: "view",
      label: "Xem điểm",
      content: (
        <SubjectGradeSheet
          classes={assignedClasses}
          commanderId={commanderId}
          mode="view"
        />
      ),
    },
  ];

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Quản lý học tập" },
      ]}
      title="Quản lý học tập"
      subtitle="Nhập điểm hoặc xem kết quả theo lớp, học kỳ và môn học."
      isLoading={classes.isLoading}
      isError={classes.isError}
      onRetry={() => void classes.refetch()}
      className="!min-h-0"
    >
      <div className="bg-white px-4 dark:bg-neutral-950">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => {
            if (id === activeTab) return;
            if (sheetDirty)
              openConfirm({
                title: "Điểm chưa lưu",
                message:
                  "Đổi tác vụ sẽ bỏ các thay đổi chưa lưu trong bảng điểm. Tiếp tục?",
                onConfirm: () => {
                  closeConfirm();
                  setSheetDirty(false);
                  setActiveTab(id);
                },
              });
            else setActiveTab(id);
          }}
          variant="pills"
        />
      </div>
    </PageContainer>
  );
}
