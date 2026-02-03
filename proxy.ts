import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isLoggedIn = (request: NextRequest) => {
  const hasLocal = request.cookies.get("ipm_access")?.value;
  const hasSpotify = request.cookies.get("spotify_access_token")?.value;
  const hasLastfm = request.cookies.get("lastfm_user")?.value;
  return Boolean(hasLocal || hasSpotify || hasLastfm);
};

export function proxy(request: NextRequest) {
  if (isLoggedIn(request)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|login|.*\\..*).*)"],
};
