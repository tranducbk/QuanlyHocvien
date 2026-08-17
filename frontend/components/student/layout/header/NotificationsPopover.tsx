"use client";

import { useCallback } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { m } from "motion/react";
import type { IconType } from "react-icons";
import {
  HiOutlineAcademicCap,
  HiOutlineBadgeCheck,
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineRefresh,
} from "react-icons/hi";
import { DEFAULT_PAGE } from "@/constants/constants";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import Divide from "@/library/Divide";
import Popover from "@/library/Popover";
import Skeleton from "@/library/Skeleton";
import { notificationService } from "@/services/notifications";
import type { Notification } from "@/types/notifications";
import { formatDateTime } from "@/utils/fn-common";

const notificationTypeConfig: Record<
  string,
  {
    label: string;
    icon: IconType;
    className: string;
  }
> = {
  GRADE: {
    label: "Điểm",
    icon: HiOutlineAcademicCap,
    className: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-200",
  },
  CUT_RICE: {
    label: "Cắt cơm",
    icon: HiOutlineCalendar,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-200",
  },
  ACHIEVEMENT: {
    label: "Khen thưởng",
    icon: HiOutlineBadgeCheck,
    className:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  TUITION: {
    label: "Học phí",
    icon: HiOutlineCash,
    className:
      "bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-200",
  },
  GENERAL: {
    label: "Chung",
    icon: HiOutlineInformationCircle,
    className:
      "bg-neutral-100 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-300",
  },
};

const getNotificationConfig = (type?: string | null) =>
  notificationTypeConfig[type || "GENERAL"] || notificationTypeConfig.GENERAL;

export default function NotificationsPopover() {
  const { push } = useRouter();
  const queryClient = useQueryClient();

  const {
    data: notificationsResponse,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, "student-header"],
    queryFn: ({ pageParam }) =>
      notificationService.getNotifications({
        page: pageParam,
        limit: 5,
      }),
    initialPageParam: DEFAULT_PAGE.PAGE_INDEX + 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const { data: unreadResponse } = useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS, "student-header-unread"],
    queryFn: () =>
      notificationService.getNotifications({
        isRead: false,
        fetchAll: true,
      }),
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

  const notifications =
    notificationsResponse?.pages.flatMap((page) => page.data || []) || [];
  const unreadCount = unreadResponse?.pagination?.total || 0;
  const loadMoreNotifications = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);
  const setLoadMoreRef = useInfiniteScroll({
    callback: loadMoreNotifications,
    hasNextPage,
    isFetching: isFetchingNextPage,
    rootMargin: "80px",
  });

  const openNotification = (notification: Notification, close: () => void) => {
    const target = notification.link?.startsWith("/")
      ? notification.link
      : undefined;

    const navigate = () => {
      close();
      if (target) push(target);
    };

    if (!notification.isRead) {
      markReadMutation.mutate(notification.id, {
        onSuccess: navigate,
      });
      return;
    }

    navigate();
  };

  const openAdvancedFilter = (close: () => void) => {
    close();
    push("/student/notification");
  };

  return (
    <Popover
      align="right"
      trigger={(isOpen) => (
        <button
          type="button"
          className={`relative size-10 flex items-center justify-center rounded-xl border transition-all group ${
            isOpen
              ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-200 border-primary-100 dark:border-primary-800"
              : "bg-neutral-50 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 hover:text-primary-600 dark:hover:text-neutral-100 hover:bg-primary-50 dark:hover:bg-neutral-800 border-neutral-100 dark:border-neutral-800"
          }`}
        >
          <m.div whileHover={{ rotate: 15, scale: 1.1 }}>
            <HiOutlineBell size={20} />
          </m.div>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-error-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white dark:border-neutral-950">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}
      popoverClassName="w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-neutral-950 rounded-3xl shadow-2xl shadow-neutral-900/10 dark:shadow-black/30 border border-neutral-100 dark:border-neutral-800 overflow-hidden"
    >
      {({ close }) => (
        <>
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase text-neutral-800 dark:text-neutral-100">
                  Thông báo
                </p>
                <p className="mt-1 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                  {unreadCount > 0
                    ? `${unreadCount.toLocaleString("vi-VN")} thông báo chưa đọc`
                    : "Không có thông báo chưa đọc"}
                </p>
              </div>

              <button
                type="button"
                disabled={unreadCount === 0 || markAllReadMutation.isPending}
                onClick={() => markAllReadMutation.mutate()}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
              >
                <HiOutlineCheckCircle size={14} />
                Đọc tất cả
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => openAdvancedFilter(close)}
                className="mt-4 text-[10px] font-black uppercase tracking-wider text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>
          </div>

          <Divide />

          <div className="max-h-[420px] overflow-y-auto p-2 custom-scrollbar">
            {isLoading ? (
              <NotificationListSkeleton />
            ) : notifications.length ? (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onOpen={() => openNotification(notification, close)}
                  />
                ))}

                {isFetchingNextPage && <NotificationListSkeleton count={2} />}

                {hasNextPage && !isFetchingNextPage && (
                  <div
                    ref={setLoadMoreRef}
                    className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 text-xs font-black uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:text-neutral-400"
                  >
                    <HiOutlineRefresh size={16} />
                    Cuộn để tải thêm
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/50 p-6 text-center">
                <HiOutlineBell
                  size={28}
                  className="text-neutral-300 dark:text-neutral-600"
                />
                <p className="mt-3 text-sm font-black text-neutral-700 dark:text-neutral-200">
                  Chưa có thông báo
                </p>
                <p className="mt-1 text-xs font-semibold text-neutral-400 dark:text-neutral-500">
                  Thông báo mới từ hệ thống sẽ hiển thị tại đây.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </Popover>
  );
}

const NotificationItem = ({
  notification,
  onOpen,
}: {
  notification: Notification;
  onOpen: () => void;
}) => {
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`w-full rounded-2xl p-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900 ${
        notification.isRead
          ? "bg-transparent"
          : "bg-primary-50/70 dark:bg-primary-500/10"
      }`}
    >
      <div className="flex gap-3">
        <div
          className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${config.className}`}
        >
          <Icon size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="line-clamp-1 flex-1 text-sm font-black text-neutral-800 dark:text-neutral-100">
              {notification.title}
            </p>
            {!notification.isRead && (
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-error-500" />
            )}
          </div>

          {notification.content && (
            <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-neutral-500 dark:text-neutral-400">
              {notification.content}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="rounded bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {config.label}
            </span>
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500">
              {formatDateTime(notification.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

const NotificationListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-2 p-2">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="rounded-2xl border border-neutral-100 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="flex gap-3">
          <Skeleton variant="rounded" width={40} height={40} />
          <div className="min-w-0 flex-1">
            <Skeleton variant="text" width="70%" height={14} />
            <Skeleton variant="text" width="95%" height={12} />
            <Skeleton variant="text" width="55%" height={12} />
            <div className="mt-2 flex gap-2">
              <Skeleton variant="rounded" width={72} height={20} />
              <Skeleton variant="text" width={110} height={12} />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
