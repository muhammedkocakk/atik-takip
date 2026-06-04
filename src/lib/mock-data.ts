import type { AsamaGecmisi, KelimeCevabi, Kutu } from "./types";

export const MOCK_KUTULAR: Kutu[] = [
  { id: "ILAC-001", kampus_kod: "sutluce", tur: "ilac", konum_aciklama: "Sağlık bilimleri fakültesi girişi", asama: "toplandi", guncelleme_tarihi: "2026-05-20T10:00:00+03:00" },
  { id: "ELEK-001", kampus_kod: "sutluce", tur: "elektronik", konum_aciklama: "Kütüphane yanı", asama: "yolda", guncelleme_tarihi: "2026-05-21T08:30:00+03:00" },
  { id: "KAGIT-001", kampus_kod: "sutluce", tur: "kagit", konum_aciklama: "Öğrenci işleri koridoru", asama: "merkezde", guncelleme_tarihi: "2026-05-19T16:45:00+03:00" },
  { id: "CAM-001", kampus_kod: "sutluce", tur: "cam", konum_aciklama: "Kafeterya çıkışı — cam kutusu", asama: "toplandi", guncelleme_tarihi: "2026-05-21T09:00:00+03:00" },
  { id: "PLASTIK-001", kampus_kod: "sutluce", tur: "plastik", konum_aciklama: "Yemekhane girişi", asama: "yolda", guncelleme_tarihi: "2026-05-21T07:00:00+03:00" },
  { id: "METAL-001", kampus_kod: "sutluce", tur: "metal", konum_aciklama: "Atölye binası girişi", asama: "toplandi", guncelleme_tarihi: "2026-05-18T12:00:00+03:00" },
  { id: "TEHL-001", kampus_kod: "sutluce", tur: "tehlikeli", konum_aciklama: "Kimya laboratuvarı katı — pil kutusu", asama: "merkezde", guncelleme_tarihi: "2026-05-20T15:00:00+03:00" },
  { id: "ILAC-001", kampus_kod: "adsm", tur: "ilac", konum_aciklama: "ADSM ana giriş", asama: "toplandi", guncelleme_tarihi: "2026-05-21T09:00:00+03:00" },
  { id: "ELEK-001", kampus_kod: "adsm", tur: "elektronik", konum_aciklama: "Teknik servis yanı", asama: "toplandi", guncelleme_tarihi: "2026-05-20T14:00:00+03:00" },
  { id: "PLASTIK-001", kampus_kod: "adsm", tur: "plastik", konum_aciklama: "Kantin çıkışı", asama: "yolda", guncelleme_tarihi: "2026-05-21T07:15:00+03:00" },
  { id: "CAM-001", kampus_kod: "adsm", tur: "cam", konum_aciklama: "Poliklinik koridoru", asama: "toplandi", guncelleme_tarihi: "2026-05-19T11:00:00+03:00" },
  { id: "KAGIT-001", kampus_kod: "adsm", tur: "kagit", konum_aciklama: "Arşiv yanı", asama: "bertaraf", guncelleme_tarihi: "2026-05-17T16:00:00+03:00" },
  { id: "ORG-001", kampus_kod: "adsm", tur: "organik", konum_aciklama: "Personel yemekhanesi", asama: "yolda", guncelleme_tarihi: "2026-05-21T06:30:00+03:00" },
  { id: "TEKSTIL-001", kampus_kod: "adsm", tur: "tekstil", konum_aciklama: "Sosyal tesis — tekstil toplama", asama: "toplandi", guncelleme_tarihi: "2026-05-20T10:30:00+03:00" },
];

export const MOCK_GECMIS: AsamaGecmisi[] = [
  { id: "1", kutu_id: "ELEK-001", kampus_kod: "sutluce", asama: "toplandi", aciklama: "Kutu doldu.", olusturma_tarihi: "2026-05-18T09:00:00+03:00" },
  { id: "2", kutu_id: "ELEK-001", kampus_kod: "sutluce", asama: "yolda", aciklama: "Atık toplama aracı (İST-042) yola çıktı.", olusturma_tarihi: "2026-05-21T08:30:00+03:00" },
  { id: "3", kutu_id: "PLASTIK-001", kampus_kod: "sutluce", asama: "toplandi", olusturma_tarihi: "2026-05-20T18:00:00+03:00" },
  { id: "4", kutu_id: "PLASTIK-001", kampus_kod: "sutluce", asama: "yolda", aciklama: "Araç Sütlüce kampüsünden ayrıldı.", olusturma_tarihi: "2026-05-21T07:00:00+03:00" },
  { id: "5", kutu_id: "KAGIT-001", kampus_kod: "sutluce", asama: "toplandi", olusturma_tarihi: "2026-05-17T11:00:00+03:00" },
  { id: "6", kutu_id: "KAGIT-001", kampus_kod: "sutluce", asama: "yolda", olusturma_tarihi: "2026-05-18T14:00:00+03:00" },
  { id: "7", kutu_id: "KAGIT-001", kampus_kod: "sutluce", asama: "merkezde", aciklama: "Geri dönüşüm tesisine teslim.", olusturma_tarihi: "2026-05-19T16:45:00+03:00" },
  { id: "8", kutu_id: "PLASTIK-001", kampus_kod: "adsm", asama: "toplandi", olusturma_tarihi: "2026-05-20T08:00:00+03:00" },
  { id: "9", kutu_id: "PLASTIK-001", kampus_kod: "adsm", asama: "yolda", aciklama: "ADSM → merkez hattı, araç yolda.", olusturma_tarihi: "2026-05-21T07:15:00+03:00" },
  { id: "10", kutu_id: "ORG-001", kampus_kod: "adsm", asama: "toplandi", olusturma_tarihi: "2026-05-20T20:00:00+03:00" },
  { id: "11", kutu_id: "ORG-001", kampus_kod: "adsm", asama: "yolda", aciklama: "Organik atık toplama aracı.", olusturma_tarihi: "2026-05-21T06:30:00+03:00" },
  { id: "12", kutu_id: "KAGIT-001", kampus_kod: "adsm", asama: "bertaraf", aciklama: "Geri dönüşüm tamamlandı.", olusturma_tarihi: "2026-05-17T16:00:00+03:00" },
];

export const MOCK_KELIMELER: KelimeCevabi[] = [
  { id: "1", metin: "çevre", olusturma_tarihi: "2026-05-15T12:00:00+03:00" },
  { id: "2", metin: "plastik", olusturma_tarihi: "2026-05-15T12:01:00+03:00" },
  { id: "3", metin: "geri dönüşüm", olusturma_tarihi: "2026-05-16T10:00:00+03:00" },
  { id: "4", metin: "kirlilik", olusturma_tarihi: "2026-05-16T11:00:00+03:00" },
  { id: "5", metin: "sürdürülebilirlik", olusturma_tarihi: "2026-05-17T09:00:00+03:00" },
  { id: "6", metin: "çöp", olusturma_tarihi: "2026-05-17T14:00:00+03:00" },
  { id: "7", metin: "doğa", olusturma_tarihi: "2026-05-18T08:00:00+03:00" },
  { id: "8", metin: "ayrıştırma", olusturma_tarihi: "2026-05-18T15:00:00+03:00" },
  { id: "9", metin: "plastik", olusturma_tarihi: "2026-05-19T10:00:00+03:00" },
  { id: "10", metin: "çevre", olusturma_tarihi: "2026-05-20T11:00:00+03:00" },
];
