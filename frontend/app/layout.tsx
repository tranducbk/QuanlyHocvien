import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import QueryProvider from "@/components/providers/QueryProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import MotionProvider from "@/components/providers/MotionProvider";
import OfflineDetector from "@/components/providers/OfflineDetector";
import Loading from "@/components/modals/Loading";
import Toast from "@/components/modals/Toast";
import Modal from "@/components/modals/Modal";
import ConfirmModal from "@/components/modals/Confirm";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { THEMES } from "@/constants/constants";

export const metadata: Metadata = {
  title: "Hệ thống quản lý học viên",
  description:
    "Hệ thống quản lý học viên là một ứng dụng web được thiết kế để giúp các tổ chức giáo dục quản lý thông tin học viên một cách hiệu quả. Hệ thống này cung cấp các tính năng như đăng ký học viên, quản lý khóa học, theo dõi tiến độ học tập và tạo báo cáo chi tiết về hoạt động của học viên. Với giao diện thân thiện và dễ sử dụng, hệ thống quản lý học viên giúp cải thiện trải nghiệm học tập và tăng cường sự tương tác giữa giáo viên và học viên.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || THEMES.DEFAULT_THEME;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${theme} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300"
      >
        <ThemeProvider initialTheme={theme}>
          <QueryProvider>
            <MotionProvider>
              <OfflineDetector />
              <Toast />
              <Loading />
              <Modal />
              <ConfirmModal />
              {children}
            </MotionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
