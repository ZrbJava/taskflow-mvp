import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Keep middleware minimal for Vercel Edge size limit and avoid
  // false negatives from token decoding differences in Auth.js v5.
  const hasSessionCookie =
    req.cookies.has("__Secure-authjs.session-token") ||
    req.cookies.has("authjs.session-token");
  const isLoggedIn = hasSessionCookie;
  const { pathname, search } = req.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/tasks");

  if (isProtected && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/login") && isLoggedIn) {
    return NextResponse.redirect(new URL("/tasks", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/login"],
};
