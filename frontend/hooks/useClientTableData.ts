"use client";

import { useMemo, useState } from "react";
import type { ColumnFiltersState, OnChangeFn, PaginationState, SortingState } from "@tanstack/react-table";

type FilterValues = Record<string, unknown>;

export default function useClientTableData<T>(
  rows: T[],
  matches: (row: T, filters: FilterValues) => boolean,
  sortValue: (row: T, field: string) => string | number | null | undefined,
) {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const filteredRows = useMemo(() => {
    const filters = Object.fromEntries(columnFilters.map(({ id, value }) => [id, value]));
    const result = rows.filter((row) => matches(row, filters));
    const activeSort = sorting[0];
    if (activeSort) {
      result.sort((a, b) => {
        const left = sortValue(a, activeSort.id);
        const right = sortValue(b, activeSort.id);
        const comparison = typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left ?? "").localeCompare(String(right ?? ""), "vi", { numeric: true });
        return activeSort.desc ? -comparison : comparison;
      });
    }
    return result;
  }, [rows, columnFilters, sorting, matches, sortValue]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pagination.pageSize));
  const pageIndex = Math.min(pagination.pageIndex, totalPages - 1);
  const data: PaginatedResponse<T> = {
    statusCode: 200,
    message: "Thành công",
    data: filteredRows.slice(pageIndex * pagination.pageSize, (pageIndex + 1) * pagination.pageSize),
    pagination: { page: pageIndex + 1, limit: pagination.pageSize, total: filteredRows.length, totalPages },
  };
  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    setColumnFilters(updater);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };
  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater);
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  return { data, pagination: { ...pagination, pageIndex }, setPagination, columnFilters, onColumnFiltersChange, sorting, onSortingChange };
}
