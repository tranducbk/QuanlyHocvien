"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { HiOutlineEye } from "react-icons/hi";
import { useRouter } from "next/navigation";
import ActionButton from "@/library/ActionButton";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import { QUERY_KEYS } from "@/constants/query-keys";
import { academicManagementService } from "@/services/academic-management";
import { SemesterResult } from "@/types/student-academic";
import { formatScore, textOrDash } from "@/utils/fn-common";

interface YearlyDetailMainProps {
  yearlyResultId: string;
}

export default function Main({ yearlyResultId }: YearlyDetailMainProps) {
  const router = useRouter();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.COMMANDER_YEARLY_RESULTS, yearlyResultId],
    queryFn: () =>
      academicManagementService.getYearlyResultDetail(yearlyResultId),
  });

  const detail = data?.data;
  const semesters = detail?.semesterResults || [];
  const profile = detail?.user?.profile;

  const columns = useMemo<ColumnDef<SemesterResult>[]>(
    () => [
      {
        id: "semester",
        header: "Học kỳ",
        accessorKey: "semester",
        cell: (info) => `Học kỳ ${textOrDash(info.row.original.semester)}`,
      },
      {
        id: "totalCredits",
        header: "Tổng tín chỉ",
        accessorKey: "totalCredits",
        cell: (info) => textOrDash(info.row.original.totalCredits),
      },
      {
        id: "averageGrade10",
        header: "GPA hệ 10",
        accessorKey: "averageGrade10",
        cell: (info) => formatScore(info.row.original.averageGrade10),
      },
      {
        id: "averageGrade4",
        header: "GPA hệ 4",
        accessorKey: "averageGrade4",
        cell: (info) => formatScore(info.row.original.averageGrade4),
      },
      {
        id: "cumulativeGrade4",
        header: "CPA hệ 4",
        accessorKey: "cumulativeGrade4",
        cell: (info) => formatScore(info.row.original.cumulativeGrade4),
      },
      {
        id: "debtCredits",
        header: "Tín chỉ nợ",
        accessorKey: "debtCredits",
        cell: (info) => textOrDash(info.row.original.debtCredits),
      },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        cell: (info) => (
          <ActionButton
            tooltipText="Xem chi tiết học kỳ"
            icon={HiOutlineEye}
            color="blue"
            onClick={() =>
              router.push(`/commander/academic-results/${info.row.original.id}`)
            }
          />
        ),
      },
    ],
    [router]
  );

  const summaryCards = [
    { label: "GPA năm (hệ 10)", value: formatScore(detail?.averageGrade10) },
    { label: "GPA năm (hệ 4)", value: formatScore(detail?.averageGrade4) },
    { label: "CPA đến cuối năm", value: formatScore(detail?.cumulativeGrade4) },
    { label: "Tín chỉ trong năm", value: textOrDash(detail?.totalCredits) },
    { label: "Tín chỉ tích lũy", value: textOrDash(detail?.cumulativeCredits) },
    { label: "Môn đạt", value: textOrDash(detail?.passedSubjects) },
    { label: "Môn chưa đạt", value: textOrDash(detail?.failedSubjects) },
    { label: "Xếp loại", value: textOrDash(detail?.academicStatus) },
  ];

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Quản lý học tập", href: "/commander/academic-results" },
        { label: "Kết quả năm học" },
      ]}
      title={
        detail
          ? `Kết quả năm học ${detail.schoolYear || ""}`
          : "Chi tiết kết quả năm học"
      }
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <Typography variant="body" weight="semibold" color="neutral">
            Học viên: {textOrDash(profile?.fullName)} ({textOrDash(profile?.code)})
          </Typography>
          <Typography variant="caption" color="gray" className="mt-1">
            Đơn vị: {textOrDash(profile?.unit)} · Trường: {textOrDash(profile?.university?.universityName)} · Lớp: {textOrDash(profile?.class?.className)}
          </Typography>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-primary-100 bg-primary-50 p-4 text-primary-800 shadow-sm dark:border-primary-900 dark:bg-primary-950 dark:text-primary-200"
            >
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-black">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white px-4 dark:bg-neutral-950">
          <Table
            data={{
              statusCode: 200,
              message: "Thành công",
              data: semesters,
              pagination: {
                total: semesters.length,
                page: 1,
                limit: Math.max(semesters.length, 1),
                totalPages: 1,
              },
            }}
            columns={columns}
            pagination={pagination}
            onPaginationChange={setPagination}
            showFilter={false}
            emptyText="Năm học này chưa có kết quả học kỳ"
          />
        </div>
      </div>
    </PageContainer>
  );
}
