"use client";

import { useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { dutyScheduleService } from "@/services/duty-schedules";
import { DutySchedule } from "@/types/duty-schedules";
import { useModalStore } from "@/store/useModalStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import Typography from "@/library/Typography";
import Badge from "@/library/Badge";
import Table from "@/library/Table";
import { FilterField } from "@/library/table/TableFilter";
import { HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { formatDate, formatDateTime } from "@/utils/fn-common";
import { RANKS } from "@/constants/constants";
import useTableQuery from "@/hooks/useTableQuery";
import CreateDutyScheduleForm from "./CreateDutyScheduleForm";
import UpdateDutyScheduleForm from "./UpdateDutyScheduleForm";
import DutyScheduleSkeleton from "./DutyScheduleSkeleton";
import ActionButton from "@/library/ActionButton";
import PageContainer from "@/library/PageContainer";
import useAppMutation from "@/hooks/useAppMutation";

export default function DutySchedulesMain() {
  const { openModal } = useModalStore();
  const { openConfirm } = useConfirmStore();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<DutySchedule>({
    queryKey: [QUERY_KEYS.DUTY_SCHEDULES],
    fetchData: dutyScheduleService.getDutySchedules,
  });

  const deleteMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_DUTY_SCHEDULE,
    mutationFn: (id: string) => dutyScheduleService.deleteDutySchedule(id),
    invalidateQueryKey: [QUERY_KEYS.DUTY_SCHEDULES],
    successMessage: "Xóa ca trực thành công!",
    errorMessage: "Xóa ca trực thất bại!",
  });

  const handleAdd = () => {
    openModal({
      title: "Phân công ca trực mới",
      content: <CreateDutyScheduleForm />,
      config: {
        mutationKey: MUTATION_KEYS.CREATE_DUTY_SCHEDULE,
      },
    });
  };

  const handleEdit = useCallback(
    (schedule: DutySchedule) => {
      openModal({
        title: "Cập nhật ca trực",
        content: <UpdateDutyScheduleForm schedule={schedule} />,
        config: {
          mutationKey: MUTATION_KEYS.UPDATE_DUTY_SCHEDULE,
        },
      });
    },
    [openModal]
  );

  const columns = useMemo<ColumnDef<DutySchedule>[]>(
    () => [
      {
        id: "fullName",
        header: "Người trực",
        accessorKey: "fullName",
        meta: { noWrap: true },
        cell: (info) => (
          <div className="flex items-center gap-3">
            <div>
              <Typography variant="body" weight="semibold" color="neutral">
                {info.row.original.fullName}
              </Typography>
              <Typography variant="caption" color="gray">
                {info.row.original.rank}
              </Typography>
            </div>
          </div>
        ),
      },
      {
        id: "position",
        header: "Nhiệm vụ",
        accessorKey: "position",
        cell: (info) => (
          <Badge variant="primary">{info.row.original.position}</Badge>
        ),
      },
      {
        id: "phoneNumber",
        header: "Số điện thoại",
        accessorKey: "phoneNumber",
        cell: (info) => (
          <Typography
            variant="body"
            weight="semibold"
            color="neutral"
            className="whitespace-nowrap"
          >
            {info.row.original.phoneNumber}
          </Typography>
        ),
      },
      {
        id: "workDay",
        header: "Ngày trực",
        accessorKey: "workDay",
        cell: (info) => (
          <Typography
            variant="body"
            weight="semibold"
            color="neutral"
            className="whitespace-nowrap"
          >
            {formatDate(info.row.original.workDay)}
          </Typography>
        ),
      },
      {
        id: "createdAt",
        header: "Ngày tạo",
        accessorKey: "createdAt",
        cell: (info) => (
          <Typography
            variant="caption"
            weight="semibold"
            color="gray"
            className="whitespace-nowrap"
          >
            {formatDateTime(info.row.original.createdAt)}
          </Typography>
        ),
      },
      {
        id: "updatedAt",
        header: "Ngày cập nhật",
        accessorKey: "updatedAt",
        cell: (info) => (
          <Typography
            variant="caption"
            weight="semibold"
            color="gray"
            className="whitespace-nowrap"
          >
            {formatDateTime(info.row.original.updatedAt)}
          </Typography>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: (info) => {
          const schedule = info.row.original;
          return (
            <div className="flex items-center justify-start gap-1">
              <ActionButton
                tooltipText="Chỉnh sửa"
                icon={HiOutlinePencil}
                onClick={() => handleEdit(schedule)}
                color="blue"
              />

              <ActionButton
                tooltipText="Xóa"
                icon={HiOutlineTrash}
                color="red"
                onClick={() =>
                  openConfirm({
                    title: "Xác nhận xóa",
                    message: "Bạn có chắc chắn muốn xóa ca trực này không?",
                    confirmText: "Xóa ngay",
                    variant: "danger",
                    mutationKey: MUTATION_KEYS.DELETE_DUTY_SCHEDULE,
                    onConfirm: () => deleteMutation.mutate(schedule.id),
                  })
                }
              />
            </div>
          );
        },
      },
    ],
    [deleteMutation, handleEdit, openConfirm]
  );

  const filterOptions = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        id: "fullName",
        label: "Tên người trực",
        placeholder: "Nhập tên...",
      },
      {
        type: "text",
        id: "position",
        label: "Nhiệm vụ",
        placeholder: "Nhập nhiệm vụ...",
      },
      {
        type: "select",
        id: "rank",
        label: "Cấp bậc",
        placeholder: "Chọn cấp bậc...",
        options: Object.values(RANKS).map((rank) => ({
          value: rank,
          label: rank,
        })),
        selectFilter: {
          enabled: true,
          mode: "client",
          placeholder: "Tìm kiếm cấp bậc...",
        },
      },
    ],
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Phân công lịch trực" },
      ]}
      title="Phân công lịch trực"
      subtitle="Quản lý và phân công ca trực ban"
      isLoading={isLoading}
      skeleton={<DutyScheduleSkeleton />}
      isError={isError}
      errorMessage={error?.message}
      onRetry={refetch}
    >
      <div className="bg-white dark:bg-neutral-950 overflow-hidden relative transition-colors">
        <div className="px-4">
          <Table
            data={data}
            columns={columns}
            pagination={pagination}
            onPaginationChange={setPagination}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            sorting={sorting}
            onSortingChange={setSorting}
            filterFields={filterOptions}
            emptyText="Không tìm thấy lịch trực nào phù hợp"
            onAdd={handleAdd}
            addLabel="Phân công lịch trực"
          />
        </div>
      </div>
    </PageContainer>
  );
}
