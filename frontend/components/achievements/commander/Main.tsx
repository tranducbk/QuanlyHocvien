"use client";

import { useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  HiOutlinePencil,
  HiOutlineTrash,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import { FilterField } from "@/library/table/TableFilter";
import useAppMutation from "@/hooks/useAppMutation";
import useTableQuery from "@/hooks/useTableQuery";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { achievementService } from "@/services/achievements/achievements";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import { Achievement, AchievementQueryRequest } from "@/types/achievements/achievements";
import { downloadBlob, formatDateTime, textOrDash, formatSemesterYear } from "@/utils/fn-common";
import AchievementForm from "./AchievementForm";
import AchievementSkeleton from "./AchievementSkeleton";
import ImportAchievementsForm from "./ImportAchievementsForm";
import AchievementToolbarActions from "./AchievementToolbarActions";

export default function Main() {
  const { openConfirm } = useConfirmStore();
  const { openModal } = useModalStore();

  const {
    data: achievementsData,
    isLoading,
    isError,
    refetch,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<Achievement, AchievementQueryRequest>({
    queryKey: [QUERY_KEYS.ACHIEVEMENTS],
    fetchData: achievementService.getAchievements,
  });

  const deleteMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_ACHIEVEMENT,
    mutationFn: (id: string) => achievementService.deleteAchievement(id),
    invalidateQueryKey: [QUERY_KEYS.ACHIEVEMENTS],
    successMessage: "Xóa thành tích thành công!",
    errorMessage: "Xóa thành tích thất bại!",
  });

  const exportMutation = useAppMutation({
    mutationKey: [QUERY_KEYS.ACHIEVEMENTS, "export"],
    mutationFn: () => {
      const filterParams = columnFilters.reduce(
        (acc, filter) => {
          acc[filter.id] = filter.value;
          return acc;
        },
        {} as Record<string, unknown>
      );

      return achievementService.exportAchievements({
        ...filterParams,
        sortBy: sorting[0]?.id,
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      } as AchievementQueryRequest);
    },
    successMessage: "Xuất báo cáo thành công!",
    errorMessage: "Xuất báo cáo thất bại!",
    onSuccess: (blob) => downloadBlob(blob, "bao-cao-thanh-tich.xlsx"),
  });

  const handleAdd = useCallback(() => {
    openModal({
      title: "Thêm thành tích",
      content: <AchievementForm />,
      size: "lg",
      config: { mutationKey: MUTATION_KEYS.CREATE_ACHIEVEMENT },
    });
  }, [openModal]);

  const handleImport = useCallback(() => {
    openModal({
      title: "Nhập thành tích từ Excel",
      content: <ImportAchievementsForm />,
      size: "md",
      config: { mutationKey: [QUERY_KEYS.ACHIEVEMENTS, "import"] },
    });
  }, [openModal]);

  const handleUpdate = useCallback(
    (achievement: Achievement) => {
      openModal({
        title: "Cập nhật thành tích",
        content: <AchievementForm achievement={achievement} />,
        size: "lg",
        config: { mutationKey: MUTATION_KEYS.UPDATE_ACHIEVEMENT },
      });
    },
    [openModal]
  );

  const columns = useMemo<ColumnDef<Achievement>[]>(
    () => [
      {
        id: "student",
        header: "Học viên",
        cell: (info) => {
          const item = info.row.original;
          const profile = item.user?.profile;
          return (
            <div className="min-w-[200px]">
              <Typography variant="body" weight="semibold" color="neutral">
                {textOrDash(profile?.fullName || item.user?.username)}
              </Typography>
              <Typography variant="caption" color="gray">
                Mã học viên: {profile?.code || item.userId}
              </Typography>
            </div>
          );
        },
      },
      {
        id: "title",
        header: "Thành tích",
        accessorKey: "title",
        cell: (info) => (
          <div className="min-w-[220px]">
            <Typography variant="body" weight="semibold" color="neutral">
              {info.row.original.title || "Chưa cập nhật"}
            </Typography>
            <Typography
              variant="caption"
              color="gray"
              className="line-clamp-2 max-w-xs"
            >
              {info.row.original.content ||
                info.row.original.description ||
                "Không có mô tả"}
            </Typography>
          </div>
        ),
      },
      {
        id: "award",
        header: "Danh hiệu",
        accessorKey: "award",
        cell: (info) => (
          <Badge variant={info.row.original.award ? "success" : "neutral"}>
            {info.row.original.award || "Chưa cập nhật"}
          </Badge>
        ),
      },
      {
        id: "semester",
        header: "Học kỳ",
        accessorKey: "semester",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {formatSemesterYear(info.row.original.semester, info.row.original.schoolYear)}
          </Typography>
        ),
      },
      {
        id: "year",
        header: "Năm",
        accessorKey: "year",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.year)}
          </Typography>
        ),
      },
      {
        id: "unit",
        header: "Đơn vị",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.user?.profile?.unit)}
          </Typography>
        ),
      },
      {
        id: "updatedAt",
        header: "Cập nhật",
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
          const achievement = info.row.original;
          return (
            <div className="flex items-center gap-1">
              <ActionButton
                tooltipText="Cập nhật"
                icon={HiOutlinePencil}
                color="blue"
                onClick={() => handleUpdate(achievement)}
              />
              <ActionButton
                tooltipText="Xóa thành tích"
                icon={HiOutlineTrash}
                color="red"
                onClick={() =>
                  openConfirm({
                    title: "Xác nhận xóa",
                    message: "Bạn có chắc chắn muốn xóa thành tích này không?",
                    confirmText: "Xóa ngay",
                    variant: "danger",
                    mutationKey: MUTATION_KEYS.DELETE_ACHIEVEMENT,
                    onConfirm: () => deleteMutation.mutate(achievement.id),
                  })
                }
              />
            </div>
          );
        },
      },
    ],
    [deleteMutation, handleUpdate, openConfirm]
  );

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        id: "fullName",
        label: "Họ và tên",
        placeholder: "Nhập họ tên học viên...",
      },
      {
        type: "text",
        id: "unit",
        label: "Đơn vị",
        placeholder: "Nhập đơn vị...",
      },
      {
        type: "text",
        id: "schoolYear",
        label: "Năm học",
        placeholder: "VD: 2024-2025",
      },
      {
        type: "text",
        id: "semester",
        label: "Học kỳ",
        placeholder: "VD: HK1",
      },
      {
        type: "text",
        id: "award",
        label: "Danh hiệu",
        placeholder: "Nhập danh hiệu...",
      },
    ],
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/commander" },
        { label: "Quản lý thành tích" },
      ]}
      title="Quản lý thành tích"
      subtitle="Theo dõi, ghi nhận và cập nhật thành tích khen thưởng của học viên."
      isLoading={isLoading}
      skeleton={<AchievementSkeleton />}
      isError={isError}
      onRetry={refetch}
    >
      <div className="relative overflow-hidden bg-white transition-colors dark:bg-neutral-950">
        <div className="px-4">
          <Table
            data={achievementsData}
            columns={columns}
            pagination={pagination}
            onPaginationChange={setPagination}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            sorting={sorting}
            onSortingChange={setSorting}
            filterFields={filterFields}
            emptyText="Không tìm thấy thành tích phù hợp"
            onAdd={handleAdd}
            addLabel="Thêm thành tích"
            actions={<AchievementToolbarActions onImport={handleImport} onExport={() => exportMutation.mutate()} exporting={exportMutation.isPending} />}
          />
        </div>
      </div>
    </PageContainer>
  );
}
