"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { HiOutlineDownload, HiOutlineEye } from "react-icons/hi";
import { useRouter } from "next/navigation";
import ActionButton from "@/library/ActionButton";
import Badge, { BadgeVariant } from "@/library/Badge";
import Button from "@/library/Button";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Tabs from "@/library/Tabs";
import Typography from "@/library/Typography";
import { FilterField } from "@/library/table/TableFilter";
import useAppMutation from "@/hooks/useAppMutation";
import useTableQuery from "@/hooks/useTableQuery";
import { academicManagementService } from "@/services/academic-management";
import { semesterService } from "@/services/semesters";
import { QUERY_KEYS } from "@/constants/query-keys";
import {
  SemesterResult,
  YearlyResult,
  YearlyResultQueryRequest,
} from "@/types/student-academic";
import { downloadBlob, formatScore, textOrDash } from "@/utils/fn-common";
import StudentSemestersTable from "./StudentSemestersTable";

type ResultView = "semester" | "year";

const ACADEMIC_CLASSIFICATIONS = [
  "XUẤT SẮC",
  "GIỎI",
  "KHÁ",
  "TRUNG BÌNH",
  "YẾU",
  "KÉM",
];

const getAcademicClassification = (result: YearlyResult) => {
  const storedClassification = result.academicStatus?.trim().toUpperCase();
  if (
    storedClassification &&
    ACADEMIC_CLASSIFICATIONS.includes(storedClassification)
  ) {
    return storedClassification;
  }

  if (
    result.averageGrade10 === null ||
    result.averageGrade10 === undefined
  ) {
    return null;
  }

  const gpa10 = Number(result.averageGrade10);
  if (!Number.isFinite(gpa10)) return null;
  if (gpa10 >= 9) return "XUẤT SẮC";
  if (gpa10 >= 8) return "GIỎI";
  if (gpa10 >= 6.5) return "KHÁ";
  if (gpa10 >= 5) return "TRUNG BÌNH";
  return "YẾU";
};

const getClassificationVariant = (
  classification: string | null
): BadgeVariant => {
  switch (classification) {
    case "XUẤT SẮC":
      return "primary";
    case "GIỎI":
      return "success";
    case "KHÁ":
      return "secondary";
    case "TRUNG BÌNH":
      return "warning";
    case "YẾU":
    case "KÉM":
      return "error";
    default:
      return "neutral";
  }
};

