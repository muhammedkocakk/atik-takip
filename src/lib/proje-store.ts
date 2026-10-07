import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { KatkiAlaniKod, ProjeDurum, ProjeKategoriKod } from "./proje-constants";
import { isSupabaseConfigured } from "./supabase";
import { getSupabaseAdmin } from "./supabase-admin";
import type { ProjeKatilimi, ProjeOzet, ProjeYonetim } from "./types";

const DOSYA = path.join(process.cwd(), "data", "projeler.json");

export class ProjeDepoHatasi extends Error {}
export class ZatenKatildiHatasi extends Error {}

export interface YeniFikir {
  ad: string;
  sorun: string;
  ozet: string;
  kategori: ProjeKategoriKod;
  destek_alanlari: KatkiAlaniKod[];
  sahip_ad: string;
  sahip_eposta: string;
}

export interface YeniKatilim {
  ad: string;
  eposta: string;
  bolum: string;
  katki_alanlari: KatkiAlaniKod[];
  mesaj: string | null;
}

type FikirKaydi = Omit<ProjeYonetim, "katilimlar" | "katilimci_sayisi">;

interface DosyaIcerigi {
  fikirler: FikirKaydi[];
  katilimlar: ProjeKatilimi[];
}

export function projeDepoTipi(): "supabase" | "yapilandirma-eksik" | "dosya" {
  if (getSupabaseAdmin()) return "supabase";
  if (isSupabaseConfigured()) return "yapilandirma-eksik";
  return "dosya";
}

function supabaseGerekli() {
  const supabase = getSupabaseAdmin();
  if (supabase) return supabase;
  if (isSupabaseConfigured()) {
    throw new ProjeDepoHatasi("SUPABASE_SERVICE_ROLE_KEY tanımlı değil.");
  }
  return null;
}

async function dosyadanOku(): Promise<DosyaIcerigi> {
  try {
    const ham = JSON.parse(await fs.readFile(DOSYA, "utf-8")) as Partial<DosyaIcerigi>;
    return {
      fikirler: Array.isArray(ham.fikirler) ? ham.fikirler : [],
      katilimlar: Array.isArray(ham.katilimlar) ? ham.katilimlar : [],
    };
  } catch {
    return { fikirler: [], katilimlar: [] };
  }
}

async function dosyayaYaz(icerik: DosyaIcerigi): Promise<void> {
  await fs.mkdir(path.dirname(DOSYA), { recursive: true });
  await fs.writeFile(DOSYA, JSON.stringify(icerik, null, 2), "utf-8");
}

function yerelId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ozeteCevir(f: FikirKaydi, katilimciSayisi: number): ProjeOzet {
  return {
    id: f.id,
    ad: f.ad,
    sorun: f.sorun,
    ozet: f.ozet,
    kategori: f.kategori,
    destek_alanlari: f.destek_alanlari,
    olusturma_tarihi: f.olusturma_tarihi,
    katilimci_sayisi: katilimciSayisi,
  };
}

const OZET_ALANLARI =
  "id, ad, sorun, ozet, kategori, destek_alanlari, olusturma_tarihi, proje_katilimlari(count)";

type OzetSatiri = Omit<ProjeOzet, "katilimci_sayisi"> & {
  proje_katilimlari: { count: number }[] | null;
};

function satiriOzeteCevir(s: OzetSatiri): ProjeOzet {
  const { proje_katilimlari, ...geri } = s;
  return { ...geri, katilimci_sayisi: proje_katilimlari?.[0]?.count ?? 0 };
}

export async function onayliProjeleriGetir(): Promise<ProjeOzet[]> {
  const supabase = supabaseGerekli();
  if (supabase) {
    const { data, error } = await supabase
      .from("proje_fikirleri")
      .select(OZET_ALANLARI)
      .eq("durum", "onayli")
      .order("olusturma_tarihi", { ascending: false });
    if (error) throw new ProjeDepoHatasi(error.message);
    return (data as unknown as OzetSatiri[]).map(satiriOzeteCevir);
  }

  const { fikirler, katilimlar } = await dosyadanOku();
  return fikirler
    .filter((f) => f.durum === "onayli")
    .sort((a, b) => b.olusturma_tarihi.localeCompare(a.olusturma_tarihi))
    .map((f) => ozeteCevir(f, katilimlar.filter((k) => k.proje_id === f.id).length));
}

