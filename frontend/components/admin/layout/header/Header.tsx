"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { ROLES } from "@/constants/constants";
import Avatar from "@/library/Avatar";
import {
  HiOutlineLogout,
  HiOutlineChevronDown,
  HiOutlineLockClosed,
  HiOutlineMoon,
} from "react-icons/hi";
import { useRouter } from "next/navigation";
import { m } from "motion/react";

import Dropdown from "@/library/Dropdown";

import Divide from "@/library/Divide";
import Toggle from "@/library/Toggle";
import { THEMES } from "@/constants/constants";
import { useModalStore } from "@/store/useModalStore";
import ChangePasswordForm from "@/components/admin/layout/header/ChangePasswordForm";
import Typography from "@/library/Typography";
import { MUTATION_KEYS } from "@/constants/query-keys";
import NotificationsPopover from "./NotificationsPopover";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function Header() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { openModal } = useModalStore();

  const isDarkMode = theme === THEMES.DARK;
  const handleToggleTheme = () => {
    const nextTheme = isDarkMode ? THEMES.LIGHT : THEMES.DARK;
    setTheme(nextTheme);
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const handleOpenChangePassword = () => {
    openModal({
      title: "Đổi mật khẩu",
      content: <ChangePasswordForm />,
      size: "md",
      config: {
        mutationKey: MUTATION_KEYS.CHANGE_PASSWORD,
      },
    });
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-neutral-950 backdrop-blur-md flex items-center px-8 shrink-0 justify-between z-40 relative transition-colors duration-300">
      <Divide className="absolute bottom-0 left-0 w-full" />
      <div className="flex flex-col">
        <Typography variant="h2" transform="uppercase">
          Hệ thống quản lý học viên
        </Typography>
        <Typography
          variant="label"
          color="gray"
          tracking="widest"
          className="leading-none mt-0.5"
        >
          Chào mừng đến với hệ thống quản lý học viên
        </Typography>
      </div>

      <div className="flex items-center gap-6">
        <NotificationsPopover />

        {/* User Profile & Dropdown */}
        <div className="flex items-center h-10 gap-6">
          <Divide orientation="vertical" className="h-6" />

          <Dropdown
            trigger={(isOpen) => (
              <div
                className={`flex items-center gap-3 transition-all group ${isOpen ? "opacity-80" : ""}`}
              >
                <div className="flex flex-col text-right">
                  <Typography
                    variant="body"
                    weight="bold"
                    color="neutral"
                    className="leading-none text-neutral-800 dark:text-neutral-100 group-hover:text-primary-700 dark:group-hover:text-white transition-colors"
                  >
                    Quản trị hệ thống
                  </Typography>
                  <Typography
                    variant="label"
                    weight="black"
                    color="gray"
                    className="mt-1 dark:text-neutral-500"
                  >
                    {ROLES.ADMIN.NAME}
                  </Typography>
                </div>
                <div className="relative">
                  <Avatar
                    src={undefined}
                    alt="Quản trị hệ thống"
                    size={40}
                    className={`border-2 transition-all ${isOpen ? "border-primary-500 shadow-md" : "border-primary-50 dark:border-neutral-800 shadow-sm"}`}
                  />
                  <div className="absolute -bottom-1 -right-1 size-4 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center shadow-sm border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
                    <HiOutlineChevronDown
                      size={10}
                      className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
              </div>
            )}
            dropdownClassName="w-64 bg-white dark:bg-neutral-950 rounded-3xl shadow-2xl shadow-neutral-900/10 dark:shadow-black/30 border border-neutral-100 dark:border-neutral-800 p-2 overflow-hidden"
          >
            <div className="space-y-1">
              {/* Đổi mật khẩu */}
              <m.button
                whileHover="hover"
                onClick={handleOpenChangePassword}
                className="w-full flex items-center gap-3 p-2 rounded-2xl text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-primary-600 dark:hover:text-neutral-100 transition-all text-left group cursor-pointer"
              >
                <div className="size-8 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 dark:text-neutral-500 group-hover:bg-primary-50 dark:group-hover:bg-neutral-800 group-hover:text-primary-600 dark:group-hover:text-neutral-100 transition-all">
                  <m.div
                    variants={{ hover: { y: -2, scale: 1.1 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <HiOutlineLockClosed size={18} />
                  </m.div>
                </div>
                <Typography variant="body" weight="semibold">
                  Đổi mật khẩu
                </Typography>
              </m.button>

              {/* Chế độ tối */}
              <m.div
                whileHover="hover"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleTheme();
                }}
                className="w-full flex items-center gap-3 p-2 rounded-2xl text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-primary-600 dark:hover:text-neutral-100 transition-all text-left group cursor-pointer"
              >
                <div className="size-8 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 dark:text-neutral-500 group-hover:bg-primary-50 dark:group-hover:bg-neutral-800 group-hover:text-primary-600 dark:group-hover:text-neutral-100 transition-all">
                  <m.div
                    variants={{ hover: { rotate: -20, scale: 1.1 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <HiOutlineMoon size={18} />
                  </m.div>
                </div>
                <Typography variant="body" weight="semibold">
                  Chế độ tối
                </Typography>
                <Toggle
                  checked={isDarkMode}
                  onChange={handleToggleTheme}
                  size="sm"
                  className="ml-auto"
                />
              </m.div>
            </div>

            <div className="mt-2 pt-2 relative">
              <Divide className="absolute top-0 left-0 w-full" />
              <m.button
                whileHover="hover"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-2 rounded-2xl text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-600 dark:hover:text-neutral-100 transition-all text-left group cursor-pointer"
              >
                <div className="size-8 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-error-400 group-hover:bg-error-50 dark:group-hover:bg-error-500/10 group-hover:text-error-600 dark:group-hover:text-error-400 transition-all">
                  <m.div
                    variants={{ hover: { x: 3, scale: 1.1 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <HiOutlineLogout size={18} />
                  </m.div>
                </div>
                <Typography variant="body" weight="semibold">
                  Đăng xuất
                </Typography>
              </m.button>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
