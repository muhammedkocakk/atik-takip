import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/admin-auth";

const KORUNAN = ["/etiketler", "/yonetim"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const korunuyor = KORUNAN.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!korunuyor) return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (await verifyAdminCookie(token)) return NextResponse.next();

  const giris = new URL("/admin/giris", request.url);
  giris.searchParams.set("next", pathname);
  return NextResponse.redirect(giris);
}

export const config = {
  matcher: ["/etiketler", "/etiketler/:path*", "/yonetim", "/yonetim/:path*"],
};
