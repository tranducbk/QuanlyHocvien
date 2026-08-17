"use client";

import React from "react";
import { useToastStore, type ToastVariant } from "@/store/useToastStore";
import {
  IoCheckmarkCircle,
  IoAlertCircle,
  IoInformationCircle,
  IoWarning,
  IoClose,
} from "react-icons/io5";
import { AnimatePresence, m } from "motion/react";
import { TOAST_CONFIG } from "@/constants/constants";

const variantConfig: Record<
  ToastVariant,
  {
    bg: string;
    border: string;
    accent: string;
    icon: React.ReactNode;
  }
> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200/50",
    accent: "text-green-600",
    icon: <IoCheckmarkCircle className="size-5 shrink-0" />,
  },
  error: {
    bg: "bg-rose-50",
    border: "border-rose-200/50",
    accent: "text-rose-600",
    icon: <IoAlertCircle className="size-5 shrink-0" />,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200/50",
    accent: "text-blue-600",
    icon: <IoInformationCircle className="size-5 shrink-0" />,
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200/50",
    accent: "text-amber-600",
    icon: <IoWarning className="size-5 shrink-0" />,
  },
};

const Toast = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-6 right-6 z-9999 flex flex-col gap-3 w-full max-w-xs pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = variantConfig[toast.variant];
          return (
            <m.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`
                pointer-events-auto
                relative overflow-hidden
                flex items-start gap-3 p-4 rounded-xl
                ${config.bg} border ${config.border}
                group transition-all duration-300
              `}
              role="alert"
            >
              <div className={`${config.accent} mt-0.5`}>{config.icon}</div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-700 leading-relaxed tracking-wide">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 -mr-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/50 transition-all cursor-pointer"
                aria-label="Close"
              >
                <IoClose className="size-4" />
              </button>

              {/* Progress bar effect if duration is provided */}
              {toast.duration !== 0 && (
                <m.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{
                    duration:
                      (toast.duration || TOAST_CONFIG.DEFAULT_DURATION) / 1000,
                    ease: "linear",
                  }}
                  className={`absolute bottom-0 left-0 h-0.5 w-full origin-left bg-current ${config.accent} opacity-30`}
                />
              )}
            </m.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
