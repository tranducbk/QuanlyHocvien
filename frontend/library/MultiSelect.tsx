"use client";

import type { ReactNode, Ref } from "react";
import { useMemo } from "react";
import { m, AnimatePresence } from "motion/react";
import { HiOutlineChevronDown, HiOutlineX } from "react-icons/hi";
import Checkbox from "@/library/Checkbox";
import Popover from "@/library/Popover";
import Typography from "./Typography";

type MultiSelectSize = "sm" | "md" | "lg";
type MultiSelectVariant = "outlined" | "filled";

export interface MultiSelectOption {
  value: string | number;
  label: string;
}

export interface MultiSelectProps {
  /** Nhãn hiển thị phía trên ô select */
  label?: string;
  /** Thông báo lỗi hiển thị phía dưới ô select (nếu có) */
  error?: string;
  /** Kiểu hiển thị label: true (nằm đè lên viền) hoặc false (nằm phía trên) */
  floatingLabel?: boolean;
  /** Kích thước: sm, md, lg */
  size?: MultiSelectSize;
  /** Kiểu hiển thị: outlined, filled */
  variant?: MultiSelectVariant;
  /** Icon hiển thị ở phía bên trái */
  prefixIcon?: ReactNode;
  /** Có chiếm toàn bộ chiều ngang không */
  fullWidth?: boolean;
  /** Vô hiệu hóa */
  disabled?: boolean;
  /** Đang tải */
  isLoading?: boolean;
  /** Danh sách tùy chọn */
  options?: MultiSelectOption[];
  /** Các giá trị đang được chọn */
  value?: (string | number)[] | null;
  /** Hàm callback trả về danh sách giá trị mới */
  onChange?: (value: (string | number)[]) => void;
  /** Class CSS tùy chỉnh */
  className?: string;
  /** Chữ mờ khi chưa chọn */
  placeholder?: string;
  /** Số lượng mục tối đa hiển thị trước khi có thanh cuộn (mặc định: 5) */
  maxVisibleItems?: number;
  /** Số chip tối đa hiển thị trên ô trước khi gộp thành "+N" (mặc định: 3) */
  maxTagCount?: number;
  /** Có bắt buộc hay không */
  required?: boolean;
  /** Chữ hiển thị khi không có dữ liệu */
  emptyText?: string;
  /** Ẩn nút "Chọn tất cả" / "Bỏ chọn" ở đầu danh sách */
  hideSelectAll?: boolean;
  /** React 19: ref được truyền trực tiếp như prop, không cần forwardRef. */
  ref?: Ref<HTMLDivElement>;
}

const sizeStyles: Record<MultiSelectSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-4 text-base",
};

