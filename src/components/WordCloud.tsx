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

function metinKutusu(
  metin: string,
  fontSize: number,
  rotate: number,
  cx: number,
  cy: number
): Kutu {
  const karakter = fontSize * 0.65;
  const w = metin.length * karakter;
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

function aciSec(rnd: () => number, uzunMetin: boolean, mobil: boolean): number {
  if (mobil) {
    return (rnd() - 0.5) * 28;
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
  const kenar = mobil ? 24 : 36;
  const MAX_DENEME = mobil ? 120 : 90;

  for (const f of liste) {
    const oran = max === min ? 0.7 : (f.sayi - min) / (max - min);
    const uzunluk = f.orijinal.length;
    const seed = hashSeed(f.metin);
    const rnd = rastgeleUret(seed);
    const renk = RENKLER[Math.floor(rnd() * RENKLER.length)];

    let fontSize = fontBoyutuHesapla(oran, uzunluk, W);
    let yerlesti = false;

    for (let kucult = 0; kucult < 4 && !yerlesti; kucult++) {
      const fs = Math.max(fontAraligi(W).min * 0.8, fontSize - kucult * 3);
      for (let d = 0; d < MAX_DENEME; d++) {
        const rotate = aciSec(rnd, uzunluk > 12, mobil);
        const x = kenar + rnd() * (W - kenar * 2);
        const y = kenar + rnd() * (H - kenar * 2);
        const kutu = metinKutusu(f.orijinal, fs, rotate, x, y);

        if (
          kutu.left < 8 ||
          kutu.top < 8 ||
          kutu.right > W - 8 ||
          kutu.bottom > H - 8
        ) {
          continue;
        }
        if (kutular.some((kb) => cakisiyor(kutu, kb))) continue;

        kutular.push(kutu);
        yerlesen.push({
          metin: f.metin,
          orijinal: f.orijinal,
          sayi: f.sayi,
          fontSize: fs,
          renk,
          rotate,
          x: (x / W) * 100,
          y: (y / H) * 100,
        });
        yerlesti = true;
        break;
      }
    }
  }

  return yerlesen;
}

export function WordCloud({ kelimeler }: WordCloudProps) {
  const kapsayiciRef = useRef<HTMLDivElement>(null);
  const [boyut, setBoyut] = useState<Boyut>({
    genislik: REF_GENISLIK,
    yukseklik: REF_YUKSEKLIK,
  });

  useEffect(() => {
    const el = kapsayiciRef.current;
    if (!el) return;

    const guncelle = () => {
      const r = el.getBoundingClientRect();
      const genislik = Math.max(280, Math.round(r.width));
      const yukseklik = Math.max(200, Math.round(r.width * (REF_YUKSEKLIK / REF_GENISLIK)));
      setBoyut({ genislik, yukseklik });
    };

    guncelle();
    const gozlemci = new ResizeObserver(guncelle);
    gozlemci.observe(el);
    window.addEventListener("resize", guncelle);
    return () => {
      gozlemci.disconnect();
      window.removeEventListener("resize", guncelle);
    };
  }, []);

  const ogeler = useMemo(
    () => kelimeleriYerlestir(frekansHesapla(kelimeler), boyut),
    [kelimeler, boyut]
  );

  if (ogeler.length === 0) {
    return (
      <p className="py-16 text-center text-slate-500">
        Henüz cevap yok. İlk siz yazın!
      </p>
    );
  }

  const buyukEkran = boyut.genislik >= 640;

  return (
    <div
      ref={kapsayiciRef}
      className="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80"
      style={{
        aspectRatio: `${REF_GENISLIK} / ${REF_YUKSEKLIK}`,
        minHeight: boyut.genislik < 400 ? 220 : buyukEkran ? 320 : 260,
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
