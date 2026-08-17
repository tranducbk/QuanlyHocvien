"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  HiOutlineCheckCircle,
  HiOutlineExternalLink,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge, { BadgeVariant } from "@/library/Badge";
import Button from "@/library/Button";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import type { FilterField } from "@/library/table/TableFilter";
import Typography from "@/library/Typography";
import useTableQuery from "@/hooks/useTableQuery";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { notificationService } from "@/services/notifications";
import {
  Notification,
  NotificationQueryRequest,
  NotificationType,
} from "@/types/notifications";
import { formatDateTime, textOrDash } from "@/utils/fn-common";
import NotificationSkeleton from "./NotificationSkeleton";

const notificationTypeMap: Record<
  NotificationType | string,
  { label: string; variant: BadgeVariant }
> = {
  GRADE: { label: "Điểm", variant: "primary" },
  CUT_RICE: { label: "Cắt cơm", variant: "warning" },
  ACHIEVEMENT: { label: "Khen thưởng", variant: "success" },
  TUITION: { label: "Học phí", variant: "secondary" },
  GENERAL: { label: "Chung", variant: "neutral" },
};

const getTypeConfig = (type?: string | null) =>
  notificationTypeMap[type || "GENERAL"];

export default function Main() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    pagination,
    setPagination,
    refetch,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<Notification, NotificationQueryRequest>({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, "commander-page"],
    fetchData: notificationService.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationKey: MUTATION_KEYS.MARK_NOTIFICATION_READ,
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationKey: MUTATION_KEYS.MARK_ALL_NOTIFICATIONS_READ,
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
    },
  });

  const openNotificationLink = useCallback(
    (notification: Notification) => {
      if (!notification.link?.startsWith("/")) return;

      if (!notification.isRead) {
        markReadMutation.mutate(notification.id, {
          onSuccess: () => router.push(notification.link as string),
        });
        return;
      }

      router.push(notification.link);
    },
    [markReadMutation, router]
  );

  const columns = useMemo<ColumnDef<Notification>[]>(
    () => [
      {
        id: "title",
        header: "Tiêu đề",
        accessorKey: "title",
        cell: ({ row }) => (
          <div className="min-w-52">
            <Typography variant="body" weight="black" className="text-neutral-900 dark:text-neutral-100">
              {row.original.title}
            </Typography>
            <Typography variant="caption" className="text-neutral-400 dark:text-neutral-500">
              {row.original.isRead ? "Đã đọc" : "Chưa đọc"}
            </Typography>
          </div>
        ),
      },
      {
        id: "type",
        header: "Loại",
        accessorKey: "type",
        cell: ({ row }) => {
          const config = getTypeConfig(row.original.type);
          return <Badge variant={config.variant}>{config.label}</Badge>;
        },
      },
      {
        id: "content",
        header: "Nội dung",
        accessorKey: "content",
        cell: ({ row }) => (
          <Typography variant="body" className="max-w-xl line-clamp-2 text-neutral-600 dark:text-neutral-300">
            {textOrDash(row.original.content)}
          </Typography>
        ),
      },
      {
        id: "isRead",
        header: "Trạng thái",
        accessorKey: "isRead",
        cell: ({ row }) => (
          <Badge variant={row.original.isRead ? "neutral" : "primary"}>
            {row.original.isRead ? "Đã đọc" : "Chưa đọc"}
          </Badge>
        ),
      },
      {
        id: "createdAt",
        header: "Thời gian",
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs font-bold text-neutral-500 dark:text-neutral-400">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => {
          const notification = row.original;

          return (
            <div className="flex items-center gap-1">
              <ActionButton
                tooltipText="Đánh dấu đã đọc"
                icon={HiOutlineCheckCircle}
                color="green"
                disabled={notification.isRead || markReadMutation.isPending}
                onClick={() => markReadMutation.mutate(notification.id)}
              />
              <ActionButton
                tooltipText="Mở liên kết"
                icon={HiOutlineExternalLink}
                color="blue"
                disabled={!notification.link}
                onClick={() => openNotificationLink(notification)}
              />
            </div>
          );
        },
      },
    ],
    [markReadMutation, openNotificationLink]
  );

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        id: "type",
        label: "Loại thông báo",
        type: "select",
        options: [
          { label: "Điểm", value: "GRADE" },
          { label: "Cắt cơm", value: "CUT_RICE" },
          { label: "Khen thưởng", value: "ACHIEVEMENT" },
          { label: "Học phí", value: "TUITION" },
          { label: "Chung", value: "GENERAL" },
        ],
      },
      {
        id: "isRead",
        label: "Trạng thái",
        type: "select",
        options: [
          { label: "Chưa đọc", value: "false" },
          { label: "Đã đọc", value: "true" },
        ],
      },
    ],
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Thông báo" },
      ]}
      title="Thông báo"
      subtitle="Xem, lọc và quản lý trạng thái đọc các thông báo từ hệ thống."
      isLoading={isLoading}
      skeleton={<NotificationSkeleton />}
      isError={isError}
      onRetry={refetch}
      className="space-y-8"
    >
      <Table
        data={data}
        columns={columns}
        pagination={pagination}
        onPaginationChange={setPagination}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        sorting={sorting}
        onSortingChange={setSorting}
        filterFields={filterFields}
        emptyText="Chưa có thông báo phù hợp"
        actions={
          <Button
            type="button"
            icon={HiOutlineCheckCircle}
            isLoading={markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-500 border border-secondary-500 rounded-xl text-[11px]! font-black! uppercase tracking-wider text-white hover:bg-secondary-600 hover:border-secondary-600 transition-all shadow-lg shadow-secondary-500/20 cursor-pointer active:scale-95 h-auto"
          >
            Đọc tất cả
          </Button>
        }
      />
    </PageContainer>
  );
}
