import QRCode from "qrcode";
import { UNIVERSITE_ETIKET } from "@/lib/branding";
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
      className="qr-etiket break-inside-avoid rounded-2xl border-2 border-slate-800 bg-white p-5 shadow-md print:border-l-[8px] print:border-t-2 print:p-8"
      style={{ borderTopColor: tur.renk, borderTopWidth: 6, borderLeftColor: tur.renk }}
    >
      <div className="qr-etiket-icerik flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left print:flex-row print:items-center print:gap-10 print:text-left">
        <img
          src={qrDataUrl}
          alt={`${tur.ad} QR kodu`}
          width={140}
          height={140}
          className="qr-etiket-gorsel shrink-0 rounded-lg print:h-[42mm] print:w-[42mm] print:max-h-none print:max-w-none"
        />
        <div className="mt-4 flex-1 sm:mt-0 print:mt-0">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 print:text-sm">
            {UNIVERSITE_ETIKET}
          </p>
          <h3 className="mt-1 flex items-center justify-center gap-2 text-xl font-bold text-slate-900 sm:justify-start print:mt-2 print:text-3xl">
            <span className="print:text-4xl">{tur.emoji}</span>
            {tur.ad}
          </h3>
          <p className="mt-1 font-medium text-brand-700 print:text-lg">{kampus.ad}</p>
          <p className="mt-2 text-sm text-slate-600 print:text-base">{kutu.konum_aciklama}</p>
          <p className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white print:mt-5 print:px-4 print:py-3 print:text-lg">
            QR okutun — sıfır atığınız nerede?
          </p>
          <p className="mt-3 text-xs text-slate-400 print:text-sm">
            Telefonunuzla kodu okutun; toplama aracı ve tesis durumunu görün.
          </p>
        </div>
      </div>
    </article>
  );
}
