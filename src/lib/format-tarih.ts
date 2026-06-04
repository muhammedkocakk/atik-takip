import { ATIK_TURLERI, KAMPUSLER, type KampusKod } from "./constants";

export function formatTarih(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function getTurAd(kod: string): string {
  return ATIK_TURLERI[kod as keyof typeof ATIK_TURLERI]?.ad ?? kod;
}

export function getKampusAd(kod: string): string {
  return KAMPUSLER[kod as KampusKod]?.ad ?? kod;
}
