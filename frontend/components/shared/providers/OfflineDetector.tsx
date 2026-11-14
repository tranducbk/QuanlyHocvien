"use client";

import { useEffect, useRef } from "react";
import { useToastStore } from "@/store/useToastStore";
import { useQueryClient } from "@tanstack/react-query";

export default function OfflineDetector() {
  const queryClient = useQueryClient();
  const { addToast, removeToast } = useToastStore();
  const offlineToastId = useRef<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      // Chỉ invalidate những query đang bị lỗi để thử lại
      queryClient.invalidateQueries({
        predicate: (query) => query.state.status === "error",
      });

      if (offlineToastId.current) {
        removeToast(offlineToastId.current);
        offlineToastId.current = null;
      }
      addToast({
        message: "Đã khôi phục kết nối mạng.",
        variant: "success",
      });
    };

    const handleOffline = () => {
      if (offlineToastId.current) return;

      offlineToastId.current = addToast({
        message: "Bạn đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng.",
        variant: "error",
        duration: Infinity,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addToast, queryClient, removeToast]);

  return null;
}
