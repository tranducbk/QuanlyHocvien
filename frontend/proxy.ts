import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTES, ROLES } from "./constants/constants";

const ROLE_PATH_MAP: Record<string, string> = {
  [ROLES.ADMIN.ROLE]: ROLES.ADMIN.PATH,
  [ROLES.COMMANDER.ROLE]: ROLES.COMMANDER.PATH,
  [ROLES.STUDENT.ROLE]: ROLES.STUDENT.PATH,
};

export default function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const role = request.cookies.get("role")?.value;
  const { pathname } = request.nextUrl;

  // 1. Nếu người dùng cố gắng vào trang bảo vệ mà KHÔNG có refreshToken hoặc role hợp lệ
  if (
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) &&
    (!refreshToken || !role || !(role in ROLE_PATH_MAP))
  ) {
    const url = new URL("/login", request.url);
    // Lưu lại trang đang định vào để sau khi login xong có thể quay lại (optional)
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const rolePath = role && role in ROLE_PATH_MAP ? ROLE_PATH_MAP[role] : undefined;
  // 2. Nếu người dùng ĐÃ có refreshToken và role mà vẫn cố vào trang login/register
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && refreshToken && role && rolePath) {
    return NextResponse.redirect(new URL(rolePath, request.url));
  }

  // 3. Nếu người dùng ĐÃ có refreshToken và role nhưng cố vào trang của role khác
  if (pathname.startsWith(ROLES.ADMIN.PATH) && role !== ROLES.ADMIN.ROLE && rolePath) {
    return NextResponse.redirect(new URL(rolePath, request.url));
  }
  if (pathname.startsWith(ROLES.COMMANDER.PATH) && role !== ROLES.COMMANDER.ROLE && rolePath) {
    return NextResponse.redirect(new URL(rolePath, request.url));
  }
  if (pathname.startsWith(ROLES.STUDENT.PATH) && role !== ROLES.STUDENT.ROLE && rolePath) {
    return NextResponse.redirect(new URL(rolePath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.svg).*)",
  ],
};
