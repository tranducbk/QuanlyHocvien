import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  count: number;
  showLoading: () => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  count: 0,
  showLoading: () =>
    set((state) => ({
      count: state.count + 1,
      isLoading: true,
    })),
  hideLoading: () =>
    set((state) => {
      const nextCount = Math.max(0, state.count - 1);
      return {
        count: nextCount,
        isLoading: nextCount > 0,
      };
    }),
}));
