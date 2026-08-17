"use client";

import React from "react";
import { m } from "motion/react";

interface ErrorStateProps {
  /** Tiêu đề của thông báo lỗi (mặc định: 'Đã có lỗi xảy ra') */
  title?: string;
  /** Nội dung chi tiết thông báo lỗi */
  message?: string;
  /** Hàm callback để kích hoạt khi người dùng nhấn nút 'Thử lại' */
  onRetry?: () => void;
  /** Các class CSS bổ sung để tùy chỉnh giao diện */
  className?: string;
}

/**
 * Component hiển thị trạng thái lỗi tổng quát (không chỉ cho bảng)
 */
const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Đã có lỗi xảy ra",
  message = "Vui lòng kiểm tra kết nối mạng và thử lại",
  onRetry,
  className = "",
}) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center min-h-[50vh] gap-4 text-red-500 text-center ${className}`}
    >
      {/* Icon Cảnh báo SVG */}
      <div className="size-20 rounded-full bg-red-50 flex items-center justify-center">
        <svg
          className="size-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Thông tin lỗi */}
      <div className="space-y-1">
        <p className="text-base font-black uppercase tracking-widest leading-none">
          {title || "Đã có lỗi xảy ra"}
        </p>
        <p className="text-sm font-medium italic text-red-400 max-w-md mx-auto">
          {message || "Vui lòng kiểm tra kết nối mạng và thử lại"}
        </p>
      </div>

      {/* Nút Thử lại */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer mt-2 px-6 py-2 bg-red-50 text-red-600 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-red-100 transition-all border border-red-200 active:scale-95 shadow-sm"
        >
          Thử lại ngay
        </button>
      )}
    </m.div>
  );
};

export default ErrorState;
