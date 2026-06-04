import Link from "next/link";
import { RecycleIcon } from "@/components/RecycleIcon";
import { PROJE_ADI, PROJE_ALT_BASLIK } from "@/lib/branding";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { isAdminAuthenticated } from "@/lib/admin-session";

const PUBLIC_NAV = [{ href: "/dusunceler", label: "Düşünceler" }];

const ADMIN_NAV = [
  { href: "/etiketler", label: "QR Etiketler" },
  { href: "/yonetim", label: "Yönetim" },
];

export async function Header() {
  const admin = await isAdminAuthenticated();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
            <RecycleIcon />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-bold text-slate-900">{PROJE_ADI}</span>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-emerald-700">
              {PROJE_ALT_BASLIK}
            </span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-0.5 text-xs sm:text-sm">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-3"
            >
              {item.label}
            </Link>
          ))}
          {admin &&
            ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2 py-2 font-medium text-emerald-800 transition hover:bg-emerald-50 sm:px-3"
              >
                {item.label}
              </Link>
            ))}
          {admin && (
            <span className="ml-1 hidden border-l border-slate-200 pl-2 sm:inline">
              <AdminLogoutButton />
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
