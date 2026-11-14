import {
  AiOutlineAppstore,
  AiOutlineBank,
  AiOutlineCalendar,
  AiOutlineCheckCircle,
  AiOutlineDollar,
  AiOutlineHome,
  AiOutlineIdcard,
  AiOutlineProfile,
  AiOutlineRead,
  AiOutlineReload,
  AiOutlineStop,
} from "@/library/icons";
import React from "react";

export type MenuItem = {
  title: string;
  path: string;
  icon: React.ElementType;
  disabled?: boolean;
};

export const COHORT_COMMANDER_MENU: MenuItem[] = [
  { title: "Tổng quan", path: "/commander", icon: AiOutlineHome },
  { title: "Chương trình đào tạo", path: "/commander/training-programs", icon: AiOutlineRead },
  { title: "Quản lý lớp học", path: "/commander/training-classes", icon: AiOutlineAppstore },
  { title: "Hồ sơ học viên", path: "/commander/profiles", icon: AiOutlineIdcard },
  { title: "Phê duyệt đề xuất", path: "/commander/approvals", icon: AiOutlineCheckCircle },
  { title: "Quản lý thành tích", path: "/commander/achievements", icon: AiOutlineStop },
  { title: "Lịch học", path: "/commander/time-tables", icon: AiOutlineCalendar },
  { title: "Quản lý học tập", path: "/commander/academic-results", icon: AiOutlineRead },
  { title: "Môn học", path: "/commander/subjects", icon: AiOutlineRead },
  { title: "Phân công lịch trực", path: "/commander/duty-schedules", icon: AiOutlineProfile },
];

export const COMMANDER_MENU = [
  {
    title: "Tổng quan",
    path: "/commander",
    icon: AiOutlineHome,
  },
  {
    title: "Chương trình đào tạo",
    path: "/commander/training-programs",
    icon: AiOutlineRead,
  },
  {
    title: "Cơ sở đào tạo",
    path: "/commander/universities",
    icon: AiOutlineBank,
  },
  {
    title: "Quản lý lớp học",
    path: "/commander/training-classes",
    icon: AiOutlineAppstore,
  },
  {
    title: "Hồ sơ học viên",
    path: "/commander/profiles",
    icon: AiOutlineIdcard,
  },
  {
    title: "Phê duyệt đề xuất",
    path: "/commander/approvals",
    icon: AiOutlineCheckCircle,
  },
  {
    title: "Quản lý thành tích",
    path: "/commander/achievements",
    icon: AiOutlineStop,
  },
  {
    title: "Lịch học",
    path: "/commander/time-tables",
    icon: AiOutlineCalendar,
  },
  {
    title: "Cắt cơm",
    path: "/commander/cut-rice",
    icon: AiOutlineReload,
  },
  {
    title: "Quản lý học phí",
    path: "/commander/tuition",
    icon: AiOutlineDollar,
  },
  {
    title: "Quản lý học tập",
    path: "/commander/academic-results",
    icon: AiOutlineRead,
  },
  {
    title: "Phân công lịch trực",
    path: "/commander/duty-schedules",
    icon: AiOutlineProfile,
  },
] as const satisfies readonly MenuItem[];
