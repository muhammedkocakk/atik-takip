import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminCookie } from "@/lib/admin-auth";
import { kelimeSil } from "@/lib/kelime-actions";

export async function DELETE(request: Request) {
  const store = await cookies();
  const yetkili = await verifyAdminCookie(store.get(ADMIN_COOKIE)?.value);
  if (!yetkili) {
    return NextResponse.json({ ok: false, error: "Yetkisiz." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "id gerekli." }, { status: 400 });
  }

  const sonuc = await kelimeSil(id, true);
  return NextResponse.json(sonuc, { status: sonuc.ok ? 200 : 400 });
}
