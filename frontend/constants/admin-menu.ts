import React from "react";
import {
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineViewGrid,
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
    title: "Cơ sở đào tạo",
    path: "/admin/universities",
    icon: HiOutlineOfficeBuilding,
  },
  {
    title: "Quản lý lớp học",
    path: "/admin/classes",
    icon: HiOutlineViewGrid,
  },
  {
    title: "Quản lý tài khoản",
    path: "/admin/accounts",
    icon: HiOutlineUserGroup,
  },
] as const satisfies readonly MenuItem[];
