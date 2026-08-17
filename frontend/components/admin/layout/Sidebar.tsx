"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ADMIN_MENU, MenuItem } from "@/constants/admin-menu";
import Typography from "@/library/Typography";

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="relative flex flex-col w-70 bg-white/75 dark:bg-neutral-950 backdrop-blur-xl border-r border-neutral-100/60 dark:border-neutral-800 shadow-sm dark:shadow-none z-50 overflow-hidden">
      {/* Subtle surface accents */}
      <div className="absolute inset-x-0 top-0 h-px bg-neutral-200/70 dark:bg-neutral-800 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-px bg-neutral-100/80 dark:bg-neutral-800 pointer-events-none" />

      {/* Header Sidebar */}
      <div className="relative flex items-center gap-3 p-6 h-20">
        <div className="size-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center shrink-0 shadow-sm dark:shadow-none">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            style={{ height: "auto" }}
          />
        </div>
        <Typography variant="h2" weight="black" className="leading-none dark:text-white">
          Tiên Phong
        </Typography>
      </div>

      {/* Danh sách Menu */}
      <nav className="relative flex-1 overflow-y-auto py-4 px-4 no-scrollbar">
        <ul className="space-y-1.5">
          {ADMIN_MENU.map((item: MenuItem) => {
            const isActive =
              pathname === item.path ||
              (item.path !== "/admin" && pathname.startsWith(item.path));

            return (
              <li key={item.title}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                    ? "bg-primary-600 dark:bg-neutral-900 text-white dark:text-neutral-100 shadow-md shadow-primary-600/10 dark:shadow-none ring-1 ring-transparent dark:ring-neutral-800"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-900 hover:text-primary-700 dark:hover:text-neutral-100 hover:shadow-sm dark:hover:shadow-none"
                    }`}
                >
                  <item.icon
                    size={20}
                    className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white dark:text-primary-300" : "text-neutral-400 dark:text-neutral-500 group-hover:text-primary-600 dark:group-hover:text-primary-300"}`}
                  />

                  <span className="whitespace-nowrap overflow-hidden text-sm font-semibold tracking-tight">
                    {item.title}
                  </span>

                  {/* Hover/Active Effect Layer */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/10 pointer-events-none" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
