import { isAxiosError } from "axios";
import { notFound, redirect } from "next/navigation";

import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { contentServerApi } from "@/features/content/api/content-server-api";
import type {
  AdminUser,
  ClinicLocation,
  UserRole,
} from "@/features/content/types/content.types";
import { UserAccountPage } from "@/widgets/users/user-account-page";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, session] = await Promise.all([params, requireUserSession()]);
  const isOwnProfile = id === session.user.id;
  const canManageUsers = session.user.role === "root" || session.user.role === "admin";

  // Any signed-in user may edit their own account. Editing other accounts remains
  // restricted to administrators, so all edit flows use this one canonical route.
  if (!isOwnProfile && !canManageUsers) {
    redirect(`/admin/users/${session.user.id}/edit`);
  }

  let user: AdminUser;
  let locations: ClinicLocation[] = [];

  if (isOwnProfile) {
    user = {
      id: session.user.id,
      firstName: session.user.firstName ?? "",
      lastName: session.user.lastName ?? "",
      email: session.user.email,
      role: session.user.role as UserRole,
      avatarUrl: session.user.avatarUrl,
      locationId: null,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    };
  } else {
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
  }

  const canEdit =
    isOwnProfile ||
    session.user.role === "root" ||
    (session.user.role === "admin" && user.role === "manager");

  return (
    <UserAccountPage
      mode="edit"
      user={user}
      locations={locations}
      currentRole={session.user.role as UserRole}
      canEdit={canEdit}
      isOwnProfile={isOwnProfile}
    />
  );
}
