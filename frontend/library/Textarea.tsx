import { useState, type ChangeEvent, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";
import { m, AnimatePresence } from "motion/react";
import Typography from "./Typography";

type TextareaSize = "sm" | "md" | "lg";
type TextareaVariant = "outlined" | "filled";

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /** Nhãn hiển thị phía trên ô nhập liệu */
  label?: string;

  /** Thông báo lỗi hiển thị phía dưới ô nhập liệu (nếu có) */
  error?: string;

  /** Kiểu hiển thị label: true (nằm đè lên viền) hoặc false (nằm phía trên) */
  floatingLabel?: boolean;

  /** Kích thước của ô nhập liệu: sm (nhỏ), md (trung bình), lg (lớn) */
  size?: TextareaSize;

  /** Kiểu hiển thị: outlined (có viền), filled (nền xám) */
  variant?: TextareaVariant;

  /** Icon hiển thị ở phía bên trái */
  prefixIcon?: ReactNode;

  /** Có chiếm toàn bộ chiều ngang của container hay không */
  fullWidth?: boolean;

  /** Trạng thái vô hiệu hóa ô nhập liệu */
  disabled?: boolean;

  /** Trạng thái đang tải (vô hiệu hóa tương tác) */
  isLoading?: boolean;

  /** Hiển thị dấu * bắt buộc */
  required?: boolean;

  /** React 19: ref được truyền trực tiếp như prop, không cần forwardRef. */
  ref?: Ref<HTMLTextAreaElement>;
}

const sizeStyles: Record<TextareaSize, string> = {
  sm: "min-h-20 px-3 py-2 text-sm",
  md: "min-h-28 px-4 py-3 text-sm",
  lg: "min-h-36 px-4 py-3 text-base",
};

export default function Textarea({
  label,
  error,
  size = "md",
  variant = "outlined",
  prefixIcon,
  fullWidth = true,
  className = "",
  id,
  disabled,
  isLoading,
  floatingLabel = true,
  required,
  maxLength,
  value,
  onChange,
  ref,
  ...props
}: TextareaProps) {
  const baseStyles =
    "rounded-xl font-sans transition-all duration-200 outline-none resize-y";

  const variantStyles: Record<TextareaVariant, string> = {
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
  const [currentLength, setCurrentLength] = useState(
    String(value ?? "").length
  );
  const shouldShowCounter = typeof maxLength === "number";

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentLength(event.target.value.length);
    onChange?.(event);
  };

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
          <span className="absolute left-3.5 top-3 text-neutral-400 dark:text-neutral-500 flex items-center pointer-events-none">
            {prefixIcon}
          </span>
        )}
        <textarea
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
              ${shouldShowCounter ? "pb-8" : ""}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              ${className}
            `}
          value={value}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />
        {shouldShowCounter && (
          <span className="pointer-events-none absolute bottom-2 right-3 text-xs font-medium text-neutral-400 dark:text-neutral-500">
            {currentLength}/{maxLength}
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
