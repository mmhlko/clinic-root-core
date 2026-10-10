import { requireRole } from "@/features/auth/api/require-role";
import { PageHeader } from "@/components/shared/page-header";
import { contentServerApi } from "@/features/content/api/content-server-api";
import { UserList } from "@/widgets/users/user-list";
import type { UserRole } from "@/features/content/types/content.types";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const session = await requireRole(["root", "admin"] as UserRole[], clinicSlug);
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
