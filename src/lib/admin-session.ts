import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminCookie } from "./admin-auth";

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminCookie(store.get(ADMIN_COOKIE)?.value);
}
