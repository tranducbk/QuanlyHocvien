import { create } from "zustand";
import React from "react";
import type { MutationKey } from "@tanstack/react-query";

/**
 * Cấu hình bổ sung cho Modal
 */
interface ModalConfig {
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  overlayClassName?: string;
  mutationKey?: MutationKey;
}

/**
 * Trạng thái của Modal Store
 */
interface ModalState {
  isOpen: boolean;
  title: React.ReactNode;
  content: React.ReactNode;
  footer: React.ReactNode;
  size: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  config: ModalConfig;
  
  /** Mở modal với các tham số cấu hình */
  openModal: (params: {
    title?: React.ReactNode;
    content: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    config?: ModalConfig;
  }) => void;
  
  /** Đóng modal */
  closeModal: () => void;
}

/**
 * Store quản lý trạng thái Modal toàn cục
 */
export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: null,
  content: null,
  footer: null,
  size: "md",
  config: {},
  
  openModal: ({ title, content, footer, size = "md", config = {} }) =>
    set({ 
      isOpen: true, 
      title, 
      content, 
      footer, 
      size, 
      config 
    }),
    
  closeModal: () => set({ isOpen: false }),
}));
