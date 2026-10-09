"use client";

import { useState } from "react";

import { useAuth } from "@/features/auth/providers/auth-provider";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type { AdminUser } from "@/features/content/types/content.types";
import { toast } from "@/components/ui/toast";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";

import { UserPasswordReset } from "./user-password-reset";
import { UserProfileCard } from "./user-profile-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UserAccountPageProps {
  user: AdminUser;
  isOwnProfile: boolean;
  canEdit: boolean;
}

export function UserAccountPage({
  user,
  isOwnProfile,
  canEdit,
}: UserAccountPageProps) {
  const { updateUser } = useAuth();
  const [resettingPassword, setResettingPassword] = useState(false);

  async function resetPassword(password: string) {
    if (resettingPassword) return;

    setResettingPassword(true);
    try {
      if (isOwnProfile) {
        const updated = await contentClientApi.updateMyProfile({
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          email: user.email,
          photoMediaId: user.photoMedia?.id,
          password,
        });

        updateUser({
          id: updated.id,
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          role: updated.role,
          photoMedia: updated.photoMedia,
        });
      } else {
        await contentClientApi.updateUser(user.id, { password });
      }

      toast.add({
        type: "success",
        description: "Пароль успешно сброшен.",
      });
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(
          cause,
          "Не удалось сбросить пароль.",
        ),
      });
    } finally {
      setResettingPassword(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      {canEdit && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/admin/users/${user.id}/edit`} />}
          >
            Редактировать
          </Button>
        </div>
      )}
      <UserProfileCard user={user} isOwnProfile={isOwnProfile} />
      {canEdit && (
        <UserPasswordReset
          resetting={resettingPassword}
          onReset={resetPassword}
        />
      )}
    </div>
  );
}
