"use client";

import React from "react";
import { m } from "motion/react";
import { Table } from "@tanstack/react-table";

interface TableEmptyStateProps<TData> {
  table: Table<TData>;
  emptyText: string;
}

const TableEmptyState = <TData,>({
  table,
  emptyText,
}: TableEmptyStateProps<TData>) => {
  return (
    <m.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <td
        colSpan={table.getAllColumns().length}
        className="px-6 py-24 text-center bg-white dark:bg-neutral-950 transition-colors"
      >
        <div className="flex flex-col items-center gap-4 text-neutral-300 dark:text-neutral-700">
          <div className="size-20 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
            <svg
              className="size-10 opacity-20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-base font-black text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
              {emptyText}
            </p>
            <p className="text-sm font-medium italic text-neutral-400 dark:text-neutral-500">
              Vui lòng kiểm tra lại bộ lọc hoặc dữ liệu đầu vào
            </p>
          </div>
        </div>
      </td>
    </m.tr>
  );
};

export default TableEmptyState;
