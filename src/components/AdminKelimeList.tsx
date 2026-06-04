"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatTarih } from "@/lib/format-tarih";
import type { KelimeCevabi } from "@/lib/types";

export function AdminKelimeList({ kelimeler }: { kelimeler: KelimeCevabi[] }) {
  const router = useRouter();
  const [siliniyor, setSiliniyor] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState("");

  async function handleSil(id: string) {
    if (!confirm("Bu kelimeyi silmek istediğinize emin misiniz?")) return;
    setSiliniyor(id);
    setMesaj("");

    try {
      const res = await fetch(`/api/admin/kelime?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.ok) {
        setMesaj(data.error ?? "Silinemedi.");
        return;
      }
      router.refresh();
    } catch {
      setMesaj("Bağlantı hatası.");
    } finally {
      setSiliniyor(null);
    }
  }

  if (kelimeler.length === 0) {
    return <p className="text-sm text-slate-500">Henüz kelime yok.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-500">
        Toplam <strong>{kelimeler.length}</strong> kelime · En yeniler üstte
      </p>
      {mesaj && <p className="text-sm text-red-600">{mesaj}</p>}
      <ul className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
        {kelimeler.slice(0, 100).map((k) => (
          <li
            key={k.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <span className="font-medium text-slate-900">{k.metin}</span>
              <span className="mt-0.5 block text-xs text-slate-400">
                {formatTarih(k.olusturma_tarihi)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSil(k.id)}
              disabled={siliniyor === k.id}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              {siliniyor === k.id ? "…" : "Sil"}
            </button>
          </li>
        ))}
      </ul>
      {kelimeler.length > 100 && (
        <p className="text-xs text-slate-400">Liste: son 100 kayıt gösteriliyor.</p>
      )}
    </div>
  );
}
