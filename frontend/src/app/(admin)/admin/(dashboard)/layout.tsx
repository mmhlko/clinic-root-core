'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { AdminShell } from '@/components/admin/admin-shell';
import { useAuth } from '@/features/auth/providers/auth-provider';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div>
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}