"use client";

import { useMemo, useCallback } from "react";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import { FilterField } from "@/library/table/TableFilter";
import useTableQuery from "@/hooks/useTableQuery";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { universityService } from "@/services/universities";
import { useModalStore } from "@/store/useModalStore";
import { University, UniversityQueryRequest } from "@/types/universities";
import CreateUniversityForm from "./CreateUniversityForm";
import UpdateUniversityForm from "./UpdateUniversityForm";
import UniversitySkeleton from "./UniversitySkeleton";
import { useUniversityColumns } from "./useUniversityColumns";

export default function Main() {
  const { openModal } = useModalStore();

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

  const handleOpenCreateModal = useCallback(() => {
    openModal({
      title: "Thêm mới trường đại học",
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

  const columns = useUniversityColumns({
    onEdit: handleOpenUpdateModal,
  });

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
        { label: "Tổng quan", href: "/commander" },
        { label: "Cơ sở đào tạo" },
      ]}
      title="Cơ sở đào tạo"
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
            addLabel="Thêm trường"
          />
        </div>
      </div>
    </PageContainer>
  );
}
