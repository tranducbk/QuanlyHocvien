import React from "react";
import {
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlineAcademicCap,
} from "react-icons/hi";

export type MenuItem = {
  title: string;
  path: string;
  icon: React.ElementType;
};

export const ADMIN_MENU = [
  {
    title: "Tổng quan",
    path: "/admin",
    icon: HiOutlineHome,
  },
  {
    title: "Quản lý tài khoản",
    path: "/admin/accounts",
    icon: HiOutlineUserGroup,
  },
  {
    title: "Chương trình đào tạo",
    path: "/admin/training-programs",
    icon: HiOutlineAcademicCap,
  },
  {
    title: "Lớp đào tạo",
    path: "/admin/training-classes",
    icon: HiOutlineAcademicCap,
  },
] as const satisfies readonly MenuItem[];
