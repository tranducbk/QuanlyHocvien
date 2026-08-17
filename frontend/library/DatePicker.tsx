"use client";

import { useState, useMemo } from "react";
import type { Ref } from "react";
import { m, AnimatePresence } from "motion/react";
import {
  HiOutlineCalendar,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDown,
} from "react-icons/hi";
import Dropdown from "@/library/Dropdown";
import Typography from "./Typography";

type DatePickerSize = "sm" | "md" | "lg";
type DatePickerVariant = "outlined" | "filled";

export interface DatePickerProps {
  /** Nhãn hiển thị phía trên */
  label?: string;
  /** Thông báo lỗi */
  error?: string;
  /** Kiểu hiển thị label: true (nằm đè lên viền) hoặc false (nằm phía trên) */
  floatingLabel?: boolean;
  /** Kích thước: sm, md, lg */
  size?: DatePickerSize;
  /** Kiểu hiển thị: outlined, filled */
  variant?: DatePickerVariant;
  /** Có chiếm toàn bộ chiều ngang không */
  fullWidth?: boolean;
  /** Vô hiệu hóa */
  disabled?: boolean;
  /** Đang tải */
  isLoading?: boolean;
  /** Giá trị hiện tại (YYYY-MM-DD) */
  value?: string | null;
  /** Hàm callback khi thay đổi ngày */
  onChange?: (value: string) => void;
  /** Class CSS tùy chỉnh */
  className?: string;
  /** Chữ mờ khi chưa chọn */
  placeholder?: string;
  /** Có bắt buộc hay không */
  required?: boolean;
  /** React 19: ref được truyền trực tiếp như prop, không cần forwardRef. */
  ref?: Ref<HTMLDivElement>;
}

