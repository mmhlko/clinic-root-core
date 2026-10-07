import "server-only";

import { redirect } from "next/navigation";
import { getUserSession } from "./user-session";
import { UserRole } from "../types/auth.types";

export async function requireRole(roles: UserRole[]) {
  const session = await getUserSession();

  if (!session) {
    redirect("/admin/login");
  }

  if (!roles.includes(session.user.role)) {
    redirect("/admin");
  }

  return session;
}
