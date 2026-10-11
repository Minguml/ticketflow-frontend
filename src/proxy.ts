import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = (request.headers.get("host") || "")
    .split(":")[0]
    .toLowerCase();
  const pathname = request.nextUrl.pathname;
  // Internal operator paths are reachable only on the operator host.
  if (
    hostname !== "operator.localhost" &&
    (pathname === "/operator" || pathname.startsWith("/operator/"))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (
    hostname === "operator.localhost" &&
    (pathname === "/" || pathname === "/login")
  ) {
    const destination = request.nextUrl.clone();
    destination.pathname = `/operator${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(destination);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/", "/login", "/operator/:path*"] };
