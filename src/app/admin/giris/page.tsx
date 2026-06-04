import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { isAdminConfigured } from "@/lib/admin-auth";
import { isAdminAuthenticated } from "@/lib/admin-session";

export default async function AdminGirisPage() {
  if (await isAdminAuthenticated()) {
    redirect("/yonetim");
  }

  const yapilandirildi = isAdminConfigured();

  return (
    <div className="mx-auto max-w-sm space-y-6 py-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-2xl text-white">
          🔐
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Admin girişi</h1>
        <p className="mt-2 text-sm text-slate-500">
          QR etiketleri ve yönetim paneli yalnızca yetkili personel içindir.
        </p>
      </div>

      {!yapilandirildi ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Şifre tanımlı değil</p>
          <p className="mt-1">
            Proje klasöründe <code className="text-xs">.env.local</code> dosyasına{" "}
            <code className="text-xs">ADMIN_SIFRE=...</code> ekleyin ve sunucuyu yeniden başlatın.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <AdminLoginForm />
        </div>
      )}

      <p className="text-center text-sm">
        <Link href="/" className="text-emerald-700 hover:underline">
          ← Ana sayfaya dön
        </Link>
      </p>
    </div>
  );
}
