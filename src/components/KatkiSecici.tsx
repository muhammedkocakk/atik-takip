"use client";

import { KATKI_ALANLARI, type KatkiAlaniKod } from "@/lib/proje-constants";

interface KatkiSeciciProps {
  secili: KatkiAlaniKod[];
  onChange: (secili: KatkiAlaniKod[]) => void;
  disabled?: boolean;
}

export function KatkiSecici({ secili, onChange, disabled }: KatkiSeciciProps) {
  function degistir(kod: KatkiAlaniKod) {
    onChange(secili.includes(kod) ? secili.filter((k) => k !== kod) : [...secili, kod]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {KATKI_ALANLARI.map((k) => {
        const aktif = secili.includes(k.kod);
        return (
          <button
            key={k.kod}
            type="button"
            onClick={() => degistir(k.kod)}
            disabled={disabled}
            aria-pressed={aktif}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
              aktif
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <span>{k.emoji}</span>
            {k.ad}
            {aktif && <span className="text-emerald-600">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
