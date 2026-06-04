-- Sıfır Atık — Supabase SQL

create table if not exists kampusler (
  kod text primary key,
  ad text not null
);

insert into kampusler (kod, ad) values
  ('sutluce', 'Sütlüce Kampüsü'),
  ('adsm', 'ADSM Kampüsü')
on conflict (kod) do nothing;

create table if not exists kutular (
  id text not null,
  kampus_kod text not null references kampusler(kod),
  tur text not null,
  konum_aciklama text not null,
  asama text not null default 'toplandi',
  guncelleme_tarihi timestamptz not null default now(),
  primary key (kampus_kod, id)
);

create table if not exists asama_gecmisi (
  id uuid primary key default gen_random_uuid(),
  kutu_id text not null,
  kampus_kod text not null,
  asama text not null,
  aciklama text,
  olusturma_tarihi timestamptz not null default now(),
  foreign key (kampus_kod, kutu_id) references kutular(kampus_kod, id)
);

create table if not exists kelime_cevaplari (
  id uuid primary key default gen_random_uuid(),
  metin text not null check (char_length(metin) >= 2 and char_length(metin) <= 60),
  olusturma_tarihi timestamptz not null default now()
);

-- Sütlüce
insert into kutular (id, kampus_kod, tur, konum_aciklama, asama) values
  ('ILAC-001', 'sutluce', 'ilac', 'Sağlık bilimleri fakültesi girişi', 'toplandi'),
  ('ELEK-001', 'sutluce', 'elektronik', 'Kütüphane yanı', 'yolda'),
  ('KAGIT-001', 'sutluce', 'kagit', 'Öğrenci işleri koridoru', 'merkezde'),
  ('CAM-001', 'sutluce', 'cam', 'Kafeterya çıkışı', 'toplandi'),
  ('PLASTIK-001', 'sutluce', 'plastik', 'Yemekhane girişi', 'yolda'),
  ('METAL-001', 'sutluce', 'metal', 'Atölye binası girişi', 'toplandi'),
  ('TEHL-001', 'sutluce', 'tehlikeli', 'Kimya laboratuvarı — pil kutusu', 'merkezde')
on conflict (kampus_kod, id) do nothing;

-- ADSM
insert into kutular (id, kampus_kod, tur, konum_aciklama, asama) values
  ('ILAC-001', 'adsm', 'ilac', 'ADSM ana giriş', 'toplandi'),
  ('ELEK-001', 'adsm', 'elektronik', 'Teknik servis yanı', 'toplandi'),
  ('PLASTIK-001', 'adsm', 'plastik', 'Kantin çıkışı', 'yolda'),
  ('CAM-001', 'adsm', 'cam', 'Poliklinik koridoru', 'toplandi'),
  ('KAGIT-001', 'adsm', 'kagit', 'Arşiv yanı', 'bertaraf'),
  ('ORG-001', 'adsm', 'organik', 'Personel yemekhanesi', 'yolda'),
  ('TEKSTIL-001', 'adsm', 'tekstil', 'Sosyal tesis', 'toplandi')
on conflict (kampus_kod, id) do nothing;

alter table kutular enable row level security;
alter table asama_gecmisi enable row level security;
alter table kelime_cevaplari enable row level security;

create policy "kutular_select" on kutular for select using (true);
create policy "kutular_update" on kutular for update using (true);
create policy "gecmis_select" on asama_gecmisi for select using (true);
create policy "gecmis_insert" on asama_gecmisi for insert with check (true);
create policy "kelime_select" on kelime_cevaplari for select using (true);
create policy "kelime_insert" on kelime_cevaplari for insert with check (true);
create policy "kelime_delete" on kelime_cevaplari for delete using (true);
