import Link from "next/link";
import { AdminForm } from "@/components/AdminForm";
import { AdminKelimeList } from "@/components/AdminKelimeList";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { AdminProjeList } from "@/components/AdminProjeList";
import { MOCK_KUTULAR } from "@/lib/mock-data";
import { getTumKutular, isSupabaseConfigured } from "@/lib/data";
import { getKelimeCevaplari, kelimeDepoTipi } from "@/lib/kelime-actions";
import { projeDepoTipi, tumProjeleriGetir } from "@/lib/proje-actions";
import type { ProjeYonetim } from "@/lib/types";

export default async function YonetimPage() {
  const kutular = await getTumKutular();
  const kelimeler = await getKelimeCevaplari();
  const depo = kelimeDepoTipi();
  const projeDepo = projeDepoTipi();

  let projeler: ProjeYonetim[] = [];
  let projeHatasi = false;
  try {
    projeler = await tumProjeleriGetir();
  } catch (e) {
    console.error("[yonetim] projeler yüklenemedi:", e);
    projeHatasi = true;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
        <h1 className="text-2xl font-bold text-slate-900">Yönetim paneli</h1>
        <p className="mt-2 text-slate-500">
          Atık toplama aracı hareketini simüle etmek için aşamayı güncelleyin.
          Örneğin kutu dolunca <strong>Toplama aracında</strong> seçin.
        </p>
        <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Kelime deposu:{" "}
          <strong>{depo === "supabase" ? "Supabase (veritabanı)" : "Yerel dosya (data/kelimeler.json)"}</strong>
          {!isSupabaseConfigured() && (
            <span className="block mt-1 text-amber-800">
              Kalıcı veri için Supabase bağlayın veya yerel dosya otomatik kullanılır.
            </span>
          )}
        </p>
        </div>
        <AdminLogoutButton />
      </div>

      <AdminForm kutular={kutular.length ? kutular : MOCK_KUTULAR} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Proje fikirleri</h2>
        <p className="mt-1 text-sm text-slate-500">
          Onayladığınız fikirler <Link href="/projeler" className="font-medium text-emerald-700 hover:underline">projeler sayfasında</Link>{" "}
          yayınlanır. İletişim bilgileri yalnızca burada görünür.
        </p>
        {projeDepo === "yapilandirma-eksik" ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Vercel ortam değişkenlerine <strong>SUPABASE_SERVICE_ROLE_KEY</strong> eklenmemiş. Ekleyip
            yeniden deploy edene kadar proje fikirleri kaydedilemez.
          </p>
        ) : projeHatasi ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Projeler yüklenemedi. Supabase&apos;de <strong>supabase/proje-fikirleri.sql</strong> dosyasının
            çalıştırıldığından emin olun.
          </p>
        ) : (
          <div className="mt-4">
            <AdminProjeList projeler={projeler} />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Kelime bulutu yönetimi</h2>
        <p className="mt-1 text-sm text-slate-500">
          Uygunsuz veya hatalı kelimeleri silebilirsiniz.
        </p>
        <div className="mt-4">
          <AdminKelimeList kelimeler={kelimeler} />
        </div>
      </section>

      <Link
        href="/etiketler"
        className="inline-block text-sm font-semibold text-emerald-700 hover:underline"
      >
        → QR etiketleri yazdır ve kutulara yapıştır
      </Link>
    </div>
  );
}
