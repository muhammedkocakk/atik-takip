"use client";

import { useState } from "react";
import { ASAMALAR, KAMPUSLER, type AsamaKod, type KampusKod } from "@/lib/constants";
import type { Kutu } from "@/lib/types";

interface AdminFormProps {
  kutular: Kutu[];
}

export function AdminForm({ kutular }: AdminFormProps) {
  const [kampus, setKampus] = useState<KampusKod>("sutluce");
  const [kutuId, setKutuId] = useState("");
  const [asama, setAsama] = useState<AsamaKod>("yolda");
  const [not, setNot] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const kampüsKutulari = kutular.filter((k) => k.kampus_kod === kampus);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMesaj("");
    setYukleniyor(true);

    try {
      const res = await fetch("/api/admin/asama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kampus, kutuId, asama, not }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setMesaj("Oturum süresi doldu. Sayfayı yenileyip tekrar giriş yapın.");
        return;
      }
      setMesaj(data.ok ? "Aşama güncellendi — takip sayfasında araç konumu değişti." : (data.error ?? "Hata."));
      if (data.ok) window.location.reload();
    } catch {
      setMesaj("Bağlantı hatası.");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <label className="block text-sm font-semibold text-slate-700">Kampüs</label>
        <select
          value={kampus}
          onChange={(e) => {
            setKampus(e.target.value as KampusKod);
            setKutuId("");
          }}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5"
        >
          {Object.values(KAMPUSLER).map((k) => (
            <option key={k.kod} value={k.kod}>{k.ad}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Atık kutusu</label>
        <select
          value={kutuId}
          onChange={(e) => setKutuId(e.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5"
        >
          <option value="">Seçin…</option>
          {kampüsKutulari.map((k) => (
            <option key={k.id} value={k.id}>
              {k.id} — {k.konum_aciklama.slice(0, 40)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Yeni aşama (araç durumu)</label>
        <select
          value={asama}
          onChange={(e) => setAsama(e.target.value as AsamaKod)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5"
        >
          {ASAMALAR.map((a) => (
            <option key={a.kod} value={a.kod}>{a.ad}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Not (isteğe bağlı)</label>
        <input
          type="text"
          value={not}
          onChange={(e) => setNot(e.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5"
          placeholder="ör. Atık toplama aracı İST-042 yola çıktı"
        />
      </div>

      <button
        type="submit"
        disabled={yukleniyor || !kutuId}
        className="w-full rounded-xl bg-slate-900 py-3.5 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        {yukleniyor ? "Güncelleniyor…" : "Güncelle"}
      </button>

      {mesaj && (
        <p className={`text-sm ${mesaj.includes("güncellendi") ? "text-emerald-700" : "text-red-600"}`}>
          {mesaj}
        </p>
      )}
    </form>
  );
}
