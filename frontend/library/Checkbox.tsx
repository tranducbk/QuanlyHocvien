"use client";

import type { ReactNode } from "react";
import { HiOutlineCheck, HiOutlineMinus } from "react-icons/hi";
import Typography from "./Typography";

type CheckboxSize = "sm" | "md" | "lg";

export interface CheckboxProps {
  /** Trạng thái đã chọn */
  checked: boolean;
  /**
   * Callback khi đổi trạng thái. Bỏ trống để dùng ở chế độ chỉ hiển thị
   * (ví dụ nhúng trong một hàng đã có sẵn sự kiện click ở phần tử cha).
   */
  onChange?: (checked: boolean) => void;
  /** Trạng thái chọn một phần (hiển thị dấu gạch ngang) */
  indeterminate?: boolean;
  /** Vô hiệu hóa */
  disabled?: boolean;
  /** Kích thước: sm, md, lg */
  size?: CheckboxSize;
  /** Nhãn hiển thị bên cạnh ô checkbox */
  label?: ReactNode;
  /** Class bổ sung cho phần bao ngoài */
  className?: string;
  /** id dùng để liên kết với label ngoài (nếu cần) */
  id?: string;
}

const sizeStyles: Record<CheckboxSize, { box: string; icon: number }> = {
  sm: { box: "h-4 w-4 rounded", icon: 12 },
  md: { box: "h-5 w-5 rounded-md", icon: 14 },
  lg: { box: "h-6 w-6 rounded-md", icon: 16 },
};

export default function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  size = "md",
  label,
  className = "",
  id,
}: CheckboxProps) {
  const styles = sizeStyles[size];
  const active = checked || indeterminate;

  const content = (
    <>
      <span
        className={`flex shrink-0 items-center justify-center border-2 transition-colors ${
          styles.box
        } ${
          active
            ? "border-primary-500 bg-primary-500 text-white dark:border-primary-400 dark:bg-primary-400"
            : "border-neutral-300 bg-transparent dark:border-neutral-600"
        } group-focus-visible:ring-2 group-focus-visible:ring-primary-500 group-focus-visible:ring-offset-2`}
      >
        {indeterminate ? (
          <HiOutlineMinus size={styles.icon} className="stroke-3" />
        ) : checked ? (
          <HiOutlineCheck size={styles.icon} className="stroke-3" />
        ) : null}
      </span>
      {label != null && (
        <Typography as="span" variant="body" weight="medium" color="neutral">
          {label}
        </Typography>
      )}
    </>
  );

  if (!onChange) {
    return (
      <span
        role="checkbox"
        aria-checked={indeterminate ? "mixed" : checked}
        aria-disabled={disabled || undefined}
        className={`inline-flex items-center gap-2.5 ${disabled ? "opacity-50" : ""} ${className}`}
      >
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group inline-flex items-center gap-2.5 text-left focus:outline-none ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } ${className}`}
    >
      {content}
    </button>
  );
}
