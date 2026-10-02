import React from "react";
import {
  HiOutlineUserGroup,
  HiOutlineHome,
  HiOutlineOfficeBuilding,
  HiOutlineViewGrid,
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
  {
    title: "Lớp quân sự",
    path: "/admin/military/classes",
    icon: HiOutlineAcademicCap,
  },
] as const satisfies readonly MenuItem[];
