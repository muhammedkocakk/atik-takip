import Link from "next/link";
import { ProjeKarti } from "@/components/ProjeKarti";
import { onayliProjeleriGetir } from "@/lib/proje-actions";
import { PROJE_KATEGORILERI, gecerliKategori } from "@/lib/proje-constants";
import type { ProjeOzet } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ kategori?: string }>;
}

export default async function ProjelerPage({ searchParams }: PageProps) {
  const { kategori } = await searchParams;
  const seciliKategori = kategori && gecerliKategori(kategori) ? kategori : null;

  let projeler: ProjeOzet[] = [];
  let yuklenemedi = false;
  try {
    projeler = await onayliProjeleriGetir();
  } catch (e) {
    console.error("[projeler] liste yüklenemedi:", e);
    yuklenemedi = true;
  }

  const gorunen = seciliKategori ? projeler.filter((p) => p.kategori === seciliKategori) : projeler;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Öğrenci projeleri</h1>
        <p className="mt-2 text-slate-500">
          Sürdürülebilir bir kampüs için fikrini paylaş ya da ilgini çeken bir projeye katıl.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/projeler/yeni"
          className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-lg transition hover:shadow-xl"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">
            💡
          </span>
          <span>
            <span className="block font-bold">Proje Fikrim Var</span>
            <span className="block text-sm text-emerald-50/90">Fikrini anlat, ekip arkadaşı bul</span>
          </span>
        </Link>
        <a
          href="#liste"
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-2xl">
            🤝
          </span>
          <span>
            <span className="block font-bold text-slate-900">Bir Projeye Katılmak İstiyorum</span>
            <span className="block text-sm text-slate-500">Aşağıdaki projelere göz at</span>
          </span>
        </a>
      </div>

      <section id="liste" className="scroll-mt-24 space-y-4">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <KategoriFiltre href="/projeler#liste" aktif={!seciliKategori}>
            Tümü
          </KategoriFiltre>
          {PROJE_KATEGORILERI.map((k) => (
            <KategoriFiltre
              key={k.kod}
              href={`/projeler?kategori=${k.kod}#liste`}
              aktif={seciliKategori === k.kod}
            >
              {k.emoji} {k.ad}
            </KategoriFiltre>
          ))}
        </div>

        {yuklenemedi ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">
            Projeler şu anda yüklenemedi. Lütfen biraz sonra tekrar deneyin.
          </p>
        ) : gorunen.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-3xl">🌱</p>
            <p className="mt-2 font-semibold text-slate-800">
              {seciliKategori ? "Bu kategoride henüz proje yok." : "Henüz yayınlanmış proje yok."}
            </p>
            <Link
              href="/projeler/yeni"
              className="mt-3 inline-block text-sm font-semibold text-emerald-700 hover:underline"
            >
              İlk fikri sen paylaş →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {gorunen.map((p) => (
              <ProjeKarti key={p.id} proje={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function KategoriFiltre({
  href,
  aktif,
  children,
}: {
  href: string;
  aktif: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium transition ${
        aktif
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </Link>
  );
}
