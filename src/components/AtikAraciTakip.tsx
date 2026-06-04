"use client";

import { ASAMALAR, asamaIndeksi, type AsamaKod } from "@/lib/constants";
import { formatTarih } from "@/lib/format-tarih";
import type { AsamaGecmisi } from "@/lib/types";

interface AtikAraciTakipProps {
  mevcutAsama: AsamaKod;
  gecmis: AsamaGecmisi[];
  guncellemeTarihi: string;
  kampusAd: string;
}

function DurumBanner({ asama }: { asama: AsamaKod }) {
  const mesajlar: Record<AsamaKod, { baslik: string; alt: string; renk: string }> = {
    toplandi: {
      baslik: "Kampüste bekliyor",
      alt: "Atık kutusu dolu; toplama aracı planlandığında hareket edecek.",
      renk: "from-slate-600 to-slate-700",
    },
    yolda: {
      baslik: "Atık toplama aracı yolda",
      alt: "Kutunuz toplama aracına yüklendi, işleme tesisine gidiyor.",
      renk: "from-amber-500 to-orange-600",
    },
    merkezde: {
      baslik: "Tesiste işleniyor",
      alt: "Atık bertaraf veya geri dönüşüm tesisine ulaştı.",
      renk: "from-blue-600 to-indigo-700",
    },
    bertaraf: {
      baslik: "Süreç tamamlandı",
      alt: "Bu atık için takip döngüsü tamamlandı.",
      renk: "from-emerald-600 to-teal-700",
    },
  };
  const m = mesajlar[asama];

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${m.renk} p-5 text-white shadow-lg`}>
      <div className="flex items-center gap-4">
        {asama === "yolda" && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl animate-bounce-slow">
            🚛
          </div>
        )}
        {asama === "toplandi" && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
            🏛️
          </div>
        )}
        {asama === "merkezde" && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
            🏭
          </div>
        )}
        {asama === "bertaraf" && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
            ✓
          </div>
        )}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/80">
            Canlı durum
          </p>
          <h3 className="text-lg font-bold">{m.baslik}</h3>
          <p className="mt-1 text-sm text-white/90">{m.alt}</p>
        </div>
      </div>
    </div>
  );
}

function Ikon({ tip, aktif, tamamlandi }: { tip: string; aktif: boolean; tamamlandi: boolean }) {
  const emojiler: Record<string, string> = {
    kampüs: "🏛️",
    arac: "🚛",
    tesis: "🏭",
    tamam: "✅",
  };
  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl transition-all ${
        aktif
          ? "scale-110 bg-brand-600 text-white shadow-lg ring-4 ring-brand-100"
          : tamamlandi
            ? "bg-brand-100 text-brand-800"
            : "bg-slate-100 text-slate-400"
      }`}
    >
      {emojiler[tip] ?? "•"}
    </div>
  );
}

export function AtikAraciTakip({
  mevcutAsama,
  gecmis,
  guncellemeTarihi,
  kampusAd,
}: AtikAraciTakipProps) {
  const aktifIndeks = asamaIndeksi(mevcutAsama);
  const aracKonum = aktifIndeks === 0 ? 8 : aktifIndeks === 1 ? 38 : aktifIndeks === 2 ? 68 : 92;

  return (
    <div className="space-y-6">
      <DurumBanner asama={mevcutAsama} />

      {/* Rota — atık aracı animasyonu */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Toplama rotası
        </p>
        <p className="mb-5 text-sm text-slate-600">
          <span className="font-medium text-slate-800">{kampusAd}</span>
          {" → "}
          toplama aracı → işleme tesisi → tamamlandı
        </p>

        <div className="relative mx-2 mb-10 mt-4 h-2 rounded-full bg-slate-100">
          <div
            className="absolute h-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-700"
            style={{ width: `${aracKonum}%` }}
          />
          {mevcutAsama === "yolda" && (
            <div
              className="absolute -top-1 h-4 w-4 rounded-full bg-amber-400 opacity-75 animate-pulse-road"
              style={{ left: `${aracKonum}%`, transform: "translateX(-50%)" }}
            />
          )}
          <div
            className={`absolute -top-7 flex flex-col items-center transition-all duration-700 ${
              mevcutAsama === "yolda" ? "animate-truck-drive" : ""
            }`}
            style={{ left: `${aracKonum}%`, transform: "translateX(-50%)" }}
          >
            <span className="text-2xl drop-shadow-md" title="Atık toplama aracı">
              🚛
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {ASAMALAR.map((asama, index) => {
            const tamamlandi = index <= aktifIndeks;
            const aktif = index === aktifIndeks;
            return (
              <div key={asama.kod} className="flex flex-col items-center text-center">
                <Ikon tip={asama.ikon} aktif={aktif} tamamlandi={tamamlandi} />
                <p
                  className={`mt-2 text-xs font-semibold leading-tight ${
                    aktif ? "text-brand-700" : tamamlandi ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {asama.kisaAd}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detay adımlar */}
      <div className="space-y-3">
        {ASAMALAR.map((asama, index) => {
          const tamamlandi = index <= aktifIndeks;
          const aktif = index === aktifIndeks;
          const kayit = [...gecmis].reverse().find((g) => g.asama === asama.kod);

          return (
            <div
              key={asama.kod}
              className={`flex gap-4 rounded-xl border p-4 transition ${
                aktif
                  ? "border-brand-300 bg-brand-50/80 shadow-sm"
                  : tamamlandi
                    ? "border-slate-200 bg-white"
                    : "border-slate-100 bg-slate-50/50 opacity-60"
              }`}
            >
              <div className="shrink-0 pt-0.5">
                {tamamlandi ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm text-white">
                    ✓
                  </span>
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className={`font-semibold ${aktif ? "text-brand-900" : "text-slate-800"}`}>
                  {asama.ad}
                </h4>
                <p className="text-sm text-slate-500">{asama.aciklama}</p>
                {kayit && (
                  <p className="mt-2 text-xs text-slate-400">
                    {formatTarih(kayit.olusturma_tarihi)}
                    {kayit.aciklama ? ` · ${kayit.aciklama}` : ""}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400">
        Son güncelleme: {formatTarih(guncellemeTarihi)}
      </p>
    </div>
  );
}
