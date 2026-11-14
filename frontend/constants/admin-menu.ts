import { AiOutlineHome, AiOutlineTeam } from "@/library/icons";
import React from "react";

export type MenuItem = {
  title: string;
  path: string;
  icon: React.ElementType;
};

export const ADMIN_MENU = [
  {
    title: "Tổng quan",
    path: "/admin",
    icon: AiOutlineHome,
  },
  {
    title: "Quản lý tài khoản",
    path: "/admin/accounts",
    icon: AiOutlineTeam,
  },
] as const satisfies readonly MenuItem[];
