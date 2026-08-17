"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { HiOutlineUserAdd } from "react-icons/hi";
import Button from "@/library/Button";
import Checkbox from "@/library/Checkbox";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import Skeleton from "@/library/Skeleton";
import ErrorState from "@/library/ErrorState";
import useAppMutation from "@/hooks/useAppMutation";
import useTableQuery from "@/hooks/useTableQuery";
import { ROLES } from "@/constants/constants";
import { QUERY_KEYS } from "@/constants/query-keys";
import { classService } from "@/services/classes";
import { userService } from "@/services/user";
import { Class } from "@/types/classes";
import { UserDetailResponse, UserQueryRequest } from "@/types/user";
import { textOrDash } from "@/utils/fn-common";
import { FilterField } from "@/library/table/TableFilter";

interface Props {
  cls: Class;
}

const getUserProfile = (user: UserDetailResponse) =>
  user.profile || user.Profile || null;

function AddClassStudentsSkeleton() {
  const columnCount = 6;
  return (
    <div className="w-full rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 shadow-sm dark:shadow-none transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-neutral-50/50 dark:bg-neutral-900/60 transition-colors">
            <tr>
              {Array.from({ length: columnCount }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton
                    variant="text"
                    width={i === 0 ? 30 : i === 1 ? 40 : 100}
                    height={14}
                  />
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
                {/* Chọn (checkbox) */}
                <td className="px-4 py-3">
                  <Skeleton variant="rounded" width={18} height={18} />
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
                {/* Lớp hiện tại */}
                <td className="px-4 py-3">
                  <Skeleton variant="text" width={80} height={14} />
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

export default function AddClassStudentsModal({ cls }: Props) {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const queryClient = useQueryClient();

  const studentsQueryKey = [QUERY_KEYS.CLASSES, cls.id, "students"];
  const availableStudentsQueryKey = [
    QUERY_KEYS.STUDENT_PROFILES,
    "assign-to-class",
    cls.id,
  ];

  const {
    data: availableStudentsData,
    isLoading,
    isError,
    refetch,
    pagination: availablePagination,
    setPagination: setAvailablePagination,
    columnFilters: availableColumnFilters,
    setColumnFilters: setAvailableColumnFilters,
    sorting: availableSorting,
    setSorting: setAvailableSorting,
  } = useTableQuery<UserDetailResponse, UserQueryRequest>({
    queryKey: availableStudentsQueryKey,
    fetchData: (params) =>
      userService.getAllUsers({
        ...params,
        role: ROLES.STUDENT.ROLE,
      }),
  });

  const invalidateClassStudents = async () => {
    await queryClient.invalidateQueries({ queryKey: studentsQueryKey });
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CLASSES] });
    await queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.STUDENT_PROFILES],
    });
  };

  const assignMutation = useAppMutation({
    mutationKey: [QUERY_KEYS.CLASSES, cls.id, "assign-students"],
    mutationFn: (userIds: string[]) =>
      classService.assignStudents(cls.id, { userIds }),
    successMessage: "Thêm học viên vào lớp thành công!",
    errorMessage: "Thêm học viên vào lớp thất bại!",
    onSuccess: async () => {
      setSelectedUserIds(new Set());
      await invalidateClassStudents();
    },
  });

  const selectedIds = useMemo(
    () => Array.from(selectedUserIds),
    [selectedUserIds]
  );

  const toggleStudent = (userId?: string | null) => {
    if (!userId) return;
    setSelectedUserIds((current) => {
      const next = new Set(current);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const availableColumns = useMemo<ColumnDef<UserDetailResponse>[]>(
    () => [
      {
        id: "select",
        header: "Chọn",
        size: 72,
        enableSorting: false,
        cell: (info) => {
          const user = info.row.original;
          const profile = getUserProfile(user);
          const isAlreadyInClass = profile?.classId === cls.id;

          return (
            <Checkbox
              checked={selectedUserIds.has(user.id)}
              disabled={isAlreadyInClass || assignMutation.isPending}
              onChange={() => toggleStudent(user.id)}
              size="sm"
            />
          );
        },
      },
      {
        id: "code",
        header: "Mã học viên",
        accessorKey: "code",
        cell: (info) => (
          <Typography variant="body" weight="semibold" color="neutral">
            {textOrDash(getUserProfile(info.row.original)?.code)}
          </Typography>
        ),
      },
      {
        id: "fullName",
        header: "Họ và tên",
        accessorKey: "fullName",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(
              getUserProfile(info.row.original)?.fullName ||
                info.row.original.username
            )}
          </Typography>
        ),
      },
      {
        id: "unit",
        header: "Đơn vị",
        accessorKey: "unit",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(getUserProfile(info.row.original)?.unit)}
          </Typography>
        ),
      },
      {
        id: "class",
        header: "Lớp hiện tại",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(getUserProfile(info.row.original)?.class?.className)}
          </Typography>
        ),
      },
    ],
    [assignMutation.isPending, cls.id, selectedUserIds]
  );

  const availableFilterOptions = useMemo<FilterField[]>(
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

  const actions = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-[11px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all shadow-sm dark:shadow-none cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedIds.length || assignMutation.isPending}
          onClick={() => setSelectedUserIds(new Set())}
        >
          Bỏ chọn
        </button>
        <Button
          type="button"
          icon={HiOutlineUserAdd}
          iconClassName="text-white"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 border border-primary-600 rounded-xl text-[11px]! font-black! uppercase tracking-wider text-white hover:bg-primary-700 hover:border-primary-700 transition-all shadow-lg shadow-primary-600/20 cursor-pointer active:scale-95 h-auto"
          disabled={!selectedIds.length}
          isLoading={assignMutation.isPending}
          onClick={() => assignMutation.mutate(selectedIds)}
        >
          Thêm vào lớp
        </Button>
      </div>
    ),
    [selectedIds, assignMutation]
  );

  return (
    <div className="max-h-[82vh] space-y-5 overflow-y-auto py-1 pr-2">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Typography variant="body" weight="bold" color="neutral">
              Danh sách học viên
            </Typography>
            <Typography variant="caption" color="gray" className="mt-0.5 block">
              Đã chọn {selectedIds.length} học viên
            </Typography>
          </div>
        </div>

        {isLoading ? (
          <AddClassStudentsSkeleton />
        ) : isError ? (
          <ErrorState
            onRetry={refetch}
            message="Không thể tải danh sách học viên khả dụng"
            className="min-h-[30vh]"
          />
        ) : (
          <Table
            data={availableStudentsData}
            columns={availableColumns}
            pagination={availablePagination}
            onPaginationChange={setAvailablePagination}
            columnFilters={availableColumnFilters}
            onColumnFiltersChange={setAvailableColumnFilters}
            sorting={availableSorting}
            onSortingChange={setAvailableSorting}
            filterFields={availableFilterOptions}
            emptyText="Không tìm thấy học viên phù hợp"
            className="shadow-none"
            actions={actions}
          />
        )}
      </div>
    </div>
  );
}
