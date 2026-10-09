import { redirect } from "next/navigation";

import { requireUserSession } from "@/features/auth/api/require-admin-session";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const [{ clinicSlug }, session] = await Promise.all([
    params,
    requireUserSession(),
  ]);
  redirect(`/${encodeURIComponent(clinicSlug)}/admin/users/${session.user.id}/edit`);
}
