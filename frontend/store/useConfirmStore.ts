import { create } from "zustand";
import type { MutationKey } from "@tanstack/react-query";

/**
 * Các loại màu sắc hỗ trợ cho nút xác nhận
 */
export type ConfirmVariant = "primary" | "danger" | "warning";

/**
 * Trạng thái của Confirm Store
 */
interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: ConfirmVariant;
  mutationKey?: MutationKey;
  onConfirm: () => void;

  /** Hiển thị hộp thoại xác nhận */
  openConfirm: (params: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: ConfirmVariant;
    mutationKey?: MutationKey;
  }) => void;
  
  /** Đóng hộp thoại */
  closeConfirm: () => void;
}

/**
 * Store quản lý trạng thái Xác nhận (Confirm) toàn cục
 */
export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  title: "",
  message: "",
  confirmText: "Xác nhận",
  cancelText: "Hủy",
  variant: "primary",
  mutationKey: undefined,
  onConfirm: () => {},
  onCancel: undefined,

  openConfirm: ({
    title,
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = "primary",
    mutationKey,
    onConfirm,
  }) =>
    set({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
      mutationKey,
      onConfirm,
    }),

  closeConfirm: () => {
    set({ isOpen: false, mutationKey: undefined });
  },
}));
