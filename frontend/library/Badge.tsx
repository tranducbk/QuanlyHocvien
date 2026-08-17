"use client";

import React from "react";

/**
 * Các loại màu sắc hỗ trợ cho Badge
 */
export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "neutral";

/**
 * Props cho component Badge
 */
export interface BadgeProps {
  /** Nội dung hiển thị bên trong badge */
  children: React.ReactNode;
  /** Loại màu sắc của badge (mặc định: neutral) */
  variant?: BadgeVariant;
  /** Class CSS tùy chỉnh bổ sung */
  className?: string;
  /** Chế độ hiển thị đậm (mặc định: false) */
  filled?: boolean;
}

/**
 * Component Badge dùng để hiển thị nhãn, trạng thái hoặc vai trò
 * Tuân thủ phong cách "Tactical Transparency"
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
  filled = false,
}) => {
  const baseStyles =
    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider inline-flex items-center justify-center transition-all";

  const variantStyles: Record<BadgeVariant, string> = {
    primary: filled
      ? "bg-primary-600 text-white"
      : "bg-primary-50 text-primary-700 border border-primary-100",
    secondary: filled
      ? "bg-secondary-600 text-white"
      : "bg-secondary-50 text-secondary-700 border border-secondary-100",
    success: filled
      ? "bg-emerald-600 text-white"
      : "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: filled
      ? "bg-amber-500 text-white"
      : "bg-amber-50 text-amber-700 border border-amber-100",
    error: filled
      ? "bg-red-600 text-white"
      : "bg-red-50 text-red-700 border border-red-100",
    neutral: filled
      ? "bg-neutral-800 text-white"
      : "bg-neutral-100 text-neutral-600 border border-neutral-200",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
