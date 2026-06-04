import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminCookie, ADMIN_COOKIE } from "@/lib/admin-auth";
import { kutuAsamaGuncelle, isValidKampus } from "@/lib/data";
import type { AsamaKod } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const store = await cookies();
    const yetkili = await verifyAdminCookie(store.get(ADMIN_COOKIE)?.value);
    if (!yetkili) {
      return NextResponse.json(
        { ok: false, error: "Yetkisiz. Önce admin girişi yapın." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { kampus, kutuId, asama, not } = body;

    if (!isValidKampus(kampus) || typeof kutuId !== "string") {
      return NextResponse.json({ ok: false, error: "Geçersiz kutu." }, { status: 400 });
    }

    const sonuc = await kutuAsamaGuncelle(
      kampus,
      kutuId,
      asama as AsamaKod,
      typeof not === "string" ? not : undefined,
      true
    );

    return NextResponse.json(sonuc, { status: sonuc.ok ? 200 : 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
