"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { KELIME_MAX_UZUNLUK } from "@/lib/kelime-constants";

export function KelimeForm() {
  const router = useRouter();
  const [metin, setMetin] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setBasari(false);
    setYukleniyor(true);

    try {
      const res = await fetch("/api/kelime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metin }),
      });
      const data = await res.json();
      if (!data.ok) {
        setHata(data.error ?? "Bir hata oluştu.");
        return;
      }
      setMetin("");
      setBasari(true);
      router.refresh();
    } catch {
      setHata("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="kelime" className="block text-sm font-medium text-slate-700">
        Atık deyince aklınıza ne geliyor?
      </label>
      <p className="text-xs text-slate-500">
        Tek kelime veya kısa cümle (en fazla {KELIME_MAX_UZUNLUK} karakter) — kayıtlar kalıcıdır
      </p>
      <div className="flex gap-2">
        <input
          id="kelime"
          type="text"
          maxLength={KELIME_MAX_UZUNLUK}
          value={metin}
          onChange={(e) => setMetin(e.target.value)}
          placeholder="ör. geri dönüşüm, çevre…"
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          disabled={yukleniyor}
        />
        <button
          type="submit"
          disabled={yukleniyor || metin.trim().length < 2}
          className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {yukleniyor ? "…" : "Gönder"}
        </button>
      </div>
      {basari && (
        <p className="text-sm text-emerald-700">Teşekkürler! Kelimeniz buluta eklendi.</p>
      )}
      {hata && <p className="text-sm text-red-600">{hata}</p>}
    </form>
  );
}
