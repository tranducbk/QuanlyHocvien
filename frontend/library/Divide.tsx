"use client";

import React from "react";

export interface DivideProps {
  /** Hướng của đường kẻ: horizontal (ngang) hoặc vertical (dọc) */
  orientation?: "horizontal" | "vertical";
  /** Độ dày của đường kẻ (pixel) */
  thickness?: number;
  /** Văn bản hiển thị ở giữa (chỉ dùng cho hướng ngang) */
  children?: React.ReactNode;
  /** Hiệu ứng mờ dần về 2 đầu */
  faded?: boolean;
  /** Khoảng cách lề (margin) */
  className?: string;
}

const Divide: React.FC<DivideProps> = ({
  orientation = "horizontal",
  thickness = 1,
  children,
  faded = false,
  className = "",
}) => {
  const isHorizontal = orientation === "horizontal";

  if (!children) {
    const lineClassName = faded
      ? isHorizontal
        ? "bg-gradient-to-r from-transparent via-neutral-200 to-transparent"
        : "bg-gradient-to-b from-transparent via-neutral-200 to-transparent"
      : "bg-neutral-100";
    return (
      <div
        className={`${lineClassName} ${isHorizontal ? "w-full" : "h-full"} ${className}`}
        style={{
          [isHorizontal ? "height" : "width"]: `${thickness}px`,
        }}
        role="separator"
      />
    );
  }

  return (
    <div className={`flex items-center w-full ${className}`} role="separator">
      <div
        className={`flex-1 ${faded ? "bg-linear-to-r from-transparent to-neutral-200" : "bg-neutral-100"}`}
        style={{ height: `${thickness}px` }}
      />
      <span className="px-4 text-xs font-medium text-neutral-400 uppercase tracking-wider bg-transparent shrink-0">
        {children}
      </span>
      <div
        className={`flex-1 ${faded ? "bg-linear-to-r from-neutral-200 to-transparent" : "bg-neutral-100"}`}
        style={{ height: `${thickness}px` }}
      />
    </div>
  );
};

export default Divide;
