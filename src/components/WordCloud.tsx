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

/** Ekran genişliğine göre ölçek */
function olcekFaktoru(genislik: number): number {
  return Math.min(1, Math.max(0.45, genislik / REF_GENISLIK));
}

function maxKelimeSayisi(genislik: number): number {
  if (genislik < 400) return 35;
  if (genislik < 640) return 55;
  return 90;
}

function metinKutusu(
  metin: string,
  fontSize: number,
  rotate: number,
  cx: number,
  cy: number,
  olcek: number
): Kutu {
  const karakter = fontSize * 0.62 * olcek;
  const w = metin.length * karakter;
  const h = fontSize * 1.2 * olcek;
  const rad = (rotate * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const genislik = w * cos + h * sin;
  const yukseklik = w * sin + h * cos;
  const uzun = metin.length > 10;
  const pad = uzun ? 14 : 10;
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
  olcek: number,
  genislik: number
): number {
  let boyut = (14 + Math.pow(oran, 0.75) * 34) * olcek;
  if (genislik < 400) boyut = Math.min(boyut, 22);
  else if (genislik < 640) boyut = Math.min(boyut, 30);

  const maxGenislikPx = genislik * 0.42;
  const tahminiGenislik = uzunluk * boyut * 0.62;
  if (tahminiGenislik > maxGenislikPx) {
    boyut = maxGenislikPx / (uzunluk * 0.62);
  }
  return Math.max(11, Math.round(boyut));
}

function kelimeleriYerlestir(
  frekanslar: { metin: string; sayi: number; orijinal: string }[],
  boyut: Boyut
): Yerlesim[] {
  const { genislik: W, yukseklik: H } = boyut;
  const olcek = olcekFaktoru(W);
  const mobil = W < 640;
  const max = frekanslar[0]?.sayi ?? 1;
  const min = frekanslar[frekanslar.length - 1]?.sayi ?? 1;
  const liste = frekanslar.slice(0, maxKelimeSayisi(W));
  const yerlesen: Yerlesim[] = [];
  const kutular: Kutu[] = [];
  const kenar = mobil ? 28 : 40;
  const MAX_DENEME = mobil ? 120 : 80;

  for (const f of liste) {
    const oran = max === min ? 0.7 : (f.sayi - min) / (max - min);
    const uzunluk = f.orijinal.length;
    const seed = hashSeed(f.metin);
    const rnd = rastgeleUret(seed);
    const renk = RENKLER[Math.floor(rnd() * RENKLER.length)];

    let fontSize = fontBoyutuHesapla(oran, uzunluk, olcek, W);
    let yerlesti = false;

    for (let kucult = 0; kucult < 4 && !yerlesti; kucult++) {
      const fs = Math.max(10, fontSize - kucult * 3);
      for (let d = 0; d < MAX_DENEME; d++) {
        const rotate = aciSec(rnd, uzunluk > 12, mobil);
        const x = kenar + rnd() * (W - kenar * 2);
        const y = kenar + rnd() * (H - kenar * 2);
        const kutu = metinKutusu(f.orijinal, fs, rotate, x, y, olcek);

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
    /* Yer yoksa kelimeyi atla — üst üste bindirme */
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

  return (
    <div
      ref={kapsayiciRef}
      className="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80"
      style={{
        aspectRatio: `${REF_GENISLIK} / ${REF_YUKSEKLIK}`,
        minHeight: boyut.genislik < 400 ? 220 : undefined,
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
              fontWeight: o.fontSize > 28 ? 800 : o.fontSize > 18 ? 700 : 600,
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
