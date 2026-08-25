import { NextResponse, type NextRequest } from "next/server";

export const VISITOR_COOKIE = "lir_vid";

/**
 * Issues the first-party visitor id — the only thing this proxy does.
 * Attribution is resolved server-side on the first /api/track call, and admin
 * auth lives in the admin layout.
 *
 * (Next.js 16 renamed `middleware` to `proxy`; the runtime is always nodejs.)
 */
export function proxy(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.get(VISITOR_COOKIE)?.value) {
    res.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === "production",
    });
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico)$).*)",
  ],
};
