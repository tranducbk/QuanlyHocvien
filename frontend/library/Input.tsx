import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { m, AnimatePresence } from "motion/react";
import Typography from "./Typography";

type InputSize = "sm" | "md" | "lg";
type InputVariant = "outlined" | "filled";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  /** Nhãn hiển thị phía trên ô nhập liệu */
  label?: string;

  /** Thông báo lỗi hiển thị phía dưới ô nhập liệu (nếu có) */
  error?: string;

  /** Kiểu hiển thị label: true (nằm đè lên viền) hoặc false (nằm phía trên) */
  floatingLabel?: boolean;

  /** Kích thước của ô nhập liệu: sm (nhỏ), md (trung bình), lg (lớn) */
  size?: InputSize;

  /** Kiểu hiển thị: outlined (có viền), filled (nền xám) */
  variant?: InputVariant;

  /** Icon hiển thị ở phía bên trái */
  prefixIcon?: ReactNode;

  /** Icon hiển thị ở phía bên phải (thường dùng cho nút ẩn/hiện mật khẩu) */
  suffixIcon?: ReactNode;

  /** Có chiếm toàn bộ chiều ngang của container hay không */
  fullWidth?: boolean;

  /** Trạng thái vô hiệu hóa ô nhập liệu */
  disabled?: boolean;

  /** Trạng thái đang tải (vô hiệu hóa tương tác) */
  isLoading?: boolean;

  /** Hiển thị dấu * bắt buộc */
  required?: boolean;

  /** React 19: ref được truyền trực tiếp như prop, không cần forwardRef. */
  ref?: Ref<HTMLInputElement>;
}

const sizeStyles: Record<InputSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-4 text-base",
};

export default function Input({
  label,
  error,
  size = "md",
  variant = "outlined",
  prefixIcon,
  suffixIcon,
  fullWidth = true,
  className = "",
  id,
  disabled,
  isLoading,
  floatingLabel = true,
  required,
  ref,
  ...props
}: InputProps) {
  const baseStyles =
    "rounded-xl font-sans transition-all duration-200 outline-none appearance-none";

  const variantStyles: Record<InputVariant, string> = {
    outlined: `
        border-2 border-primary-200 dark:border-neutral-700 bg-white dark:bg-neutral-950
        text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500
        hover:border-primary-400 dark:hover:border-neutral-600
        focus:border-primary-500 dark:focus:border-primary-500
      `,
    filled: `
        border border-transparent bg-neutral-50 dark:bg-neutral-900
        text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500
        hover:bg-neutral-100 dark:hover:bg-neutral-800
        focus:bg-white dark:focus:bg-neutral-950 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
      `,
  };

  const errorStyles = error
    ? "!border-error-200 dark:!border-error-500/60 hover:!border-error-400 focus:!border-error-500"
    : "";

  const disabledStyles = disabled
    ? "!border-neutral-200 dark:!border-neutral-800 hover:!border-neutral-200 dark:hover:!border-neutral-800 focus:!border-neutral-200 dark:focus:!border-neutral-800"
    : "";

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <div
      className={`${fullWidth ? "w-full" : "inline-flex flex-col"} relative ${floatingLabel ? "mt-1.5" : ""}`}
    >
      {label && (
        <Typography
          as="label"
          variant={floatingLabel ? "caption" : "body"}
          weight={floatingLabel ? "bold" : "semibold"}
          color={error ? "error" : floatingLabel ? "gray" : "neutral"}
          className={
            floatingLabel
              ? "absolute -top-2 left-3 z-10 px-1 rounded-md bg-white dark:bg-neutral-950 cursor-text"
              : "block mb-1.5 ml-1"
          }
          htmlFor={id}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Typography>
      )}
      <div className="relative">
        {prefixIcon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 flex items-center pointer-events-none">
            {prefixIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          disabled={disabled || isLoading}
          className={`
              ${baseStyles}
              ${sizeStyles[size]}
              ${variantStyles[variant]}
              ${errorStyles}
              ${disabledStyles}
              ${widthStyles}
              ${prefixIcon ? "pl-10!" : ""}
              ${suffixIcon ? "pr-10!" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className}
            `}
          {...props}
        />
        {suffixIcon && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 flex items-center">
            {suffixIcon}
          </span>
        )}
      </div>
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
