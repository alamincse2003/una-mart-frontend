import { NextResponse } from "next/server";

// Admin pages are protected by the API (admin role + password/OTP session on
// every /v1/admin route) and redirect to /admin/login in the browser. This
// proxy only keeps them out of search engines and caches.
export function proxy() {
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
