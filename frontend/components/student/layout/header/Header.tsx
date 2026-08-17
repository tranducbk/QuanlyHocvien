"use client";

import { useQuery } from "@tanstack/react-query";
import { m } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HiOutlineChevronDown,
  HiOutlineLockClosed,
  HiOutlineLogout,
  HiOutlineMoon,
  HiOutlineUser,
} from "react-icons/hi";
import { DEFAULT_VALUES, ROLES, THEMES } from "@/constants/constants";
import { MUTATION_KEYS, QUERY_KEYS } from "@/constants/query-keys";
import Avatar from "@/library/Avatar";
import Divide from "@/library/Divide";
import Dropdown from "@/library/Dropdown";
import Toggle from "@/library/Toggle";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useModalStore } from "@/store/useModalStore";
import ChangePasswordForm from "./ChangePasswordForm";
import NotificationsPopover from "./NotificationsPopover";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function Header() {
  const { replace } = useRouter();
  const { logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { openModal } = useModalStore();

  const { data: profileResponse } = useQuery({
    queryKey: [QUERY_KEYS.PROFILE],
    queryFn: () => authService.getProfile(),
  });

  const profile = profileResponse?.data;

  const isDarkMode = theme === THEMES.DARK;
  const handleToggleTheme = () => {
    const nextTheme = isDarkMode ? THEMES.LIGHT : THEMES.DARK;
    setTheme(nextTheme);
  };

  const handleLogout = () => {
    logout();
    replace("/login");
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
        <h2 className="text-xl font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-tighter">
          Cổng thông tin học viên
        </h2>
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 font-bold">
          Học viện Khoa học Quân sự
        </span>
      </div>

      <div className="flex items-center gap-6">
        <NotificationsPopover />

        <div className="flex items-center h-10 gap-6">
          <Divide orientation="vertical" className="h-6" />

          <Dropdown
            trigger={(isOpen) => (
              <div
                className={`flex items-center gap-3 transition-all group ${isOpen ? "opacity-80" : ""
                  }`}
              >
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100 leading-none group-hover:text-primary-700 dark:group-hover:text-white transition-colors">
                    {profile?.profile?.fullName ||
                      DEFAULT_VALUES.DEFAULT_STUDENT_NAME}
                  </span>
                  <span className="text-[10px] tracking-widest text-neutral-400 dark:text-neutral-500 font-black uppercase mt-1">
                    {ROLES.STUDENT.NAME}
                  </span>
                </div>

                <div className="relative">
                  <Avatar
                    src={profile?.profile?.avatar}
                    alt={profile?.profile?.fullName}
                    size={40}
                    className={`border-2 transition-all ${isOpen
                        ? "border-primary-500 shadow-md"
                        : "border-primary-50 dark:border-neutral-800 shadow-sm"
                      }`}
                  />
                  <div className="absolute -bottom-1 -right-1 size-4 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center shadow-sm border border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
                    <HiOutlineChevronDown
                      size={10}
                      className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </div>
                </div>
              </div>
            )}
            dropdownClassName="w-64 bg-white dark:bg-neutral-950 rounded-3xl shadow-2xl shadow-neutral-900/10 dark:shadow-black/30 border border-neutral-100 dark:border-neutral-800 p-2 overflow-hidden"
          >
            <div className="space-y-1">
              <Link href="/student/profile" className="block">
                <m.button
                  whileHover="hover"
                  className="w-full flex items-center gap-3 p-2 rounded-2xl text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-primary-600 dark:hover:text-neutral-100 transition-all text-left group cursor-pointer"
                >
                  <div className="size-8 rounded-xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 dark:text-neutral-500 group-hover:bg-primary-50 dark:group-hover:bg-neutral-800 group-hover:text-primary-600 dark:group-hover:text-neutral-100 transition-all">
                    <m.div
                      variants={{ hover: { scale: 1.2, rotate: 5 } }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 10,
                      }}
                    >
                      <HiOutlineUser size={18} />
                    </m.div>
                  </div>
                  Thông tin cá nhân
                </m.button>
              </Link>

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
                Đổi mật khẩu
              </m.button>

              <m.div
                whileHover="hover"
                onClick={(event) => {
                  event.stopPropagation();
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
                Chế độ tối
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
                Đăng xuất
              </m.button>
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
