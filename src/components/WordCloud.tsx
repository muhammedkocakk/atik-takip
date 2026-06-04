"use client";

/**
 * Kelime bulutu: d3-cloud (Wordle / Jason Davies algoritması).
 * @see https://github.com/jasondavies/d3-cloud
 * @see https://www.jasondavies.com/wordcloud/
 */

import cloud, { type CloudWord } from "d3-cloud";
import { useEffect, useRef, useState } from "react";

const RENKLER = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#059669",
  "#dc2626", "#0d9488",
];

const REF_GENISLIK = 1000;
const REF_YUKSEKLIK = 560;
const SINIR_PAYI = 10;

interface WordCloudProps {
  kelimeler: string[];
}

interface Yerlesim {
  metin: string;
  orijinal: string;
  sayi: number;
  fontSize: number;
  renk: string;
  rotate: number;
  xPx: number;
  yPx: number;
}

interface Boyut {
  genislik: number;
  yukseklik: number;
}

interface BulutGirdisi {
  text: string;
  orijinal: string;
  sayi: number;
  metin: string;
  renk: string;
  size: number;
  padding: number;
  x?: number;
  y?: number;
  rotate?: number;
}

function frekansHesapla(kelimeler: string[]): { metin: string; sayi: number; orijinal: string }[] {
  const map = new Map<string, { sayi: number; orijinal: string }>();
  for (const k of kelimeler) {
    const key = k.trim().toLowerCase();
    if (key.length < 2) continue;
    const mevcut = map.get(key);
    if (mevcut) mevcut.sayi += 1;
    else map.set(key, { sayi: 1, orijinal: k.trim() });
  }
  return [...map.entries()]
    .map(([metin, v]) => ({ metin, sayi: v.sayi, orijinal: v.orijinal }))
    .sort((a, b) => b.sayi - a.sayi);
}

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rastgeleUret(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function fontAraligi(genislik: number): { min: number; max: number } {
  if (genislik < 400) return { min: 14, max: 28 };
  if (genislik < 640) return { min: 16, max: 36 };
  if (genislik < 900) return { min: 20, max: 48 };
  return { min: 22, max: 56 };
}

function maxKelimeSayisi(genislik: number): number {
  if (genislik < 400) return 40;
  if (genislik < 640) return 55;
  return 80;
}

function fontBoyutu(
  sayi: number,
  minSayi: number,
  maxSayi: number,
  uzunluk: number,
  genislik: number
): number {
  const { min, max } = fontAraligi(genislik);
  const oran = maxSayi === minSayi ? 0.75 : (sayi - minSayi) / (maxSayi - minSayi);
  let boyut = min + Math.pow(oran, 0.75) * (max - min);
  const maxSatir = genislik * (genislik < 640 ? 0.88 : 0.75);
  const tahmini = uzunluk * boyut * 0.58;
  if (tahmini > maxSatir) boyut = maxSatir / (uzunluk * 0.58);
  return Math.max(min, Math.round(boyut));
}

let olcumCanvas: HTMLCanvasElement | null = null;
let olcumCtx: CanvasRenderingContext2D | null = null;

function metinGenisligiPx(metin: string, fontSize: number): number {
  if (typeof document !== "undefined") {
    if (!olcumCanvas) {
      olcumCanvas = document.createElement("canvas");
      olcumCtx = olcumCanvas.getContext("2d");
    }
    if (olcumCtx) {
      olcumCtx.font = `700 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
      return olcumCtx.measureText(metin).width;
    }
  }
  return metin.length * fontSize * 0.58;
}

function kelimeSinirKutusu(
  w: Yerlesim,
  W: number,
  H: number
): { left: number; top: number; right: number; bottom: number } {
  const cx = W / 2 + w.xPx;
  const cy = H / 2 + w.yPx;
  const genislik = metinGenisligiPx(w.orijinal, w.fontSize);
  const yukseklik = w.fontSize * 1.2;
  const rad = (w.rotate * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const kutuW = genislik * cos + yukseklik * sin;
  const kutuH = genislik * sin + yukseklik * cos;
  const pad = SINIR_PAYI;
  return {
    left: cx - kutuW / 2 - pad,
    top: cy - kutuH / 2 - pad,
    right: cx + kutuW / 2 + pad,
    bottom: cy + kutuH / 2 + pad,
  };
}

function hepsiSinirIcinde(yerlesen: Yerlesim[], W: number, H: number): boolean {
  for (const w of yerlesen) {
    const k = kelimeSinirKutusu(w, W, H);
    if (
      k.left < SINIR_PAYI ||
      k.top < SINIR_PAYI ||
      k.right > W - SINIR_PAYI ||
      k.bottom > H - SINIR_PAYI
    ) {
      return false;
    }
  }
  return true;
}

function konumlariOlcekle(yerlesen: Yerlesim[], skala: number): Yerlesim[] {
  if (skala === 1) return yerlesen;
  return yerlesen.map((w) => ({
    ...w,
    xPx: w.xPx * skala,
    yPx: w.yPx * skala,
  }));
}

/** Az kelime varken d3-cloud merkezde kalır; konumları alana yay (sınır içinde) */
function seyrekKonumlariYay(yerlesen: Yerlesim[], W: number, H: number): Yerlesim[] {
  const n = yerlesen.length;
  if (n <= 1) return yerlesen;

  const hedefX = W * (n < 6 ? 0.44 : n < 12 ? 0.38 : 0.32);
  const hedefY = H * (n < 6 ? 0.4 : n < 12 ? 0.34 : 0.28);

  let maxAbsX = 0;
  let maxAbsY = 0;
  for (const w of yerlesen) {
    maxAbsX = Math.max(maxAbsX, Math.abs(w.xPx));
    maxAbsY = Math.max(maxAbsY, Math.abs(w.yPx));
  }
  if (maxAbsX < 2 && maxAbsY < 2) return yerlesen;

  const hedefSkala = Math.min(
    hedefX / Math.max(maxAbsX, 1),
    hedefY / Math.max(maxAbsY, 1),
    n < 6 ? 2 : 1.6
  );
  if (hedefSkala <= 1.05) return yerlesen;

  let enIyi = yerlesen;
  let alt = 1;
  let ust = hedefSkala;

  for (let i = 0; i < 14; i++) {
    const orta = (alt + ust) / 2;
    const deneme = konumlariOlcekle(yerlesen, orta);
    if (hepsiSinirIcinde(deneme, W, H)) {
      enIyi = deneme;
      alt = orta;
    } else {
      ust = orta;
    }
  }

  return enIyi;
}

/** Yayma dışında kalan taşmalar için hafif küçültme */
function sinirlaraSigdir(yerlesen: Yerlesim[], W: number, H: number): Yerlesim[] {
  if (hepsiSinirIcinde(yerlesen, W, H)) return yerlesen;
  for (let skala = 0.95; skala >= 0.7; skala -= 0.05) {
    const deneme = konumlariOlcekle(yerlesen, skala);
    if (hepsiSinirIcinde(deneme, W, H)) return deneme;
  }
  return konumlariOlcekle(yerlesen, 0.7);
}

function bulutHazirla(
  frekanslar: { metin: string; sayi: number; orijinal: string }[],
  boyut: Boyut
): Promise<Yerlesim[]> {
  const { genislik: W, yukseklik: H } = boyut;
  const mobil = W < 640;
  const liste = frekanslar.slice(0, maxKelimeSayisi(W));
  if (liste.length === 0) return Promise.resolve([]);

  const maxSayi = liste[0].sayi;
  const minSayi = liste[liste.length - 1].sayi;
  const tohum = hashSeed(liste.map((f) => f.metin).join("|") + `@${W}x${H}`);
  const rnd = rastgeleUret(tohum);

  const girdiler: BulutGirdisi[] = liste.map((f, i) => ({
    text: f.orijinal,
    orijinal: f.orijinal,
    sayi: f.sayi,
    metin: f.metin,
    renk: RENKLER[Math.floor(rnd() * RENKLER.length)],
    size: fontBoyutu(f.sayi, minSayi, maxSayi, f.orijinal.length, W),
    padding: mobil ? 3 : 5,
  }));

  return new Promise((resolve) => {
    const layout = cloud()
      .size([W, H])
      .words(girdiler as unknown as CloudWord[])
      .padding(mobil ? 3 : 5)
      .spiral("archimedean")
      .random(rnd)
      .font("ui-sans-serif, system-ui, sans-serif")
      .fontStyle("normal")
      .fontWeight("700")
      .fontSize((d) => d.size ?? 16)
      .rotate((d) => {
        if (mobil) return 0;
        const uzun = (d.text?.length ?? 0) > 14;
        const r = rnd();
        if (r < 0.55) return 0;
        if (r < 0.75 && !uzun) return (rnd() > 0.5 ? 1 : -1) * 90;
        return (Math.floor(rnd() * 5) - 2) * 30;
      })
      .on("end", (cikti) => {
        const yerlesen: Yerlesim[] = [];
        for (const ham of cikti) {
          const w = ham as unknown as BulutGirdisi;
          if (w.x == null || w.y == null || w.size == null) continue;
          yerlesen.push({
            metin: w.metin ?? w.text ?? "",
            orijinal: w.orijinal,
            sayi: w.sayi,
            fontSize: w.size,
            renk: w.renk,
            rotate: w.rotate ?? 0,
            xPx: w.x,
            yPx: w.y,
          });
        }
        resolve(sinirlaraSigdir(seyrekKonumlariYay(yerlesen, W, H), W, H));
      });

    layout.start();
  });
}

export function WordCloud({ kelimeler }: WordCloudProps) {
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const [boyut, setBoyut] = useState<Boyut | null>(null);
  const [ogeler, setOgeler] = useState<Yerlesim[]>([]);
  const [hesaplaniyor, setHesaplaniyor] = useState(false);

  useEffect(() => {
    const el = kapsayiciRef.current;
    if (!el) return;

    const guncelle = () => {
      const r = el.getBoundingClientRect();
      if (r.width < 1) return;
      const genislik = Math.max(280, Math.round(r.width));
      const yukseklik = Math.max(200, Math.round(r.width * (REF_YUKSEKLIK / REF_GENISLIK)));
      setBoyut({ genislik, yukseklik });
    };

    guncelle();
    requestAnimationFrame(guncelle);
    const gozlemci = new ResizeObserver(guncelle);
    gozlemci.observe(el);
    window.addEventListener("resize", guncelle);
    return () => {
      gozlemci.disconnect();
      window.removeEventListener("resize", guncelle);
    };
  }, []);

  useEffect(() => {
    if (!boyut || kelimeler.length === 0) {
      setOgeler([]);
      return;
    }

    let iptal = false;
    setHesaplaniyor(true);

    bulutHazirla(frekansHesapla(kelimeler), boyut).then((sonuc) => {
      if (!iptal) {
        setOgeler(sonuc);
        setHesaplaniyor(false);
      }
    });

    return () => {
      iptal = true;
    };
  }, [kelimeler, boyut]);

  if (kelimeler.length === 0) {
    return (
      <p className="py-16 text-center text-slate-500">
        Henüz cevap yok. İlk siz yazın!
      </p>
    );
  }

  const buyukEkran = (boyut?.genislik ?? 0) >= 640;
  const goster = ogeler.length > 0;

  return (
    <div
      ref={kapsayiciRef}
      className="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80"
      style={{
        aspectRatio: `${REF_GENISLIK} / ${REF_YUKSEKLIK}`,
        minHeight: (boyut?.genislik ?? 0) < 400 ? 220 : buyukEkran ? 320 : 260,
      }}
    >
      {hesaplaniyor && !goster && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
          Bulut hazırlanıyor…
        </div>
      )}
      {goster && (
        <div className="absolute inset-0">
          {ogeler.map((o) => (
            <span
              key={`${o.metin}-${o.xPx}-${o.yPx}-${o.rotate}-${o.fontSize}`}
              className="absolute left-1/2 top-1/2 cursor-default select-none whitespace-nowrap font-bold leading-none transition-transform duration-200 hover:z-10"
              style={{
                fontSize: `${o.fontSize}px`,
                color: o.renk,
                transform: `translate(calc(-50% + ${o.xPx}px), calc(-50% + ${o.yPx}px)) rotate(${o.rotate}deg)`,
                fontWeight: 700,
              }}
              title={`${o.sayi} kez yazıldı`}
            >
              {o.orijinal}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
