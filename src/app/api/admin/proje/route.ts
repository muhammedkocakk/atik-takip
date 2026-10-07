import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/admin-auth";
import { projeDurumGuncelle, projeSil } from "@/lib/proje-actions";

async function yetkiliMi(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminCookie(store.get(ADMIN_COOKIE)?.value);
}

export async function PATCH(request: Request) {
  if (!(await yetkiliMi())) {
    return NextResponse.json({ ok: false, error: "Yetkisiz." }, { status: 401 });
  }
  try {
    const { id, durum } = await request.json();
    if (typeof id !== "string" || typeof durum !== "string") {
      return NextResponse.json({ ok: false, error: "Geçersiz veri." }, { status: 400 });
    }
    const sonuc = await projeDurumGuncelle(id, durum, true);
    return NextResponse.json(sonuc, { status: sonuc.ok ? 200 : 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await yetkiliMi())) {
    return NextResponse.json({ ok: false, error: "Yetkisiz." }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "id gerekli." }, { status: 400 });
  }
  const sonuc = await projeSil(id, true);
  return NextResponse.json(sonuc, { status: sonuc.ok ? 200 : 400 });
}
