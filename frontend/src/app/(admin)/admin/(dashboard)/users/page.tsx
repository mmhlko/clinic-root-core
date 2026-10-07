import { requireRole } from "@/features/auth/api/require-role";
import { PageHeader } from "@/components/shared/page-header";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { UserList } from "@/widgets/users/user-list";
import type { UserRole } from "@/features/content/types/content.types";

export default async function UsersPage() {
  const session = await requireRole(["root", "admin"] as UserRole[]);
  const users = await contentServerApi.users(session.accessToken);
  return (
    <div className="mx-auto w-full">
      <PageHeader
        title="Пользователи"
        description="Управление администраторами и менеджерами"
      />
      <UserList
        users={users}
        currentRole={session.user.role}
        currentUserId={session.user.id}
      />
    </div>
  );
}
