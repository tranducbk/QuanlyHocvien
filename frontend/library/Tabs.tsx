"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "motion/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Typography from "./Typography";

export interface TabItem {
  /** ID duy nhất của tab */
  id: string;
  /** Nhãn hiển thị trên thanh điều hướng tab */
  label: string;
  /** Icon hiển thị cạnh nhãn (tùy chọn) */
  icon?: React.ReactNode;
  /** Nội dung hiển thị khi tab được chọn */
  content: React.ReactNode;
}

interface TabsProps {
  /** Danh sách các tab */
  tabs: TabItem[];
  /** ID của tab đang hoạt động */
  activeTab: string;
  /** Hàm callback khi thay đổi tab */
  onChange: (id: string) => void;
  /** Kiểu hiển thị: pills (dạng nút bo tròn) hoặc underline (dạng gạch chân) */
  variant?: "pills" | "underline";
  /** Có chiếm toàn bộ chiều ngang không */
  fullWidth?: boolean;
  /** Class CSS tùy chỉnh */
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "pills",
  fullWidth = false,
  className = "",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    return () => observer.disconnect();
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.5;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="relative flex items-center">
        {(canScrollLeft || canScrollRight) && (
          <button
            onClick={() => scroll("left")}
            className="flex items-center justify-center size-9 shrink-0 bg-white dark:bg-neutral-800 rounded-full shadow-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <FiChevronLeft size={18} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className={`
            flex p-1 gap-1 overflow-x-auto no-scrollbar  whitespace-nowrap
            ${variant === "pills" && "bg-neutral-100 dark:bg-neutral-900 rounded-2xl"}
            ${fullWidth ? "w-full" : "w-fit max-w-full"}
          `}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                relative cursor-pointer flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-300 shrink-0
                ${fullWidth ? "flex-1" : ""}
                ${
                  isActive
                    ? variant === "pills"
                      ? "text-primary-700 dark:text-primary-300"
                      : "text-primary-600 dark:text-primary-400"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                }
              `}
              >
                {isActive && variant === "pills" && (
                  <m.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm dark:shadow-none border border-neutral-200/50 dark:border-neutral-700"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-2">
                  {tab.icon && <span>{tab.icon}</span>}
                  <Typography variant="body" weight="bold" color="inherit">
                    {tab.label}
                  </Typography>
                </div>

                {isActive && variant === "underline" && (
                  <m.div
                    layoutId="active-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  />
                )}
              </button>
            );
          })}
        </div>

        {(canScrollLeft || canScrollRight) && (
          <button
            onClick={() => scroll("right")}
            className="flex items-center justify-center size-9 shrink-0 bg-white dark:bg-neutral-800 rounded-full shadow-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <FiChevronRight size={18} />
          </button>
        )}
      </div>

      <div className="relative overflow-hidden min-h-[100px]">
        <AnimatePresence mode="wait">
          <m.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {tabs.find((t) => t.id === activeTab)?.content}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tabs;
