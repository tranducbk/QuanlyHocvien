import React from "react";
import Sidebar from "@/components/admin/layout/Sidebar";
import Header from "@/components/admin/layout/header/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Vùng nội dung chính */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header trên cùng */}
        <Header />

        {/* Nội dung trang */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
