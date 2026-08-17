export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    PROFILE: "/api/auth/profile",
    REGISTER: "/api/auth/register",
    REFRESH_TOKEN: "/api/auth/refresh-token",
    CHANGE_PASSWORD: "/api/auth/change-password",
    NOTIFICATIONS: "/api/auth/notifications",
    NOTIFICATION_DETAIL: (id: string | number) =>
      `/api/auth/notifications/${id}`,
    MARK_NOTIFICATION_READ: (id: string | number) =>
      `/api/auth/notifications/${id}/read`,
    MARK_ALL_NOTIFICATIONS_READ: "/api/auth/notifications/read-all",
    AVATAR: "/api/users/avatar",
  },
  USERS: {
    BASE: "/api/users",
    DETAIL: (id: string | number) => `${ENDPOINTS.USERS.BASE}/${id}`,
    PROFILES: "/api/users/profiles",
    PROFILE_DETAIL: (id: string | number) =>
      `${ENDPOINTS.USERS.BASE}/profiles/${id}`,
    TOGGLE_ACTIVE: (id: string | number) =>
      `${ENDPOINTS.USERS.BASE}/${id}/toggle-active`,
    RESET_PASSWORD: (id: string | number) =>
      `${ENDPOINTS.USERS.BASE}/${id}/reset-password`,
    BATCH: "/api/users/batch",
    BATCH_PROFILES: "/api/users/batch-profiles",
    BATCH_PROFILES_TEMPLATE: "/api/users/batch-profiles/template",
    IMPORT: "/api/users/import",
    IMPORT_TEMPLATE: "/api/users/import-template",
    EXPORT: "/api/users/export",
  },
  UNIVERSITIES: {
    BASE: "/api/universities",
  },
  ORGANIZATIONS: {
    BASE: "/api/organizations",
  },
  EDUCATION_LEVELS: {
    BASE: "/api/education-levels",
  },
  CLASSES: {
    BASE: "/api/classes",
    STUDENTS: (id: string | number) => `/api/classes/${id}/students`,
    STUDENT_DETAIL: (id: string | number, userId: string | number) =>
      `/api/classes/${id}/students/${userId}`,
    ASSIGN_STUDENTS_BATCH: (id: string | number) =>
      `/api/classes/${id}/students/batch`,
  },
  SEMESTERS: {
    BASE: "/api/semesters",
    SCHOOL_YEARS: "/api/semesters/school-years",
    TERMS: "/api/semesters/terms",
  },
  TIME_TABLES: {
    BASE: "/api/time-tables",
    REPORT: "/api/time-tables/report",
    IMPORT: "/api/time-tables/import",
    TEMPLATE: "/api/time-tables/template",
    EXPORT: "/api/time-tables/export",
    TIME_TABLE: "/api/users/time-table",
    MY_SEMESTERS: "/api/users/time-table-semesters",
  },
  TUITION_FEES: {
    BASE: "/api/tuition-fees",
    IMPORT: "/api/tuition-fees/import",
    TEMPLATE: "/api/tuition-fees/template",
    MY: "/api/users/tuition-fees",
  },
  CUT_RICE: {
    BASE: "/api/cut-rice",
    MY: "/api/users/cut-rice",
    MY_REQUESTS: "/api/users/cut-rice/requests",
    REQUESTS: "/api/cut-rice/requests",
    APPROVE_REQUEST: (id: string | number) =>
      `/api/cut-rice/requests/${id}/approve`,
    REJECT_REQUEST: (id: string | number) =>
      `/api/cut-rice/requests/${id}/reject`,
    IMPORT: "/api/cut-rice/import",
    TEMPLATE: "/api/cut-rice/template",
    EXPORT: "/api/cut-rice/export",
    GENERATE: (userId: string | number) =>
      `/api/users/cut-rice/generate/${userId}`,
    GENERATE_ALL: "/api/users/cut-rice/generate-all",
  },
  DUTY_SCHEDULES: {
    BASE: "/api/commander-duty-schedules",
  },
  ACADEMIC_RESULTS: {
    BASE: "/api/users/academic-results",
  },
  SUBJECT_RESULTS: {
    BASE: "/api/subject-results",
    DETAIL: (id: string | number) => `/api/subject-results/${id}`,
  },
  SEMESTER_RESULTS: {
    BASE: "/api/semester-results",
    DETAIL: (id: string | number) => `/api/semester-results/${id}`,
  },
  ACHIEVEMENTS: {
    BASE: "/api/achievements",
    IMPORT: "/api/achievements/import",
    TEMPLATE: "/api/achievements/template",
    EXPORT: "/api/achievements/export",
    MY: "/api/users/achievements",
  },

  GRADE_REQUESTS: {
    STUDENT_BASE: "/api/students/grade-requests",
    STUDENT_DETAIL: (id: string | number) =>
      `/api/students/grade-requests/${id}`,
    COMMANDER_BASE: "/api/commanders/grade-requests",
    COMMANDER_DETAIL: (id: string | number) =>
      `/api/commanders/grade-requests/${id}`,
    APPROVE: (id: string | number) =>
      `/api/commanders/grade-requests/${id}/approve`,
    REJECT: (id: string | number) =>
      `/api/commanders/grade-requests/${id}/reject`,
  },
  REPORTS: {
    ADMIN_DASHBOARD: "/api/admins/dashboard",
    COMMANDER_DASHBOARD: "/api/commanders/dashboard",
    STUDENT_DASHBOARD: "/api/students/dashboard",
    TUITION: "/api/commanders/reports/tuition",
  },
} as const;
