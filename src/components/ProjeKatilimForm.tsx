"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { KatkiSecici } from "@/components/KatkiSecici";
import { PROJE_SINIRLARI, type KatkiAlaniKod } from "@/lib/proje-constants";

const GIRDI =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const ETIKET = "block text-sm font-semibold text-slate-800";

const BOS = { ad: "", eposta: "", bolum: "", mesaj: "", website: "" };

export function ProjeKatilimForm({ projeId, projeAd }: { projeId: string; projeAd: string }) {
  const router = useRouter();
  const [form, setForm] = useState(BOS);
  const [katkilar, setKatkilar] = useState<KatkiAlaniKod[]>([]);
  const [onay, setOnay] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState(false);

  function alan(ad: keyof typeof BOS) {
    return {
      value: form[ad],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [ad]: e.target.value })),
      disabled: yukleniyor,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);
    try {
      const res = await fetch("/api/proje/katil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, proje_id: projeId, katki_alanlari: katkilar, onay }),
      });
      const data = await res.json();
      if (!data.ok) {
        setHata(data.error ?? "Bir hata oluştu.");
        return;
      }
      setBasari(true);
      router.refresh();
    } catch {
      setHata("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setYukleniyor(false);
    }
  }

  if (basari) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-3xl">🤝</p>
        <h3 className="mt-2 text-lg font-bold text-emerald-900">Katılım isteğiniz alındı!</h3>
        <p className="mt-2 text-sm text-emerald-800">
          <strong>{projeAd}</strong> ekibi sizinle e-posta üzerinden iletişime geçecek.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="k_ad" className={ETIKET}>Ad soyad</label>
          <input
            id="k_ad"
            maxLength={PROJE_SINIRLARI.kisiAd.max}
            autoComplete="name"
            className={GIRDI}
            required
            {...alan("ad")}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="k_eposta" className={ETIKET}>E-posta</label>
          <input
            id="k_eposta"
            type="email"
            maxLength={PROJE_SINIRLARI.eposta.max}
            autoComplete="email"
            className={GIRDI}
            required
            {...alan("eposta")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="k_bolum" className={ETIKET}>Bölümün</label>
        <input
          id="k_bolum"
          maxLength={PROJE_SINIRLARI.bolum.max}
          placeholder="ör. Hemşirelik, Bilgisayar Mühendisliği"
          className={GIRDI}
          required
          {...alan("bolum")}
        />
      </div>

      <div className="space-y-2">
        <span className={ETIKET}>Nasıl katkı sağlayabilirsin?</span>
        <p className="text-xs text-slate-500">Birden fazla seçebilirsiniz.</p>
        <KatkiSecici secili={katkilar} onChange={setKatkilar} disabled={yukleniyor} />
      </div>

      <div className="space-y-2">
        <label htmlFor="k_mesaj" className={ETIKET}>
          Eklemek istediğin bir şey var mı? <span className="font-normal text-slate-400">(isteğe bağlı)</span>
        </label>
        <textarea
          id="k_mesaj"
          rows={3}
          maxLength={PROJE_SINIRLARI.mesaj.max}
          placeholder="ör. Daha önce benzer bir projede gönüllü çalıştım."
          className={GIRDI}
          {...alan("mesaj")}
        />
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        {...alan("website")}
      />

      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={onay}
          onChange={(e) => setOnay(e.target.checked)}
          disabled={yukleniyor}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        Ad ve e-posta bilgilerimin, bu projeye katılımım için proje ekibiyle paylaşılmasını kabul
        ediyorum. Bilgilerim sitede gösterilmez.
      </label>

      {hata && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{hata}</p>}

      <button
        type="submit"
        disabled={yukleniyor || !onay}
        className="w-full rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {yukleniyor ? "Gönderiliyor…" : "🤝 Bu projeye katılmak istiyorum"}
      </button>
    </form>
  );
}
