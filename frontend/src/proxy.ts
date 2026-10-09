import { NextResponse, type NextRequest } from "next/server";

const RESERVED_ROOT_SEGMENTS = new Set([
  "admin",
  "api",
  "uploads",
  "_next",
  "favicon.ico",
]);

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  // `/.well-known/*` is a reserved URL space, not a clinic slug. Keep these
  // requests out of the dynamic `/:clinicSlug/admin` route tree.
  if (firstSegment === ".well-known") {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  if (firstSegment === "admin") {
    const remainingPath = segments.slice(1).join("/");
    // The unscoped login URL is the platform's demo login. Tenant logins use
    // their explicit `/{clinicSlug}/admin/login` URL and must not depend on a
    // stale clinicSlug cookie.
    const clinicSlug = remainingPath === "login"
      ? "demo"
      : request.cookies.get("clinicSlug")?.value || "demo";
    const target = new URL(`/${clinicSlug}/admin${remainingPath ? `/${remainingPath}` : ""}`, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target);
  }

  if (!firstSegment) {
    const response = NextResponse.next();
    response.cookies.set("clinicSlug", "demo", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return response;
  }

  if (RESERVED_ROOT_SEGMENTS.has(firstSegment)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("X-Clinic-Slug", firstSegment);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.cookies.set("clinicSlug", firstSegment, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
