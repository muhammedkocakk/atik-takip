"use client";

import Link from "next/link";
import { useState } from "react";
import { KatkiSecici } from "@/components/KatkiSecici";
import {
  PROJE_KATEGORILERI,
  PROJE_SINIRLARI,
  type KatkiAlaniKod,
} from "@/lib/proje-constants";

const GIRDI =
  "w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const ETIKET = "block text-sm font-semibold text-slate-800";

const BOS = {
  ad: "",
  sorun: "",
  ozet: "",
  kategori: "",
  sahip_ad: "",
  sahip_eposta: "",
  website: "",
};

export function ProjeFikirForm() {
  const [form, setForm] = useState(BOS);
  const [destek, setDestek] = useState<KatkiAlaniKod[]>([]);
  const [onay, setOnay] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [basari, setBasari] = useState(false);

  function alan(ad: keyof typeof BOS) {
    return {
      value: form[ad],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [ad]: e.target.value })),
      disabled: yukleniyor,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);
    try {
      const res = await fetch("/api/proje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, destek_alanlari: destek, onay }),
      });
      const data = await res.json();
      if (!data.ok) {
        setHata(data.error ?? "Bir hata oluştu.");
        return;
      }
      setForm(BOS);
      setDestek([]);
      setOnay(false);
      setBasari(true);
    } catch {
      setHata("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setYukleniyor(false);
    }
  }

  if (basari) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-3xl">🎉</p>
        <h2 className="mt-2 text-lg font-bold text-emerald-900">Fikriniz bize ulaştı!</h2>
        <p className="mt-2 text-sm text-emerald-800">
          Kısa bir incelemeden sonra proje listesinde yayınlanacak ve diğer öğrenciler katılım
          isteği gönderebilecek.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/projeler"
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Projelere dön
          </Link>
          <button
            type="button"
            onClick={() => setBasari(false)}
            className="rounded-xl border border-emerald-300 px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            Yeni fikir gönder
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="ad" className={ETIKET}>Proje fikrinin adı</label>
        <input
          id="ad"
          maxLength={PROJE_SINIRLARI.ad.max}
          placeholder="ör. Kampüs Kompost Noktası"
          className={GIRDI}
          required
          {...alan("ad")}
        />
      </div>

      <div className="space-y-2">
        <span className={ETIKET}>Kategori</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PROJE_KATEGORILERI.map((k) => (
            <label
              key={k.kod}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                form.kategori === k.kod
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100"
                  : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <input
                type="radio"
                name="kategori"
                value={k.kod}
                checked={form.kategori === k.kod}
                onChange={() => setForm((f) => ({ ...f, kategori: k.kod }))}
                disabled={yukleniyor}
                className="sr-only"
              />
              <span>{k.emoji}</span>
              <span className="leading-tight">{k.ad}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="sorun" className={ETIKET}>Hangi soruna çözüm oluyor?</label>
        <textarea
          id="sorun"
          rows={3}
          maxLength={PROJE_SINIRLARI.sorun.max}
          placeholder="ör. Yemekhanede her gün çok miktarda organik atık çöpe gidiyor."
          className={GIRDI}
          required
          {...alan("sorun")}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="ozet" className={ETIKET}>Kısaca fikrin</label>
        <textarea
          id="ozet"
          rows={5}
          maxLength={PROJE_SINIRLARI.ozet.max}
          placeholder="Fikrinizi birkaç cümleyle anlatın: ne yapacaksınız, nasıl işleyecek?"
          className={GIRDI}
          required
          {...alan("ozet")}
        />
        <p className="text-right text-xs text-slate-400">
          {form.ozet.length}/{PROJE_SINIRLARI.ozet.max}
        </p>
      </div>

      <div className="space-y-2">
        <span className={ETIKET}>Hangi alanda destek arıyorsun?</span>
        <p className="text-xs text-slate-500">Birden fazla seçebilirsiniz.</p>
        <KatkiSecici secili={destek} onChange={setDestek} disabled={yukleniyor} />
      </div>

      <div className="space-y-4 rounded-xl bg-slate-50 p-4">
        <p className="text-xs text-slate-500">
          İletişim bilgileriniz sitede <strong>gösterilmez</strong>; yalnızca proje ekibiyle sizi
          buluşturmak için kullanılır.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="sahip_ad" className={ETIKET}>Ad soyad</label>
            <input
              id="sahip_ad"
              maxLength={PROJE_SINIRLARI.kisiAd.max}
              autoComplete="name"
              className={GIRDI}
              required
              {...alan("sahip_ad")}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="sahip_eposta" className={ETIKET}>E-posta</label>
            <input
              id="sahip_eposta"
              type="email"
              maxLength={PROJE_SINIRLARI.eposta.max}
              autoComplete="email"
              className={GIRDI}
              required
              {...alan("sahip_eposta")}
            />
          </div>
        </div>
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
        Ad ve e-posta bilgilerimin, proje fikrim hakkında benimle iletişime geçilmesi amacıyla
        kullanılmasını kabul ediyorum.
      </label>

      {hata && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{hata}</p>}

      <button
        type="submit"
        disabled={yukleniyor || !onay}
        className="w-full rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        {yukleniyor ? "Gönderiliyor…" : "💡 Fikrimi gönder"}
      </button>
    </form>
  );
}
