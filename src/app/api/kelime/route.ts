import { NextResponse } from "next/server";
import { kelimeEkle } from "@/lib/kelime-actions";

export async function POST(request: Request) {
  try {
    const { metin } = await request.json();
    if (typeof metin !== "string") {
      return NextResponse.json({ ok: false, error: "Geçersiz veri." }, { status: 400 });
    }
    const sonuc = await kelimeEkle(metin);
    return NextResponse.json(sonuc, { status: sonuc.ok ? 200 : 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