const sizeStyles: Record<DatePickerSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-4 text-base",
};

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export default function DatePicker({
  label,
  error,
  size = "md",
  variant = "outlined",
  fullWidth = true,
  className = "",
  disabled,
  isLoading,
  floatingLabel = true,
  value,
  onChange,
  placeholder = "Chọn ngày...",
  required,
  ref,
}: DatePickerProps) {
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const dateStr = value.split("T")[0];
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]) - 1;
        const d = parseInt(parts[2]);
        return new Date(y, m, d);
      }
    }

    return new Date();
  });
  const [viewMode, setViewMode] = useState<"calendar" | "year">("calendar");

  const selectedDateParts = useMemo(() => {
    if (!value) return null;
    const dateStr = value.split("T")[0];
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    return {
      year: parseInt(parts[0]),
      month: parseInt(parts[1]) - 1,
      day: parseInt(parts[2]),
    };
  }, [value]);

  const baseStyles =
    "rounded-2xl transition-all duration-200 outline-none flex items-center justify-between cursor-pointer select-none font-medium";

  const variantStyles: Record<DatePickerVariant, string> = {
    outlined: `
        border-2 border-primary-200 dark:border-neutral-700 bg-white dark:bg-neutral-950
        text-neutral-900 dark:text-neutral-100 hover:border-primary-400 dark:hover:border-neutral-500
      `,
    filled: `
        border border-transparent bg-neutral-50 dark:bg-neutral-900
        text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800
      `,
  };

  const errorStyles = error ? "!border-error-200 hover:!border-error-400" : "";
  const disabledStyles =
    disabled || isLoading
      ? "!border-neutral-200 dark:!border-neutral-800 hover:!border-neutral-200 dark:hover:!border-neutral-800 opacity-50 !cursor-not-allowed pointer-events-none"
      : "";

  // Calendar generation logic
  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);

    const days = [];

    // Prev month days
    const prevMonthTotalDays = daysInMonth(year, month - 1);
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        day: prevMonthTotalDays - i,
        month: month - 1,
        year,
        currentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        month,
        year,
        currentMonth: true,
      });
    }

    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        month: month + 1,
        year,
        currentMonth: false,
      });
    }

    return days;
  };

  const handleDateSelect = (day: number, month: number, year: number) => {
    const formatted = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    onChange?.(formatted);
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + direction,
      1
    );
    setViewDate(newDate);
  };

  const formatDisplayDate = (val?: string | null) => {
    if (!val) return placeholder;
    const dateStr = val.split("T")[0];
    const parts = dateStr.split("-");
    if (parts.length !== 3) return placeholder;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    const endYear = currentYear + 20;
    const result = [];
    for (let y = endYear; y >= startYear; y--) {
      result.push(y);
    }
    return result;
  }, []);

  return (
    <div
      className={`${fullWidth ? "w-full" : "inline-flex flex-col"} relative min-w-40 ${floatingLabel ? "mt-1.5" : ""}`}
      ref={ref}
    >
      {label && (
        <Typography
          as="label"
          variant={floatingLabel ? "caption" : "body"}
          weight={floatingLabel ? "bold" : "semibold"}
          color={error ? "error" : floatingLabel ? "gray" : "neutral"}
          className={
            floatingLabel
              ? "absolute -top-2 left-3 z-25 px-1 rounded-md bg-white dark:bg-neutral-950 cursor-text"
              : "block mb-1.5 ml-1"
          }
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Typography>
      )}

      <Dropdown
        align="left"
        className={fullWidth ? "w-full" : ""}
        targetY={8}
        dropdownClassName={
          "w-80 bg-white dark:bg-neutral-950 border-2 border-primary-500 dark:border-neutral-700 p-3 rounded-2xl shadow-xl dark:shadow-black/40 z-50"
        }
        trigger={(isOpen) => (
          <div
            className={`
                ${baseStyles}
                ${sizeStyles[size]}
                ${variantStyles[variant]}
                ${fullWidth ? "w-full" : ""}
                ${errorStyles}
                ${disabledStyles}
                ${isOpen ? "border-primary-500! ring-4 ring-primary-500/10 z-20 relative" : ""}
                ${className}
              `}
          >
            <div className="flex items-center gap-2 truncate">
              <HiOutlineCalendar
                size={18}
                className="text-neutral-400 shrink-0"
              />
              <span
                className={!value ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-800 dark:text-neutral-100"}
              >
                {formatDisplayDate(value)}
              </span>
            </div>
            <HiOutlineChevronDown
              size={16}
              className={`text-neutral-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        )}
      >
        <div className="flex flex-col gap-3">
          {viewMode === "calendar" ? (
            <>
              {/* Calendar Header */}
              <div
                className="flex items-center justify-between px-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode("year");
                  }}
                  className="flex items-center gap-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 px-2 py-1 rounded-lg transition-colors group cursor-pointer"
                >
                  <Typography variant="body" weight="bold" color="neutral">
                    {MONTHS[viewDate.getMonth()]}, {viewDate.getFullYear()}
                  </Typography>
                  <HiOutlineChevronDown
                    size={14}
                    className="text-neutral-400 group-hover:text-primary-500 transition-colors"
                  />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateMonth(-1);
                    }}
                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
                  >
                    <HiOutlineChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateMonth(1);
                    }}
                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
                  >
                    <HiOutlineChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Weekdays */}
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
                onClick={(e) => e.stopPropagation()}
              >
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center py-2">
                    <Typography variant="caption" weight="bold" color="gray">
                      {day}
                    </Typography>
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}
              >
                {generateCalendarDays().map((dateObj, idx) => {
                  const isSelected =
                    selectedDateParts &&
                    selectedDateParts.day === dateObj.day &&
                    selectedDateParts.month === dateObj.month &&
                    selectedDateParts.year === dateObj.year;

                  const isToday =
                    new Date().getDate() === dateObj.day &&
                    new Date().getMonth() === dateObj.month &&
                    new Date().getFullYear() === dateObj.year;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleDateSelect(
                          dateObj.day,
                          dateObj.month,
                          dateObj.year
                        );
                      }}
                      className={`
                          aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer
                          ${!dateObj.currentMonth ? "text-neutral-300 dark:text-neutral-700" : "text-neutral-700 dark:text-neutral-200 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-300"}
                          ${isSelected ? "bg-primary-500! text-white! shadow-md shadow-primary-200 dark:shadow-primary-950/40 scale-110 z-10" : ""}
                          ${isToday && !isSelected ? "border border-primary-500 text-primary-600 dark:text-primary-300" : ""}
                        `}
                    >
                      {dateObj.day}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Year Selection View */}
              <div className="flex items-center justify-between mb-2">
                <Typography variant="body" weight="bold">
                  Chọn năm
                </Typography>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode("calendar");
                  }}
                  className="text-xs font-bold text-primary-600 hover:underline cursor-pointer"
                >
                  Quay lại
                </button>
              </div>
              <div
                className="grid gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1"
                style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
                onClick={(e) => e.stopPropagation()}
              >
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewDate(new Date(y, viewDate.getMonth(), 1));
                      setViewMode("calendar");
                    }}
                    className={`
                        py-2 rounded-xl text-sm font-bold transition-all cursor-pointer
                        ${y === viewDate.getFullYear() ? "bg-primary-500 text-white" : "bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"}
                      `}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Quick Actions */}
          {viewMode === "calendar" && value && (
            <div
              className="flex items-center justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.("");
                }}
                className="text-xs font-bold text-neutral-400 dark:text-neutral-500 hover:text-error-500 cursor-pointer"
              >
                Xóa chọn
              </button>
            </div>
          )}
        </div>
      </Dropdown>

      <AnimatePresence>
        {error && (
          <m.div
            key={error}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 ml-1"
          >
            <Typography variant="caption" weight="medium" color="error">
              {error}
            </Typography>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
