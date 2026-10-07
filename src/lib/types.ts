import type { AsamaKod, AtikTurKod, KampusKod } from "./constants";
import type { KatkiAlaniKod, ProjeDurum, ProjeKategoriKod } from "./proje-constants";

export interface Kutu {
  id: string;
  kampus_kod: KampusKod;
  tur: AtikTurKod;
  konum_aciklama: string;
  asama: AsamaKod;
  guncelleme_tarihi: string;
}

export interface AsamaGecmisi {
  id: string;
  kutu_id: string;
  kampus_kod: KampusKod;
  asama: AsamaKod;
  aciklama?: string;
  olusturma_tarihi: string;
}

export interface KelimeCevabi {
  id: string;
  metin: string;
  olusturma_tarihi: string;
}

/** Sitede herkese gösterilen proje bilgisi — kişisel veri içermez */
export interface ProjeOzet {
  id: string;
  ad: string;
  sorun: string;
  ozet: string;
  kategori: ProjeKategoriKod;
  destek_alanlari: KatkiAlaniKod[];
  olusturma_tarihi: string;
  katilimci_sayisi: number;
}

export interface ProjeKatilimi {
  id: string;
  proje_id: string;
  ad: string;
  eposta: string;
  bolum: string;
  katki_alanlari: KatkiAlaniKod[];
  mesaj: string | null;
  olusturma_tarihi: string;
}

/** Yalnızca yönetim panelinde */
export interface ProjeYonetim extends ProjeOzet {
  sahip_ad: string;
  sahip_eposta: string;
  durum: ProjeDurum;
  katilimlar: ProjeKatilimi[];
}
