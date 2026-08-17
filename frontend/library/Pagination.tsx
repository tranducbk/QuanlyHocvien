"use client";

import React, { useEffect } from "react";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from "react-icons/hi";

import Select from "@/library/Select";
import { DEFAULT_PAGE } from "@/constants/constants";

export interface PaginationProps {
  /** Trang hiện tại (bắt đầu từ 1) */
  pageIndex: number;
  /** Tổng số trang */
  totalPages: number;
  /** Số lượng bản ghi trên mỗi trang */
  pageSize: number;
  /** Hàm xử lý khi thay đổi trang */
  onPageChange: (pageIndex: number) => void;
  /** Hàm xử lý khi thay đổi số lượng hiển thị trên mỗi trang */
  onPageSizeChange: (pageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pageIndex,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  // Bắt sự kiện phím sang trái/phải để chuyển trang
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Chỉ bắt sự kiện nếu không đang tập trung vào các ô nhập liệu
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (isInput) return;

      if (e.key === "ArrowLeft") {
        if (pageIndex > 1) onPageChange(pageIndex - 1);
      } else if (e.key === "ArrowRight") {
        if (pageIndex < totalPages) onPageChange(pageIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageIndex, totalPages, onPageChange]);

  const getPages = () => {
    const pages = [];
    const start = Math.max(1, pageIndex - 2);
    const end = Math.min(totalPages, pageIndex + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPages();

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-3 bg-neutral-50/50 dark:bg-neutral-950/80 border-t border-transparent dark:border-neutral-800 transition-colors">
      {/* Phần chọn số lượng hiển thị */}
      <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 justify-start">
        <div className="text-neutral-400 dark:text-neutral-500 uppercase tracking-widest text-[10px] flex-1">
          Số hàng mỗi trang
        </div>
        <Select
          size="sm"
          className="font-black"
          value={pageSize}
          fullWidth={false}
          onChange={(value) => onPageSizeChange(Number(value))}
          options={[
            { value: 10, label: "10" },
            { value: 20, label: "20" },
            { value: 50, label: "50" },
            { value: 100, label: "100" },
          ]}
        />
      </div>

      {/* Phần điều hướng trang */}
      <div className="flex items-center gap-2">
        {/* Nút về đầu */}
        <button
          onClick={() => onPageChange(1)}
          disabled={pageIndex === DEFAULT_PAGE.PAGE_INDEX + 1}
          className="size-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Trang đầu"
        >
          <HiOutlineChevronDoubleLeft size={16} />
        </button>

        <button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 1}
          className="size-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <HiOutlineChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p) => (
            <PageButton
              key={p}
              num={p}
              active={p === pageIndex}
              onClick={onPageChange}
            />
          ))}
        </div>

        <button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex >= totalPages}
          className="size-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <HiOutlineChevronRight size={16} />
        </button>

        {/* Nút đến cuối */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={pageIndex >= totalPages}
          className="size-8 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 disabled:opacity-30 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Trang cuối"
        >
          <HiOutlineChevronDoubleRight size={16} />
        </button>

        <div className="hidden lg:block ml-4 text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em]">
          {pageIndex} / {totalPages}
        </div>
      </div>
    </div>
  );
};

interface PageButtonProps {
  num: number;
  active: boolean;
  onClick: (p: number) => void;
}

const PageButton: React.FC<PageButtonProps> = ({ num, active, onClick }) => (
  <button
    onClick={() => onClick(num)}
    className={`
      size-8 flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer
      ${active
        ? "bg-primary-600 text-white font-semibold shadow-sm shadow-primary-600/20"
        : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
      }
    `}
  >
    {num}
  </button>
);

export default Pagination;
