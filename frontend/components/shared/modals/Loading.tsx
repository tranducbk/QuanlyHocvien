"use client";

import { useLoadingStore } from "@/store/useLoadingStore";
import { m, AnimatePresence } from "motion/react";

export default function Loading() {
  const { isLoading } = useLoadingStore();

  return (
    <AnimatePresence>
      {isLoading && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center backdrop-blur-[2px]"
        >
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="relative flex flex-col items-center gap-6"
          >
            <div className="relative size-16">
              {/* Outer ring */}
              <m.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full"
              />

              {/* Inner ring (reverse) */}
              <m.div
                animate={{ rotate: -360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border-4 border-transparent border-b-primary-400 rounded-full"
              />

              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <m.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="size-1.5 bg-primary-800 rounded-full"
                />
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
