"use client";

import { useMemo, useState } from "react";
import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
} from "@tanstack/react-table";
import Table from "@/library/Table";
import type { FilterField } from "@/library/table/TableFilter";

type MilitaryDataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  emptyText: string;
  showIndex?: boolean;
  onAdd?: () => void;
  addLabel?: string;
  filterFields?: FilterField[];
  onFiltersChange?: (filters: ColumnFiltersState) => void;
};

export default function MilitaryDataTable<TData>({
  data,
  columns,
  emptyText,
  showIndex = true,
  onAdd,
  addLabel,
  filterFields,
  onFiltersChange,
}: MilitaryDataTableProps<TData>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const filteredData = useMemo(
    () =>
      data.filter((row) =>
        columnFilters.every((filter) => {
          const column = columns.find(
            (item) =>
              ("id" in item && item.id === filter.id) ||
              ("accessorKey" in item && item.accessorKey === filter.id)
          );
          if (!column) return true;
          const value =
            "accessorFn" in column && column.accessorFn
              ? column.accessorFn(row, 0)
              : "accessorKey" in column && column.accessorKey
                ? String(column.accessorKey)
                    .split(".")
                    .reduce<unknown>(
                      (current, key) =>
                        current && typeof current === "object"
                          ? (current as Record<string, unknown>)[key]
                          : undefined,
                      row
                    )
                : undefined;
          const actual = String(value ?? "").toLocaleLowerCase("vi-VN");
          const expected = String(filter.value ?? "").toLocaleLowerCase(
            "vi-VN"
          );
          return filterFields?.find((field) => field.id === filter.id)?.type ===
            "select"
            ? actual === expected
            : actual.includes(expected);
        })
      ),
    [data, columns, columnFilters, filterFields]
  );
  const visibleData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return filteredData.slice(start, start + pagination.pageSize);
  }, [filteredData, pagination]);
  const response = useMemo<PaginatedResponse<TData>>(
    () => ({
      success: true,
      statusCode: 200,
      message: "Thành công",
      data: visibleData,
      pagination: {
        total: filteredData.length,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        totalPages: Math.max(
          1,
          Math.ceil(filteredData.length / pagination.pageSize)
        ),
      },
    }),
    [filteredData, pagination, visibleData]
  );
  const changePagination: OnChangeFn<PaginationState> = (updater) =>
    setPagination((current) =>
      typeof updater === "function" ? updater(current) : updater
    );

  const changeFilters: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next =
      typeof updater === "function" ? updater(columnFilters) : updater;
    setColumnFilters(next);
    onFiltersChange?.(next);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  return (
    <Table
      data={response}
      columns={columns}
      pagination={pagination}
      onPaginationChange={changePagination}
      columnFilters={columnFilters}
      onColumnFiltersChange={changeFilters}
      filterFields={filterFields}
      showIndex={showIndex}
      showVisibilityToggle
      enableColumnOrdering={false}
      emptyText={emptyText}
      onAdd={onAdd}
      addLabel={addLabel}
    />
  );
}
