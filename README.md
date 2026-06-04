# Atık Takip — Pilot

İstün **Sütlüce** ve **ADSM** kampüslerinde atık kutusu QR takibi + kelime bulutu (web + PWA).

## Özellikler

- QR ile kutu takip sayfası: `/k/sutluce/ILAC-001`
- Kargo tarzı aşama zaman çizelgesi
- İki kampüs: Sütlüce, ADSM
- Kelime bulutu: “Atık deyince ne geliyor?”
- **Admin only:** QR etiketler `/etiketler`, yönetim `/yonetim` — giriş: `/admin/giris`

## Kurulum

```bash
cd ATIK
npm install
cp .env.example .env.local
npm run dev
```

Tarayıcı: http://localhost:3000

### Supabase (kalıcı veri)

1. [supabase.com](https://supabase.com) → yeni proje
2. SQL Editor → `supabase/schema.sql` içeriğini çalıştırın
3. Settings → API → URL ve `anon` key → `.env.local`
4. **Zorunlu:** `ADMIN_SIFRE=guclu-bir-sifre` (QR etiket + yönetim için)

Supabase yokken uygulama **mock veri** ile çalışır (deneme için yeterli).

## QR kodları

Canlı URL formatı:

```
https://SITENIZ.vercel.app/k/sutluce/ILAC-001
https://SITENIZ.vercel.app/k/adsm/PLASTIK-001
```

Ücretsiz QR üretimi: [qr-code-generator.com](https://www.qr-code-generator.com) veya Canva.

## Yayınlama (ücretsiz)

1. Projeyi GitHub’a yükleyin
2. [vercel.com](https://vercel.com) → Import → env değişkenlerini ekleyin
3. `NEXT_PUBLIC_SITE_URL` = Vercel URL’niz
4. QR’ları bu URL ile yeniden oluşturun

## PWA

Telefonda Chrome/Safari → “Ana ekrana ekle”. `manifest.json` hazır.

## Pilot kutular

| Kampüs | Kutu ID | Tür |
|--------|---------|-----|
| Sütlüce | ILAC-001 | İlaç |
| Sütlüce | ELEK-001 | Elektronik |
| Sütlüce | KAGIT-001 | Kağıt |
| ADSM | ILAC-001 | İlaç |
| ADSM | ELEK-001 | Elektronik |
| ADSM | PLASTIK-001 | Plastik |
