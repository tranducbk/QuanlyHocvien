"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { HiOutlineTrash } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import Skeleton from "@/library/Skeleton";
import ErrorState from "@/library/ErrorState";
import useAppMutation from "@/hooks/useAppMutation";
import useTableQuery from "@/hooks/useTableQuery";
import { QUERY_KEYS } from "@/constants/query-keys";
import { classService } from "@/services/classes";
import { useConfirmStore } from "@/store/useConfirmStore";
import { Class } from "@/types/classes";
import { Student, StudentProfileQueryRequest } from "@/types/user";
import { textOrDash } from "@/utils/fn-common";
import { FilterField } from "@/library/table/TableFilter";

interface Props {
  cls: Class;
  readOnly?: boolean;
}

function ClassStudentsListSkeleton() {
  const columnCount = 6;
  return (
    <div className="w-full rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 shadow-sm dark:shadow-none transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-50/50 dark:bg-neutral-900/60 transition-colors">
            <tr>
              {Array.from({ length: columnCount }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton variant="text" width={i === 0 ? 30 : 100} height={14} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-t border-neutral-50 dark:border-neutral-800/70 transition-colors"
              >
                {/* STT */}
                <td className="px-4 py-3">
                  <Skeleton variant="text" width={20} height={14} />
                </td>
                {/* Mã học viên */}
                <td className="px-4 py-3">
                  <Skeleton variant="text" width={80} height={14} />
                </td>
                {/* Họ và tên */}
                <td className="px-4 py-3">
                  <Skeleton variant="text" width={120} height={14} />
                </td>
                {/* Đơn vị */}
                <td className="px-4 py-3">
                  <Skeleton variant="text" width={100} height={14} />
                </td>
                {/* Cấp bậc */}
                <td className="px-4 py-3">
                  <Skeleton variant="text" width={60} height={14} />
                </td>
                {/* Thao tác */}
                <td className="px-4 py-3">
                  <Skeleton variant="rounded" width={32} height={32} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-3 flex items-center justify-between transition-colors">
        <Skeleton variant="text" width={100} height={14} />
        <div className="flex items-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" width={32} height={32} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ClassStudentsListModal({ cls, readOnly = false }: Props) {
  const queryClient = useQueryClient();
  const { openConfirm } = useConfirmStore();

  const studentsQueryKey = [QUERY_KEYS.CLASSES, cls.id, "students"];

  const {
    data: studentsData,
    isLoading,
    isError,
    refetch,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<Student, StudentProfileQueryRequest>({
    queryKey: studentsQueryKey,
    fetchData: (params) => classService.getClassStudents(cls.id, params),
  });

  const invalidateClassStudents = async () => {
    await queryClient.invalidateQueries({ queryKey: studentsQueryKey });
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES] });
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STUDENT_PROFILES] });
  };

  const removeMutation = useAppMutation({
    mutationKey: [QUERY_KEYS.CLASSES, cls.id, "remove-student"],
    mutationFn: (userId: string) => classService.removeStudent(cls.id, userId),
    successMessage: "Đã bỏ học viên khỏi lớp!",
    errorMessage: "Bỏ học viên khỏi lớp thất bại!",
    onSuccess: invalidateClassStudents,
  });

  const currentColumns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        id: "code",
        header: "Mã học viên",
        accessorKey: "code",
        cell: (info) => (
          <Typography variant="body" weight="semibold" color="neutral">
            {textOrDash(info.row.original.code)}
          </Typography>
        ),
      },
      {
        id: "fullName",
        header: "Họ và tên",
        accessorKey: "fullName",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.fullName)}
          </Typography>
        ),
      },
      {
        id: "unit",
        header: "Đơn vị",
        accessorKey: "unit",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.unit)}
          </Typography>
        ),
      },
      {
        id: "rank",
        header: "Cấp bậc",
        accessorKey: "rank",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.rank)}
          </Typography>
        ),
      },
      ...(!readOnly ? [{
        id: "actions",
        header: "Thao tác",
        cell: (info: any) => {
          const student = info.row.original;
          const userId = student.user?.id;

          return (
            <ActionButton
              tooltipText={"Xóa học viên khỏi lớp"}
              icon={HiOutlineTrash}
              color="red"
              disabled={removeMutation.isPending}
              onClick={() => {
                openConfirm({
                  title: "Bỏ học viên khỏi lớp",
                  message: `Bạn có chắc chắn muốn bỏ "${student.fullName || student.code}" khỏi lớp "${cls.className}" không?`,
                  confirmText: "Bỏ khỏi lớp",
                  variant: "danger",
                  mutationKey: [QUERY_KEYS.CLASSES, cls.id, "remove-student"],
                  onConfirm: () => removeMutation.mutate(userId!),
                });
              }}
            />
          );
        },
      }] : []),
    ],
    [cls.className, cls.id, openConfirm, readOnly, removeMutation]
  );

  const currentFilterOptions = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        id: "code",
        label: "Mã học viên",
        placeholder: "Nhập mã học viên...",
      },
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
    ],
    []
  );

  return (
    <div className="max-h-[82vh] space-y-5 overflow-y-auto py-1 pr-2">
      <Typography variant="body" weight="bold" color="neutral">
        Học viên trong lớp
      </Typography>

      {isLoading ? (
        <ClassStudentsListSkeleton />
      ) : isError ? (
        <ErrorState
          onRetry={refetch}
          message="Không thể tải danh sách học viên trong lớp"
          className="min-h-[30vh]"
        />
      ) : (
        <Table
          data={studentsData}
          columns={currentColumns}
          pagination={pagination}
          onPaginationChange={setPagination}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          sorting={sorting}
          onSortingChange={setSorting}
          filterFields={currentFilterOptions}
          emptyText="Lớp này chưa có học viên"
          className="shadow-none"
        />
      )}
    </div>
  );
}
