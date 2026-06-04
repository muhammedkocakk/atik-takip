# Atık Takip — Ücretsiz yayınlama rehberi

## Sıra özeti

1. ✅ Supabase (veritabanı) — tamam
2. ⬜ `.env.local` — Supabase anahtarlarını ekle
3. ⬜ GitHub — kodu yükle
4. ⬜ Vercel — siteyi yayınla
5. ⬜ Canlı URL + QR etiketleri

---

## Adım 2 — Yerel Supabase bağlantısı

`ATIK/.env.local` dosyası şöyle olmalı (Supabase → Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_SIFRE=guclu-bir-sifre
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Sonra:

```powershell
cd "c:\Users\mhmmd\OneDrive\Masaüstü\ATIK"
npm run dev
```

`/dusunceler` → kelime yaz → Supabase Table Editor’da `kelime_cevaplari`’nda görünmeli.

---

## Adım 3 — GitHub

1. https://github.com/new → repo adı örn. `atik-takip` → **Create** (README ekleme)

2. PowerShell:

```powershell
cd "c:\Users\mhmmd\OneDrive\Masaüstü\ATIK"
git init
git add .
git commit -m "İstün atık takip pilot"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/atik-takip.git
git push -u origin main
```

`KULLANICI_ADINIZ` yerine kendi GitHub kullanıcı adınızı yazın.

---

## Adım 4 — Vercel (ücretsiz)

1. https://vercel.com → **Sign up** → **Continue with GitHub**
2. **Add New → Project** → `atik-takip` reposunu seç → **Import**
3. **Environment Variables** — hepsini ekleyin:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `ADMIN_SIFRE` | Güçlü şifre (canlıda `pilot123` kullanmayın) |
| `NEXT_PUBLIC_SITE_URL` | İlk deploy sonrası doldurulacak |

4. **Deploy** — bitince site adresi örn. `https://atik-takip-xxx.vercel.app`

5. **Settings → Environment Variables** → `NEXT_PUBLIC_SITE_URL` = bu adres  
6. **Deployments → … → Redeploy** (QR linkleri doğru olsun)

---

## Adım 5 — Canlı kullanım

| Ne | Adres |
|----|--------|
| Herkese açık site | `https://SITENIZ.vercel.app` |
| Admin giriş | `https://SITENIZ.vercel.app/admin/giris` |
| QR etiket yazdır | Girişten sonra `/etiketler` |

Telefonda: siteyi aç → **Ana ekrana ekle** (PWA).

---

## Sorun giderme

- **Kelime kayboluyor (canlı):** Vercel’de Supabase env’leri eksik veya yanlış.
- **Admin açılmıyor:** `ADMIN_SIFRE` Vercel’de tanımlı mı?
- **QR yanlış link:** `NEXT_PUBLIC_SITE_URL` canlı adres + redeploy.
