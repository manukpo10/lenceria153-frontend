import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("authUser")?.value;
  const isLogin = request.nextUrl.pathname === "/login";
  const isApi = request.nextUrl.pathname.startsWith("/api");
  const isAsset = request.nextUrl.pathname.startsWith("/_next") || request.nextUrl.pathname.includes(".");

  if (isAsset || isApi || isLogin) return NextResponse.next();

  if (!token && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};