import { isAxiosError } from "axios";
import { notFound } from "next/navigation";

import { requireRole } from "@/features/auth/api/require-role";
import { contentServerApi } from "@/features/content/api/content-server-api";
import type { UserRole } from "@/features/content/types/content.types";
import { UserAccountPage } from "@/widgets/users/user-account-page";

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([
    params,
    requireRole(["root", "admin"] as UserRole[]),
  ]);

  let user;
  let locations;
  try {
    [user, locations] = await Promise.all([
      contentServerApi.user(id, session.accessToken),
      contentServerApi.locations(session.accessToken),
    ]);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      notFound();
    }
    throw error;
  }

  const canEdit =
    session.user.role === "root" ||
    user.id === session.user.id ||
    (session.user.role === "admin" && user.role === "manager");

  return (
    <UserAccountPage
      mode="view"
      user={user}
      locations={locations}
      currentRole={session.user.role}
      canEdit={canEdit}
    />
  );
}
