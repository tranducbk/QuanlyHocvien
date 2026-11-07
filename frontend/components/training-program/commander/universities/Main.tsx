"use client";

import {
  AiOutlineArrowRight,
  AiOutlineBank,
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlineUserAdd,
} from "@/library/icons";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import ActionButton from "@/library/ActionButton";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import { FilterField } from "@/library/table/TableFilter";
import useTableQuery from "@/hooks/useTableQuery";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import { useModalStore } from "@/store/useModalStore";
import { universityService } from "@/services/training-program/universities";
import { University, UniversityQueryRequest } from "@/types/training-program/universities";
import CreateUniversityForm from "./CreateUniversityForm";
import UpdateUniversityForm from "./UpdateUniversityForm";
import UniversitySkeleton from "./UniversitySkeleton";
import AddUniversityStudents from "./AddUniversityStudents";
import CreateOrganizationForm from "./[organizations]/CreateOrganizationForm";
import Button from "@/library/Button";

export default function Main() {
  const { openModal } = useModalStore();
  const handleCreateMajor = useCallback((university: University) => {
    openModal({
      title: `Tạo ngành học · ${university.universityCode}`,
      content: <CreateOrganizationForm universityId={university.id} />,
      size: "md",
      config: { mutationKey: MUTATION_KEYS.CREATE_ORGANIZATION },
    });
  }, [openModal]);
  const handleAddStudents = useCallback((university: University) => {
    openModal({
      title: `Thêm học viên · ${university.universityCode}`,
      content: <AddUniversityStudents university={university} />,
      size: "2xl",
      config: { mutationKey: [QUERY_KEYS.UNIVERSITIES, "add-students"] },
    });
  }, [openModal]);
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

  const columns = useMemo<ColumnDef<University>[]>(
    () => [
      {
        id: "universityName",
        header: "Trường đại học",
        size: 330,
        accessorKey: "universityName",
        cell: ({ row }) => {
          const university = row.original;
          return (
            <Link
              href={`/commander/universities/${university.id}`}
              className="group flex min-w-0 items-center gap-3"
            >
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300 lg:flex">
                <AiOutlineBank className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
              <Typography
                variant="body"
                weight="semibold"
                color="neutral"
                className="break-words text-sm leading-5 group-hover:text-primary-600 transition-colors"
              >
                {university.universityName}
              </Typography>
              <Typography variant="caption" color="gray">
                <span className="mt-1 inline-flex items-center gap-1 text-xs">Ngành học <AiOutlineArrowRight aria-hidden="true" /></span>
              </Typography>
              </span>
            </Link>
          );
        },
      },
      {
        id: "universityCode",
        header: "Mã trường",
        size: 105,
        accessorKey: "universityCode",
        cell: ({ row }) => (
          <Typography variant="body" weight="semibold" color="neutral" className="inline-flex rounded-md bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-800">
            {row.original.universityCode}
          </Typography>
        ),
      },
      {
        id: "totalStudents",
        header: "Số học viên",
        size: 130,
        accessorKey: "totalStudents",
        cell: ({ row }) => (
          <Typography variant="body" color="neutral" className="font-semibold tabular-nums">
            {row.original.totalStudents}
          </Typography>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        size: 150,
        accessorKey: "status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "ACTIVE" ? "success" : "neutral"}>
            {row.original.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Thao tác",
        size: 240,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-1.5">
          {row.original.status === "ACTIVE" && <button type="button"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-2 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-primary-800 dark:bg-primary-950 dark:text-primary-300"
            onClick={() => handleCreateMajor(row.original)}>
            <AiOutlinePlus className="h-4 w-4" aria-hidden="true" /> Tạo ngành học
          </button>}
          {row.original.status === "ACTIVE" && <ActionButton
            tooltipText="Thêm học viên"
            icon={AiOutlineUserAdd}
            color="neutral"
            className="border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
            onClick={() => handleAddStudents(row.original)}
          />}
          <ActionButton
            tooltipText="Chỉnh sửa trường"
            icon={AiOutlineEdit}
            color="neutral"
            className="border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
            onClick={() => handleOpenUpdateModal(row.original)}
          />
          </div>
        ),
      },
    ],
    [handleOpenUpdateModal, handleAddStudents, handleCreateMajor]
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
        { label: "Tổng quan", href: "/commander" },
        { label: "Cơ sở đào tạo" },
      ]}
      title="Cơ sở đào tạo"
      actions={<Button type="button" icon={AiOutlinePlus} onClick={handleOpenCreateModal}>Thêm trường đại học</Button>}
      isLoading={isLoading}
      skeleton={<UniversitySkeleton />}
      isError={isError}
      onRetry={refetch}
    >
      <div className="min-w-0">
        <div className="min-w-0">
          <Table
            compact
            fitToContainer
            rowClassName="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/40 transition-colors"
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
          />
        </div>
      </div>
    </PageContainer>
  );
}
