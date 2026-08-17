import React from "react";
import Link from "next/link";
import Typography from "./Typography";
import AnimatedContainer from "./AnimatedContainer";
import ErrorState from "./ErrorState";
import { HiOutlineHome, HiOutlineChevronRight } from "react-icons/hi";

export interface BreadcrumbItem {
  /** Nhãn hiển thị */
  label?: string;
  /** Đường dẫn — nếu không có thì đây là trang hiện tại (item cuối cùng) */
  href?: string;
}

interface PageContainerProps {
  /** Danh sách các mục breadcrumb, item cuối không cần href */
  breadcrumb: BreadcrumbItem[];
  /** Tiêu đề trang (h1) */
  title?: string;
  /** Mô tả ngắn bên dưới tiêu đề */
  subtitle?: string;
  /** Trạng thái đang tải — hiển thị skeleton thay vì nội dung */
  isLoading?: boolean;
  /** Component skeleton hiển thị khi loading */
  skeleton?: React.ReactNode;
  /** Trạng thái lỗi — hiển thị ErrorState thay vì nội dung */
  isError?: boolean;
  /** Thông điệp lỗi */
  errorMessage?: string;
  /** Hàm retry khi lỗi */
  onRetry?: () => void;
  /** Nội dung chính của trang */
  children: React.ReactNode;
  /** Class bổ sung cho container */
  className?: string;
  /** Nút hành động ở góc phải header */
  actions?: React.ReactNode;
}

/**
 * Component PageContainer bao bọc toàn bộ trang Commander / Admin.
 * Xử lý tập trung: Loading → Error → Breadcrumb + Header + Content.
 */
export default function PageContainer({
  breadcrumb,
  title,
  subtitle,
  isLoading = false,
  skeleton,
  isError = false,
  errorMessage,
  onRetry,
  children,
  className = "",
  actions,
}: PageContainerProps) {
  return (
    <AnimatedContainer
      variant="slideUp"
      className={`space-y-6 p-6 bg-white dark:bg-neutral-950 rounded-2xl min-h-screen text-neutral-900 dark:text-neutral-100 transition-colors duration-300 ${className}`}
    >
      {isLoading && skeleton ? (
        skeleton
      ) : isError ? (
        <ErrorState
          message={errorMessage || "Đã có lỗi xảy ra"}
          onRetry={onRetry}
        />
      ) : (
        <>
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
            {breadcrumb.map((item, index) => {
              const isFirst = index === 0;
              const isLast = index === breadcrumb.length - 1;

              return (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <HiOutlineChevronRight size={12} />}

                  {item.href && item.label && !isLast ? (
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-neutral-100 transition-colors group"
                    >
                      {isFirst && (
                        <HiOutlineHome
                          size={14}
                          className="mb-0.5 group-hover:scale-110 transition-transform"
                        />
                      )}
                      <Typography variant="label" tracking="wide">
                        {item.label}
                      </Typography>
                    </Link>
                  ) : (
                    <Typography variant="label" color="primary" tracking="wide">
                      {item.label}
                    </Typography>
                  )}
                </div>
              );
            })}
          </div>

          {/* Page Header */}
          {title && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Typography variant="h1" transform="uppercase">
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body" className="text-neutral-500 dark:text-neutral-400 mt-1">
                    {subtitle}
                  </Typography>
                )}
              </div>
              {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
            </div>
          )}

          {/* Content */}
          {children}
        </>
      )}
    </AnimatedContainer>
  );
}
