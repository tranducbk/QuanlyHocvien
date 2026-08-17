"use client";

import React, { JSX } from "react";

export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  | "label"
  | "caption"
  | "display";

export type TypographyColor =
  | "primary"
  | "secondary"
  | "neutral"
  | "error"
  | "warning"
  | "success"
  | "white"
  | "gray"
  | "inherit";

export type TypographyWeight =
  | "normal"
  | "medium"
  | "semibold"
  | "bold"
  | "black";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  /** Nội dung văn bản hiển thị bên trong */
  children: React.ReactNode;
  /** Kiểu hiển thị (h1, h2, body, label,...) - Mặc định: body */
  variant?: TypographyVariant;
  /** Màu sắc văn bản (primary, neutral, error,...) - Mặc định: inherit */
  color?: TypographyColor;
  /** Độ đậm của chữ (normal, semibold, bold, black) */
  weight?: TypographyWeight;
  /** Biến đổi kiểu chữ (uppercase, capitalize,...) */
  transform?: "uppercase" | "capitalize" | "lowercase" | "none";
  /** Override thẻ HTML (ví dụ muốn variant h1 nhưng render thẻ span) */
  as?: keyof JSX.IntrinsicElements;
  /** Class CSS tùy chỉnh bổ sung */
  className?: string;
  /** Khoảng cách giữa các chữ (tight, normal, wide, widest) */
  tracking?: "tight" | "normal" | "wide" | "widest";
  /** Thuộc tính dành cho thẻ label */
  htmlFor?: string;
}

/**
 * Component Typography chuẩn hóa hiển thị văn bản trong hệ thống
 * Tuân thủ phong cách "Tactical Transparency"
 */
const Typography: React.FC<TypographyProps> = ({
  children,
  variant = "body",
  color = "inherit",
  weight,
  transform = "none",
  as,
  className = "",
  tracking,
  htmlFor
}) => {
  // Xác định thẻ HTML mặc định dựa trên variant
  const Component = as || (
    {
      h1: "h1",
      h2: "h2",
      h3: "h3",
      h4: "h4",
      h5: "h5",
      h6: "h6",
      body: "p",
      label: "span",
      caption: "span",
      display: "h1",
    }[variant] as keyof JSX.IntrinsicElements
  );

  const variantStyles: Record<TypographyVariant, string> = {
    display: "text-4xl md:text-5xl tracking-tighter",
    h1: "text-2xl tracking-tight",
    h2: "text-xl tracking-tight",
    h3: "text-lg tracking-tight",
    h4: "text-base tracking-tight",
    h5: "text-sm tracking-tight",
    h6: "text-xs tracking-tight",
    body: "text-sm",
    label: "text-[11px] uppercase tracking-[0.2em]",
    caption: "text-xs",
  };

  const colorStyles: Record<TypographyColor, string> = {
    primary: "text-primary-600 dark:text-primary-400",
    secondary: "text-secondary-600 dark:text-secondary-400",
    neutral: "text-neutral-800 dark:text-neutral-100",
    error: "text-error-600 dark:text-error-400",
    warning: "text-amber-600 dark:text-amber-400",
    success: "text-emerald-600 dark:text-emerald-400",
    white: "text-white",
    gray: "text-neutral-400 dark:text-neutral-500",
    inherit: "",
  };

  const weightStyles: Record<TypographyWeight, string> = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
    black: "font-black",
  };

  // Mặc định weight theo variant nếu không được truyền vào
  const defaultWeights: Record<TypographyVariant, TypographyWeight> = {
    display: "black",
    h1: "black",
    h2: "bold",
    h3: "bold",
    h4: "bold",
    h5: "bold",
    h6: "bold",
    body: "semibold",
    label: "black",
    caption: "bold",
  };

  const finalWeight = weight || defaultWeights[variant];

  const transformStyles = {
    uppercase: "uppercase",
    capitalize: "capitalize",
    lowercase: "lowercase",
    none: "",
  }[transform];

  const trackingStyles = tracking ? {
    tight: "tracking-tight",
    normal: "tracking-normal",
    wide: "tracking-wide",
    widest: "tracking-widest",
  }[tracking] : "";

  const combinedClasses = [
    variantStyles[variant],
    colorStyles[color],
    weightStyles[finalWeight],
    transformStyles,
    trackingStyles,
    className,
  ].filter(Boolean).join(" ");

  return <Component className={combinedClasses} htmlFor={htmlFor}>{children}</Component>;
};

export default Typography;
