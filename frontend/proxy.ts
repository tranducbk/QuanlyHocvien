import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTES, ROLES } from "./constants/constants";

const ROLE_PATH_MAP: Record<string, string> = {
  [ROLES.ADMIN.ROLE]: ROLES.ADMIN.PATH,
  [ROLES.COMMANDER.ROLE]: ROLES.COMMANDER.PATH,
  [ROLES.STUDENT.ROLE]: ROLES.STUDENT.PATH,
};

const TRAINING_SYSTEM_CODES = ["HE_1", "HE_3", "HE_4", "HE_5", "HE_7"];

export default function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const role = request.cookies.get("role")?.value;
  const trainingSystemCode = request.cookies.get("trainingSystemCode")?.value;
  const hasAssignedSystem = Boolean(trainingSystemCode && TRAINING_SYSTEM_CODES.includes(trainingSystemCode));
  const isHe5 = trainingSystemCode === "HE_5";
  const isCohort = Boolean(trainingSystemCode && ["HE_1", "HE_3", "HE_4", "HE_7"].includes(trainingSystemCode));
  const { pathname } = request.nextUrl;

  // 1. Nếu người dùng cố gắng vào trang bảo vệ mà KHÔNG có refreshToken hoặc role hợp lệ
  if (
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) &&
    (!refreshToken || !role || !(role in ROLE_PATH_MAP) || (role !== ROLES.ADMIN.ROLE && !hasAssignedSystem))
  ) {
    const url = new URL("/login", request.url);
    // Lưu lại trang đang định vào để sau khi login xong có thể quay lại (optional)
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const rolePath =
    role && role in ROLE_PATH_MAP ? ROLE_PATH_MAP[role] : undefined;
  // 2. Nếu người dùng ĐÃ có refreshToken và role mà vẫn cố vào trang login/register
  if (
    AUTH_ROUTES.some((route) => pathname.startsWith(route)) &&
    refreshToken &&
    role &&
    rolePath && (role === ROLES.ADMIN.ROLE || hasAssignedSystem)
  ) {
    return NextResponse.redirect(new URL(rolePath, request.url));
  }

  // 3. Nếu người dùng ĐÃ có refreshToken và role nhưng cố vào trang của role khác
  if (
    pathname.startsWith(ROLES.ADMIN.PATH) &&
    role !== ROLES.ADMIN.ROLE &&
    rolePath
  ) {
    return NextResponse.redirect(new URL(rolePath, request.url));
  }
  if (
    role === ROLES.ADMIN.ROLE &&
    ["/admin/universities", "/admin/classes", "/admin/military"].some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.redirect(new URL("/admin/accounts", request.url));
  }
  if (
    pathname.startsWith(ROLES.COMMANDER.PATH) &&
    role !== ROLES.COMMANDER.ROLE &&
    rolePath
  ) {
    return NextResponse.redirect(new URL(rolePath, request.url));
  }
  if (
    pathname.startsWith(ROLES.STUDENT.PATH) &&
    role !== ROLES.STUDENT.ROLE &&
    rolePath
  ) {
    return NextResponse.redirect(new URL(rolePath, request.url));
  }

  if (
    role === ROLES.COMMANDER.ROLE &&
    isCohort &&
    pathname.startsWith("/commander/") &&
    pathname !== "/commander/training-classes" &&
    pathname !== "/commander/profiles" &&
    pathname !== "/commander/semesters" &&
    pathname !== "/commander/subjects" &&
    pathname !== "/commander/time-tables" &&
    pathname !== "/commander/achievements" &&
    pathname !== "/commander/duty-schedules" &&
    pathname !== "/commander/academic-results" &&
    pathname !== "/commander/approvals"
  ) {
    return NextResponse.redirect(
      new URL("/commander", request.url)
    );
  }
  if (
    role === ROLES.COMMANDER.ROLE &&
    isHe5 &&
    pathname === "/commander/training-classes"
  ) {
    return NextResponse.redirect(new URL("/commander", request.url));
  }
  if (
    role === ROLES.COMMANDER.ROLE &&
    isHe5 &&
    pathname.startsWith("/commander/military/")
  ) {
    return NextResponse.redirect(new URL("/commander/classes", request.url));
  }
  if (
    role === ROLES.STUDENT.ROLE &&
    isHe5 &&
    pathname.startsWith("/student/military/")
  ) {
    return NextResponse.redirect(new URL("/student/results", request.url));
  }
  if (
    role === ROLES.STUDENT.ROLE &&
    isCohort &&
    pathname.startsWith("/student/military/") &&
    pathname !== "/student/military/unavailable" &&
    ![
      "/student/military/results",
      "/student/military/time-table",
      "/student/military/achievements",
    ].includes(pathname)
  ) {
    return NextResponse.redirect(new URL("/student/military/unavailable", request.url));
  }
  if (role === ROLES.STUDENT.ROLE && isCohort && pathname.startsWith("/student/military/")) {
    const legacyStudentRoutes: Record<string, string> = {
      "/student/military/results": "/student/results",
      "/student/military/time-table": "/student/time-table",
      "/student/military/achievements": "/student/achievements",
    };
    const redirectPath = legacyStudentRoutes[pathname];
    if (redirectPath) return NextResponse.redirect(new URL(redirectPath, request.url));
  }
  if (
    role === ROLES.STUDENT.ROLE &&
    isCohort &&
    [
      "/student/meal-schedules",
      "/student/tuition",
    ].some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.redirect(new URL("/student/military/unavailable", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.svg).*)",
  ],
};
