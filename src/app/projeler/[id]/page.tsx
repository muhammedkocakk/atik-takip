import Link from "next/link";
import { notFound } from "next/navigation";
import { KatilimciSayisi, KatkiEtiketleri } from "@/components/ProjeKarti";
import { ProjeKatilimForm } from "@/components/ProjeKatilimForm";
import { formatTarih } from "@/lib/format-tarih";
import { onayliProjeGetir } from "@/lib/proje-actions";
import { kategoriBul } from "@/lib/proje-constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjeDetayPage({ params }: PageProps) {
  const { id } = await params;
  const proje = await onayliProjeGetir(id);
  if (!proje) notFound();

  const kategori = kategoriBul(proje.kategori);

  return (
    <div className="space-y-6">
      <Link
        href="/projeler"
        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Projeler
      </Link>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-800 p-6 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            {kategori.emoji} {kategori.ad}
          </span>
          <h1 className="mt-3 text-2xl font-bold leading-tight">{proje.ad}</h1>
          <p className="mt-2 text-xs text-white/70">{formatTarih(proje.olusturma_tarihi)}</p>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Hangi soruna çözüm oluyor?
            </h2>
            <p className="mt-2 whitespace-pre-line text-slate-700">{proje.sorun}</p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fikir</h2>
            <p className="mt-2 whitespace-pre-line text-slate-700">{proje.ozet}</p>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Destek aradığı alanlar
            </h2>
            <KatkiEtiketleri kodlar={proje.destek_alanlari} />
          </section>

          <KatilimciSayisi sayi={proje.katilimci_sayisi} />
        </div>
      </article>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">🤝 Bu projeye katılmak istiyorum</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">
          Bölümünü ve nasıl katkı sağlayabileceğini seç; proje ekibi seninle iletişime geçsin.
        </p>
        <ProjeKatilimForm projeId={proje.id} projeAd={proje.ad} />
      </section>
    </div>
  );
}
