import "server-only";

import { redirect } from "next/navigation";
import { getUserSession } from "./user-session";
import { UserRole } from "../types/auth.types";

export async function requireRole(roles: UserRole[], clinicSlug?: string) {
  const session = await getUserSession();
  const clinicAdminBase = clinicSlug
    ? `/${encodeURIComponent(clinicSlug)}/admin`
    : "/admin";

  if (!session) {
    redirect(clinicSlug ? `${clinicAdminBase}/login` : "/admin/login");
  }

  if (!roles.includes(session.user.role)) {
    redirect(clinicAdminBase);
  }

  return session;
}
