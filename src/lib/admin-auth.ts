export const ADMIN_COOKIE = "atik_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

async function sessionToken(): Promise<string> {
  const secret = process.env.ADMIN_SIFRE;
  if (!secret) return "";
  const data = new TextEncoder().encode(`atik-admin:${secret}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_SIFRE?.length);
}

export async function verifyAdminCookie(value: string | undefined): Promise<boolean> {
  if (!value || !isAdminConfigured()) return false;
  return value === (await sessionToken());
}

export async function getAdminCookieValue(): Promise<string> {
  return sessionToken();
}
