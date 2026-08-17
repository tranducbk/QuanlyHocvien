"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { QUERY_KEYS } from "@/constants/query-keys";
import useTableQuery from "@/hooks/useTableQuery";
import Badge from "@/library/Badge";
import ErrorState from "@/library/ErrorState";
import Table from "@/library/Table";
import { useModalStore } from "@/store/useModalStore";
import { academicResultService } from "@/services/academic-results";
import { gradeRequestService } from "@/services/grade-requests";
import {
  AcademicResultQueryRequest,
  GradeRequest,
  GradeRequestQueryRequest,
  requestTypeMap,
  SemesterResult,
  statusMap,
  SubjectResult,
  YearlyResult,
} from "@/types/student-academic";
import CreateGradeRequestForm from "./CreateGradeRequestForm";
import GradeRequestsSkeleton from "./GradeRequestsSkeleton";
import { formatDate, formatScore } from "@/utils/fn-common";



const getSemesters = (year: YearlyResult): SemesterResult[] => year.semesterResults || [];
const getSubjects = (semester: SemesterResult): SubjectResult[] => semester.subjectResults || [];

export default function GradeRequestsTab() {
  const { openModal } = useModalStore();

  const {
    data,
    isLoading,
    isError,
    refetch,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<GradeRequest, GradeRequestQueryRequest>({
    queryKey: [QUERY_KEYS.STUDENT_GRADE_REQUESTS],
    fetchData: gradeRequestService.getStudentGradeRequests,
  });

  const resultsQuery = useTableQuery<YearlyResult, AcademicResultQueryRequest>({
    queryKey: [QUERY_KEYS.STUDENT_RESULTS],
    fetchData: academicResultService.getAcademicResults,
  });

  const subjectOptions = useMemo(() => {
    return (resultsQuery.data?.data || [])
      .flatMap((year) => getSemesters(year).flatMap(getSubjects))
      .map((subject) => ({
        id: subject.id,
        semesterResultId: subject.semesterResultId,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        credits: subject.credits,
        letterGrade: subject.letterGrade,
        gradePoint4: subject.gradePoint4,
        gradePoint10: subject.gradePoint10,
        note: subject.note,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
      }));
  }, [resultsQuery.data]);

  const openCreateRequest = () => {
    openModal({
      title: "Gửi đề xuất chỉnh sửa điểm",
      content: <CreateGradeRequestForm subjects={subjectOptions} />,
      size: "lg",
    });
  };

  const columns = useMemo<ColumnDef<GradeRequest>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Ngày gửi",
        cell: ({ row }) =>
          formatDate(row.original.createdAt)
      },
      {
        id: "subject",
        header: "Môn học",
        cell: ({ row }) => row.original?.subjectResult?.subjectName || "---",
      },
      {
        accessorKey: "requestType",
        header: "Loại",
        cell: ({ row }) =>
           requestTypeMap[row.original.requestType]
      },
      {
        accessorKey: "proposedGradePoint10",
        header: "Điểm đề xuất",
        cell: ({ row }) => formatScore(row.original.proposedGradePoint10),
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={statusMap[row.original.status].variant}>
            {statusMap[row.original.status].label}
          </Badge>
        ),
      },
      {
        accessorKey: "reason",
        header: "Lý do",
        cell: ({ row }) => row.original.reason || "---",
      },
      {
        accessorKey: "reviewNote",
        header: "Phản hồi",
        cell: ({ row }) => row.original.reviewNote || "Chưa có",
      },
    ],
    []
  );

  if (isLoading || resultsQuery.isLoading) {
    return <GradeRequestsSkeleton />;
  }

  if (isError || resultsQuery.isError) {
    return (
      <ErrorState
        onRetry={() => {
          refetch();
          resultsQuery.refetch();
        }}
      />
    );
  }

  return (
    <Table
      data={data}
      columns={columns}
      pagination={pagination}
      onPaginationChange={setPagination}
      columnFilters={columnFilters}
      onColumnFiltersChange={setColumnFilters}
      sorting={sorting}
      onSortingChange={setSorting}
      filterFields={[
        {
          id: "status",
          label: "Trạng thái",
          type: "select",
          options: Object.entries(statusMap).map(([value, item]) => ({
            value,
            label: item.label,
          })),
        },
      ]}
      onAdd={openCreateRequest}
      addLabel="Gửi đề xuất"
      emptyText="Chưa có đề xuất chỉnh sửa điểm"
    />
  );
}
