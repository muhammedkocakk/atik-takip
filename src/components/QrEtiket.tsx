import QRCode from "qrcode";
import { ATIK_TURLERI, KAMPUSLER } from "@/lib/constants";
import { getKutuTakipUrl } from "@/lib/site-url";
import type { Kutu } from "@/lib/types";

export async function QrEtiket({ kutu }: { kutu: Kutu }) {
  const tur = ATIK_TURLERI[kutu.tur];
  const kampus = KAMPUSLER[kutu.kampus_kod];
  const url = getKutuTakipUrl(kutu.kampus_kod, kutu.id);

  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 280,
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  return (
    <article
      className="qr-etiket break-inside-avoid rounded-2xl border-2 border-slate-800 bg-white p-5 shadow-md"
      style={{ borderTopColor: tur.renk, borderTopWidth: 6 }}
    >
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
        <img
          src={qrDataUrl}
          alt={`${tur.ad} QR kodu`}
          width={140}
          height={140}
          className="shrink-0 rounded-lg"
        />
        <div className="mt-4 flex-1 sm:mt-0">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            İstün · Atık Takip
          </p>
          <h3 className="mt-1 flex items-center justify-center gap-2 text-xl font-bold text-slate-900 sm:justify-start">
            <span>{tur.emoji}</span>
            {tur.ad}
          </h3>
          <p className="mt-1 font-medium text-brand-700">{kampus.ad}</p>
          <p className="mt-2 text-sm text-slate-600">{kutu.konum_aciklama}</p>
          <p className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            QR okutun — atığınız nerede?
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Telefonunuzla kodu okutun; toplama aracı ve tesis durumunu görün.
          </p>
        </div>
      </div>
    </article>
  );
}
