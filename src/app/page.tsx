import Link from "next/link";
import { KAMPUSLER, ONERILEN_TURLER, ATIK_TURLERI } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-800 p-8 text-white shadow-xl">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
          İstün Üniversitesi · Pilot
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">
          Atığınız nerede?
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-emerald-50/95">
          Kutudaki QR kodu okutun; atığınızın kampüsten toplama aracına, işleme
          tesisine kadar olan yolculuğunu canlı izleyin.
        </p>
        <p className="mt-6 text-sm text-emerald-100/90">
          Kutudaki QR kodu okutarak takip sayfasına ulaşın.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-slate-900">Kampüsler</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.values(KAMPUSLER).map((kampus) => (
            <Link
              key={kampus.kod}
              href={`/kampus/${kampus.kod}`}
              className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl group-hover:bg-emerald-100">
                🏛️
              </div>
              <h3 className="mt-4 font-bold text-slate-900">{kampus.ad}</h3>
              <p className="mt-1 text-sm text-slate-500">Atık kutuları ve durumları</p>
              <span className="mt-4 inline-block text-sm font-semibold text-emerald-700">
                Görüntüle →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Desteklenen atık türleri</h2>
        <p className="mt-1 text-sm text-slate-500">Pilot kapsamında izlenebilir kutular</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ONERILEN_TURLER.map((kod) => {
            const t = ATIK_TURLERI[kod];
            return (
              <span
                key={kod}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                {t.emoji} {t.ad}
              </span>
            );
          })}
        </div>
      </section>

      <Link
        href="/dusunceler"
        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-violet-300 hover:shadow-md"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
          💭
        </span>
        <div>
          <p className="font-bold text-slate-900">Atık deyince ne geliyor?</p>
          <p className="text-sm text-slate-500">Kelime bulutuna katılın</p>
        </div>
      </Link>
    </div>
  );
}
