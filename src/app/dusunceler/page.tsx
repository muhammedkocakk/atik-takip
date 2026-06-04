import { KelimeForm } from "@/components/KelimeForm";
import { WordCloud } from "@/components/WordCloud";
import { getKelimeCevaplari } from "@/lib/kelime-actions";

export default async function DusuncelerPage() {
  const cevaplar = await getKelimeCevaplari();
  const kelimeler = cevaplar.map((c) => c.metin);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sıfır atık deyince ne geliyor?</h1>
        <p className="mt-2 text-slate-500">
          Tek kelime veya kısa bir cümle yazın; cevaplar aşağıdaki bulutta toplanır.
        </p>
      </div>

      <KelimeForm />

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Kelime bulutu</h2>
        <p className="mb-4 text-sm text-slate-500">{cevaplar.length} kayıtlı cevap</p>
        <WordCloud kelimeler={kelimeler} />
      </section>
    </div>
  );
}
