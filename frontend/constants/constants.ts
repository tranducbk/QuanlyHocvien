/**
 * Các hằng số dùng chung cho toàn bộ ứng dụng
 */

export const TOAST_CONFIG = {
  DEFAULT_DURATION: 3000,
} as const;

export const JWT_CONFIG = {
  DEFAULT_EXPIRED_DATE: 7,
} as const;

export const PROTECTED_ROUTES = ["/student", "/commander", "/admin"] as const;
export const AUTH_ROUTES = ["/login"] as const;

export const ROLES = {
  ADMIN: { ID: 1, NAME: "Admin", ROLE: "ADMIN", PATH: "/admin" },
  COMMANDER: { ID: 2, NAME: "Chỉ huy", ROLE: "COMMANDER", PATH: "/commander" },
  STUDENT: { ID: 3, NAME: "Học viên", ROLE: "STUDENT", PATH: "/student" },
} as const;

export const THEMES = {
  DEFAULT_THEME: "light",
  LIGHT: "light",
  DARK: "dark",
} as const;

export const DEFAULT_VALUES = {
  DEFAULT_ADMIN_NAME: "Admin",
  DEFAULT_COMMANDER_NAME: "Chỉ huy đơn vị",
  DEFAULT_STUDENT_NAME: "Học viên",
  DEFAULT_DEBOUNCE_DELAY: 500,
} as const;

export const DEFAULT_PAGE = {
  PAGE_INDEX: 0,
  PAGE_SIZE: 10,
} as const;

export const RANKS = {
  PRIVATE_SECOND_CLASS: 'Binh nhì',
  PRIVATE_FIRST_CLASS: 'Binh nhất',
  CORPORAL: 'Hạ sĩ',
  SERGEANT: 'Trung sĩ',
  STAFF_SERGEANT: 'Thượng sĩ',
  SECOND_LIEUTENANT: 'Thiếu úy',
  FIRST_LIEUTENANT: 'Trung úy',
  SENIOR_LIEUTENANT: 'Thượng úy',
  CAPTAIN: 'Đại úy',
  MAJOR: 'Thiếu tá',
  LIEUTENANT_COLONEL: 'Trung tá',
  SENIOR_COLONEL: 'Thượng tá',
  COLONEL: 'Đại tá',
  MAJOR_GENERAL: 'Thiếu tướng',
  LIEUTENANT_GENERAL: 'Trung tướng',
  SENIOR_GENERAL: 'Thượng tướng',
  GENERAL: 'Đại tướng',
} as const;

export const GENDER = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
} as const;
