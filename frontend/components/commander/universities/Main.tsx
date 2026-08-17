"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import Badge from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import Typography from "@/library/Typography";
import { FilterField } from "@/library/table/TableFilter";
import useTableQuery from "@/hooks/useTableQuery";
import { QUERY_KEYS } from "@/constants/query-keys";
import { universityService } from "@/services/universities";
import { University, UniversityQueryRequest } from "@/types/universities";
import UniversitySkeleton from "./UniversitySkeleton";

export default function Main() {
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
        accessorKey: "universityName",
        cell: ({ row }) => {
          const university = row.original;
          return (
            <Link
              href={`/commander/universities/${university.id}`}
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
          <Typography variant="body" weight="semibold" color="neutral" className="whitespace-nowrap">
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
          <Badge variant={row.original.status === "ACTIVE" ? "success" : "neutral"}>
            {row.original.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
          </Badge>
        ),
      },
    ],
    []
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
          />
        </div>
      </div>
    </PageContainer>
  );
}
