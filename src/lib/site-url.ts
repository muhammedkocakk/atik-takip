/** QR kodların içine gömülecek tam site adresi */
export function getSiteBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function getKutuTakipUrl(kampusKod: string, kutuId: string): string {
  return `${getSiteBaseUrl()}/k/${kampusKod}/${kutuId}`;
}
