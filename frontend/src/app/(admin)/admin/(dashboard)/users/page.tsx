import { requireRole } from "@/features/auth/api/require-role";
import { PageHeader } from "@/components/shared/page-header";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { ContentManager } from "@/widgets/admin-content/content-manager";
import type { UserRole } from "@/features/content/types/content.types";

export default async function UsersPage() {
  const session = await requireRole(["root", "admin"] as UserRole[]);
  const [users, locations] = await Promise.all([
    contentServerApi.users(session.accessToken),
    contentServerApi.locations(session.accessToken),
  ]);
  return (
    <div className="mx-auto w-full">
      <PageHeader
        title="Пользователи"
        description="Управление администраторами и менеджерами"
      />
      <ContentManager
        kind="users"
        initialData={users}
        references={{ locations }}
        currentRole={session.user.role}
      />
    </div>
  );
}
