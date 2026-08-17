import React from "react";
import Tooltip from "./Tooltip";

export type ActionButtonColor =
  | "blue"
  | "green"
  | "red"
  | "amber"
  | "secondary"
  | "neutral";

interface ActionButtonProps {
  /** Nội dung tooltip khi hover */
  tooltipText: string;
  /** Icon component (từ react-icons) */
  icon: React.ElementType;
  /** Hàm xử lý khi click */
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Màu sắc khi hover: blue, green, red, amber, secondary, neutral (mặc định: blue) */
  color?: ActionButtonColor;
  /** Trạng thái vô hiệu hóa nút */
  disabled?: boolean;
  /** Class bổ sung cho button */
  className?: string;
  /** Class bổ sung cho icon */
  iconClassName?: string;
  /** Kích thước icon (mặc định: 18) */
  iconSize?: number;
}

/**
 * Component ActionButton chuyên dùng cho các nút hành động trong bảng hoặc danh sách.
 * Tự động bọc Tooltip và áp dụng style "Tactical Transparency".
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  tooltipText,
  icon: Icon,
  onClick,
  color = "blue",
  disabled = false,
  className = "",
  iconClassName = "",
  iconSize = 18,
}) => {
  const colorClasses: Record<ActionButtonColor, string> = {
    blue: "hover:text-blue-600 hover:bg-blue-50",
    green: "hover:text-green-600 hover:bg-green-50",
    red: "hover:text-error-600 hover:bg-error-50",
    amber: "hover:text-amber-600 hover:bg-amber-50",
    secondary: "hover:text-secondary-600 hover:bg-secondary-50",
    neutral: "hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800",
  };

  return (
    <Tooltip content={tooltipText}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          group cursor-pointer size-9 flex items-center justify-center 
          text-neutral-400 rounded-xl transition-all
          ${disabled ? "opacity-40 cursor-not-allowed" : colorClasses[color]}
          ${className}
        `}
      >
        <Icon
          size={iconSize}
          className={`transition-transform duration-200 group-hover:scale-110 active:scale-95 ${iconClassName}`}
        />
      </button>
    </Tooltip>
  );
};

export default ActionButton;
