"use client";

import { useIsMutating } from "@tanstack/react-query";
import { m, AnimatePresence } from "motion/react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import Button from "@/library/Button";
import { useConfirmStore } from "@/store/useConfirmStore";
import { MUTATION_KEYS } from "@/constants/query-keys";

/**
 * Component Confirm (Global Renderer)
 * Đọc trạng thái từ useConfirmStore để hiển thị hộp thoại xác nhận toàn hệ thống
 */
const Confirm = () => {
  const {
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    variant,
    mutationKey,
    onConfirm,
    closeConfirm,
  } = useConfirmStore();
  const isLoading =
    useIsMutating({ mutationKey: mutationKey ?? MUTATION_KEYS.CONFIRM_IDLE }) > 0;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : closeConfirm}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-neutral-950 rounded-3xl shadow-2xl dark:shadow-black/50 overflow-hidden border border-transparent dark:border-neutral-800 transition-colors"
          >
            <div className="px-4 py-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div
                  className={`size-16 rounded-2xl flex items-center justify-center border-2 ${variant === "danger"
                    ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/60 text-red-500 dark:text-red-400"
                    : variant === "warning"
                      ? "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/60 text-amber-500 dark:text-amber-400"
                      : "bg-primary-50 dark:bg-primary-950/30 border-primary-100 dark:border-primary-900/60 text-primary-600 dark:text-primary-400"
                    }`}
                >
                  <HiOutlineExclamationCircle size={32} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-tighter">
                    {title}
                  </h3>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed px-4">
                    {message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8 px-8">
                <Button
                  variant="ghost"
                  onClick={closeConfirm}
                  disabled={isLoading}
                  className="flex-1 h-10 rounded-2xl text-[11px] font-black uppercase tracking-wider"
                >
                  {cancelText}
                </Button>
                <Button
                  variant={variant === "danger" ? "danger" : "primary"}
                  onClick={handleConfirm}
                  isLoading={isLoading}
                  className="flex-1 h-10 rounded-2xl text-[11px] font-black uppercase tracking-wider shadow-lg shadow-primary-600/10"
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Confirm;
