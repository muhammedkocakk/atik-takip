"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const RENKLER = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#059669",
  "#dc2626", "#0d9488",
];

const REF_GENISLIK = 1000;
const REF_YUKSEKLIK = 560;

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
  x: number;
  y: number;
}

interface Kutu {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface Boyut {
  genislik: number;
  yukseklik: number;
}

interface FontAraligi {
  min: number;
  max: number;
  /** Kelimenin kaplayabileceği max genişlik oranı */
  maxSatirOrani: number;
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

/** Ekran genişliğine göre min/max font (px) */
function fontAraligi(genislik: number): FontAraligi {
  if (genislik < 400) {
    return { min: 12, max: 24, maxSatirOrani: 0.4 };
  }
  if (genislik < 640) {
    return { min: 15, max: 32, maxSatirOrani: 0.44 };
  }
  if (genislik < 900) {
    return { min: 20, max: 48, maxSatirOrani: 0.5 };
  }
  return { min: 22, max: 58, maxSatirOrani: 0.52 };
}

function maxKelimeSayisi(genislik: number): number {
  if (genislik < 400) return 35;
  if (genislik < 640) return 50;
  if (genislik < 900) return 65;
  return 75;
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
  return metin.length * fontSize * 0.62;
}

function metinKutusu(
  metin: string,
  fontSize: number,
  rotate: number,
  cx: number,
  cy: number
): Kutu {
  const w = metinGenisligiPx(metin, fontSize);
  const h = fontSize * 1.25;
  const rad = (rotate * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const genislikKutu = w * cos + h * sin;
  const yukseklikKutu = w * sin + h * cos;
  const pad = metin.length > 10 ? 12 : 8;
  return {
    left: cx - genislikKutu / 2 - pad,
    top: cy - yukseklikKutu / 2 - pad,
    right: cx + genislikKutu / 2 + pad,
    bottom: cy + yukseklikKutu / 2 + pad,
  };
}

function cakisiyor(a: Kutu, b: Kutu): boolean {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function sinirIcinde(kutu: Kutu, W: number, H: number, kenar: number): boolean {
  return (
    kutu.left >= kenar &&
    kutu.top >= kenar &&
    kutu.right <= W - kenar &&
    kutu.bottom <= H - kenar
  );
}

/** Merkezden dışa spiral — yarıçap ekrana göre ölçeklenir */
function* spiralNoktalari(
  merkezX: number,
  merkezY: number,
  baslangicAcisi: number,
  adimSayisi: number,
  maxYaricap: number
): Generator<{ x: number; y: number }> {
  yield { x: merkezX, y: merkezY };
  for (let i = 1; i < adimSayisi; i++) {
    const t = i / adimSayisi;
    const r = t * maxYaricap;
    const aci = baslangicAcisi + i * 0.42;
    yield {
      x: merkezX + r * Math.cos(aci),
      y: merkezY + r * Math.sin(aci),
    };
  }
}

/** Mobil ve dar ekranlarda tüm alanı tarayan ızgara denemeleri */
function* izgaraNoktalari(
  aralik: { minX: number; maxX: number; minY: number; maxY: number },
  sutun: number,
  satir: number,
  rnd: () => number
): Generator<{ x: number; y: number }> {
  const hucreler: { x: number; y: number }[] = [];
  for (let row = 0; row < satir; row++) {
    for (let col = 0; col < sutun; col++) {
      const x =
        aralik.minX +
        ((col + 0.5) / sutun) * (aralik.maxX - aralik.minX);
      const y =
        aralik.minY +
        ((row + 0.5) / satir) * (aralik.maxY - aralik.minY);
      hucreler.push({ x, y });
    }
  }
  for (let i = hucreler.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [hucreler[i], hucreler[j]] = [hucreler[j], hucreler[i]];
  }
  yield* hucreler;
}

function gecerliMerkezAraligi(
  metin: string,
  fontSize: number,
  rotate: number,
  W: number,
  H: number,
  kenar: number
): { minX: number; maxX: number; minY: number; maxY: number } {
  const kutu = metinKutusu(metin, fontSize, rotate, W / 2, H / 2);
  const yarimGenislik = (kutu.right - kutu.left) / 2;
  const yarimYukseklik = (kutu.bottom - kutu.top) / 2;
  return {
    minX: kenar + yarimGenislik,
    maxX: W - kenar - yarimGenislik,
    minY: kenar + yarimYukseklik,
    maxY: H - kenar - yarimYukseklik,
  };
}

function aciSec(rnd: () => number, uzunMetin: boolean, mobil: boolean): number {
  if (mobil) {
    return (rnd() - 0.5) * 16;
  }
  const tip = rnd();
  if (tip < 0.5) return (rnd() - 0.5) * 40;
  if (tip < 0.85) return 0;
  if (uzunMetin) return (rnd() - 0.5) * 20;
  return (rnd() > 0.5 ? 1 : -1) * (75 + rnd() * 15);
}

function fontBoyutuHesapla(
  oran: number,
  uzunluk: number,
  genislik: number
): number {
  const { min, max, maxSatirOrani } = fontAraligi(genislik);
  let boyut = min + Math.pow(oran, 0.8) * (max - min);

  const maxGenislikPx = genislik * maxSatirOrani;
  const tahminiGenislik = uzunluk * boyut * 0.65;
  if (tahminiGenislik > maxGenislikPx) {
    boyut = maxGenislikPx / (uzunluk * 0.65);
  }

  return Math.max(min * 0.85, Math.round(boyut));
}

function konumDene(
  f: { metin: string; sayi: number; orijinal: string },
  fs: number,
  rotate: number,
  x: number,
  y: number,
  W: number,
  H: number,
  kenar: number,
  kutular: Kutu[],
  renk: string
): Yerlesim | null {
  const kutu = metinKutusu(f.orijinal, fs, rotate, x, y);
  if (!sinirIcinde(kutu, W, H, kenar)) return null;
  if (kutular.some((kb) => cakisiyor(kutu, kb))) return null;
  kutular.push(kutu);
  return {
    metin: f.metin,
    orijinal: f.orijinal,
    sayi: f.sayi,
    fontSize: fs,
    renk,
    rotate,
    x: (x / W) * 100,
    y: (y / H) * 100,
  };
}

function kelimeleriYerlestir(
  frekanslar: { metin: string; sayi: number; orijinal: string }[],
  boyut: Boyut
): Yerlesim[] {
  const { genislik: W, yukseklik: H } = boyut;
  const mobil = W < 640;
  const max = frekanslar[0]?.sayi ?? 1;
  const min = frekanslar[frekanslar.length - 1]?.sayi ?? 1;
  const liste = frekanslar.slice(0, maxKelimeSayisi(W));
  const yerlesen: Yerlesim[] = [];
  const kutular: Kutu[] = [];
  const kenar = mobil ? 14 : 28;
  const merkezX = W / 2;
  const merkezY = H / 2;
  const maxYaricap = Math.min(W, H) * (mobil ? 0.46 : 0.48);
  const SPIRAL_ADIM = mobil ? 200 : 220;
  const RASTGELE_EK = mobil ? 50 : 60;
  const IZGARA_SUTUN = mobil ? 7 : 0;
  const IZGARA_SATIR = mobil ? 6 : 0;

  for (let idx = 0; idx < liste.length; idx++) {
    const f = liste[idx];
    const oran = max === min ? 0.7 : (f.sayi - min) / (max - min);
    const uzunluk = f.orijinal.length;
    const seed = hashSeed(f.metin) ^ (idx * 2654435761);
    const rnd = rastgeleUret(seed);
    const renk = RENKLER[Math.floor(rnd() * RENKLER.length)];

    let fontSize = fontBoyutuHesapla(oran, uzunluk, W);
    let yerlesti = false;

    for (let kucult = 0; kucult < 5 && !yerlesti; kucult++) {
      const fs = Math.max(fontAraligi(W).min * 0.8, fontSize - kucult * 3);
      const aciAdaylari = mobil
        ? [0, (rnd() - 0.5) * 14, (rnd() - 0.5) * 10]
        : [aciSec(rnd, uzunluk > 12, mobil)];

      for (const rotate of aciAdaylari) {
        if (yerlesti) break;
        const aralik = gecerliMerkezAraligi(f.orijinal, fs, rotate, W, H, kenar);

        if (aralik.minX > aralik.maxX || aralik.minY > aralik.maxY) continue;

        const baslangicAcisi = rnd() * Math.PI * 2;

        const noktaDene = (cx: number, cy: number): boolean => {
          if (cx < aralik.minX || cx > aralik.maxX || cy < aralik.minY || cy > aralik.maxY) {
            return false;
          }
          const sonuc = konumDene(f, fs, rotate, cx, cy, W, H, kenar, kutular, renk);
          if (sonuc) {
            yerlesen.push(sonuc);
            yerlesti = true;
            return true;
          }
          return false;
        };

        for (const { x, y } of spiralNoktalari(
          merkezX,
          merkezY,
          baslangicAcisi,
          SPIRAL_ADIM,
          maxYaricap
        )) {
          if (noktaDene(x, y)) break;
        }

        if (yerlesti) break;

        if (IZGARA_SUTUN > 0) {
          for (const { x, y } of izgaraNoktalari(aralik, IZGARA_SUTUN, IZGARA_SATIR, rnd)) {
            if (noktaDene(x, y)) break;
          }
        }

        if (yerlesti) break;

        for (let d = 0; d < RASTGELE_EK; d++) {
          const cx = aralik.minX + rnd() * (aralik.maxX - aralik.minX);
          const cy = aralik.minY + rnd() * (aralik.maxY - aralik.minY);
          if (noktaDene(cx, cy)) break;
        }
      }
    }
  }

  return yerlesen;
}

export function WordCloud({ kelimeler }: WordCloudProps) {
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const [boyut, setBoyut] = useState<Boyut | null>(null);

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

  const ogeler = useMemo(() => {
    if (!boyut) return [];
    return kelimeleriYerlestir(frekansHesapla(kelimeler), boyut);
  }, [kelimeler, boyut]);

  if (kelimeler.length === 0) {
    return (
      <p className="py-16 text-center text-slate-500">
        Henüz cevap yok. İlk siz yazın!
      </p>
    );
  }

  if (ogeler.length === 0 && !boyut) {
    return (
      <div
        ref={kapsayiciRef}
        className="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80"
        style={{
          aspectRatio: `${REF_GENISLIK} / ${REF_YUKSEKLIK}`,
          minHeight: 260,
        }}
        aria-hidden
      />
    );
  }

  if (ogeler.length === 0) {
    return (
      <p className="py-16 text-center text-slate-500">
        Henüz cevap yok. İlk siz yazın!
      </p>
    );
  }

  const buyukEkran = (boyut?.genislik ?? 0) >= 640;

  return (
    <div
      ref={kapsayiciRef}
      className="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80"
      style={{
        aspectRatio: `${REF_GENISLIK} / ${REF_YUKSEKLIK}`,
        minHeight: (boyut?.genislik ?? 0) < 400 ? 220 : buyukEkran ? 320 : 260,
      }}
    >
      <div className="absolute inset-0">
        {ogeler.map((o) => (
          <span
            key={`${o.metin}-${o.x}-${o.y}-${o.rotate}-${o.fontSize}`}
            className="absolute cursor-default select-none whitespace-nowrap font-bold leading-none transition-transform duration-200 hover:z-10"
            style={{
              left: `${o.x}%`,
              top: `${o.y}%`,
              fontSize: `${o.fontSize}px`,
              color: o.renk,
              transform: `translate(-50%, -50%) rotate(${o.rotate}deg)`,
              fontWeight: o.fontSize > 36 ? 800 : o.fontSize > 22 ? 700 : 600,
            }}
            title={`${o.sayi} kez yazıldı`}
          >
            {o.orijinal}
          </span>
        ))}
      </div>
    </div>
  );
}
