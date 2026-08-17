"use client";

import React, { ReactNode } from "react";
import { m, HTMLMotionProps, Variants } from "motion/react";

type AnimationVariant =
  | "fade"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scale"
  | "diagonalUp";

export interface AnimatedContainerProps extends HTMLMotionProps<"div"> {
  /** Nội dung bên trong container */
  children: ReactNode;

  /**
   * Kiểu hiệu ứng xuất hiện có sẵn:
   * - fade: Hiện dần
   * - slideUp/Down/Left/Right: Trượt từ các hướng
   * - scale: Phóng to
   * - diagonalUp: Trượt chéo từ dưới phải lên
   */
  variant?: AnimationVariant;

  /** Thời gian chờ trước khi bắt đầu animation (giây) */
  delay?: number;

  /** Độ dài của animation (giây) */
  duration?: number;

  /** Khoảng thời gian trễ giữa các con (stagger effect) */
  staggerChildren?: number;

  /** Ghi đè tọa độ X bắt đầu (pixel). Ví dụ: x={100} sẽ bay từ phải sang */
  x?: number;

  /** Ghi đè tọa độ Y bắt đầu (pixel). Ví dụ: y={-50} sẽ rơi từ trên xuống */
  y?: number;
}

const variants: Record<AnimationVariant, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  diagonalUp: {
    hidden: { opacity: 0, x: 50, y: 50 },
    visible: { opacity: 1, x: 0, y: 0 },
  },
};

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  variant = "slideUp",
  delay = 0,
  duration = 0.4,
  staggerChildren = 0.1,
  x,
  y,
  className = "",
  ...props
}) => {
  const selectedVariant = variants[variant];

  const hiddenState = {
    ...selectedVariant.hidden,
    ...(x !== undefined && { x }),
    ...(y !== undefined && { y }),
  };

  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: hiddenState,
        visible: {
          ...selectedVariant.visible,
          transition: {
            duration,
            delay,
            staggerChildren,
            ease: "easeOut",
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </m.div>
  );
};

export default AnimatedContainer;
