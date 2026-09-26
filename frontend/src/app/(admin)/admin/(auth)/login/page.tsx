"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { authApi } from "@/features/auth/api/auth-api";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { LoginForm } from "@/features/auth/components/login-form";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
            УД
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Администрация</h1>
          <p className="mt-2 text-sm text-slate-500">Войдите в систему управления клиникой</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
