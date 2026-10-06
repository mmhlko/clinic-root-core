import { redirect } from "next/navigation";

import { requireUserSession } from "@/features/auth/api/require-admin-session";

export default async function ProfilePage() {
  const session = await requireUserSession();
  redirect(`/admin/users/${session.user.id}/edit`);
}
