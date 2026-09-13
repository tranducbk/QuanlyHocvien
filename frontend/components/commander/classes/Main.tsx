"use client";

import { useMemo, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import { FilterField } from "@/library/table/TableFilter";
import useTableQuery from "@/hooks/useTableQuery";
import { classService } from "@/services/classes";
import { universityService } from "@/services/universities";
import { DEFAULT_PAGE } from "@/constants/constants";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { useModalStore } from "@/store/useModalStore";
import { Class } from "@/types/classes";
import AddClassStudentsModal from "@/components/classes/AddClassStudentsModal";
import ClassStudentsListModal from "@/components/classes/ClassStudentsListModal";
import CreateClassForm from "./CreateClassForm";
import UpdateClassForm from "./UpdateClassForm";
import ClassSkeleton from "./ClassSkeleton";
import { useClassColumns } from "./useClassColumns";

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

  const handleOpenCreateModal = useCallback(() => {
    openModal({
      title: "Tạo lớp học mới",
      content: <CreateClassForm />,
      size: "md",
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

  const columns = useClassColumns({
    onAddStudents: handleOpenAddStudentsModal,
    onViewStudents: handleOpenStudentsListModal,
    onEdit: handleOpenUpdateModal,
  });

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
            onAdd={handleOpenCreateModal}
            addLabel="Tạo lớp học"
          />
        </div>
      </div>
    </PageContainer>
  );
}
