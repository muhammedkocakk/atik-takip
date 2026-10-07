export const PROJE_KATEGORILERI = [
  { kod: "atik", ad: "Atık", emoji: "🗑️" },
  { kod: "su", ad: "Su", emoji: "💧" },
  { kod: "enerji", ad: "Enerji", emoji: "⚡" },
  { kod: "iklim", ad: "İklim", emoji: "🌍" },
  { kod: "kampus", ad: "Sürdürülebilir Kampüs", emoji: "🏫" },
  { kod: "dongusel", ad: "Döngüsel Ekonomi", emoji: "♻️" },
  { kod: "diger", ad: "Diğer", emoji: "✨" },
] as const;

export type ProjeKategoriKod = (typeof PROJE_KATEGORILERI)[number]["kod"];

/** Fikir sahibinin aradığı destek ve katılımcının sunduğu katkı aynı liste */
export const KATKI_ALANLARI = [
  { kod: "arastirma", ad: "Araştırma", emoji: "🔬" },
  { kod: "yazilim", ad: "Yazılım", emoji: "💻" },
  { kod: "tasarim", ad: "Tasarım", emoji: "🎨" },
  { kod: "iletisim", ad: "Sosyal medya / iletişim", emoji: "📣" },
  { kod: "saha", ad: "Saha çalışması", emoji: "🧤" },
  { kod: "veri", ad: "Veri analizi", emoji: "📊" },
] as const;

export type KatkiAlaniKod = (typeof KATKI_ALANLARI)[number]["kod"];

export const PROJE_DURUMLARI = ["beklemede", "onayli", "reddedildi"] as const;
export type ProjeDurum = (typeof PROJE_DURUMLARI)[number];

export const PROJE_SINIRLARI = {
  ad: { min: 3, max: 100 },
  sorun: { min: 10, max: 600 },
  ozet: { min: 10, max: 1500 },
  kisiAd: { min: 3, max: 80 },
  eposta: { min: 5, max: 120 },
  bolum: { min: 2, max: 80 },
  mesaj: { max: 500 },
} as const;

export function kategoriBul(kod: string) {
  return PROJE_KATEGORILERI.find((k) => k.kod === kod) ?? PROJE_KATEGORILERI[PROJE_KATEGORILERI.length - 1];
}

export function katkiBul(kod: string) {
  return KATKI_ALANLARI.find((k) => k.kod === kod);
}

export function gecerliKategori(kod: string): kod is ProjeKategoriKod {
  return PROJE_KATEGORILERI.some((k) => k.kod === kod);
}

export function gecerliKatkilar(kodlar: unknown): KatkiAlaniKod[] {
  if (!Array.isArray(kodlar)) return [];
  const gecerli = new Set<string>(KATKI_ALANLARI.map((k) => k.kod));
  return [...new Set(kodlar.filter((k): k is KatkiAlaniKod => typeof k === "string" && gecerli.has(k)))];
}
