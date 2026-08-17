"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "motion/react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  Placement,
  size,
} from "@floating-ui/react";

export interface PopoverRenderProps {
  /** Trạng thái mở hiện tại */
  isOpen: boolean;
  /** Hướng hiển thị thực tế của Popover */
  placement: "top" | "bottom";
  /** Hàm đóng Popover (gọi khi bấm nút Xác nhận / Hủy bỏ) */
  close: () => void;
}

export interface PopoverProps {
  /** Thành phần kích hoạt Popover. Có thể là ReactNode hoặc function nhận trạng thái */
  trigger:
    | React.ReactNode
    | ((isOpen: boolean, placement: "top" | "bottom") => React.ReactNode);
  /** Nội dung bên trong Popover. Nhận hàm close để đóng thủ công (nút Xác nhận / Hủy bỏ) */
  children: React.ReactNode | ((props: PopoverRenderProps) => React.ReactNode);
  /** Hướng căn lề của Popover so với trigger */
  align?: "left" | "right" | "center";
  /** Class CSS cho container bên ngoài */
  className?: string;
  /** Class CSS cho container của Popover */
  popoverClassName?: string | ((placement: "top" | "bottom") => string);
  /** Độ lệch y khi bắt đầu hiệu ứng (mặc định: 10) */
  offsetY?: number;
  /** Độ lệch y khi kết thúc hiệu ứng (mặc định: 10) */
  targetY?: number;
  /** Bắt buộc Popover phải có chiều rộng bằng đúng với phần tử trigger */
  fullwidth?: boolean;
  /** Trạng thái vô hiệu hóa */
  disabled?: boolean;
  /** Trạng thái đang tải */
  isLoading?: boolean;
  /** Có cho phép đóng khi click ra ngoài hay không (mặc định: true) */
  dismissOnOutsideClick?: boolean;
  /** Có cho phép đóng khi bấm Escape hay không (mặc định: true) */
  dismissOnEscape?: boolean;
  /** Callback khi trạng thái mở/đóng thay đổi */
  onOpenChange?: (open: boolean) => void;
}

const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  align = "left",
  className = "",
  popoverClassName = "",
  offsetY = 10,
  targetY = 10,
  fullwidth = false,
  disabled = false,
  isLoading = false,
  dismissOnOutsideClick = true,
  dismissOnEscape = true,
  onOpenChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const getInitialPlacement = (): Placement => {
    if (align === "left") return "bottom-start";
    if (align === "right") return "bottom-end";
    return "bottom";
  };

  const {
    refs: { setReference, setFloating },
    x,
    y,
    strategy,
    context,
    placement,
  } = useFloating({
    open: isOpen,
    onOpenChange: handleOpenChange,
    placement: getInitialPlacement(),
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(targetY),
      flip({ padding: 16 }),
      shift({ padding: 16 }),
      ...(fullwidth
        ? [
            size({
              apply({ rects, elements }) {
                Object.assign(elements.floating.style, {
                  width: `${rects.reference.width}px`,
                });
              },
            }),
          ]
        : []),
    ],
  });

  const click = useClick(context, { enabled: !disabled && !isLoading });
  const dismiss = useDismiss(context, {
    outsidePress: dismissOnOutsideClick,
    escapeKey: dismissOnEscape,
  });
  const role = useRole(context, { role: "dialog" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const basePlacement = placement.split("-")[0] as "top" | "bottom";

  const close = () => handleOpenChange(false);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={setReference}
        {...getReferenceProps()}
        className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
      >
        {typeof trigger === "function"
          ? trigger(isOpen, basePlacement)
          : trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <FloatingPortal>
            <m.div
              ref={setFloating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                zIndex: 9999,
              }}
              {...getFloatingProps()}
              initial={{
                opacity: 0,
                y:
                  basePlacement === "top"
                    ? targetY - offsetY
                    : offsetY - targetY,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y:
                  basePlacement === "top"
                    ? targetY - offsetY
                    : offsetY - targetY,
                scale: 0.95,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`
                ${typeof popoverClassName === "function" ? popoverClassName(basePlacement) : popoverClassName}
              `}
            >
              {typeof children === "function"
                ? children({ isOpen, placement: basePlacement, close })
                : children}
            </m.div>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Popover;
