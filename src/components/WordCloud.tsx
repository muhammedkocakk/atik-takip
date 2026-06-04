"use client";

import { useMemo } from "react";

const RENKLER = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#059669",
  "#dc2626", "#0d9488",
];

const BULUT_GENISLIK = 1000;
const BULUT_YUKSEKLIK = 560;
const MAX_KELIME = 120;
const MAX_DENEME = 80;

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

function frekansHesapla(kelimeler: string[]): { metin: string; sayi: number; orijinal: string }[] {
  const map = new Map<string, { sayi: number; orijinal: string }>();
  for (const k of kelimeler) {
    const key = k.trim().toLowerCase();
    if (key.length < 2) continue;
    const mevcut = map.get(key);
    if (mevcut) {
      mevcut.sayi += 1;
    } else {
      map.set(key, { sayi: 1, orijinal: k.trim() });
    }
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

function metinKutusu(
  metin: string,
  fontSize: number,
  rotate: number,
  cx: number,
  cy: number
): Kutu {
  const karakter = fontSize * 0.58;
  const w = metin.length * karakter;
  const h = fontSize * 1.15;
  const rad = (rotate * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const genislik = w * cos + h * sin;
  const yukseklik = w * sin + h * cos;
  const pad = 6;
  return {
    left: cx - genislik / 2 - pad,
    top: cy - yukseklik / 2 - pad,
    right: cx + genislik / 2 + pad,
    bottom: cy + yukseklik / 2 + pad,
  };
}

function cakisiyor(a: Kutu, b: Kutu): boolean {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function aciSec(rnd: () => number, uzunMetin: boolean): number {
  const tip = rnd();
  if (tip < 0.55) return (rnd() - 0.5) * 50;
  if (tip < 0.8) return 0;
  if (uzunMetin) return (rnd() - 0.5) * 30;
  const dik = rnd() > 0.5 ? 90 : -90;
  return dik + (rnd() - 0.5) * 16;
}

function kelimeleriYerlestir(
  frekanslar: { metin: string; sayi: number; orijinal: string }[]
): Yerlesim[] {
  const max = frekanslar[0]?.sayi ?? 1;
  const min = frekanslar[frekanslar.length - 1]?.sayi ?? 1;
  const liste = frekanslar.slice(0, MAX_KELIME);
  const yerlesen: Yerlesim[] = [];
  const kutular: Kutu[] = [];

  const kenar = 40;

  for (const f of liste) {
    const oran = max === min ? 0.7 : (f.sayi - min) / (max - min);
    const fontSize = Math.round(14 + Math.pow(oran, 0.75) * 34);
    const seed = hashSeed(f.metin);
    const rnd = rastgeleUret(seed);
    const renk = RENKLER[Math.floor(rnd() * RENKLER.length)];
    const uzun = f.orijinal.length > 12;

    let yerlesti = false;

    for (let d = 0; d < MAX_DENEME; d++) {
      const rotate = aciSec(rnd, uzun);
      const x = kenar + rnd() * (BULUT_GENISLIK - kenar * 2);
      const y = kenar + rnd() * (BULUT_YUKSEKLIK - kenar * 2);
      const kutu = metinKutusu(f.orijinal, fontSize, rotate, x, y);

      if (
        kutu.left < 10 ||
        kutu.top < 10 ||
        kutu.right > BULUT_GENISLIK - 10 ||
        kutu.bottom > BULUT_YUKSEKLIK - 10
      ) {
        continue;
      }

      if (kutular.some((k) => cakisiyor(kutu, k))) continue;

      kutular.push(kutu);
      yerlesen.push({
        metin: f.metin,
        orijinal: f.orijinal,
        sayi: f.sayi,
        fontSize,
        renk,
        rotate,
        x: (x / BULUT_GENISLIK) * 100,
        y: (y / BULUT_YUKSEKLIK) * 100,
      });
      yerlesti = true;
      break;
    }

    if (!yerlesti) {
      const rotate = (rnd() - 0.5) * 20;
      const x = 15 + (hashSeed(f.metin + "x") % 700);
      const y = 15 + (hashSeed(f.metin + "y") % 400);
      yerlesen.push({
        metin: f.metin,
        orijinal: f.orijinal,
        sayi: f.sayi,
        fontSize: Math.max(12, fontSize - 4),
        renk,
        rotate,
        x: (x / BULUT_GENISLIK) * 100,
        y: (y / BULUT_YUKSEKLIK) * 100,
      });
    }
  }

  return yerlesen;
}

export function WordCloud({ kelimeler }: WordCloudProps) {
  const ogeler = useMemo(() => kelimeleriYerlestir(frekansHesapla(kelimeler)), [kelimeler]);

  if (ogeler.length === 0) {
    return (
      <p className="py-16 text-center text-slate-500">
        Henüz cevap yok. İlk siz yazın!
      </p>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80"
      style={{ aspectRatio: `${BULUT_GENISLIK} / ${BULUT_YUKSEKLIK}` }}
    >
      <div className="absolute inset-0">
        {ogeler.map((o) => (
          <span
            key={`${o.metin}-${o.x}-${o.y}-${o.rotate}`}
            className="absolute cursor-default select-none font-bold leading-none whitespace-nowrap transition-transform duration-200 hover:z-10 hover:scale-110"
            style={{
              left: `${o.x}%`,
              top: `${o.y}%`,
              fontSize: `${o.fontSize}px`,
              color: o.renk,
              transform: `translate(-50%, -50%) rotate(${o.rotate}deg)`,
              fontWeight: o.fontSize > 32 ? 800 : o.fontSize > 22 ? 700 : 600,
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
