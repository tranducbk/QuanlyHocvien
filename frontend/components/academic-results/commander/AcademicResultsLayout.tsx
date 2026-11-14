"use client";

import type { ReactNode } from "react";
import PageContainer from "@/library/PageContainer";
import Tabs, { type TabItem } from "@/library/Tabs";

export default function AcademicResultsLayout({ activeTab, onChange, tabs, children, empty, subtitle, isLoading, isError, onRetry }: {
  activeTab: string;
  onChange: (id: string) => void;
  tabs: TabItem[];
  children?: ReactNode;
  empty?: ReactNode;
  subtitle?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}) {
  return (
    <PageContainer
      breadcrumb={[{ label: "Tổng quan", href: "/commander" }, { label: "Quản lý học tập" }]}
      title="Quản lý học tập"
      subtitle={subtitle}
      isLoading={isLoading}
      isError={isError}
      onRetry={onRetry}
    >
      {children}
      {tabs.length ? <div className="bg-white px-4 dark:bg-neutral-950"><Tabs tabs={tabs} activeTab={activeTab} onChange={onChange} variant="pills" /></div> : empty}
    </PageContainer>
  );
}
