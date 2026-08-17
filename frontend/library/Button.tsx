import type { ButtonHTMLAttributes, ElementType, Ref } from "react";
import { HiOutlineRefresh } from "react-icons/hi";

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Kích thước nút: sm (nhỏ), md (vừa), lg (lớn) */
  size?: ButtonSize;

  /** Biểu diễn màu sắc/kiểu dáng: primary, secondary, outline, ghost, danger */
  variant?: ButtonVariant;

  /** Có chiếm toàn bộ chiều ngang container hay không */
  fullWidth?: boolean;

  /** Trạng thái đang tải (hiển thị spinner nếu có và vô hiệu hóa nút) */
  isLoading?: boolean;

  /** Vị trí hiển thị icon so với văn bản */
  iconPlacement?: "left" | "right";

  /** Icon component (từ react-icons, ví dụ: HiOutlinePlus) */
  icon?: ElementType;

  /** Class CSS tùy chỉnh cho icon */
  iconClassName?: string;
  /** React 19: ref được truyền trực tiếp như prop, không cần forwardRef. */
  ref?: Ref<HTMLButtonElement>;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary-600 text-white border border-primary-600
    hover:bg-primary-700 hover:border-primary-700
    active:bg-primary-800
  `,
  secondary: `
    bg-secondary-100 text-secondary-800 border border-secondary-200
    hover:bg-secondary-200 hover:border-secondary-300
    active:bg-secondary-300
  `,
  outline: `
    bg-transparent text-primary-700 border border-primary-300
    hover:bg-primary-50 hover:border-primary-400
    active:bg-primary-100
  `,
  ghost: `
    bg-transparent text-neutral-700 border border-neutral-300
    hover:bg-neutral-50
    active:bg-neutral-100
  `,
  danger: `
    bg-error-500 text-white border border-error-500
    hover:bg-error-600 hover:border-error-600
    active:bg-error-700
  `,
};

export default function Button({
  size = "md",
  variant = "primary",
  fullWidth = false,
  isLoading = false,
  iconPlacement = "left",
  icon: Icon,
  iconClassName = "",
  children,
  disabled,
  className = "",
  ref,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const iconSize = size === "sm" ? 16 : size === "md" ? 18 : 20;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={`
          inline-flex items-center justify-center
          rounded-xl font-semibold font-sans
          transition-all duration-200
          select-none
          outline-none
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${fullWidth ? "w-full" : ""}
          ${isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
      {...props}
    >
      {isLoading && iconPlacement === "left" && (
        <HiOutlineRefresh
          size={iconSize}
          className="shrink-0 animate-spin"
          aria-hidden="true"
        />
      )}
      {!isLoading && Icon && iconPlacement === "left" && (
        <Icon size={iconSize} className={`shrink-0 ${iconClassName}`} />
      )}
      {children}
      {!isLoading && Icon && iconPlacement === "right" && (
        <Icon size={iconSize} className={`shrink-0 ${iconClassName}`} />
      )}
      {isLoading && iconPlacement === "right" && (
        <HiOutlineRefresh
          size={iconSize}
          className="shrink-0 animate-spin"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
