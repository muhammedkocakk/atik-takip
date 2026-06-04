import {
  ASAMALAR,
  KAMPUSLER,
  type AsamaKod,
  type KampusKod,
} from "./constants";
import { MOCK_GECMIS, MOCK_KUTULAR } from "./mock-data";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { AsamaGecmisi, Kutu } from "./types";

export function isValidKampus(kod: string): kod is KampusKod {
  return kod in KAMPUSLER;
}

export async function getTumKutular(): Promise<Kutu[]> {
  const supabase = getSupabase();
  if (!supabase) return MOCK_KUTULAR;

  const { data, error } = await supabase.from("kutular").select("*").order("kampus_kod").order("id");
  if (error || !data) return MOCK_KUTULAR;
  return data as Kutu[];
}

export async function getKutularByKampus(kampusKod: KampusKod): Promise<Kutu[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return MOCK_KUTULAR.filter((k) => k.kampus_kod === kampusKod);
  }

  const { data, error } = await supabase
    .from("kutular")
    .select("*")
    .eq("kampus_kod", kampusKod)
    .order("id");

  if (error || !data) {
    return MOCK_KUTULAR.filter((k) => k.kampus_kod === kampusKod);
  }

  return data as Kutu[];
}

export async function getKutu(
  kampusKod: KampusKod,
  kutuId: string
): Promise<Kutu | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return (
      MOCK_KUTULAR.find(
        (k) => k.kampus_kod === kampusKod && k.id === kutuId
      ) ?? null
    );
  }

  const { data, error } = await supabase
    .from("kutular")
    .select("*")
    .eq("kampus_kod", kampusKod)
    .eq("id", kutuId)
    .single();

  if (error || !data) {
    return (
      MOCK_KUTULAR.find(
        (k) => k.kampus_kod === kampusKod && k.id === kutuId
      ) ?? null
    );
  }

  return data as Kutu;
}

export async function getAsamaGecmisi(
  kampusKod: KampusKod,
  kutuId: string
): Promise<AsamaGecmisi[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return MOCK_GECMIS.filter(
      (g) => g.kampus_kod === kampusKod && g.kutu_id === kutuId
    ).sort(
      (a, b) =>
        new Date(a.olusturma_tarihi).getTime() -
        new Date(b.olusturma_tarihi).getTime()
    );
  }

  const { data, error } = await supabase
    .from("asama_gecmisi")
    .select("*")
    .eq("kampus_kod", kampusKod)
    .eq("kutu_id", kutuId)
    .order("olusturma_tarihi", { ascending: true });

  if (error || !data) return [];
  return data as AsamaGecmisi[];
}

export async function kutuAsamaGuncelle(
  kampusKod: KampusKod,
  kutuId: string,
  asama: AsamaKod,
  not?: string,
  adminYetkili = false
): Promise<{ ok: boolean; error?: string }> {
  if (!adminYetkili) {
    return { ok: false, error: "Yetkisiz. Admin girişi gerekli." };
  }

  if (!ASAMALAR.some((a) => a.kod === asama)) {
    return { ok: false, error: "Geçersiz aşama." };
  }

  const simdi = new Date().toISOString();
  const supabase = getSupabase();

  if (!supabase) {
    const kutu = MOCK_KUTULAR.find(
      (k) => k.kampus_kod === kampusKod && k.id === kutuId
    );
    if (!kutu) return { ok: false, error: "Kutu bulunamadı." };
    kutu.asama = asama;
    kutu.guncelleme_tarihi = simdi;
    MOCK_GECMIS.push({
      id: `mock-${Date.now()}`,
      kutu_id: kutuId,
      kampus_kod: kampusKod,
      asama,
      aciklama: not,
      olusturma_tarihi: simdi,
    });
    return { ok: true };
  }

  const { error: kutuError } = await supabase
    .from("kutular")
    .update({ asama, guncelleme_tarihi: simdi })
    .eq("kampus_kod", kampusKod)
    .eq("id", kutuId);

  if (kutuError) return { ok: false, error: "Kutu güncellenemedi." };

  await supabase.from("asama_gecmisi").insert({
    kutu_id: kutuId,
    kampus_kod: kampusKod,
    asama,
    aciklama: not || null,
  });

  return { ok: true };
}

export { formatTarih, getTurAd, getKampusAd } from "./format-tarih";
export { isSupabaseConfigured };
