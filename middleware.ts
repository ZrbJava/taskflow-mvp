import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
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
});

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/login"],
};
