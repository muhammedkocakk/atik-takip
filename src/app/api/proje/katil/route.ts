import { NextResponse } from "next/server";
import { katilimEkle } from "@/lib/proje-actions";

export async function POST(request: Request) {
  try {
    const girdi = await request.json();
    if (!girdi || typeof girdi !== "object") {
      return NextResponse.json({ ok: false, error: "Geçersiz veri." }, { status: 400 });
    }
    const sonuc = await katilimEkle(girdi);
    return NextResponse.json(sonuc, { status: sonuc.ok ? 200 : 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
