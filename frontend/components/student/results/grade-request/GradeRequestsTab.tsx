"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { QUERY_KEYS } from "@/constants/query-keys";
import useTableQuery from "@/hooks/useTableQuery";
import Badge from "@/library/Badge";
import ErrorState from "@/library/ErrorState";
import Table from "@/library/Table";
import { gradeRequestService } from "@/services/grade-requests";
import {
  GradeRequest,
  GradeRequestQueryRequest,
  requestTypeMap,
  statusMap,
} from "@/types/student-academic";
import GradeRequestsSkeleton from "./GradeRequestsSkeleton";
import { formatDate, formatScore } from "@/utils/fn-common";



export default function GradeRequestsTab() {

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

  if (isLoading) {
    return <GradeRequestsSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        onRetry={() => {
          refetch();
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
      emptyText="Chưa có đề xuất chỉnh sửa điểm"
    />
  );
}
