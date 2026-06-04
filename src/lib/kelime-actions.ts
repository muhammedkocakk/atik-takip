import "server-only";
import { KELIME_MAX_UZUNLUK, KELIME_MIN_UZUNLUK } from "./kelime-constants";
import { kelimeEkleKayit, kelimeSilKayit, kelimeleriGetir } from "./kelime-store";

export { kelimeleriGetir as getKelimeCevaplari, kelimeDepoTipi } from "./kelime-store";

export async function kelimeEkle(metin: string): Promise<{ ok: boolean; error?: string }> {
  const temiz = metin.trim().slice(0, KELIME_MAX_UZUNLUK);
  if (temiz.length < KELIME_MIN_UZUNLUK) {
    return { ok: false, error: `En az ${KELIME_MIN_UZUNLUK} karakter girin.` };
  }

  try {
    await kelimeEkleKayit(temiz);
    return { ok: true };
  } catch (e) {
    console.error("[kelime] ekleme hatası:", e);
    return { ok: false, error: "Kayıt eklenemedi. Lütfen tekrar deneyin." };
  }
}

export async function kelimeSil(
  id: string,
  adminYetkili: boolean
): Promise<{ ok: boolean; error?: string }> {
  if (!adminYetkili) return { ok: false, error: "Yetkisiz." };
  const silindi = await kelimeSilKayit(id);
  if (!silindi) return { ok: false, error: "Kelime bulunamadı." };
  return { ok: true };
}
