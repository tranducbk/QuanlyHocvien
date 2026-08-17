"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { HiOutlineEye } from "react-icons/hi";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import ActionButton from "@/library/ActionButton";
import useTableQuery from "@/hooks/useTableQuery";
import { academicManagementService } from "@/services/academic-management";
import { QUERY_KEYS } from "@/constants/query-keys";
import { SemesterResult } from "@/types/student-academic";
import { formatScore, textOrDash } from "@/utils/fn-common";

interface StudentSemestersTableProps {
  userId: string;
  excludeId?: string;
}

export default function StudentSemestersTable({ userId, excludeId }: StudentSemestersTableProps) {
  const router = useRouter();

  const {
    data: semesterResultsData,
    pagination,
    setPagination,
    sorting,
    setSorting,
  } = useTableQuery<SemesterResult>({
    queryKey: [QUERY_KEYS.STUDENT_RESULTS, "COMMANDER_SEMESTERS", userId, excludeId],
    fetchData: (params) => academicManagementService.getSemesterResults({ ...params, userId, excludeId }),
  });

  const columns = useMemo<ColumnDef<SemesterResult>[]>(
    () => [
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

  return (
    <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-b-xl border-x border-b border-neutral-100 dark:border-neutral-800 shadow-inner">
      <div className="mb-3">
        <Typography variant="body" weight="semibold" className="text-neutral-600 dark:text-neutral-400">
          Kết quả học tập các học kỳ khác:
        </Typography>
      </div>
      <Table
        data={semesterResultsData}
        columns={columns}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        showFilter={false}
        emptyText="Học viên này chưa có kết quả học tập nào"
        className="!shadow-none border-none !bg-transparent"
      />
    </div>
  );
}
