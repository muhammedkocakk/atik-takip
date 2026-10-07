import Link from "next/link";
import { kategoriBul, katkiBul } from "@/lib/proje-constants";
import type { ProjeOzet } from "@/lib/types";

export function KatkiEtiketleri({ kodlar }: { kodlar: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {kodlar.map((kod) => {
        const k = katkiBul(kod);
        if (!k) return null;
        return (
          <span
            key={kod}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
          >
            {k.emoji} {k.ad}
          </span>
        );
      })}
    </div>
  );
}

export function KatilimciSayisi({ sayi }: { sayi: number }) {
  return (
    <span className="text-xs font-medium text-slate-500">
      {sayi === 0 ? "İlk katılan sen ol" : `👥 ${sayi} kişi katılmak istiyor`}
    </span>
  );
}

export function ProjeKarti({ proje }: { proje: ProjeOzet }) {
  const kategori = kategoriBul(proje.kategori);

  return (
    <Link
      href={`/projeler/${proje.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-lg"
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        {kategori.emoji} {kategori.ad}
      </span>
      <h3 className="mt-3 text-lg font-bold leading-snug text-slate-900 group-hover:text-emerald-800">
        {proje.ad}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{proje.sorun}</p>

      <div className="mb-5 mt-4">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Destek arıyor
        </p>
        <KatkiEtiketleri kodlar={proje.destek_alanlari} />
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <KatilimciSayisi sayi={proje.katilimci_sayisi} />
        <span className="text-sm font-semibold text-emerald-700">İncele →</span>
      </div>
    </Link>
  );
}