export default function MultiSelect({
  label,
  error,
  size = "md",
  variant = "outlined",
  prefixIcon,
  fullWidth = true,
  className = "",
  disabled,
  isLoading,
  floatingLabel = true,
  options = [],
  value,
  onChange,
  placeholder = "Chọn...",
  maxVisibleItems = 5,
  maxTagCount = 3,
  required,
  emptyText,
  hideSelectAll = false,
  ref,
}: MultiSelectProps) {
  const baseStyles =
    "rounded-2xl transition-all duration-200 outline-none flex items-center justify-between gap-2 cursor-pointer select-none font-medium";

  const variantStyles: Record<MultiSelectVariant, string> = {
    outlined: `
        border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950
        text-neutral-900 dark:text-neutral-100 hover:border-primary-300 dark:hover:border-neutral-600
      `,
    filled: `
        border border-transparent bg-neutral-50 dark:bg-neutral-900
        text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800
      `,
  };

  const errorStyles = error
    ? "!border-error-300 dark:!border-error-500/60 hover:!border-error-400 focus:!border-error-500"
    : "";
  const disabledStyles = disabled
    ? "!border-neutral-200 dark:!border-neutral-800 hover:!border-neutral-200 dark:hover:!border-neutral-800 opacity-50 !cursor-not-allowed pointer-events-none"
    : "";

  const selectedValues = useMemo(() => value ?? [], [value]);

  const selectedSet = useMemo(
    () => new Set(selectedValues.map((v) => String(v))),
    [selectedValues]
  );

  const selectedOptions = useMemo(
    () => options.filter((opt) => selectedSet.has(String(opt.value))),
    [options, selectedSet]
  );

  const allSelected = options.length > 0 && selectedSet.size >= options.length;

  const toggleValue = (optionValue: string | number) => {
    if (selectedSet.has(String(optionValue))) {
      onChange?.(
        selectedValues.filter((v) => String(v) !== String(optionValue))
      );
    } else {
      onChange?.([...selectedValues, optionValue]);
    }
  };

  const toggleAll = () => {
    onChange?.(allSelected ? [] : options.map((opt) => opt.value));
  };

  const visibleTags = selectedOptions.slice(0, maxTagCount);
  const hiddenCount = selectedOptions.length - visibleTags.length;

  return (
    <div
      className={`${fullWidth ? "w-full" : "inline-flex flex-col"} relative min-w-20 ${floatingLabel ? "mt-1.5" : ""}`}
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
          {required && (
            <span className="text-error-500 dark:text-error-400 ml-0.5">*</span>
          )}
        </Typography>
      )}

      <Popover
        align="left"
        fullwidth
        targetY={0}
        disabled={disabled}
        isLoading={isLoading}
        className={fullWidth ? "w-full" : ""}
        popoverClassName={(placement) => `
            bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800
            p-1.5 shadow-xl shadow-neutral-200/60 dark:shadow-black/40
            ${placement === "bottom" ? "rounded-b-2xl rounded-t-none -mt-[2px]" : "rounded-t-2xl rounded-b-none -mb-[2px]"}
          `}
        trigger={(isOpen, placement) => (
          <div
            className={`
                ${baseStyles}
                ${sizeStyles[size]}
                ${variantStyles[variant]}
                ${fullWidth ? "w-full" : ""}
                ${errorStyles}
                ${disabledStyles}
                py-1.5
                ${
                  isOpen
                    ? `border-primary-400 dark:border-primary-500 z-20 relative
                       ${placement === "bottom" ? "rounded-b-none" : "rounded-t-none"}`
                    : ""
                }
                ${className}
              `}
          >
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
              {prefixIcon && (
                <span className="shrink-0 text-neutral-400 dark:text-neutral-500">
                  {prefixIcon}
                </span>
              )}
              {selectedOptions.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5 py-0.5">
                  {visibleTags.map((opt) => (
                    <span
                      key={opt.value}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
                    >
                      {opt.label}
                      {!disabled && (
                        <HiOutlineX
                          size={13}
                          className="shrink-0 cursor-pointer transition-opacity hover:opacity-70"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleValue(opt.value);
                          }}
                        />
                      )}
                    </span>
                  ))}
                  {hiddenCount > 0 && (
                    <span className="inline-flex items-center rounded-lg bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      +{hiddenCount}
                    </span>
                  )}
                </div>
              ) : (
                <span className="truncate text-neutral-400 dark:text-neutral-500">
                  {placeholder}
                </span>
              )}
            </div>
            <HiOutlineChevronDown
              size={18}
              className={`shrink-0 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        )}
      >
        {!hideSelectAll && options.length > 0 && (
          <div
            onClick={toggleAll}
            className="mb-1 flex h-10 cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-500/15"
          >
            <Checkbox
              checked={allSelected}
              indeterminate={selectedSet.size > 0 && !allSelected}
            />
            <span className="flex-1">
              {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </span>
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500">
              {selectedSet.size}/{options.length}
            </span>
          </div>
        )}

        <div
          style={{
            maxHeight: `${maxVisibleItems * 40 + (maxVisibleItems - 1) * 4}px`,
          }}
          className="overflow-auto custom-scrollbar"
        >
          <div className="flex min-w-0 flex-col gap-1.5 text-neutral-900 dark:text-neutral-100">
            {options.length > 0 ? (
              options.map((opt) => {
                const isSelected = selectedSet.has(String(opt.value));
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleValue(opt.value)}
                    className={`relative flex h-10 cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-semibold transition-all ${
                      isSelected
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    <Checkbox checked={isSelected} />
                    <span className="truncate">{opt.label}</span>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-sm text-neutral-400 dark:text-neutral-500">
                {emptyText || "Không tìm thấy dữ liệu"}
              </div>
            )}
          </div>
        </div>
      </Popover>

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
