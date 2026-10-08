"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type {
  AdminUser,
  ClinicLocation,
  UserRole,
} from "@/features/content/types/content.types";
import { useImageUpload } from "@/features/image-upload/hooks/use-image-upload";
import { UserEditForm } from "@/features/users/components/user-edit-form";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";

interface UserEditPageProps {
  user?: AdminUser;
  locations?: ClinicLocation[];
  currentRole: UserRole;
  canEdit: boolean;
  isOwnProfile: boolean;
}

export function UserEditPage({
  user,
  locations = [],
  currentRole,
  canEdit,
  isOwnProfile,
}: UserEditPageProps) {
  const router = useRouter();
  const { updateUser } = useAuth();
  const isCreate = !user;

  const [saving, setSaving] = useState(false);
  const {
    image,
    isUploading,
    isDeleting,
    upload,
    remove,
    cleanup,
    commit,
  } = useImageUpload({
    initialImage: user?.photoMedia
  });

  async function handleSave(data: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    locationId: string | null;
    password?: string;
    confirmPassword?: string;
  }) {
    if (!canEdit || saving || isUploading || isDeleting) return;

    const password = data.password ?? "";
    if (password && password !== (data.confirmPassword ?? "")) {
      toast.add({ type: "error", description: "Пароли не совпадают." });
      return;
    }

    // if (isCreate && data.role === "manager" && !data.locationId) {
    //   toast.add({
    //     type: "error",
    //     description: "Выберите филиал для менеджера.",
    //   });
    //   return;
    // }
 
    setSaving(true);
    try {
      if (isCreate) {
        await contentClientApi.createUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          locationId: data.role === "manager" ? data.locationId : null,
          photoMediaId: image?.id,
          password,
        });
        commit();
        toast.add({ type: "success", description: "Пользователь добавлен." });
        router.push("/admin/users");
      } else if (user && isOwnProfile) {
        const updated = await contentClientApi.updateMyProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          photoMediaId: image?.id ?? null,
          ...(password ? { password } : {}),
        });

        updateUser({
          id: updated.id,
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          role: updated.role,
          photoMedia: updated.photoMedia,
        });
        commit();
        toast.add({
          type: "success",
          description: "Профиль успешно сохранён.",
        });
        router.push(`/admin/users/${user.id}`);
      } else if (user) {
        await contentClientApi.updateUser(user.id, {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          ...(currentRole === "root" ? { role: data.role } : {}),
          locationId: data.role === "manager" ? data.locationId : null,
          photoMediaId: image?.id ?? null,
        });
        commit();
        toast.add({
          type: "success",
          description: "Пользователь обновлён.",
        });
        router.push(`/admin/users/${user.id}`);
      }

      router.refresh();
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(
          cause,
          isCreate
            ? "Не удалось создать пользователя."
            : isOwnProfile
              ? "Не удалось сохранить профиль."
              : "Не удалось сохранить пользователя.",
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    await cleanup();
    if (isCreate) {
      router.push("/admin/users");
    } else if (user) {
      router.push(`/admin/users/${user.id}`);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isCreate
            ? "Создание пользователя"
            : isOwnProfile
              ? "Редактирование профиля"
              : "Редактирование пользователя"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isOwnProfile
            ? "Личные данные и фото пользователя"
            : "Укажите данные учётной записи и права доступа"}
        </p>
      </header>

      <UserEditForm
        user={user}
        locations={locations}
        currentRole={currentRole}
        isOwnProfile={isOwnProfile}
        canEdit={canEdit}
        image={image}
        isUploading={isUploading}
        isDeleting={isDeleting}
        upload={upload}
        remove={remove}
        saving={saving}
        onSubmit={handleSave}
        onCancel={cancel}
      />
    </div>
  );
}
