import "server-only";

import { redirect } from "next/navigation";

import { getUserSession } from "./user-session";

export async function requireUserSession() {
  const session = await getUserSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}