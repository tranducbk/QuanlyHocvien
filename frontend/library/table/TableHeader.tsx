"use client";

import { Header, flexRender } from "@tanstack/react-table";
import { useSortable } from "@dnd-kit/react/sortable";

interface HeaderProps<TData> {
  header: Header<TData, unknown>;
  index: number;
}

const TableHeader = <TData,>({ header, index }: HeaderProps<TData>) => {
  const { ref, handleRef, isDragSource } = useSortable({
    id: header.column.id,
    index,
  });

  const isSorted = header.column.getIsSorted();

  return (
    <th
      ref={ref}
      colSpan={header.colSpan}
      className={`p-2 py-4 text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest first:pl-4 transition-colors
        ${isDragSource ? "bg-primary-50/80 dark:bg-primary-500/10 opacity-60" : "hover:bg-neutral-50/50 dark:hover:bg-neutral-900/60"}
      `}
    >
      {header.isPlaceholder ? null : (
        <div className="flex items-center gap-2">
          {/* Vùng nắm để kéo thả */}
          <div
            ref={handleRef}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1"
          >
            <div className="w-1 h-4 border-l-2 border-dotted border-neutral-300 dark:border-neutral-700" />
          </div>

          {/* Vùng bấm để sắp xếp */}
          <div
            className={`flex items-center gap-2 flex-1 ${
              header.column.getCanSort()
                ? "cursor-pointer select-none group/sort hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                : ""
            }`}
            onClick={() => {
              if (header.column.getCanSort()) {
                header.column.toggleSorting();
              }
            }}
          >
            <span className="truncate">
              {flexRender(header.column.columnDef.header, header.getContext())}
            </span>

            {header.column.getCanSort() && (
              <div className="flex flex-col shrink-0">
                <svg
                  className={`size-2 -mb-0.5 transition-all ${
                    isSorted === "asc"
                      ? "text-primary-600 dark:text-primary-400 opacity-100"
                      : "text-neutral-300 dark:text-neutral-600 opacity-50 group-hover/sort:opacity-100"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={4}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                <svg
                  className={`size-2 -mt-0.5 transition-all ${
                    isSorted === "desc"
                      ? "text-primary-600 dark:text-primary-400 opacity-100"
                      : "text-neutral-300 dark:text-neutral-600 opacity-50 group-hover/sort:opacity-100"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={4}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}
    </th>
  );
};

export default TableHeader;
