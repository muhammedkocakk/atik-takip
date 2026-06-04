export const KAMPUSLER = {
  sutluce: {
    kod: "sutluce",
    ad: "İstün Sütlüce Kampüsü",
    kisaAd: "Sütlüce",
  },
  adsm: {
    kod: "adsm",
    ad: "ADSM Kampüsü",
    kisaAd: "ADSM",
  },
} as const;

export type KampusKod = keyof typeof KAMPUSLER;

export const ATIK_TURLERI = {
  ilac: { kod: "ilac", ad: "İlaç Atığı", emoji: "💊", renk: "#dc2626" },
  elektronik: { kod: "elektronik", ad: "Elektronik Atık", emoji: "📱", renk: "#2563eb" },
  kagit: { kod: "kagit", ad: "Kağıt / Karton", emoji: "📄", renk: "#d97706" },
  plastik: { kod: "plastik", ad: "Plastik", emoji: "♻️", renk: "#16a34a" },
  cam: { kod: "cam", ad: "Cam", emoji: "🫙", renk: "#0891b2" },
  metal: { kod: "metal", ad: "Metal", emoji: "🔩", renk: "#64748b" },
  organik: { kod: "organik", ad: "Organik Atık", emoji: "🌿", renk: "#65a30d" },
  tekstil: { kod: "tekstil", ad: "Tekstil / Kıyafet", emoji: "👕", renk: "#db2777" },
  tehlikeli: { kod: "tehlikeli", ad: "Tehlikeli Atık / Pil", emoji: "⚠️", renk: "#9333ea" },
  genel: { kod: "genel", ad: "Genel / Karışık", emoji: "🗑️", renk: "#475569" },
} as const;

export type AtikTurKod = keyof typeof ATIK_TURLERI;

/** Atık toplama aracı rotası — kargo takibi benzeri */
export const ASAMALAR = [
  {
    kod: "toplandi",
    ad: "Kampüste toplandı",
    kisaAd: "Kampüs",
    aciklama: "Atık kutusu doldu, kampüs toplama noktasında bekliyor",
    ikon: "kampüs",
    sira: 1,
  },
  {
    kod: "yolda",
    ad: "Toplama aracında",
    kisaAd: "Yolda",
    aciklama: "Atık toplama aracı kutayı aldı, tesise doğru yolda",
    ikon: "arac",
    sira: 2,
  },
  {
    kod: "merkezde",
    ad: "İşleme tesisinde",
    kisaAd: "Tesis",
    aciklama: "Bertaraf veya geri dönüşüm tesisine ulaştı",
    ikon: "tesis",
    sira: 3,
  },
  {
    kod: "bertaraf",
    ad: "İşlem tamamlandı",
    kisaAd: "Tamam",
    aciklama: "Geri dönüşüm veya bertaraf süreci tamamlandı",
    ikon: "tamam",
    sira: 4,
  },
] as const;

export type AsamaKod = (typeof ASAMALAR)[number]["kod"];

export function asamaIndeksi(kod: AsamaKod): number {
  return ASAMALAR.findIndex((a) => a.kod === kod);
}

/** Pilot için önerilen ek türler (zaten yukarıda tanımlı) */
export const ONERILEN_TURLER: AtikTurKod[] = [
  "ilac",
  "elektronik",
  "kagit",
  "plastik",
  "cam",
  "metal",
  "organik",
  "tehlikeli",
  "tekstil",
];
