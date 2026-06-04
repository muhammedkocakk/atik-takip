import Link from "next/link";
import { notFound } from "next/navigation";
import { AtikAraciTakip } from "@/components/AtikAraciTakip";
import { ATIK_TURLERI, KAMPUSLER, ASAMALAR } from "@/lib/constants";
import { getAsamaGecmisi, getKutu, isValidKampus } from "@/lib/data";

interface PageProps {
  params: Promise<{ kampus: string; kutuId: string }>;
}

export default async function KutuTakipPage({ params }: PageProps) {
  const { kampus: kampusParam, kutuId } = await params;

  if (!isValidKampus(kampusParam)) notFound();

  const kutu = await getKutu(kampusParam, kutuId);
  if (!kutu) notFound();

  const gecmis = await getAsamaGecmisi(kampusParam, kutuId);
  const tur = ATIK_TURLERI[kutu.tur];
  const kampus = KAMPUSLER[kampusParam];
  const asamaAd = ASAMALAR.find((a) => a.kod === kutu.asama)?.ad;

  return (
    <div className="space-y-6">
      <Link
        href={`/kampus/${kampusParam}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
      >
        ← {kampus.kisaAd}
      </Link>

      <div
        className="overflow-hidden rounded-3xl shadow-xl"
        style={{
          background: `linear-gradient(145deg, ${tur.renk} 0%, ${tur.renk}cc 50%, #0f172a 100%)`,
        }}
      >
        <div className="p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                {kampus.ad}
              </p>
              <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold">
                <span className="text-4xl">{tur.emoji}</span>
                {tur.ad}
              </h1>
              <p className="mt-2 text-white/85">{kutu.konum_aciklama}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              {asamaAd}
            </span>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">Canlı takip</h2>
        <AtikAraciTakip
          mevcutAsama={kutu.asama}
          gecmis={gecmis}
          guncellemeTarihi={kutu.guncelleme_tarihi}
          kampusAd={kampus.ad}
        />
      </section>
    </div>
  );
}
