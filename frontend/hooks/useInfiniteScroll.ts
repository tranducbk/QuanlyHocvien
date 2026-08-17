import { useEffect, useState } from "react";

interface UseInfiniteScrollProps {
  /** Hàm callback để tải thêm dữ liệu */
  callback: () => void;
  /** Điều kiện để cho phép tải tiếp (ví dụ: hasNextPage từ react-query) */
  hasNextPage?: boolean;
  /** Trạng thái đang tải dữ liệu để tránh gọi trùng lặp */
  isFetching?: boolean;
  /** Khoảng cách lề để kích hoạt sớm trước khi phần tử lọt vào khung nhìn (mặc định: "200px") */
  rootMargin?: string;
}

/**
 * Custom hook để xử lý việc tải thêm dữ liệu khi phần tử mục tiêu xuất hiện trong viewport
 * Sử dụng Intersection Observer để tối ưu hiệu năng và hỗ trợ cả cuộn trong div.
 *
 * @returns Hàm ref để gắn vào phần tử nằm ở cuối danh sách (sentinel)
 */
export const useInfiniteScroll = ({
  callback,
  hasNextPage,
  isFetching,
  rootMargin = "200px",
}: UseInfiniteScrollProps) => {
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetching) {
          callback();
        }
      },
      { threshold: 0.1, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback, hasNextPage, isFetching, element, rootMargin]);

  return setElement;
};
