"use client";

import { MotionConfig, LazyMotion, domMax } from "motion/react";
import type { ReactNode } from "react";

type MotionProviderProps = {
  children: ReactNode;
};

/**
 * - LazyMotion + `domMax`: chỉ tải các tính năng animation cần thiết theo kiểu lazy-load,
 *   giúp giảm ~kb bundle. Toàn bộ component dùng `m.*` thay cho `motion.*`.
 *   Dùng `domMax` (thay vì `domAnimation`) vì có layout animation (`layoutId` trong Tabs).
 *   `strict` để chặn việc vô tình import lại `motion` (full bundle) trong tương lai.
 * - MotionConfig reducedMotion="user": giảm animation khi user bật chế độ hạn chế chuyển động.
 */
export default function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
