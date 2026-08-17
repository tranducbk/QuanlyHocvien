"use client";

import { useMemo, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { classService } from "@/services/classes";
import { universityService } from "@/services/universities";
import { Class } from "@/types/classes";
import { formatDateTime, textOrDash } from "@/utils/fn-common";
import Table from "@/library/Table";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUserAdd,
  HiOutlineUserGroup,
} from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import Typography from "@/library/Typography";
import PageContainer from "@/library/PageContainer";
import { FilterField } from "@/library/table/TableFilter";
import { useConfirmStore } from "@/store/useConfirmStore";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { useModalStore } from "@/store/useModalStore";
import UpdateClassForm from "@/components/commander/classes/UpdateClassForm";
import CreateClassForm from "./CreateClassForm";
import useTableQuery from "@/hooks/useTableQuery";
import ClassSkeleton from "./ClassSkeleton";
import { DEFAULT_PAGE } from "@/constants/constants";
import useAppMutation from "@/hooks/useAppMutation";
import AddClassStudentsModal from "@/components/classes/AddClassStudentsModal";
import ClassStudentsListModal from "@/components/classes/ClassStudentsListModal";

export default function Main() {
  const { openConfirm } = useConfirmStore();
  const { openModal } = useModalStore();

  const {
    data: universities,
    fetchNextPage: fetchNextUniversities,
    hasNextPage: hasNextUniversities,
    isFetchingNextPage: isFetchingNextUniversities,
    isLoading: isLoadingUniversities,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.UNIVERSITIES],
    queryFn: ({ pageParam }) =>
      universityService.getUniversities({
        page: pageParam,
        limit: DEFAULT_PAGE.PAGE_SIZE,
      }),
    initialPageParam: DEFAULT_PAGE.PAGE_INDEX + 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    select: (data) => data.pages.flatMap((page) => page.data || []),
  });

  const {
    data: classesData,
    isLoading: isClassesLoading,
    isError: isClassesError,
    refetch: refetchClasses,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } = useTableQuery<Class>({
    queryKey: [QUERY_KEYS.CLASSES],
    fetchData: classService.getClasses,
  });

  const deleteMutation = useAppMutation({
    mutationKey: MUTATION_KEYS.DELETE_CLASS,
    mutationFn: (id: string) => classService.deleteClass(id),
    invalidateQueryKey: [QUERY_KEYS.CLASSES],
    successMessage: "Xóa lớp học thành công!",
    errorMessage: "Xóa lớp học thất bại!",
  });

  const handleAddClass = useCallback(() => {
    openModal({
      title: "Thêm lớp học mới",
      content: <CreateClassForm />,
      config: {
        mutationKey: MUTATION_KEYS.CREATE_CLASS,
      },
    });
  }, [openModal]);

  const handleOpenUpdateModal = useCallback(
    (cls: Class) => {
      openModal({
        title: "Chỉnh sửa lớp học",
        content: <UpdateClassForm cls={cls} />,
        size: "md",
        config: {
          mutationKey: MUTATION_KEYS.UPDATE_CLASS,
        },
      });
    },
    [openModal]
  );

  const handleOpenAddStudentsModal = useCallback(
    (cls: Class) => {
      openModal({
        title: "Thêm học viên vào lớp",
        content: <AddClassStudentsModal cls={cls} />,
        size: "2xl",
      });
    },
    [openModal]
  );

  const handleOpenStudentsListModal = useCallback(
    (cls: Class) => {
      openModal({
        title: "Danh sách học viên trong lớp",
        content: <ClassStudentsListModal cls={cls} />,
        size: "2xl",
      });
    },
    [openModal]
  );

  const columns = useMemo<ColumnDef<Class>[]>(
    () => [
      {
        id: "className",
        header: "Tên lớp",
        accessorKey: "className",
        cell: (info) => (
          <Typography variant="body" weight="semibold" color="neutral">
            {info.row.original.className}
          </Typography>
        ),
      },
      {
        id: "universityName",
        header: "Trường đại học",
        accessorKey: "universityName",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.universityName)}
          </Typography>
        ),
      },
      {
        id: "organizationName",
        header: "Khoa/Ngành",
        accessorKey: "organizationName",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.organizationName)}
          </Typography>
        ),
      },
      {
        id: "levelName",
        header: "Trình độ",
        accessorKey: "levelName",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {textOrDash(info.row.original.levelName)}
          </Typography>
        ),
      },
      {
        id: "studentCount",
        header: "Số học viên",
        accessorKey: "studentCount",
        cell: (info) => (
          <Typography variant="body" color="neutral">
            {info.row.original.studentCount}
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
          const cls = info.row.original;
          return (
            <div className="flex items-center justify-start gap-1">
              <ActionButton
                tooltipText="Thêm học viên"
                icon={HiOutlineUserAdd}
                onClick={() => handleOpenAddStudentsModal(cls)}
                color="green"
              />
              <ActionButton
                tooltipText="Danh sách học viên"
                icon={HiOutlineUserGroup}
                onClick={() => handleOpenStudentsListModal(cls)}
                color="secondary"
              />
              <ActionButton
                tooltipText="Chỉnh sửa"
                icon={HiOutlinePencil}
                onClick={() => handleOpenUpdateModal(cls)}
                color="blue"
              />

              <ActionButton
                tooltipText="Xóa lớp"
                icon={HiOutlineTrash}
                color="red"
                onClick={() =>
                  openConfirm({
                    title: "Xác nhận xóa",
                    message: `Bạn có chắc chắn muốn xóa lớp "${cls.className}" không?`,
                    confirmText: "Xóa ngay",
                    variant: "danger",
                    mutationKey: MUTATION_KEYS.DELETE_CLASS,
                    onConfirm: () => deleteMutation.mutate(cls.id),
                  })
                }
              />
            </div>
          );
        },
      },
    ],
    [
      handleOpenAddStudentsModal,
      handleOpenStudentsListModal,
      handleOpenUpdateModal,
      openConfirm,
      deleteMutation,
    ]
  );

  const universityOptions = useMemo(() => {
    const options = [{ value: "", label: "Tất cả trường" }];
    if (universities) {
      universities.forEach((uni) => {
        options.push({ value: uni.id, label: uni.universityName });
      });
    }
    return options;
  }, [universities]);

  const filterOptions = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        id: "className",
        label: "Tên lớp",
        placeholder: "Nhập tên lớp...",
      },
      {
        type: "select",
        id: "universityId",
        label: "Trường đại học",
        options: universityOptions,
        placeholder: "Chọn trường...",
        hasNextPage: hasNextUniversities,
        isFetchingNextPage: isFetchingNextUniversities,
        onLoadMore: fetchNextUniversities,
        isLoading: isLoadingUniversities,
        selectFilter: {
          enabled: true,
          mode: "client",
          placeholder: "Tìm kiếm trường...",
        },
      },
    ],
    [
      universityOptions,
      hasNextUniversities,
      isFetchingNextUniversities,
      fetchNextUniversities,
      isLoadingUniversities,
    ]
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Tổng quan", href: "/admin" },
        { label: "Quản lý lớp học" },
      ]}
      title="Quản lý lớp học"
      isLoading={isClassesLoading}
      skeleton={<ClassSkeleton />}
      isError={isClassesError}
      onRetry={refetchClasses}
    >
      <div className="bg-white dark:bg-neutral-950 overflow-hidden relative transition-colors">
        <div className="px-4">
          <Table
            data={classesData}
            columns={columns}
            pagination={pagination}
            onPaginationChange={setPagination}
            columnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            sorting={sorting}
            onSortingChange={setSorting}
            filterFields={filterOptions}
            emptyText="Không tìm thấy lớp học nào phù hợp"
            onAdd={handleAddClass}
            addLabel="Thêm lớp học"
          />
        </div>
      </div>
    </PageContainer>
  );
}
