import { isAxiosError } from "axios";
import { notFound, redirect } from "next/navigation";

import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { contentServerApi } from "@/features/content/api/content-server-api";
import type { AdminUser } from "@/features/content/types/content.types";
import { UserEditPage } from "@/widgets/users/user-edit-page";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ clinicSlug: string; id: string }>;
}) {
  const { clinicSlug, id } = await params;
  const session = await requireUserSession(
    `/${encodeURIComponent(clinicSlug)}/admin/login`,
  );

  const isOwnProfile =
    id === session.user.id;

  const canManageUsers =
    session.user.role === "root" ||
    session.user.role === "admin";

  if (!isOwnProfile && !canManageUsers) {
    redirect(`/${encodeURIComponent(clinicSlug)}/admin/users/${session.user.id}/edit`);
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
    isOwnProfile ||
    session.user.role === "root" ||
    (session.user.role === "admin" &&
      user.role === "manager");
  const locations =
    canEdit && !isOwnProfile && user.role === "manager"
      ? await contentServerApi.locations(session.accessToken)
      : [];

  return (
    <UserEditPage
      user={user}
      locations={locations}
      currentRole={session.user.role}
      canEdit={canEdit}
      isOwnProfile={isOwnProfile}
    />
  );
}
