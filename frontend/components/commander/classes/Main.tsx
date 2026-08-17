"use client";

import { useMemo, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { HiOutlineUserGroup } from "react-icons/hi";
import ActionButton from "@/library/ActionButton";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import { FilterField } from "@/library/table/TableFilter";
import useTableQuery from "@/hooks/useTableQuery";
import { classService } from "@/services/classes";
import { universityService } from "@/services/universities";
import { DEFAULT_PAGE } from "@/constants/constants";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useModalStore } from "@/store/useModalStore";
import { Class } from "@/types/classes";
import { formatDateTime, textOrDash } from "@/utils/fn-common";
import ClassStudentsListModal from "@/components/classes/ClassStudentsListModal";
import ClassSkeleton from "./ClassSkeleton";

export default function Main() {
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

  const handleOpenStudentsListModal = useCallback(
    (cls: Class) => {
      openModal({
        title: "Danh sách học viên trong lớp",
        content: <ClassStudentsListModal cls={cls} readOnly />,
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
          <Typography variant="caption" weight="semibold" color="gray" className="whitespace-nowrap">
            {formatDateTime(info.row.original.createdAt)}
          </Typography>
        ),
      },
      {
        id: "updatedAt",
        header: "Ngày cập nhật",
        accessorKey: "updatedAt",
        cell: (info) => (
          <Typography variant="caption" weight="semibold" color="gray" className="whitespace-nowrap">
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
            <ActionButton
              tooltipText="Danh sách học viên"
              icon={HiOutlineUserGroup}
              onClick={() => handleOpenStudentsListModal(cls)}
              color="secondary"
            />
          );
        },
      },
    ],
    [handleOpenStudentsListModal]
  );

  const universityOptions = useMemo(() => {
    const options = [{ value: "", label: "Tất cả trường" }];
    universities?.forEach((uni) => {
      options.push({ value: uni.id, label: uni.universityName });
    });
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
        { label: "Tổng quan", href: "/commander" },
        { label: "Lớp học" },
      ]}
      title="Lớp học"
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
          />
        </div>
      </div>
    </PageContainer>
  );
}
