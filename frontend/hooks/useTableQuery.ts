"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { DEFAULT_PAGE } from "@/constants/constants";

export interface UseTableQueryOptions<TData, TParams> {
  /** Khóa truy vấn cho React Query (ví dụ: [QUERY_KEYS.CLASSES]) */
  queryKey: unknown[];
  /** Hàm gọi API để lấy dữ liệu, nhận vào các tham số phân trang, lọc, sắp xếp */
  fetchData: (params: TParams) => Promise<PaginatedResponse<TData>>;
  /** Trang bắt đầu (mặc định: 0) */
  initialPageIndex?: number;
  /** Số lượng bản ghi trên mỗi trang (mặc định: 10) */
  initialPageSize?: number;
  /** Trạng thái kích hoạt truy vấn (mặc định: true) */
  enabled?: boolean;
}

/**
 * useTableQuery
 * - Centralizes pagination / sorting / filtering state and the React Query call
 * - Returns react-query fields plus state setters so parent can pass them down to a Table component
 */
export default function useTableQuery<
  TData,
  TParams extends object = Record<string, unknown>,
>({
  queryKey,
  fetchData,
  initialPageIndex = DEFAULT_PAGE.PAGE_INDEX,
  initialPageSize = DEFAULT_PAGE.PAGE_SIZE,
  enabled = true,
}: UseTableQueryOptions<TData, TParams>) {
  const [pagination, setPagination] = useState({
    pageIndex: initialPageIndex,
    pageSize: initialPageSize,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const query = useQuery({
    queryKey: [...queryKey, pagination, columnFilters, sorting],
    queryFn: async () => {
      const filterParams = columnFilters.reduce(
        (acc, filter) => {
          acc[filter.id] = filter.value;
          return acc;
        },
        {} as Record<string, unknown>
      );

      const sortParams: Record<string, string> = {};
      if (sorting.length > 0) {
        sortParams.sortBy = sorting[0].id as string;
        sortParams.sortOrder = sorting[0].desc ? "desc" : "asc";
      }

      return fetchData({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filterParams,
        ...sortParams,
      } as unknown as TParams);
    },
    enabled,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    pagination,
    setPagination,
    columnFilters,
    setColumnFilters,
    sorting,
    setSorting,
  } as const;
}
