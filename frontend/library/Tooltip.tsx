"use client";

import React, { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "motion/react";

/**
 * Props cho component Tooltip
 */
export type TooltipPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface TooltipProps {
  /** Nội dung hiển thị bên trong tooltip */
  content: string;
  /** Component con mà tooltip sẽ bao quanh */
  children: React.ReactNode;
  /** Vị trí hiển thị của tooltip so với children (mặc định: top) */
  position?: TooltipPosition;
  /** Thời gian chờ trước khi hiển thị (giây) */
  delay?: number;
}

const POSITION_CLASSES: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  "top-left": "bottom-full right-0 mb-2",
  "top-right": "bottom-full left-0 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  "bottom-left": "top-full right-0 mt-2",
  "bottom-right": "top-full left-0 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const ANIMATION_VARIANTS: Record<
  TooltipPosition,
  {
    initial: { opacity: number; x?: number; y?: number };
    animate: { opacity: number; x?: number; y?: number };
  }
> = {
  top: { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } },
  "top-left": { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } },
  "top-right": { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } },
  bottom: { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } },
  "bottom-left": { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } },
  "bottom-right": { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } },
  left: { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 } },
  right: { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 } },
};

const ARROW_CLASSES: Record<TooltipPosition, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-neutral-800",
  "top-left": "top-full right-3.5 border-t-neutral-800",
  "top-right": "top-full left-3.5 border-t-neutral-800",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-neutral-800",
  "bottom-left": "bottom-full right-3.5 border-b-neutral-800",
  "bottom-right": "bottom-full left-3.5 border-b-neutral-800",
  left: "left-full top-1/2 -translate-y-1/2 border-l-neutral-800",
  right: "right-full top-1/2 -translate-y-1/2 border-r-neutral-800",
};

/**
 * Component Tooltip hiển thị chỉ dẫn khi hover
 * Tuân thủ phong cách thiết kế "Tactical Transparency"
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 0.5,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onClick={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <m.div
            initial={ANIMATION_VARIANTS[position].initial}
            animate={ANIMATION_VARIANTS[position].animate}
            exit={ANIMATION_VARIANTS[position].initial}
            className={`absolute z-1000 px-2 py-1 rounded-lg bg-neutral-800 text-white text-[9px] font-bold uppercase tracking-[0.15em] whitespace-nowrap shadow-xl pointer-events-none ${POSITION_CLASSES[position]}`}
          >
            {content}
            <div
              className={`absolute border-4 border-transparent ${ARROW_CLASSES[position]}`}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
