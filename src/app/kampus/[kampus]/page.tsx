import Link from "next/link";
import { notFound } from "next/navigation";
import { KutuCard } from "@/components/KutuCard";
import { KAMPUSLER } from "@/lib/constants";
import { getKutularByKampus, isValidKampus } from "@/lib/data";

interface PageProps {
  params: Promise<{ kampus: string }>;
}

export default async function KampusPage({ params }: PageProps) {
  const { kampus: kampusParam } = await params;

  if (!isValidKampus(kampusParam)) notFound();

  const kampus = KAMPUSLER[kampusParam];
  const kutular = await getKutularByKampus(kampusParam);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline">
          ← Ana sayfa
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{kampus.ad}</h1>
        <p className="mt-1 text-slate-500">{kutular.length} atık kutusu</p>
      </div>

      <div className="space-y-3">
        {kutular.map((kutu) => (
          <KutuCard key={`${kutu.kampus_kod}-${kutu.id}`} kutu={kutu} />
        ))}
      </div>

    </div>
  );
}
