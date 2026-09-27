  import { AdminShell } from '@/components/admin/admin-shell';
import { AuthProvider } from '@/features/auth/providers/auth-provider';
import { requireUserSession } from '@/features/auth/api/require-admin-session';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUserSession();

  return (
    <AuthProvider initialUser={session.user}>
      <AdminShell user={session.user}>{children}</AdminShell>
    </AuthProvider>
  );
}