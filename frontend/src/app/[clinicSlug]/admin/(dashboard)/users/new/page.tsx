import { requireRole } from "@/features/auth/api/require-role";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { UserEditPage } from "@/widgets/users/user-edit-page";
import type { UserRole } from "@/features/content/types/content.types";

export default async function NewUserPage() {
  const session = await requireRole(["root", "admin"] as UserRole[]);
  const locations = await contentServerApi.locations(session.accessToken);

  return (
    <UserEditPage
      locations={locations}
      currentRole={session.user.role}
      canEdit
      isOwnProfile={false}
    />
  );
}
