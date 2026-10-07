import Link from "next/link";
import { ProjeFikirForm } from "@/components/ProjeFikirForm";

export default function YeniProjePage() {
  return (
    <div className="space-y-6">
      <Link
        href="/projeler"
        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Projeler
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">💡 Proje Fikrim Var</h1>
        <p className="mt-2 text-slate-500">
          Fikrini kısaca anlat ve hangi konularda destek aradığını seç. İncelendikten sonra
          projeler sayfasında yayınlanır, ilgilenen öğrenciler sana katılım isteği gönderebilir.
        </p>
      </div>

      <ProjeFikirForm />
    </div>
  );
}
