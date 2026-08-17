"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Table } from "@tanstack/react-table";
import { HiOutlineAdjustments, HiOutlineFilter, HiOutlinePlus, HiOutlineUpload } from "react-icons/hi";
import TableFilter, { FilterField } from "./TableFilter";
import Button from "@/library/Button";

interface TableToolbarProps<TData> {
  /** Thao tác với bảng từ TanStack table */
  table: Table<TData>;
  /** Cấu hình các trường lọc */
  filterFields?: FilterField[];
  /** Hiển thị bộ lọc (mặc định: true nếu có filterFields) */
  showFilter?: boolean;
  /** Callback khi bấm nút thêm */
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

const TableToolbar = <TData,>({
  table,
  filterFields,
  showFilter = true,
  onAdd,
  addLabel,
  onBulkUpdate,
  bulkUpdateLabel,
  actions,
}: TableToolbarProps<TData>) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col px-2">
      <div className="flex flex-row items-center justify-end gap-2 mb-4 flex-wrap">
        {actions}

        {onBulkUpdate && (
          <Button
            type="button"
            onClick={onBulkUpdate}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-500 border border-secondary-500 rounded-xl text-[11px]! font-black! uppercase tracking-wider text-white hover:bg-secondary-600 hover:border-secondary-600 transition-all shadow-lg shadow-secondary-500/20 cursor-pointer active:scale-95 h-auto"
            icon={HiOutlineUpload}
            iconClassName="text-white"
          >
            {bulkUpdateLabel || "Cập nhật hàng loạt"}
          </Button>
        )}

        {onAdd && (
          <Button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 border border-primary-600 rounded-xl text-[11px]! font-black! uppercase tracking-wider text-white hover:bg-primary-700 hover:border-primary-700 transition-all shadow-lg shadow-primary-600/20 cursor-pointer active:scale-95 h-auto"
            icon={HiOutlinePlus}
          >
            {addLabel || "Thêm mới"}
          </Button>
        )}

        {showFilter && filterFields && filterFields.length > 0 && (
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-sm dark:shadow-none border cursor-pointer ${isFilterOpen
              ? "bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-300"
              : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              }`}
          >
            <HiOutlineFilter
              size={16}
              className={isFilterOpen ? "text-primary-500 dark:text-primary-300" : "text-neutral-400 dark:text-neutral-500"}
            />
            Bộ lọc
          </button>
        )}

        <div className="relative group/visibility self-start">
          <button className=" cursor-pointer flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-[11px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-sm dark:shadow-none">
            <HiOutlineAdjustments size={16} className="text-neutral-400 dark:text-neutral-500" />
            Cột hiển thị
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-2xl shadow-neutral-200/50 dark:shadow-black/40 p-2 opacity-0 invisible group-hover/visibility:opacity-100 group-hover/visibility:visible transition-all z-50 transform origin-top-right group-hover/visibility:translate-y-0 translate-y-2">
            <div className="px-3 py-2 border-b border-neutral-50 dark:border-neutral-800 mb-1">
              <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                Tùy chỉnh hiển thị
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-0.5 px-1">
              {table.getAllLeafColumns().map((column) => {
                if (column.id === "stt" || column.id === "actions") return null;
                return (
                  <label
                    key={column.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors group/item"
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        className="peer appearance-none size-5 border-2 border-neutral-100 dark:border-neutral-700 rounded-lg checked:bg-primary-500 checked:border-primary-500 transition-all cursor-pointer"
                      />
                      <svg
                        className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={4}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 group-hover/item:text-neutral-900 dark:group-hover/item:text-neutral-100 transition-colors capitalize">
                      {typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showFilter && filterFields && filterFields.length > 0 && (
        <TableFilter
          table={table}
          fields={filterFields}
          isOpen={isFilterOpen}
        />
      )}
    </div>
  );
};

export default TableToolbar;
