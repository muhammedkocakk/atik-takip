"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/yonetim";

  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);

    try {
      const res = await fetch("/api/admin/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre }),
      });
      const data = await res.json();
      if (!data.ok) {
        setHata(data.error ?? "Giriş başarısız.");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setHata("Bağlantı hatası.");
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="admin-sifre" className="block text-sm font-semibold text-slate-700">
          Yönetici şifresi
        </label>
        <input
          id="admin-sifre"
          type="password"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="Admin şifreniz"
        />
      </div>
      <button
        type="submit"
        disabled={yukleniyor}
        className="w-full rounded-xl bg-slate-900 py-3.5 font-bold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {yukleniyor ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
      {hata && <p className="text-sm text-red-600">{hata}</p>}
    </form>
  );
}

export function AdminLoginForm() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Yükleniyor…</p>}>
      <LoginFormInner />
    </Suspense>
  );
}
