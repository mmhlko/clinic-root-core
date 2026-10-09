import "server-only";

import { redirect } from "next/navigation";

import { getUserSession } from "./user-session";

export async function requireUserSession(loginPath = "/admin/login") {
  const session = await getUserSession();

  if (!session) {
    redirect(loginPath);
  }

  return session;
}
