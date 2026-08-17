"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMMANDER_MENU, MenuItem } from "@/constants/commander-menu";
import Typography from "@/library/Typography";
import Image from "next/image";

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="relative flex flex-col w-70 bg-white/75 dark:bg-neutral-950 backdrop-blur-xl border-r border-neutral-100/60 dark:border-neutral-800 shadow-sm dark:shadow-none z-50 overflow-hidden">
      {/* Background blobs for flair */}
      <div className="absolute -top-28 -left-28 size-72 bg-primary-100/35 dark:bg-primary-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-36 size-72 bg-secondary-100/25 dark:bg-neutral-900/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header Sidebar */}
      <div className="relative flex items-center gap-3 p-6 h-20">
        <div className="size-10 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center shrink-0">
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
          {COMMANDER_MENU.map((item: MenuItem) => {
            const isActive =
              pathname === item.path ||
              (item.path !== "/commander" && pathname.startsWith(item.path));

            return (
              <li key={item.title}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                    ? "bg-primary-600 dark:bg-neutral-800 text-white shadow-md shadow-primary-600/10"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-900 hover:text-primary-700 dark:hover:text-neutral-100 hover:shadow-sm"
                    }`}
                >
                  <item.icon
                    size={20}
                    className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-neutral-400 dark:text-neutral-500 group-hover:text-primary-600 dark:group-hover:text-primary-300"}`}
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
