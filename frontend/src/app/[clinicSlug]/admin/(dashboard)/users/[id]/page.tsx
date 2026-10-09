import { isAxiosError } from "axios";
import { notFound, redirect } from "next/navigation";

import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { UserAccountPage } from "@/widgets/users/user-account-page";
import type { AdminUser } from "@/features/content/types/content.types";

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([params, requireUserSession()]);

  const isOwnProfile = id === session.user.id;
  const canManageUsers =
    session.user.role === "root" || session.user.role === "admin";

  if (!canManageUsers && !isOwnProfile) {
    redirect("/admin");
  }

  let user: AdminUser;
  try {
    user = isOwnProfile
      ? await contentServerApi.currentUser(session.accessToken)
      : await contentServerApi.user(id, session.accessToken);
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
    <UserAccountPage user={user} isOwnProfile={isOwnProfile} canEdit={canEdit} />
  );
}
