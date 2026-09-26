import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AdminShell } from '@/components/admin/admin-shell';
import { AuthProvider } from '@/features/auth/providers/auth-provider';
import { getAdminSession } from '@/features/auth/api/auth-server-api';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const refreshToken = (await cookies()).get('refreshToken')?.value;

  if (!refreshToken) {
    redirect('/admin/login');
  }

  let user;

  try {
    user = await getAdminSession(refreshToken);
  } catch {
    redirect('/admin/login');
  }

  return (
    <AuthProvider initialUser={user}>
      <AdminShell user={user}>{children}</AdminShell>
    </AuthProvider>
  );
}