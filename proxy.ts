import { NextResponse, type NextRequest } from "next/server";

// The admin panel has no real auth until the NestJS role guard exists
// (SYSTEM_DESIGN: "a hidden frontend route is not a protected route"). So in
// production it doesn't exist at all unless ADMIN_PREVIEW=1 is set; on
// localhost (`next dev`) it's always available.
export function proxy(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && process.env.ADMIN_PREVIEW !== "1") {
    return request.nextUrl.pathname.startsWith("/api/")
      ? NextResponse.json({ message: "Not found" }, { status: 404 })
      : NextResponse.rewrite(new URL("/not-found-admin", request.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
