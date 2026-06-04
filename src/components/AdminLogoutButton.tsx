"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleLogout() {
    setYukleniyor(true);
    await fetch("/api/admin/cikis", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={yukleniyor}
      className="text-sm font-medium text-slate-500 hover:text-red-600 disabled:opacity-50"
    >
      {yukleniyor ? "Çıkış…" : "Çıkış yap"}
    </button>
  );
}