export default function Main() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ResultView>("semester");

  const schoolYearsQuery = useQuery({
    queryKey: [QUERY_KEYS.SEMESTERS, "school-years", "academic-results"],
    queryFn: () => semesterService.getSchoolYears({ fetchAll: true }),
  });

  const schoolYearOptions = useMemo(
    () => [
      { value: "", label: "Tất cả" },
      ...(schoolYearsQuery.data?.data || []).map((item) => ({
        value: item.schoolYear,
        label: item.schoolYear,
      })),
    ],
    [schoolYearsQuery.data]
  );

  const semesterQuery = useTableQuery<SemesterResult>({
    queryKey: [QUERY_KEYS.COMMANDER_SEMESTER_RESULTS],
    enabled: activeView === "semester",
    fetchData: (params: Record<string, unknown>) => {
      const hasSemesterFilter = Boolean(params.semester);
      const hasSchoolYearFilter = Boolean(params.schoolYear);
      const latestOnly =
        !hasSemesterFilter && !hasSchoolYearFilter ? true : undefined;
      return academicManagementService.getSemesterResults({
        ...params,
        latestOnly,
      });
    },
  });

  const yearlyQuery = useTableQuery<YearlyResult, YearlyResultQueryRequest>({
    queryKey: [QUERY_KEYS.COMMANDER_YEARLY_RESULTS],
    enabled: activeView === "year",
    fetchData: academicManagementService.getYearlyResults,
  });

  const semesterColumns = useMemo<ColumnDef<SemesterResult>[]>(
    () => [
      {
        id: "studentCode",
        header: "Mã HV",
        enableSorting: false,
        accessorFn: (row) => row.user?.profile?.code,
        cell: (info) => (
          <Typography variant="body" weight="semibold" color="neutral">
            {textOrDash(info.getValue() as string)}
          </Typography>
        ),
      },
      {
        id: "fullName",
        header: "Họ và tên",
        enableSorting: false,
        accessorFn: (row) => row.user?.profile?.fullName,
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.getValue() as string)}
          </Typography>
        ),
      },
      {
        id: "unit",
        header: "Đại đội",
        enableSorting: false,
        accessorFn: (row) => row.user?.profile?.unit,
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
        enableSorting: false,
        cell: (info) => (
          <ActionButton
            tooltipText="Xem chi tiết & nhập điểm"
            icon={HiOutlineEye}
            onClick={() =>
              router.push(`/commander/academic-results/${info.row.original.id}`)
            }
            color="blue"
          />
        ),
      },
    ],
    [router]
  );

  const yearlyColumns = useMemo<ColumnDef<YearlyResult>[]>(
    () => [
      {
        id: "fullName",
        header: "Học viên",
        enableSorting: false,
        accessorFn: (row) => row.user?.profile?.fullName,
        cell: (info) => {
          const profile = info.row.original.user?.profile;
          return (
            <div className="flex min-w-0 flex-col gap-0.5">
              <Typography
                variant="body"
                weight="semibold"
                color="neutral"
                className="truncate"
              >
                {textOrDash(profile?.fullName)}
              </Typography>
              <span className="truncate text-xs font-medium text-neutral-400">
                {textOrDash(profile?.code)}
              </span>
            </div>
          );
        },
      },
      {
        id: "schoolYear",
        header: "Năm học",
        accessorKey: "schoolYear",
        cell: (info) => textOrDash(info.row.original.schoolYear),
      },
      {
        id: "averageGrade10",
        header: "GPA 10",
        accessorKey: "averageGrade10",
        cell: (info) => (
          <Typography variant="body" weight="semibold" color="neutral">
            {formatScore(info.row.original.averageGrade10)}
          </Typography>
        ),
      },
      {
        id: "averageGrade4",
        header: "GPA 4",
        accessorKey: "averageGrade4",
        cell: (info) => (
          <Typography variant="body" weight="semibold" color="neutral">
            {formatScore(info.row.original.averageGrade4)}
          </Typography>
        ),
      },
      {
        id: "cumulativeCredits",
        header: "TC tích lũy",
        accessorKey: "cumulativeCredits",
        cell: (info) => textOrDash(info.row.original.cumulativeCredits),
      },
      {
        id: "academicStatus",
        header: "Xếp loại",
        accessorKey: "academicStatus",
        cell: (info) => {
          const classification = getAcademicClassification(info.row.original);
          return (
            <Badge
              variant={getClassificationVariant(classification)}
              className="max-w-full truncate"
            >
              {textOrDash(classification)}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Chi tiết",
        enableSorting: false,
        cell: (info) => (
          <ActionButton
            tooltipText="Xem chi tiết năm học"
            icon={HiOutlineEye}
            onClick={() =>
              router.push(
                `/commander/academic-results/yearly/${info.row.original.id}`
              )
            }
            color="blue"
          />
        ),
      },
    ],
    [router]
  );

  const semesterFilters = useMemo<FilterField[]>(
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
        options: schoolYearOptions,
        isLoading: schoolYearsQuery.isLoading,
      },
    ],
    [schoolYearOptions, schoolYearsQuery.isLoading]
  );

  const yearlyFilters = useMemo<FilterField[]>(
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
        label: "Đơn vị",
        placeholder: "Nhập đơn vị...",
      },
      {
        type: "select",
        id: "schoolYear",
        label: "Năm học",
        placeholder: "Chọn năm học...",
        options: schoolYearOptions,
        isLoading: schoolYearsQuery.isLoading,
      },
    ],
    [schoolYearOptions, schoolYearsQuery.isLoading]
  );

  const exportMutation = useAppMutation<Blob, void>({
    mutationKey: [QUERY_KEYS.COMMANDER_YEARLY_RESULTS, "export"],
    mutationFn: () => {
      const filterParams = yearlyQuery.columnFilters.reduce(
        (params, filter) => ({ ...params, [filter.id]: filter.value }),
        {} as Record<string, unknown>
      );
      const activeSort = yearlyQuery.sorting[0];
      return academicManagementService.exportYearlyResults({
        ...filterParams,
        ...(activeSort
          ? {
              sortBy: activeSort.id,
              sortOrder: activeSort.desc ? "desc" : "asc",
            }
          : {}),
      } as YearlyResultQueryRequest);
    },
    successMessage: "Xuất kết quả năm học thành công!",
    errorMessage: "Xuất kết quả năm học thất bại!",
    onSuccess: (blob) => downloadBlob(blob, "ket-qua-hoc-tap-theo-nam.xlsx"),
  });

  const semesterTable = (
    <Table
      data={semesterQuery.data}
      columns={semesterColumns}
      pagination={semesterQuery.pagination}
      onPaginationChange={semesterQuery.setPagination}
      columnFilters={semesterQuery.columnFilters}
      onColumnFiltersChange={semesterQuery.setColumnFilters}
      sorting={semesterQuery.sorting}
      onSortingChange={semesterQuery.setSorting}
      filterFields={semesterFilters}
      emptyText="Không tìm thấy kết quả học kỳ phù hợp"
      defaultExpanded={{}}
      renderSubComponent={(row) => (
        <StudentSemestersTable
          userId={row.original.userId}
          excludeId={row.original.id}
        />
      )}
    />
  );

  const yearlyTable = (
    <Table
      data={yearlyQuery.data}
      columns={yearlyColumns}
      showIndex={false}
      showVisibilityToggle={false}
      enableColumnOrdering={false}
      className="[&_table]:table-fixed [&_th:first-child]:w-[24%] [&_th:last-child]:w-[8%]"
      pagination={yearlyQuery.pagination}
      onPaginationChange={yearlyQuery.setPagination}
      columnFilters={yearlyQuery.columnFilters}
      onColumnFiltersChange={yearlyQuery.setColumnFilters}
      sorting={yearlyQuery.sorting}
      onSortingChange={yearlyQuery.setSorting}
      filterFields={yearlyFilters}
      emptyText="Không tìm thấy kết quả năm học phù hợp"
      actions={
        <Button
          variant="outline"
          size="sm"
          icon={HiOutlineDownload}
          isLoading={exportMutation.isPending}
          onClick={() => exportMutation.mutate()}
        >
          Xuất Excel
        </Button>
      }
    />
  );

  const activeQuery = activeView === "semester" ? semesterQuery : yearlyQuery;

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Quản lý học tập" },
      ]}
      title="Quản lý học tập"
      isLoading={activeQuery.isLoading}
      isError={activeQuery.isError}
      onRetry={activeQuery.refetch}
    >
      <div className="bg-white px-4 dark:bg-neutral-950">
        <Tabs
          tabs={[
            { id: "semester", label: "Theo học kỳ", content: semesterTable },
            { id: "year", label: "Theo năm học", content: yearlyTable },
          ]}
          activeTab={activeView}
          onChange={(id) => setActiveView(id as ResultView)}
          variant="pills"
        />
      </div>
    </PageContainer>
  );
}
