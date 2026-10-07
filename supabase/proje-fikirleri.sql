-- Proje fikirleri ve katılım başvuruları
-- Supabase → SQL Editor'da bir kez çalıştırın.
--
-- RLS açık ama politika yok: tarayıcıdaki anon anahtar bu tablolara hiç erişemez.
-- Okuma/yazma yalnızca sunucudan, SUPABASE_SERVICE_ROLE_KEY ile yapılır
-- (öğrenci e-postaları dışarıya açılmasın diye).

create table if not exists proje_fikirleri (
  id uuid primary key default gen_random_uuid(),
  ad text not null check (char_length(ad) between 3 and 100),
  sorun text not null check (char_length(sorun) between 10 and 600),
  ozet text not null check (char_length(ozet) between 10 and 1500),
  kategori text not null,
  destek_alanlari text[] not null default '{}',
  sahip_ad text not null check (char_length(sahip_ad) between 3 and 80),
  sahip_eposta text not null check (char_length(sahip_eposta) between 5 and 120),
  durum text not null default 'beklemede'
    check (durum in ('beklemede', 'onayli', 'reddedildi')),
  olusturma_tarihi timestamptz not null default now()
);

create table if not exists proje_katilimlari (
  id uuid primary key default gen_random_uuid(),
  proje_id uuid not null references proje_fikirleri(id) on delete cascade,
  ad text not null check (char_length(ad) between 3 and 80),
  eposta text not null check (char_length(eposta) between 5 and 120),
  bolum text not null check (char_length(bolum) between 2 and 80),
  katki_alanlari text[] not null default '{}',
  mesaj text check (mesaj is null or char_length(mesaj) <= 500),
  olusturma_tarihi timestamptz not null default now(),
  unique (proje_id, eposta)
);

create index if not exists proje_fikirleri_durum_idx on proje_fikirleri (durum, olusturma_tarihi desc);
create index if not exists proje_katilimlari_proje_idx on proje_katilimlari (proje_id);

alter table proje_fikirleri enable row level security;
alter table proje_katilimlari enable row level security;
