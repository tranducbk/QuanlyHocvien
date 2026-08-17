"use client";

import { useMemo, useCallback, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { HiOutlineEye } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import { FilterField } from "@/library/table/TableFilter";
import useTableQuery from "@/hooks/useTableQuery";
import { academicManagementService } from "@/services/academic-management";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useModalStore } from "@/store/useModalStore";
import { SemesterResult } from "@/types/student-academic";
import { useRouter } from "next/navigation";
import { formatScore, textOrDash } from "@/utils/fn-common";
import StudentSemestersTable from "./StudentSemestersTable";

export default function Main() {
  const router = useRouter();
  const {
    data: semesterResultsData,
    isLoading: isSemesterResultsLoading,
    isError: isSemesterResultsError,
    refetch: refetchSemesterResults,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<SemesterResult>({
    queryKey: [QUERY_KEYS.STUDENT_RESULTS, "COMMANDER_SEMESTERS_LATEST"],
    fetchData: (params: any) => {
      const hasSemesterFilter = !!params.semester;
      const hasSchoolYearFilter = !!params.schoolYear;
      const latestOnly = (!hasSemesterFilter && !hasSchoolYearFilter) ? true : undefined;
      return academicManagementService.getSemesterResults({ ...params, latestOnly });
    },
  });

  const columns = useMemo<ColumnDef<SemesterResult>[]>(
    () => [
      {
        id: "studentCode",
        header: "Mã HV",
        accessorFn: (row: any) => row.user?.profile?.code,
        cell: (info) => (
          <Typography variant="body" weight="semibold" color="neutral">
            {textOrDash(info.getValue() as string)}
          </Typography>
        ),
      },
      {
        id: "fullName",
        header: "Họ và tên",
        accessorFn: (row: any) => row.user?.profile?.fullName,
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.getValue() as string)}
          </Typography>
        ),
      },
      {
        id: "unit",
        header: "Đại đội",
        accessorFn: (row: any) => row.user?.profile?.unit,
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.getValue() as string)}
          </Typography>
        ),
      },
      {
        id: "semester",
        header: "Học kỳ",
        accessorKey: "semester",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.semester)}
          </Typography>
        ),
      },
      {
        id: "schoolYear",
        header: "Năm học",
        accessorKey: "schoolYear",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.schoolYear)}
          </Typography>
        ),
      },
      {
        id: "averageGrade10",
        header: "TBC (hệ 10)",
        accessorKey: "averageGrade10",
        cell: (info) => (
          <Typography variant="body" color="neutral" weight="semibold">
            {formatScore(info.row.original.averageGrade10)}
          </Typography>
        ),
      },
      {
        id: "averageGrade4",
        header: "TBC (hệ 4)",
        accessorKey: "averageGrade4",
        cell: (info) => (
          <Typography variant="body" color="neutral" weight="semibold">
            {formatScore(info.row.original.averageGrade4)}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: (info) => {
          const record = info.row.original;
          return (
            <div className="flex gap-2">
              <ActionButton
                tooltipText="Xem chi tiết & nhập điểm"
                icon={HiOutlineEye}
                onClick={() => router.push(`/commander/academic-results/${record.id}`)}
                color="blue"
              />
            </div>
          );
        },
      },
    ],
    [router]
  );

  const filterOptions = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        id: "fullName",
        label: "Họ và tên",
        placeholder: "Nhập họ tên...",
      },
      {
        type: "text",
        id: "unit",
        label: "Đại đội",
        placeholder: "Nhập đại đội...",
      },
      {
        type: "select",
        id: "semester",
        label: "Học kỳ",
        placeholder: "Chọn học kỳ...",
        options: [
          { value: "", label: "Tất cả" },
          { value: "1", label: "Học kỳ 1" },
          { value: "2", label: "Học kỳ 2" },
        ],
      },
      {
        type: "select",
        id: "schoolYear",
        label: "Năm học",
        placeholder: "Chọn năm học...",
        options: [
          { value: "", label: "Tất cả" },
          { value: "2023-2024", label: "2023-2024" },
          { value: "2024-2025", label: "2024-2025" },
          { value: "2025-2026", label: "2025-2026" },
          { value: "2026-2027", label: "2026-2027" },
        ],
      },
    ],
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Quản lý học tập" },
      ]}
      title="Quản lý học tập"
      isLoading={isSemesterResultsLoading}
      isError={isSemesterResultsError}
      onRetry={refetchSemesterResults}
    >
      <div className="bg-white dark:bg-neutral-950 overflow-hidden relative transition-colors">
        <div className="px-4">
          <Table
            data={semesterResultsData}
            columns={columns}
            pagination={pagination}
            onPaginationChange={setPagination}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            sorting={sorting}
            onSortingChange={setSorting}
            filterFields={filterOptions}
            emptyText="Không tìm thấy kết quả học tập nào phù hợp"
            defaultExpanded={{}}
            renderSubComponent={(row) => <StudentSemestersTable userId={row.original.userId} excludeId={row.original.id} />}
          />
        </div>
      </div>
    </PageContainer>
  );
}
