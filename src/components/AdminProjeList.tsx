"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { KatkiEtiketleri } from "@/components/ProjeKarti";
import { formatTarih } from "@/lib/format-tarih";
import { kategoriBul, type ProjeDurum } from "@/lib/proje-constants";
import type { ProjeYonetim } from "@/lib/types";

const DURUM_ETIKET: Record<ProjeDurum, { ad: string; sinif: string }> = {
  beklemede: { ad: "Onay bekliyor", sinif: "bg-amber-100 text-amber-800" },
  onayli: { ad: "Yayında", sinif: "bg-emerald-100 text-emerald-800" },
  reddedildi: { ad: "Reddedildi", sinif: "bg-slate-200 text-slate-600" },
};

const DURUM_SIRASI: Record<ProjeDurum, number> = { beklemede: 0, onayli: 1, reddedildi: 2 };

export function AdminProjeList({ projeler }: { projeler: ProjeYonetim[] }) {
  const router = useRouter();
  const [islemde, setIslemde] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState("");

  async function istek(id: string, init: RequestInit, url = "/api/admin/proje") {
    setIslemde(id);
    setMesaj("");
    try {
      const res = await fetch(url, { ...init, credentials: "include" });
      const data = await res.json();
      if (!data.ok) {
        setMesaj(data.error ?? "İşlem yapılamadı.");
        return;
      }
      router.refresh();
    } catch {
      setMesaj("Bağlantı hatası.");
    } finally {
      setIslemde(null);
    }
  }

  function durumDegistir(id: string, durum: ProjeDurum) {
    return istek(id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, durum }),
    });
  }

  function sil(id: string, ad: string) {
    if (!confirm(`"${ad}" fikri ve tüm katılım başvuruları silinsin mi?`)) return;
    return istek(id, { method: "DELETE" }, `/api/admin/proje?id=${encodeURIComponent(id)}`);
  }

  if (projeler.length === 0) {
    return <p className="text-sm text-slate-500">Henüz gönderilmiş proje fikri yok.</p>;
  }

  const sirali = [...projeler].sort((a, b) => DURUM_SIRASI[a.durum] - DURUM_SIRASI[b.durum]);
  const bekleyen = projeler.filter((p) => p.durum === "beklemede").length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">
        Toplam <strong>{projeler.length}</strong> fikir
        {bekleyen > 0 && (
          <>
            {" · "}
            <strong className="text-amber-700">{bekleyen} onay bekliyor</strong>
          </>
        )}
      </p>
      {mesaj && <p className="text-sm text-red-600">{mesaj}</p>}

      <ul className="space-y-3">
        {sirali.map((p) => {
          const durum = DURUM_ETIKET[p.durum];
          const kategori = kategoriBul(p.kategori);
          const mesgul = islemde === p.id;
          return (
            <li key={p.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${durum.sinif}`}>
                  {durum.ad}
                </span>
                <span className="text-xs text-slate-500">
                  {kategori.emoji} {kategori.ad} · {formatTarih(p.olusturma_tarihi)}
                </span>
              </div>

              <h3 className="mt-2 font-bold text-slate-900">{p.ad}</h3>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                <strong className="text-slate-700">Sorun:</strong> {p.sorun}
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                <strong className="text-slate-700">Fikir:</strong> {p.ozet}
              </p>
              <div className="mt-2">
                <KatkiEtiketleri kodlar={p.destek_alanlari} />
              </div>
              <p className="mt-3 text-sm text-slate-700">
                👤 {p.sahip_ad} ·{" "}
                <a href={`mailto:${p.sahip_eposta}`} className="font-medium text-emerald-700 hover:underline">
                  {p.sahip_eposta}
                </a>
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {p.durum !== "onayli" && (
                  <button
                    type="button"
                    disabled={mesgul}
                    onClick={() => durumDegistir(p.id, "onayli")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {p.durum === "beklemede" ? "Onayla ve yayınla" : "Yayına al"}
                  </button>
                )}
                {p.durum === "onayli" && (
                  <button
                    type="button"
                    disabled={mesgul}
                    onClick={() => durumDegistir(p.id, "beklemede")}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
                  >
                    Yayından kaldır
                  </button>
                )}
                {p.durum === "beklemede" && (
                  <button
                    type="button"
                    disabled={mesgul}
                    onClick={() => durumDegistir(p.id, "reddedildi")}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-50"
                  >
                    Reddet
                  </button>
                )}
                <button
                  type="button"
                  disabled={mesgul}
                  onClick={() => sil(p.id, p.ad)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Sil
                </button>
              </div>

              {p.katilimlar.length > 0 && (
                <details className="mt-3 rounded-lg border border-slate-200 bg-white">
                  <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-800">
                    🤝 {p.katilimlar.length} katılım başvurusu
                  </summary>
                  <ul className="divide-y divide-slate-100">
                    {p.katilimlar.map((k) => (
                      <li key={k.id} className="space-y-1.5 px-3 py-3 text-sm">
                        <p className="text-slate-800">
                          <strong>{k.ad}</strong> · {k.bolum}
                        </p>
                        <a href={`mailto:${k.eposta}`} className="text-emerald-700 hover:underline">
                          {k.eposta}
                        </a>
                        <KatkiEtiketleri kodlar={k.katki_alanlari} />
                        {k.mesaj && <p className="whitespace-pre-line text-slate-600">“{k.mesaj}”</p>}
                        <p className="text-xs text-slate-400">{formatTarih(k.olusturma_tarihi)}</p>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
