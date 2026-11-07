import {
  AiOutlineBell,
  AiOutlineCalendar,
  AiOutlineCheckSquare,
  AiOutlineDollar,
  AiOutlineHome,
  AiOutlineIdcard,
  AiOutlineRead,
} from "@/library/icons";
import React from "react";

export type MenuItem = {
  title: string;
  path: string;
  icon: React.ElementType;
};

export const STUDENT_MENU = [
  {
    title: "Tổng quan",
    path: "/student",
    icon: AiOutlineHome,
  },
  {
    title: "Thông tin cá nhân",
    path: "/student/profile",
    icon: AiOutlineIdcard,
  },
  {
    title: "Kết quả học tập",
    path: "/student/results",
    icon: AiOutlineRead,
  },
  {
    title: "Quản lý lịch học",
    path: "/student/time-table",
    icon: AiOutlineCalendar,
  },
  {
    title: "Lịch cắt cơm",
    path: "/student/meal-schedules",
    icon: AiOutlineCalendar,
  },
  {
    title: "Thành tích",
    path: "/student/achievements",
    icon: AiOutlineCheckSquare,
  },
  {
    title: "Học phí",
    path: "/student/tuition",
    icon: AiOutlineDollar,
  },
] as const satisfies readonly MenuItem[];

export const COHORT_STUDENT_MENU = [
  {
    title: "Tổng quan",
    path: "/student",
    icon: AiOutlineHome,
  },
  {
    title: "Thông tin cá nhân",
    path: "/student/profile",
    icon: AiOutlineIdcard,
  },
  {
    title: "Kết quả học tập",
    path: "/student/results",
    icon: AiOutlineRead,
  },
  {
    title: "Quản lý lịch học",
    path: "/student/time-table",
    icon: AiOutlineCalendar,
  },
  {
    title: "Thành tích",
    path: "/student/achievements",
    icon: AiOutlineCheckSquare,
  },
  {
    title: "Thông báo",
    path: "/student/notification",
    icon: AiOutlineBell,
  },
] as const satisfies readonly MenuItem[];
