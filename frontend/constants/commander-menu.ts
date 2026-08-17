import React from "react";
import {
  HiOutlineOfficeBuilding,
  HiOutlineIdentification,
  HiOutlineCheckCircle,
  HiOutlineStop,
  HiOutlineCalendar,
  HiOutlineCash,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlineViewGrid,
  HiOutlineHome,
  HiOutlineRefresh,
} from "react-icons/hi";

export type MenuItem = {
  title: string;
  path: string;
  icon: React.ElementType;
};

export const COMMANDER_MENU = [
  {
    title: "Tổng quan",
    path: "/commander",
    icon: HiOutlineHome,
  },
  {
    title: "Cơ sở đào tạo",
    path: "/commander/universities",
    icon: HiOutlineOfficeBuilding,
  },
  {
    title: "Quản lý lớp học",
    path: "/commander/classes",
    icon: HiOutlineViewGrid,
  },
  {
    title: "Hồ sơ học viên",
    path: "/commander/profiles",
    icon: HiOutlineIdentification,
  },
  {
    title: "Phê duyệt đề xuất",
    path: "/commander/approvals",
    icon: HiOutlineCheckCircle,
  },
  {
    title: "Quản lý thành tích",
    path: "/commander/achievements",
    icon: HiOutlineStop,
  },
  {
    title: "Lịch học",
    path: "/commander/time-tables",
    icon: HiOutlineCalendar,
  },
  {
    title: "Cắt cơm",
    path: "/commander/cut-rice",
    icon: HiOutlineRefresh,
  },
  {
    title: "Quản lý học phí",
    path: "/commander/tuition",
    icon: HiOutlineCash,
  },
  {
    title: "Quản lý học tập",
    path: "/commander/academic-results",
    icon: HiOutlineAcademicCap,
  },
  {
    title: "Quản lý học kỳ",
    path: "/commander/semesters",
    icon: HiOutlineAcademicCap,
  },
  {
    title: "Phân công lịch trực",
    path: "/commander/duty-schedules",
    icon: HiOutlineClipboardList,
  },
] as const satisfies readonly MenuItem[];
