"use client";

import type { ReactNode, Ref } from "react";
import { m, AnimatePresence } from "motion/react";
import { HiOutlineChevronDown } from "react-icons/hi";
import Dropdown from "@/library/Dropdown";
import Typography from "./Typography";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import SelectFilter from "@/library/select/SelectFilter";
import SelectOptions from "@/library/select/SelectOption";
type SelectSize = "sm" | "md" | "lg";
type SelectVariant = "outlined" | "filled";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectFilterConfig {
  /** Bật ô lọc trong dropdown */
  enabled: boolean;
  /** client: lọc options hiện có, server: parent tự gọi API rồi truyền lại options */
  mode: "client" | "server";
  /** Callback khi keyword thay đổi, dùng cho server-side filter */
  onChange?: (value: string) => void;
  /** Placeholder của ô lọc */
  placeholder?: string;
}

export interface SelectProps {
  /** Nhãn hiển thị phía trên ô select */
  label?: string;
  /** Thông báo lỗi hiển thị phía dưới ô select (nếu có) */
  error?: string;
  /** Kiểu hiển thị label: true (nằm đè lên viền) hoặc false (nằm phía trên) */
  floatingLabel?: boolean;
  /** Kích thước: sm, md, lg */
  size?: SelectSize;
  /** Kiểu hiển thị: outlined, filled */
  variant?: SelectVariant;
  /** Icon hiển thị ở phía bên trái */
  prefixIcon?: ReactNode;
  /** Có chiếm toàn bộ chiều ngang không */
  fullWidth?: boolean;
  /** Vô hiệu hóa */
  disabled?: boolean;
  /** Đang tải */
  isLoading?: boolean;
  /** Danh sách tùy chọn */
  options?: SelectOption[];
  /** Có trang tiếp theo không (cho infinite scroll) */
  hasNextPage?: boolean;
  /** Đang tải trang tiếp theo không */
  isFetchingNextPage?: boolean;
  /** Hàm callback để tải thêm dữ liệu */
  onLoadMore?: () => void;
  /** Giá trị của input */
  value?: string | number | null;
  /** Hàm callback trả về trực tiếp giá trị (thay vì event) */
  onChange?: (value: string | number) => void;
  /** Class CSS tùy chỉnh */
  className?: string;
  /** Chữ mờ khi chưa chọn */
  placeholder?: string;
  /** Số lượng mục tối đa hiển thị trước khi có thanh cuộn (mặc định: 5) */
  maxVisibleItems?: number;
  /** Có bắt buộc hay không */
  required?: boolean;
  /** Chữ hiển thị khi không có dữ liệu */
  emptyText?: string;
  /** Cấu hình lọc option trong dropdown */
  filter?: SelectFilterConfig;
  /** React 19: ref được truyền trực tiếp như prop, không cần forwardRef. */
  ref?: Ref<HTMLDivElement>;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-4 text-base",
};

export default function Select({
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
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  value,
  onChange,
  placeholder = "Chọn...",
  maxVisibleItems = 5,
  required,
  emptyText,
  filter,
  ref,
}: SelectProps) {
  const baseStyles =
    "rounded-2xl transition-all duration-200 outline-none flex items-center justify-between cursor-pointer select-none font-medium";

  const variantStyles: Record<SelectVariant, string> = {
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

  const selectedOption = options.find(
    (opt) => String(opt.value) === String(value)
  );
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const setSentinelRef = useInfiniteScroll({
    callback: onLoadMore || (() => {}),
    hasNextPage,
    isFetching: isFetchingNextPage,
    rootMargin: "20px",
  });

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

      <Dropdown
        align="left"
        className={fullWidth ? "w-full" : ""}
        targetY={0}
        fullwidth={true}
        disabled={disabled}
        isLoading={isLoading}
        dropdownClassName={(placement) => `
            bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 p-1.5 shadow-xl shadow-neutral-200/60 dark:shadow-black/40
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
                ${
                  isOpen
                    ? `border-primary-400 dark:border-primary-500 z-20 relative
                   ${placement === "bottom" ? "rounded-b-none" : "rounded-t-none"}`
                    : ""
                }
                ${className}
              `}
          >
            <div className="flex items-center gap-2 truncate">
              {prefixIcon && (
                <span className="text-neutral-400 dark:text-neutral-500">
                  {prefixIcon}
                </span>
              )}
              <span
                className={
                  selectedOption
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-400 dark:text-neutral-500"
                }
              >
                {displayValue}
              </span>
            </div>
            <HiOutlineChevronDown
              size={18}
              className={`text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        )}
      >
        {/*Nếu có filter thì sử dụng SelectFilter */}
        {filter?.enabled ? (
          <SelectFilter
            filter={filter}
            options={options}
            renderOptions={(visibleOptions) => (
              <SelectOptions
                visibleOptions={visibleOptions}
                value={value}
                maxVisibleItems={maxVisibleItems}
                emptyText={emptyText}
                isFetchingNextPage={isFetchingNextPage}
                setSentinelRef={setSentinelRef}
                onChange={onChange}
              />
            )}
          />
        ) : (
          <SelectOptions
            visibleOptions={options}
            value={value}
            maxVisibleItems={maxVisibleItems}
            emptyText={emptyText}
            isFetchingNextPage={isFetchingNextPage}
            setSentinelRef={setSentinelRef}
            onChange={onChange}
          />
        )}
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
