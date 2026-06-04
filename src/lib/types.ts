import type { AsamaKod, AtikTurKod, KampusKod } from "./constants";

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
