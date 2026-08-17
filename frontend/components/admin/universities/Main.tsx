"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import {
  HiOutlineLockClosed,
  HiOutlineLockOpen,
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
import { universityService } from "@/services/universities";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useModalStore } from "@/store/useModalStore";
import { University, UniversityQueryRequest } from "@/types/universities";
import CreateUniversityForm from "./CreateUniversityForm";
import UpdateUniversityForm from "./UpdateUniversityForm";
import UniversitySkeleton from "./UniversitySkeleton";

export default function Main() {
  const { openModal } = useModalStore();
  const { openConfirm } = useConfirmStore();

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
  } = useTableQuery<University, UniversityQueryRequest>({
    queryKey: [QUERY_KEYS.UNIVERSITIES],
    fetchData: universityService.getUniversities,
  });

  const toggleUniversityStatusMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.TOGGLE_UNIVERSITY_STATUS,
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "ACTIVE" | "INACTIVE";
    }) => universityService.toggleUniversityStatus(id, status),
    invalidateQueryKey: [QUERY_KEYS.UNIVERSITIES],
    successMessage: "Cập nhật trạng thái thành công",
    errorMessage: "Cập nhật trạng thái thất bại!",
  });

  const deleteUniversityMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_UNIVERSITY,
    mutationFn: (id: string) => universityService.deleteUniversity(id),
    invalidateQueryKey: [QUERY_KEYS.UNIVERSITIES],
    successMessage: "Xóa trường đại học thành công",
    errorMessage: "Xóa trường đại học thất bại!",
  });

  const handleOpenCreateModal = useCallback(() => {
    openModal({
      title: "Thêm trường đại học",
      content: <CreateUniversityForm />,
      size: "md",
      config: {
        mutationKey: MUTATION_KEYS.CREATE_UNIVERSITY,
      },
    });
  }, [openModal]);

  const handleOpenUpdateModal = useCallback(
    (university: University) => {
      openModal({
        title: "Chỉnh sửa trường đại học",
        content: <UpdateUniversityForm university={university} />,
        size: "md",
        config: {
          mutationKey: MUTATION_KEYS.UPDATE_UNIVERSITY,
        },
      });
    },
    [openModal]
  );

  const columns = useMemo<ColumnDef<University>[]>(
    () => [
      {
        id: "universityName",
        header: "Trường đại học",
        accessorKey: "universityName",
        cell: ({ row }) => {
          const university = row.original;
          return (
            <Link
              href={`/admin/universities/${university.id}`}
              className="group inline-flex flex-col"
            >
              <Typography
                variant="body"
                weight="semibold"
                color="neutral"
                className="group-hover:text-primary-600 transition-colors"
              >
                {university.universityName}
              </Typography>
              <Typography variant="caption" color="gray">
                Xem chuyên ngành / đơn vị
              </Typography>
            </Link>
          );
        },
      },
      {
        id: "universityCode",
        header: "Mã trường",
        accessorKey: "universityCode",
        cell: ({ row }) => (
          <Typography
            variant="body"
            weight="semibold"
            color="neutral"
            className="whitespace-nowrap"
          >
            {row.original.universityCode}
          </Typography>
        ),
      },
      {
        id: "totalStudents",
        header: "Số học viên",
        accessorKey: "totalStudents",
        cell: ({ row }) => (
          <Typography variant="body" color="neutral">
            {row.original.totalStudents}
          </Typography>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        accessorKey: "status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === "ACTIVE" ? "success" : "neutral"}
          >
            {row.original.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => {
          const university = row.original;
          const isActive = university.status === "ACTIVE";

          return (
            <div className="flex items-center justify-start gap-1">
              <ActionButton
                tooltipText={
                  isActive ? "Tạm dừng hoạt động" : "Kích hoạt hoạt động"
                }
                icon={isActive ? HiOutlineLockOpen : HiOutlineLockClosed}
                color={isActive ? "amber" : "green"}
                onClick={() =>
                  openConfirm({
                    title: isActive
                      ? "Xác nhận tạm dừng"
                      : "Xác nhận kích hoạt",
                    message: `Bạn có chắc chắn muốn ${isActive ? "tạm dừng" : "kích hoạt"} trường "${university.universityName}" không?`,
                    confirmText: isActive ? "Tạm dừng" : "Kích hoạt",
                    variant: isActive ? "danger" : "primary",
                    mutationKey: MUTATION_KEYS.TOGGLE_UNIVERSITY_STATUS,
                    onConfirm: () =>
                      toggleUniversityStatusMutation.mutate({
                        id: university.id,
                        status: university.status,
                      }),
                  })
                }
              />

              <ActionButton
                tooltipText="Chỉnh sửa"
                icon={HiOutlinePencil}
                color="blue"
                onClick={() => handleOpenUpdateModal(university)}
              />

              <ActionButton
                tooltipText="Xóa trường"
                icon={HiOutlineTrash}
                color="red"
                onClick={() =>
                  openConfirm({
                    title: "Xác nhận xóa",
                    message: `Bạn có chắc chắn muốn xóa trường "${university.universityName}"? Toàn bộ dữ liệu cấp dưới sẽ bị xóa.`,
                    confirmText: "Xóa ngay",
                    variant: "danger",
                    mutationKey: MUTATION_KEYS.DELETE_UNIVERSITY,
                    onConfirm: () =>
                      deleteUniversityMutation.mutate(university.id),
                  })
                }
              />
            </div>
          );
        },
      },
    ],
    [
      deleteUniversityMutation,
      handleOpenUpdateModal,
      openConfirm,
      toggleUniversityStatusMutation,
    ]
  );

  const filterOptions = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        id: "universityName",
        label: "Tên trường",
        placeholder: "Nhập tên trường...",
      },
      {
        type: "text",
        id: "universityCode",
        label: "Mã trường",
        placeholder: "Nhập mã trường...",
      },
      {
        type: "select",
        id: "status",
        label: "Trạng thái",
        placeholder: "Chọn trạng thái...",
        options: [
          { value: "", label: "Tất cả trạng thái" },
          { value: "ACTIVE", label: "Hoạt động" },
          { value: "INACTIVE", label: "Tạm dừng" },
        ],
      },
    ],
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/admin" },
        { label: "Cơ sở đào tạo" },
      ]}
      title="Quản lý cơ sở đào tạo"
      isLoading={isLoading}
      skeleton={<UniversitySkeleton />}
      isError={isError}
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
            emptyText="Không tìm thấy cơ sở đào tạo nào phù hợp"
            onAdd={handleOpenCreateModal}
            addLabel="Thêm trường đại học"
          />
        </div>
      </div>
    </PageContainer>
  );
}
