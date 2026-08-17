import React from "react";

/**
 * Thuộc tính cho component Skeleton.
 */
export interface SkeletonProps {
  /** Chiều rộng của skeleton (ví dụ: '100%', 200, 'fit-content'). */
  width?: string | number;
  /** Chiều cao của skeleton (ví dụ: '1em', 48, '100%'). */
  height?: string | number;
  /** Hình dạng hiển thị của skeleton. */
  variant?: "rectangular" | "circular" | "rounded" | "text";
  /** Các class CSS bổ sung để tùy chỉnh kiểu dáng. */
  className?: string;
};

const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = "rounded",
  className = "",
}) => {
  const baseStyles = "animate-pulse bg-neutral-200/60 dark:bg-neutral-800/40";

  const variantStyles = {
    rectangular: "rounded-none",
    circular: "rounded-full",
    rounded: "rounded-xl",
    text: "rounded-md h-[1em] w-full mb-2",
  };

  const style: React.CSSProperties = {
    width,
    height,
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
