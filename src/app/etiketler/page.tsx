import Link from "next/link";
import { QrEtiket } from "@/components/QrEtiket";
import { PrintButton } from "@/components/PrintButton";
import { KAMPUSLER } from "@/lib/constants";
import { getTumKutular } from "@/lib/data";
import { getSiteBaseUrl } from "@/lib/site-url";
import type { KampusKod } from "@/lib/constants";

export default async function EtiketlerPage() {
  const kutular = await getTumKutular();
  const siteUrl = getSiteBaseUrl();

  const gruplar = (Object.keys(KAMPUSLER) as KampusKod[]).map((kod) => ({
    kampus: KAMPUSLER[kod],
    kutular: kutular.filter((k) => k.kampus_kod === kod),
  }));

  return (
    <div className="space-y-8">
      <div className="print:hidden">
        <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline">
          ← Ana sayfa
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">QR etiketler</h1>
        <p className="mt-2 text-slate-600 leading-relaxed">
          Her kartın ortasında <strong>yazdırılabilir QR kod</strong> vardır. Kutuya
          yapıştırın; öğrenci veya personel telefonla okutunca doğrudan takip sayfası
          açılır. Teknik adresleri görmek zorunda değiller.
        </p>
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Nasıl kullanılır?</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-emerald-800">
            <li>Aşağıdan ilgili kampüs etiketlerini yazdırın</li>
            <li>QR’lı yüzü kutunun üstüne yapıştırın (laminasyon önerilir)</li>
            <li>Yönetim panelinden aşamayı güncelleyin — araç “yolda” görünsün</li>
          </ol>
          <p className="mt-3 text-xs text-emerald-700">
            Canlı site adresi: <strong>{siteUrl}</strong> — Vercel’e yükledikten sonra
            .env içinde NEXT_PUBLIC_SITE_URL güncelleyin ve bu sayfayı yeniden yazdırın.
          </p>
        </div>
        <div className="mt-6">
          <PrintButton />
        </div>
      </div>

      {gruplar.map(({ kampus, kutular: liste }) => (
        <section key={kampus.kod} className="space-y-4">
          <h2 className="border-b border-slate-200 pb-2 text-xl font-bold text-slate-900 print:mt-8">
            {kampus.ad}
          </h2>
          {liste.length === 0 ? (
            <p className="text-slate-500">Bu kampüste henüz kutu tanımlı değil.</p>
          ) : (
            <div className="grid gap-6">
              {liste.map((kutu) => (
                <QrEtiket key={`${kutu.kampus_kod}-${kutu.id}`} kutu={kutu} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
