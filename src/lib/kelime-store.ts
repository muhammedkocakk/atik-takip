import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { KELIME_LISTE_LIMIT } from "./kelime-constants";
import { MOCK_KELIMELER } from "./mock-data";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { KelimeCevabi } from "./types";

const DOSYA = path.join(process.cwd(), "data", "kelimeler.json");

async function dosyadanOku(): Promise<KelimeCevabi[]> {
  try {
    const ham = await fs.readFile(DOSYA, "utf-8");
    const parsed = JSON.parse(ham) as KelimeCevabi[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [...MOCK_KELIMELER];
  }
}

async function dosyayaYaz(liste: KelimeCevabi[]): Promise<void> {
  await fs.mkdir(path.dirname(DOSYA), { recursive: true });
  await fs.writeFile(DOSYA, JSON.stringify(liste, null, 2), "utf-8");
}

export function kelimeDepoTipi(): "supabase" | "dosya" {
  return isSupabaseConfigured() ? "supabase" : "dosya";
}

export async function kelimeleriGetir(): Promise<KelimeCevabi[]> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("kelime_cevaplari")
      .select("*")
      .order("olusturma_tarihi", { ascending: false })
      .limit(KELIME_LISTE_LIMIT);

    if (!error && data) return data as KelimeCevabi[];
    console.error("[kelime] Supabase okuma hatası, dosyaya düşülüyor:", error?.message);
  }

  return dosyadanOku();
}

export async function kelimeEkleKayit(metin: string): Promise<KelimeCevabi> {
  const kayit: KelimeCevabi = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    metin,
    olusturma_tarihi: new Date().toISOString(),
  };

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("kelime_cevaplari")
      .insert({ metin })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as KelimeCevabi;
  }

  const liste = await dosyadanOku();
  liste.unshift(kayit);
  await dosyayaYaz(liste);
  return kayit;
}

export async function kelimeSilKayit(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("kelime_cevaplari").delete().eq("id", id);
    return !error;
  }

  const liste = await dosyadanOku();
  const yeni = liste.filter((k) => k.id !== id);
  if (yeni.length === liste.length) return false;
  await dosyayaYaz(yeni);
  return true;
}
