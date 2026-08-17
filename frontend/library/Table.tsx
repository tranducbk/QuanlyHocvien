"use client";

import { useMemo, useCallback, useState } from "react";
import type { ReactNode } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import type {
  ColumnDef,
  VisibilityState,
  ColumnFiltersState,
  SortingState,
  OnChangeFn,
  PaginationState,
  ExpandedState,
  Row,
} from "@tanstack/react-table";
import { DragDropProvider, DragEndEvent } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import Divide from "@/library/Divide";
import Pagination from "@/library/Pagination";
import TableHeader from "./table/TableHeader";
import TableToolbar from "./table/TableToolbar";
import TableBody from "./table/TableBody";
import { FilterField } from "./table/TableFilter";

export interface TableProps<TData> {
  /** Dữ liệu đã fetch từ bên ngoài (qua useTableQuery) */
  data: PaginatedResponse<TData> | undefined;

  /** Định nghĩa các cột */
  columns: ColumnDef<TData>[];

  /** State phân trang (controlled) */
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;

  /** State lọc (controlled) */
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;

  /** State sắp xếp (controlled) */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  /** Hiển thị cột số thứ tự (mặc định: true) */
  showIndex?: boolean;
  /** Hiển thị nút tùy chỉnh ẩn hiện cột (mặc định: true) */
  showVisibilityToggle?: boolean;
  /** Cấu hình các trường lọc */
  filterFields?: FilterField[];
  /** Hiển thị bộ lọc (mặc định: true nếu có filterFields) */
  showFilter?: boolean;
  /** Văn bản hiển thị khi không có dữ liệu */
  emptyText?: string;
  /** Class CSS bổ sung cho container của bảng */
  className?: string;
  /** Class CSS cho các hàng (tr) */
  rowClassName?: string;
  /** Lay cac row con de expand tren client */
  getSubRows?: (row: TData) => TData[] | undefined;
  /** Render hang group full-width; return null/undefined/false de render row theo columns */
  renderGroupRow?: (row: Row<TData>) => ReactNode;
  /** Render nội dung chi tiết bên dưới hàng khi được mở rộng (expand) */
  renderSubComponent?: (row: Row<TData>) => ReactNode;
  /** Expanded mặc định mở */
  defaultExpanded?: ExpandedState;
  /** Callback khi bấm nút thêm (nếu có sẽ hiện nút thêm) */
  onAdd?: () => void;
  /** Nhãn cho nút thêm */
  addLabel?: string;
  /** Callback khi bấm nút cập nhật hàng loạt */
  onBulkUpdate?: () => void;
  /** Nhãn cho nút cập nhật hàng loạt */
  bulkUpdateLabel?: string;
  /** Các node hành động tùy chỉnh hiển thị trên thanh công cụ (vd: nút xuất báo cáo) */
  actions?: ReactNode;
}

const Table = <TData,>({
  data,
  columns: userColumns,
  pagination,
  onPaginationChange,
  columnFilters,
  onColumnFiltersChange,
  sorting,
  onSortingChange,
  showIndex = true,
  filterFields,
  showFilter = true,
  emptyText = "Không có dữ liệu hiển thị",
  className = "",
  rowClassName = "",
  getSubRows,
  renderGroupRow,
  renderSubComponent,
  defaultExpanded = true,
  onAdd,
  addLabel,
  onBulkUpdate,
  bulkUpdateLabel,
  actions,
}: TableProps<TData>) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<ExpandedState>(defaultExpanded);

  const displayData = useMemo(() => data?.data || [], [data]);
  const totalPages = useMemo(() => data?.pagination?.totalPages || 1, [data]);

  const finalColumns = useMemo<ColumnDef<TData>[]>(() => {
    if (!showIndex) return userColumns;

    const indexColumn: ColumnDef<TData> = {
      id: "stt",
      header: "STT",
      size: 70,
      enableSorting: false,
      cell: (info) => {
        return (
          <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500">
            {pagination.pageIndex * pagination.pageSize + info.row.index + 1}
          </span>
        );
      },
    };

    return [indexColumn, ...userColumns];
  }, [showIndex, userColumns, pagination.pageIndex, pagination.pageSize]);

  const table = useReactTable({
    data: displayData,
    columns: finalColumns,
    pageCount: totalPages,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableMultiSort: false,
    state: {
      pagination,
      columnOrder,
      columnVisibility,
      columnFilters,
      sorting,
      expanded,
    },
    onPaginationChange,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange,
    onSortingChange,
    onExpandedChange: setExpanded,
    getSubRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { canceled, source } = event.operation;

      if (canceled) return;

      if (isSortable(source)) {
        const { initialIndex, index } = source;
        if (initialIndex !== index) {
          const currentOrder =
            table.getState().columnOrder.length > 0
              ? [...table.getState().columnOrder]
              : table.getAllLeafColumns().map((col) => col.id);

          const [removed] = currentOrder.splice(initialIndex, 1);
          currentOrder.splice(index, 0, removed);
          table.setColumnOrder(currentOrder);
        }
      }
    },
    [table]
  );

  const handlePageChange = (newPage: number) => {
    onPaginationChange((prev: PaginationState) => ({
      ...prev,
      pageIndex: newPage - 1,
    }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    onPaginationChange((prev: PaginationState) => ({
      ...prev,
      pageSize: newPageSize,
      pageIndex: 0,
    }));
  };

  return (
    <div className="space-y-4">
      {/* table Toolbar */}
      <TableToolbar
        table={table}
        filterFields={filterFields}
        showFilter={showFilter}
        onAdd={onAdd}
        addLabel={addLabel}
        onBulkUpdate={onBulkUpdate}
        bulkUpdateLabel={bulkUpdateLabel}
        actions={actions}
      />

      <DragDropProvider onDragEnd={handleDragEnd}>
        <div
          className={`w-full rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-950 shadow-sm dark:shadow-none transition-colors ${className}`}
        >
          <div className="overflow-x-auto custom-scrollbar relative">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50/50 dark:bg-neutral-900/70">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, index) => (
                      <TableHeader
                        key={header.id}
                        header={header}
                        index={index}
                      />
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                <TableBody
                  table={table}
                  emptyText={emptyText}
                  rowClassName={rowClassName}
                  renderGroupRow={renderGroupRow}
                  renderSubComponent={renderSubComponent}
                />
              </tbody>
            </table>
          </div>

          <Divide className="w-full" />
          <Pagination
            pageIndex={pagination.pageIndex + 1}
            totalPages={totalPages}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </DragDropProvider>
    </div>
  );
};

export default Table;
