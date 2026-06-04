import Link from "next/link";
import { AdminForm } from "@/components/AdminForm";
import { AdminKelimeList } from "@/components/AdminKelimeList";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { MOCK_KUTULAR } from "@/lib/mock-data";
import { getTumKutular, isSupabaseConfigured } from "@/lib/data";
import { getKelimeCevaplari, kelimeDepoTipi } from "@/lib/kelime-actions";

export default async function YonetimPage() {
  const kutular = await getTumKutular();
  const kelimeler = await getKelimeCevaplari();
  const depo = kelimeDepoTipi();

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
