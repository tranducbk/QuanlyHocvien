import React from "react";
import {
  HiOutlineAcademicCap,
  HiOutlineBadgeCheck,
  HiOutlineCalendar,
  HiOutlineBell,
  HiOutlineCash,
  HiOutlineHome,
  HiOutlineIdentification,
} from "react-icons/hi";

export type MenuItem = {
  title: string;
  path: string;
  icon: React.ElementType;
};

export const STUDENT_MENU = [
  {
    title: "Tổng quan",
    path: "/student",
    icon: HiOutlineHome,
  },
  {
    title: "Thông tin cá nhân",
    path: "/student/profile",
    icon: HiOutlineIdentification,
  },
  {
    title: "Kết quả học tập",
    path: "/student/results",
    icon: HiOutlineAcademicCap,
  },
  {
    title: "Quản lý lịch học",
    path: "/student/time-table",
    icon: HiOutlineCalendar,
  },
  {
    title: "Lịch cắt cơm",
    path: "/student/meal-schedules",
    icon: HiOutlineCalendar,
  },
  {
    title: "Thành tích",
    path: "/student/achievements",
    icon: HiOutlineBadgeCheck,
  },
  {
    title: "Học phí",
    path: "/student/tuition",
    icon: HiOutlineCash,
  },
] as const satisfies readonly MenuItem[];

export const COHORT_STUDENT_MENU = [
  {
    title: "Tổng quan",
    path: "/student",
    icon: HiOutlineHome,
  },
  {
    title: "Thông tin cá nhân",
    path: "/student/profile",
    icon: HiOutlineIdentification,
  },
  {
    title: "Kết quả học tập",
    path: "/student/results",
    icon: HiOutlineAcademicCap,
  },
  {
    title: "Quản lý lịch học",
    path: "/student/time-table",
    icon: HiOutlineCalendar,
  },
  {
    title: "Thành tích",
    path: "/student/achievements",
    icon: HiOutlineBadgeCheck,
  },
  {
    title: "Thông báo",
    path: "/student/notification",
    icon: HiOutlineBell,
  },
] as const satisfies readonly MenuItem[];
