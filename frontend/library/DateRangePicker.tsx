"use client";

import { useState, type Ref } from "react";
import { m, AnimatePresence } from "motion/react";
import { HiOutlineCalendar, HiOutlineChevronDown } from "react-icons/hi";
import Popover from "./Popover";
import Typography from "./Typography";
import DayRangePanel from "./date-range-picker/DayRangePanel";
import MonthRangePanel from "./date-range-picker/MonthRangePanel";
import YearRangePanel from "./date-range-picker/YearRangePanel";
import {
  formatDisplay,
  formatValue,
  normalizeRange,
  placeholders,
  popoverWidthStyles,
  type DateParts,
  type DateRangeMode,
  type DateRangeValue,
} from "./date-range-picker/utils";

type InputSize = "sm" | "md" | "lg";

export type { DateRangeMode, DateRangeValue };

export interface DateRangePickerProps {
  label?: string;
  value?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  mode?: DateRangeMode;
  /** Giới hạn khoảng chọn theo đơn vị của mode: ngày / tháng / năm */
  maxRange?: number;
  error?: string;
  size?: InputSize;
  fullWidth?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  required?: boolean;
  placeholder?: string;
  ref?: Ref<HTMLDivElement>;
}

const SEPARATOR = " - ";

const sizeStyles: Record<InputSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-4 text-base",
};

export default function DateRangePicker({
  label,
  value,
  onChange,
  mode = "DD/MM/YYYY",
  maxRange,
  error,
  size = "md",
  fullWidth = true,
  disabled = false,
  isLoading = false,
  required,
  placeholder,
  ref,
}: DateRangePickerProps) {
  const [draftStart, setDraftStart] = useState(value?.startDate ?? "");
  const [draftEnd, setDraftEnd] = useState(value?.endDate ?? "");

  const handleOpenChange = (open: boolean) => {
    if (!open) return;
    setDraftStart(value?.startDate ?? "");
    setDraftEnd(value?.endDate ?? "");
  };

  const handleSelect = (parts: DateParts) => {
    const nextValue = formatValue(parts, mode);
    if (!draftStart || draftEnd) {
      setDraftStart(nextValue);
      setDraftEnd("");
      onChange?.({ startDate: nextValue, endDate: undefined });
      return;
    }

    const nextRange = normalizeRange(draftStart, nextValue, mode);
    setDraftStart(nextRange.startDate);
    setDraftEnd(nextRange.endDate);
    onChange?.(nextRange);
  };

  const renderPanel = () => {
    const props = {
      startDate: draftStart || undefined,
      endDate: draftEnd || undefined,
      maxRange,
      onSelect: handleSelect,
    };

    if (mode === "MM/YYYY") return <MonthRangePanel {...props} />;
    if (mode === "YYYY") return <YearRangePanel {...props} />;
    return <DayRangePanel {...props} />;
  };

  const displayText =
    value?.startDate || value?.endDate
      ? `${formatDisplay(value?.startDate, mode) || placeholders[mode]}${SEPARATOR}${formatDisplay(value?.endDate, mode) || placeholders[mode]}`
      : "";
  const displayPlaceholder =
    placeholder || `${placeholders[mode]}${SEPARATOR}${placeholders[mode]}`;
  const errorStyles = error ? "!border-error-200 hover:!border-error-400" : "";
  const disabledStyles = disabled
    ? "!border-neutral-200 dark:!border-neutral-800 hover:!border-neutral-200 dark:hover:!border-neutral-800 opacity-50 !cursor-not-allowed pointer-events-none"
    : "";

  return (
    <div
      ref={ref}
      className={`${fullWidth ? "w-full" : "inline-flex flex-col"} relative min-w-40 mt-1.5`}
    >
      {label && (
        <Typography
          as="label"
          variant="caption"
          weight="bold"
          color={error ? "error" : "gray"}
          className="absolute -top-2 left-3 z-25 px-1 rounded-md bg-white dark:bg-neutral-950 cursor-text"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Typography>
      )}

      <Popover
        align="left"
        className={fullWidth ? "w-full" : ""}
        targetY={8}
        disabled={disabled}
        isLoading={isLoading}
        onOpenChange={handleOpenChange}
        popoverClassName={`${popoverWidthStyles[mode]} bg-white dark:bg-neutral-950 border-2 border-primary-500 dark:border-neutral-700 p-3 rounded-2xl shadow-xl dark:shadow-black/40 z-50`}
        trigger={(isOpen) => (
          <div
            className={`
              rounded-2xl transition-all duration-200 outline-none flex items-center justify-between cursor-pointer select-none font-medium
              border-2 border-primary-200 dark:border-neutral-700 bg-white dark:bg-neutral-950
              text-neutral-900 dark:text-neutral-100 hover:border-primary-400 dark:hover:border-neutral-500
              ${sizeStyles[size]}
              ${fullWidth ? "w-full" : ""}
              ${errorStyles}
              ${disabledStyles}
              ${isOpen ? "border-primary-500! ring-4 ring-primary-500/10 z-20 relative" : ""}
            `}
          >
            <div className="flex items-center gap-2 truncate">
              <HiOutlineCalendar
                size={18}
                className="text-neutral-400 shrink-0"
              />
              <span
                className={
                  !displayText
                    ? "text-neutral-400 dark:text-neutral-500"
                    : "text-neutral-800 dark:text-neutral-100"
                }
              >
                {displayText || displayPlaceholder}
              </span>
            </div>
            <HiOutlineChevronDown
              size={16}
              className={`text-neutral-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        )}
      >
        <div
          className="flex flex-col gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {renderPanel()}

          {(draftStart || draftEnd) && (
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-1">
              <Typography variant="caption" weight="medium" color="gray">
                {draftEnd ? "Đã chọn khoảng" : "Chọn mốc kết thúc"}
              </Typography>
              <button
                type="button"
                onClick={() => {
                  setDraftStart("");
                  setDraftEnd("");
                  onChange?.({ startDate: undefined, endDate: undefined });
                }}
                className="text-xs font-bold text-neutral-400 dark:text-neutral-500 hover:text-error-500 cursor-pointer"
              >
                Xóa chọn
              </button>
            </div>
          )}
        </div>
      </Popover>

      <AnimatePresence mode="wait">
        {error && (
          <m.div
            key={error}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-0.5 ml-1"
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
