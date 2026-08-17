"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { IconType } from "react-icons";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import Badge, { BadgeVariant } from "@/library/Badge";
import PageContainer from "@/library/PageContainer";
import Table from "@/library/Table";
import type { FilterField } from "@/library/table/TableFilter";
import Typography from "@/library/Typography";
import useTableQuery from "@/hooks/useTableQuery";
import { QUERY_KEYS } from "@/constants/query-keys";
import { tuitionFeeService } from "@/services/tuition-fees";
import {
  TuitionFee,
  TuitionFeeQueryRequest,
  TuitionFeeStatus,
} from "@/types/tuition-fees";
import { formatDateTime, formatCurrency, textOrDash, formatSemesterYear } from "@/utils/fn-common";
import TuitionSkeleton from "./TuitionSkeleton";

const statusConfig: Record<
  TuitionFeeStatus,
  { label: string; variant: BadgeVariant; icon: IconType }
> = {
  PAID: {
    label: "Đã thanh toán",
    variant: "success",
    icon: HiOutlineCheckCircle,
  },
  UNPAID: {
    label: "Chưa thanh toán",
    variant: "warning",
    icon: HiOutlineExclamationCircle,
  },
};


export default function Main() {
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
  } = useTableQuery<TuitionFee, TuitionFeeQueryRequest>({
    queryKey: [QUERY_KEYS.TUITION_FEES, "student"],
    fetchData: tuitionFeeService.getMyTuitionFees,
  });

  const columns = useMemo<ColumnDef<TuitionFee>[]>(
    () => [
      {
        id: "semester",
        header: "Học kỳ",
        cell: ({ row }) => {
          const fee = row.original;
          const semester = fee.semesterInfo?.code || fee.semester;
          const schoolYear = fee.semesterInfo?.schoolYearInfo?.schoolYear || fee.schoolYear;
          return (
            <div className="min-w-36">
              <Typography
                variant="body"
                weight="bold"
                className="text-neutral-900 dark:text-neutral-100"
              >
                {formatSemesterYear(semester, schoolYear)}
              </Typography>
            </div>
          );
        },
      },
      {
        id: "content",
        header: "Nội dung",
        accessorKey: "content",
        cell: ({ row }) => (
          <Typography
            variant="body"
            className="max-w-md line-clamp-2 text-neutral-600 dark:text-neutral-300"
          >
            {textOrDash(row.original.content)}
          </Typography>
        ),
      },
      {
        id: "totalAmount",
        header: "Số tiền",
        accessorKey: "totalAmount",
        cell: ({ row }) => (
          <Typography
            variant="body"
            weight="black"
            className="whitespace-nowrap text-emerald-600 dark:text-emerald-400"
          >
            {formatCurrency(row.original.totalAmount)}
          </Typography>
        ),
      },
      {
        id: "status",
        header: "Trạng thái",
        accessorKey: "status",
        cell: ({ row }) => {
          const config =
            statusConfig[row.original.status] || statusConfig.UNPAID;
          const StatusIcon = config.icon;

          return (
            <Badge
              variant={config.variant}
              className="gap-1.5 whitespace-nowrap"
            >
              <StatusIcon size={13} />
              {config.label}
            </Badge>
          );
        },
      },
      {
        id: "updatedAt",
        header: "Cập nhật",
        accessorKey: "updatedAt",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs font-bold text-neutral-500 dark:text-neutral-400">
            {formatDateTime(row.original.updatedAt)}
          </span>
        ),
      },
    ],
    []
  );

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        id: "status",
        label: "Trạng thái",
        type: "select",
        options: [
          { label: "Đã thanh toán", value: "PAID" },
          { label: "Chưa thanh toán", value: "UNPAID" },
        ],
      },
      {
        id: "schoolYear",
        label: "Năm học",
        type: "text",
        placeholder: "VD: 2024-2025",
      },
      {
        id: "semester",
        label: "Học kỳ",
        type: "text",
        placeholder: "VD: HK1",
      },
    ],
    []
  );

  return (
    <PageContainer
      breadcrumb={[
        { label: "Trang chủ", href: "/student" },
        { label: "Học phí" },
      ]}
      title="Học phí"
      subtitle="Theo dõi các khoản học phí theo học kỳ, năm học và trạng thái thanh toán."
      isLoading={isLoading}
      skeleton={<TuitionSkeleton />}
      isError={isError}
      onRetry={refetch}
      className="space-y-8"
    >
      <div className="space-y-8">
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
          emptyText="Chưa có dữ liệu học phí phù hợp"
        />
      </div>
    </PageContainer>
  );
}
