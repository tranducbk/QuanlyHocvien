"use client";

import { useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { HiOutlineChevronRight } from "react-icons/hi";
import { QUERY_KEYS } from "@/constants/query-keys";
import useTableQuery from "@/hooks/useTableQuery";
import Badge from "@/library/Badge";
import ErrorState from "@/library/ErrorState";
import Table from "@/library/Table";
import { academicResultService } from "@/services/academic-results";
import {
  AcademicResultQueryRequest,
  YearlyResult,
} from "@/types/student-academic";
import AcademicResultsSkeleton from "./AcademicResultsSkeleton";
import { formatScore } from "@/utils/fn-common";

export type AcademicSubjectRow = {
  rowType: "subject";
  subjectCode?: string | null;
  subjectName?: string | null;
  credits?: number | null;
  letterGrade?: string | null;
  gradePoint4?: number | null;
  gradePoint10?: number | null;
  note?: string | null;
};

export type AcademicGroupRow = {
  rowType: "semester-group";
  schoolYear?: string | null;
  semester?: string | number | null;
  totalCredits?: number | null;
  averageGrade4?: number | null;
  averageGrade10?: number | null;
  subjectCount: number;
  cumulativeGrade4?: number | null;
  subRows: AcademicSubjectRow[];
};

export type AcademicTableRow = AcademicGroupRow | AcademicSubjectRow;

const isSubjectRow = (row: AcademicTableRow): row is AcademicSubjectRow =>
  row.rowType === "subject";

const getSemesterLabel = (semester?: string | number | null) =>
  semester ? `Học kỳ ${semester}` : "Chưa có học kỳ";

const formatSummaryValue = (value: number) => value.toLocaleString("vi-VN");

export default function AcademicResultsTab() {
  const {
    data,
    isLoading,
    isError,
    pagination,
    setPagination,
    refetch,
  } = useTableQuery<YearlyResult, AcademicResultQueryRequest>({
    queryKey: [QUERY_KEYS.STUDENT_RESULTS],
    fetchData: academicResultService.getAcademicResults,
  });

  const academicGroups = useMemo<AcademicGroupRow[]>(() => {
    return (data?.data || []).flatMap((year) =>
      (year.semesterResults || []).map((semester) => {
        const subjects = (semester.subjectResults || []).map(
          (subject): AcademicSubjectRow => ({
            ...subject,
            rowType: "subject",
          })
        );
        return {
          ...semester,
          rowType: "semester-group",
          subjectCount: subjects.length,
          subRows: subjects,
        };
      })
    );
  }, [data]);

  const paginatedAcademicGroups = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return academicGroups.slice(start, start + pagination.pageSize);
  }, [academicGroups, pagination.pageIndex, pagination.pageSize]);

  const academicTableData = useMemo<PaginatedResponse<AcademicTableRow>>(
    () => ({
      statusCode: 200,
      message: "Thành công",
      data: paginatedAcademicGroups,
      pagination: {
        total: academicGroups.length,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        totalPages: Math.max(
          1,
          Math.ceil(academicGroups.length / pagination.pageSize)
        ),
      },
    }),
    [
      academicGroups.length,
      paginatedAcademicGroups,
      pagination.pageIndex,
      pagination.pageSize,
    ]
  );

  const academicSummary = useMemo(() => {
    const years = data?.data || [];
    const semesters = years.flatMap((year) => year.semesterResults || []);
    const subjects = semesters.flatMap(
      (semester) => semester.subjectResults || []
    );

    const totalCredits = years.reduce(
      (total, year) => total + (year.totalCredits ?? 0),
      0
    );
    const totalSubjects = years.reduce(
      (total, year) => total + (year.totalSubjects ?? 0),
      0
    );
    const passedSubjects = years.reduce(
      (total, year) => total + (year.passedSubjects ?? 0),
      0
    );
    const failedSubjects = years.reduce(
      (total, year) => total + (year.failedSubjects ?? 0),
      0
    );

    return {
      currentCpa4: years[0]?.cumulativeGrade4,
      totalCredits:
        totalCredits ||
        subjects.reduce((total, subject) => total + (subject.credits ?? 0), 0),
      totalSubjects: totalSubjects || subjects.length,
      passedSubjects,
      failedSubjects,
    };
  }, [data]);

  const summaryCards = [
    {
      label: "Tổng tín chỉ",
      value: formatSummaryValue(academicSummary.totalCredits),
      helper: "Tín chỉ đã ghi nhận",
      className: "bg-primary-50 text-primary-700 border-primary-100",
    },
    {
      label: "Tổng môn học",
      value: formatSummaryValue(academicSummary.totalSubjects),
      helper: "Môn học trong kết quả",
      className: "bg-secondary-50 text-secondary-700 border-secondary-100",
    },
    {
      label: "Môn đạt",
      value: formatSummaryValue(academicSummary.passedSubjects),
      helper: "Môn học đã qua",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      label: "Môn chưa đạt",
      value: formatSummaryValue(academicSummary.failedSubjects),
      helper: "Môn học cần cải thiện",
      className: "bg-red-50 text-red-700 border-red-100",
    },
    {
      label: "CPA hiện tại",
      value: formatScore(academicSummary.currentCpa4),
      helper: "Hệ 4 tích lũy mới nhất",
      className: "bg-sky-50 text-sky-700 border-sky-100",
    },
  ];

  const columns = useMemo<ColumnDef<AcademicTableRow>[]>(
    () => [
      {
        id: "subjectCode",
        header: "Mã môn",
        cell: ({ row }) => {
          if (isSubjectRow(row.original)) {
            return row.original.subjectCode || "---";
          }
        },
      },
      {
        id: "subjectName",
        header: "Môn học",
        cell: ({ row }) => {
          if (isSubjectRow(row.original)) {
            return row.original.subjectName || "---";
          }
        },
      },
      {
        id: "credits",
        header: "Tín chỉ",
        cell: ({ row }) => {
          if (isSubjectRow(row.original)) {
            return row.original.credits ?? "---";
          }
        },
      },
      {
        id: "letterGrade",
        header: "Điểm chữ",
        cell: ({ row }) => {
          if (isSubjectRow(row.original)) {
            return (
              <Badge variant="primary">
                {row.original.letterGrade || "---"}
              </Badge>
            );
          }
        },
      },
      {
        id: "gradePoint10",
        header: "Hệ 10",
        cell: ({ row }) => {
          if (isSubjectRow(row.original)) {
            return formatScore(row.original.gradePoint10);
          }
        },
      },
      {
        id: "gradePoint4",
        header: "Hệ 4",
        cell: ({ row }) => {
          if (isSubjectRow(row.original)) {
            return formatScore(row.original.gradePoint4);
          }
        },
      },
      {
        id: "note",
        header: "Ghi chú",
        cell: ({ row }) => {
          if (isSubjectRow(row.original)) {
            return row.original.note || "---";
          }
        },
      },
    ],
    []
  );

  const renderGroupRow = (row: Row<AcademicTableRow>) => {
    const group = row.original;
    if (group.rowType !== "semester-group") return null;

    const canExpand = row.getCanExpand();
    const isExpanded = row.getIsExpanded();

    return (
      <button
        type="button"
        disabled={!canExpand}
        onClick={canExpand ? row.getToggleExpandedHandler() : undefined}
        className={`flex w-full items-center gap-4 px-6 py-4 text-left transition-colors ${
          canExpand ? "cursor-pointer hover:bg-primary-50/40" : "cursor-default"
        }`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
            isExpanded
              ? "rotate-90 bg-primary-100 text-primary-600"
              : "bg-neutral-100 text-neutral-500"
          }`}
        >
          <HiOutlineChevronRight size={18} />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span className="min-w-0">
            <span className="block truncate text-sm font-black text-neutral-700">
              {group.schoolYear || "---"} - {getSemesterLabel(group.semester)}
            </span>
            <span className="mt-1 block text-xs font-semibold text-neutral-400">
              {group.subjectCount} môn học
            </span>
          </span>

          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">TC: {group.totalCredits ?? "---"}</Badge>
            <Badge variant="secondary">
              GPA 10: {formatScore(group.averageGrade10)}
            </Badge>
            <Badge variant="primary">
              GPA 4: {formatScore(group.averageGrade4)}
            </Badge>
            <Badge variant="success">
              CPA 4: {formatScore(group.cumulativeGrade4)}
            </Badge>
          </span>
        </span>
      </button>
    );
  };

  if (isLoading) {
    return <AcademicResultsSkeleton />;
  }

  if (isError) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-4 shadow-sm ${card.className}`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-black leading-none">
              {card.value}
            </p>
            <p className="mt-2 text-xs font-semibold opacity-70">
              {card.helper}
            </p>
          </div>
        ))}
      </div>

      <Table
        data={academicTableData}
        columns={columns}
        pagination={pagination}
        onPaginationChange={setPagination}
        getSubRows={(row) =>
          row.rowType === "semester-group" ? row.subRows : undefined
        }
        renderGroupRow={renderGroupRow}
        emptyText="Chưa có kết quả học tập"
      />
    </div>
  );
}
