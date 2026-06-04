import Link from "next/link";
import { ATIK_TURLERI, KAMPUSLER, ASAMALAR } from "@/lib/constants";
import { formatTarih } from "@/lib/format-tarih";
import type { Kutu } from "@/lib/types";

export function KutuCard({ kutu }: { kutu: Kutu }) {
  const tur = ATIK_TURLERI[kutu.tur];
  const asama = ASAMALAR.find((a) => a.kod === kutu.asama);
  const yolda = kutu.asama === "yolda";

  return (
    <Link
      href={`/k/${kutu.kampus_kod}/${kutu.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-lg"
    >
      <div className="h-1" style={{ backgroundColor: tur.renk }} />
      <div className="flex items-start gap-4 p-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
          style={{ backgroundColor: `${tur.renk}18` }}
        >
          {tur.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-slate-900">{tur.ad}</p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                yolda
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-50 text-emerald-800"
              }`}
            >
              {yolda ? "🚛 " : ""}
              {asama?.kisaAd}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">{kutu.konum_aciklama}</p>
          <p className="mt-2 text-xs text-slate-400">
            {KAMPUSLER[kutu.kampus_kod].kisaAd} · {formatTarih(kutu.guncelleme_tarihi)}
          </p>
        </div>
        <span className="text-slate-300 transition group-hover:text-emerald-600">→</span>
      </div>
    </Link>
  );
}
