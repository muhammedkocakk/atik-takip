import "server-only";
import {
  PROJE_DURUMLARI,
  PROJE_SINIRLARI,
  gecerliKategori,
  gecerliKatkilar,
  type ProjeDurum,
  type ProjeKategoriKod,
} from "./proje-constants";
import {
  ProjeDepoHatasi,
  ZatenKatildiHatasi,
  fikirEkleKayit,
  katilimEkleKayit,
  onayliProjeGetir,
  projeDurumGuncelleKayit,
  projeSilKayit,
} from "./proje-store";

export {
  onayliProjeleriGetir,
  onayliProjeGetir,
  tumProjeleriGetir,
  projeDepoTipi,
} from "./proje-store";

type Sonuc = { ok: boolean; error?: string };

const EPOSTA_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function metin(deger: unknown): string {
  return typeof deger === "string" ? deger.trim().replace(/\s+/g, " ") : "";
}

/** Çok satırlı alanlarda satır sonlarını koru */
function uzunMetin(deger: unknown): string {
  return typeof deger === "string" ? deger.trim().replace(/\n{3,}/g, "\n\n") : "";
}

function uzunlukHatasi(
  deger: string,
  etiket: string,
  sinir: { min?: number; max: number }
): string | null {
  if (sinir.min && deger.length < sinir.min) return `${etiket} en az ${sinir.min} karakter olmalı.`;
  if (deger.length > sinir.max) return `${etiket} en fazla ${sinir.max} karakter olabilir.`;
  return null;
}

function depoHatasiMesaji(e: unknown): string {
  if (e instanceof ProjeDepoHatasi) console.error("[proje] depo hatası:", e.message);
  else console.error("[proje] beklenmeyen hata:", e);
  return "Kayıt yapılamadı. Lütfen biraz sonra tekrar deneyin.";
}

export async function fikirEkle(girdi: Record<string, unknown>): Promise<Sonuc> {
  // Bot tuzağı: gerçek kullanıcı bu gizli alanı görmez
  if (metin(girdi.website)) return { ok: true };
  if (girdi.onay !== true) return { ok: false, error: "Devam etmek için onay kutusunu işaretleyin." };

  const ad = metin(girdi.ad);
  const sorun = uzunMetin(girdi.sorun);
  const ozet = uzunMetin(girdi.ozet);
  const kategori = metin(girdi.kategori);
  const destek = gecerliKatkilar(girdi.destek_alanlari);
  const sahipAd = metin(girdi.sahip_ad);
  const eposta = metin(girdi.sahip_eposta).toLowerCase();

  const hata =
    uzunlukHatasi(ad, "Proje adı", PROJE_SINIRLARI.ad) ??
    uzunlukHatasi(sorun, "Çözülen sorun", PROJE_SINIRLARI.sorun) ??
    uzunlukHatasi(ozet, "Fikir açıklaması", PROJE_SINIRLARI.ozet) ??
    (gecerliKategori(kategori) ? null : "Bir kategori seçin.") ??
    (destek.length > 0 ? null : "Destek aradığınız en az bir alan seçin.") ??
    uzunlukHatasi(sahipAd, "Ad soyad", PROJE_SINIRLARI.kisiAd) ??
    uzunlukHatasi(eposta, "E-posta", PROJE_SINIRLARI.eposta) ??
    (EPOSTA_REGEX.test(eposta) ? null : "Geçerli bir e-posta adresi girin.");
  if (hata) return { ok: false, error: hata };

  try {
    await fikirEkleKayit({
      ad,
      sorun,
      ozet,
      kategori: kategori as ProjeKategoriKod,
      destek_alanlari: destek,
      sahip_ad: sahipAd,
      sahip_eposta: eposta,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: depoHatasiMesaji(e) };
  }
}

export async function katilimEkle(girdi: Record<string, unknown>): Promise<Sonuc> {
  if (metin(girdi.website)) return { ok: true };
  if (girdi.onay !== true) return { ok: false, error: "Devam etmek için onay kutusunu işaretleyin." };

  const projeId = metin(girdi.proje_id);
  const ad = metin(girdi.ad);
  const eposta = metin(girdi.eposta).toLowerCase();
  const bolum = metin(girdi.bolum);
  const katkilar = gecerliKatkilar(girdi.katki_alanlari);
  const mesaj = uzunMetin(girdi.mesaj);

  const hata =
    (projeId ? null : "Proje bulunamadı.") ??
    uzunlukHatasi(ad, "Ad soyad", PROJE_SINIRLARI.kisiAd) ??
    uzunlukHatasi(eposta, "E-posta", PROJE_SINIRLARI.eposta) ??
    (EPOSTA_REGEX.test(eposta) ? null : "Geçerli bir e-posta adresi girin.") ??
    uzunlukHatasi(bolum, "Bölüm", PROJE_SINIRLARI.bolum) ??
    (katkilar.length > 0 ? null : "Nasıl katkı sağlayacağınızı en az bir alanla seçin.") ??
    uzunlukHatasi(mesaj, "Mesaj", PROJE_SINIRLARI.mesaj);
  if (hata) return { ok: false, error: hata };

  try {
    const proje = await onayliProjeGetir(projeId);
    if (!proje) return { ok: false, error: "Bu proje artık başvuru almıyor." };

    await katilimEkleKayit(projeId, {
      ad,
      eposta,
      bolum,
      katki_alanlari: katkilar,
      mesaj: mesaj || null,
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof ZatenKatildiHatasi) {
      return { ok: false, error: "Bu e-posta ile bu projeye zaten başvurdunuz." };
    }
    return { ok: false, error: depoHatasiMesaji(e) };
  }
}

export async function projeDurumGuncelle(
  id: string,
  durum: string,
  adminYetkili: boolean
): Promise<Sonuc> {
  if (!adminYetkili) return { ok: false, error: "Yetkisiz." };
  if (!PROJE_DURUMLARI.includes(durum as ProjeDurum)) return { ok: false, error: "Geçersiz durum." };
  try {
    const bulundu = await projeDurumGuncelleKayit(id, durum as ProjeDurum);
    return bulundu ? { ok: true } : { ok: false, error: "Proje bulunamadı." };
  } catch (e) {
    return { ok: false, error: depoHatasiMesaji(e) };
  }
}

export async function projeSil(id: string, adminYetkili: boolean): Promise<Sonuc> {
  if (!adminYetkili) return { ok: false, error: "Yetkisiz." };
  try {
    const silindi = await projeSilKayit(id);
    return silindi ? { ok: true } : { ok: false, error: "Proje bulunamadı." };
  } catch (e) {
    return { ok: false, error: depoHatasiMesaji(e) };
  }
}