export async function onayliProjeGetir(id: string): Promise<ProjeOzet | null> {
  const supabase = supabaseGerekli();
  if (supabase) {
    const { data, error } = await supabase
      .from("proje_fikirleri")
      .select(OZET_ALANLARI)
      .eq("id", id)
      .eq("durum", "onayli")
      .maybeSingle();
    // 22P02: geçersiz uuid — bulunamadı say
    if (error && error.code !== "22P02") throw new ProjeDepoHatasi(error.message);
    return data ? satiriOzeteCevir(data as unknown as OzetSatiri) : null;
  }

  const { fikirler, katilimlar } = await dosyadanOku();
  const f = fikirler.find((x) => x.id === id && x.durum === "onayli");
  return f ? ozeteCevir(f, katilimlar.filter((k) => k.proje_id === f.id).length) : null;
}

export async function fikirEkleKayit(fikir: YeniFikir): Promise<void> {
  const supabase = supabaseGerekli();
  if (supabase) {
    const { error } = await supabase.from("proje_fikirleri").insert(fikir);
    if (error) throw new ProjeDepoHatasi(error.message);
    return;
  }

  const icerik = await dosyadanOku();
  icerik.fikirler.push({
    ...fikir,
    id: yerelId(),
    durum: "beklemede",
    olusturma_tarihi: new Date().toISOString(),
  });
  await dosyayaYaz(icerik);
}

export async function katilimEkleKayit(projeId: string, katilim: YeniKatilim): Promise<void> {
  const supabase = supabaseGerekli();
  if (supabase) {
    const { error } = await supabase
      .from("proje_katilimlari")
      .insert({ ...katilim, proje_id: projeId });
    if (error?.code === "23505") throw new ZatenKatildiHatasi();
    if (error) throw new ProjeDepoHatasi(error.message);
    return;
  }

  const icerik = await dosyadanOku();
  if (icerik.katilimlar.some((k) => k.proje_id === projeId && k.eposta === katilim.eposta)) {
    throw new ZatenKatildiHatasi();
  }
  icerik.katilimlar.push({
    ...katilim,
    id: yerelId(),
    proje_id: projeId,
    olusturma_tarihi: new Date().toISOString(),
  });
  await dosyayaYaz(icerik);
}

export async function tumProjeleriGetir(): Promise<ProjeYonetim[]> {
  const supabase = supabaseGerekli();
  if (supabase) {
    const { data, error } = await supabase
      .from("proje_fikirleri")
      .select("*, proje_katilimlari(*)")
      .order("olusturma_tarihi", { ascending: false })
      .order("olusturma_tarihi", { referencedTable: "proje_katilimlari", ascending: true });
    if (error) throw new ProjeDepoHatasi(error.message);
    return (data as (FikirKaydi & { proje_katilimlari: ProjeKatilimi[] | null })[]).map(
      ({ proje_katilimlari, ...f }) => ({
        ...f,
        katilimlar: proje_katilimlari ?? [],
        katilimci_sayisi: proje_katilimlari?.length ?? 0,
      })
    );
  }

  const { fikirler, katilimlar } = await dosyadanOku();
  return fikirler
    .sort((a, b) => b.olusturma_tarihi.localeCompare(a.olusturma_tarihi))
    .map((f) => {
      const ilgili = katilimlar.filter((k) => k.proje_id === f.id);
      return { ...f, katilimlar: ilgili, katilimci_sayisi: ilgili.length };
    });
}

export async function projeDurumGuncelleKayit(id: string, durum: ProjeDurum): Promise<boolean> {
  const supabase = supabaseGerekli();
  if (supabase) {
    const { data, error } = await supabase
      .from("proje_fikirleri")
      .update({ durum })
      .eq("id", id)
      .select("id");
    if (error) throw new ProjeDepoHatasi(error.message);
    return (data?.length ?? 0) > 0;
  }

  const icerik = await dosyadanOku();
  const f = icerik.fikirler.find((x) => x.id === id);
  if (!f) return false;
  f.durum = durum;
  await dosyayaYaz(icerik);
  return true;
}

export async function projeSilKayit(id: string): Promise<boolean> {
  const supabase = supabaseGerekli();
  if (supabase) {
    const { data, error } = await supabase
      .from("proje_fikirleri")
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw new ProjeDepoHatasi(error.message);
    return (data?.length ?? 0) > 0;
  }

  const icerik = await dosyadanOku();
  const kalan = icerik.fikirler.filter((x) => x.id !== id);
  if (kalan.length === icerik.fikirler.length) return false;
  await dosyayaYaz({
    fikirler: kalan,
    katilimlar: icerik.katilimlar.filter((k) => k.proje_id !== id),
  });
  return true;
}
