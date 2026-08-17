"use client";

import React from "react";

type ToggleSize = "sm" | "md" | "lg";

export interface ToggleProps {
  /** Trạng thái bật/tắt */
  checked: boolean;
  /** Hàm callback khi thay đổi trạng thái */
  onChange: (checked: boolean) => void;
  /** Kích thước: sm, md, lg */
  size?: ToggleSize;
  /** Vô hiệu hóa */
  disabled?: boolean;
  /** Class bổ sung */
  className?: string;
  /** Màu nền khi active (ví dụ: bg-primary-600) */
  activeColor?: string;
}

const sizeStyles: Record<
  ToggleSize,
  { width: string; height: string; thumb: string; translate: string }
> = {
  sm: {
    width: "w-8",
    height: "h-4",
    thumb: "size-3",
    translate: "translate-x-4",
  },
  md: {
    width: "w-11",
    height: "h-6",
    thumb: "size-5",
    translate: "translate-x-5",
  },
  lg: {
    width: "w-14",
    height: "h-8",
    thumb: "size-7",
    translate: "translate-x-6",
  },
};

export default function Toggle({
  checked,
  onChange,
  size = "md",
  disabled = false,
  className = "",
  activeColor = "bg-primary-600",
}: ToggleProps) {
  const styles = sizeStyles[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent 
        transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        ${checked ? activeColor : "bg-neutral-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${styles.width} ${styles.height}
        ${className}
      `}
    >
      <span className="sr-only">Toggle</span>
      <span
        className={`
          pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0
          transition-transform duration-300 ease-in-out
          ${checked ? styles.translate : "translate-x-0"}
          ${styles.thumb}
        `}
      />
    </button>
  );
}
