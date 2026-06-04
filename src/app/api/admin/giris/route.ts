import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  getAdminCookieValue,
  isAdminConfigured,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Sunucuda ADMIN_SIFRE tanımlı değil." },
      { status: 503 }
    );
  }

  try {
    const { sifre } = await request.json();
    if (sifre !== process.env.ADMIN_SIFRE) {
      return NextResponse.json({ ok: false, error: "Hatalı şifre." }, { status: 401 });
    }

    const token = await getAdminCookieValue();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }
}
