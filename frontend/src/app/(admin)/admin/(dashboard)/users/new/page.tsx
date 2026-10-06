import { requireRole } from "@/features/auth/api/require-role";
import { contentServerApi } from "@/features/content/api/content-server-api";
import type { UserRole } from "@/features/content/types/content.types";
import { UserAccountPage } from "@/widgets/users/user-account-page";

export default async function NewUserPage() {
  const session = await requireRole(["root", "admin"] as UserRole[]);
  const locations = await contentServerApi.locations(session.accessToken);

  return (
    <UserAccountPage
      mode="create"
      locations={locations}
      currentRole={session.user.role}
      canEdit
    />
  );
}
