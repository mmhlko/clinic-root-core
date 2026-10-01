"use client";

import { useState, type FormEvent } from "react";
import { SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/features/image-upload/hooks/image-upload";
import { useImageUpload } from "@/features/image-upload/hooks/use-image-upload";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { contentClientApi } from "@/features/content/api/content-client-api";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { ContentField } from "@/widgets/admin-content/content-field";
import { toast } from "@/components/ui/toast";

export function ProfileSettings() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const {
    image,
    isUploading,
    isDeleting,
    error: imageError,
    upload,
    remove,
    cleanup,
    commit,
  } = useImageUpload({
    initialImage: user?.avatarUrl
      ? { id: `profile-${user.id}`, url: user.avatarUrl }
      : null,
  });

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || isUploading) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const password = String(form.get("password") || "");
    setSaving(true);

    try {
      const updated = await contentClientApi.updateMyProfile({
        firstName: String(form.get("firstName")).trim(),
        lastName: String(form.get("lastName")).trim(),
        email: String(form.get("email")).trim(),
        avatarUrl: image?.url ?? null,
        ...(password ? { password } : {}),
      });
      updateUser({
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
      });
      commit();
      toast.add({
        type: "success",
        description: "Профиль успешно сохранён.",
      });
      const passwordInput = formElement.elements.namedItem("password");
      if (passwordInput instanceof HTMLInputElement) passwordInput.value = "";
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось сохранить профиль."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    await cleanup();
    router.push("/admin");
  }

  if (!user) {
    return <p className="text-sm text-muted-foreground">Загрузка профиля…</p>;
  }

  const formKey = [
    user.id,
    user.firstName,
    user.lastName,
    user.email,
    user.avatarUrl,
  ].join(":");

  return (
    <form key={formKey} onSubmit={(event) => void save(event)} className="mx-auto w-full max-w-3xl space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Профиль</h2>
        <p className="mt-1 text-sm text-muted-foreground">Личные данные и фото пользователя</p>
      </header>
      
      <section className="grid gap-6 rounded-lg border bg-card p-4 sm:grid-cols-[180px_1fr] sm:p-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Фото профиля</h3>
          <ImageUpload
            image={image}
            alt="Фото профиля"
            onUpload={upload}
            onRemove={remove}
            isUploading={isUploading}
            isDeleting={isDeleting}
            aspectRatio="1/1"
            className="max-w-44"
            error={imageError}
          />
        </div>
        <div className="grid content-start gap-4 sm:grid-cols-2">
          <ContentField label="Имя" name="firstName" required defaultValue={user.firstName} />
          <ContentField label="Фамилия" name="lastName" required defaultValue={user.lastName} />
          <div className="sm:col-span-2">
            <ContentField label="Email" name="email" type="email" required defaultValue={user.email} />
          </div>
          <div className="sm:col-span-2">
            <ContentField label="Новый пароль (необязательно)" name="password" type="password" minLength={6} />
          </div>
          <p className="text-sm text-muted-foreground sm:col-span-2">Роль: {user.role}</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving || isUploading || isDeleting}>
          <SaveIcon data-icon="inline-start" />
          {saving ? "Сохранение…" : "Сохранить профиль"}
        </Button>
        <Button type="button" variant="outline" onClick={() => void cancel()} disabled={saving}>
          Отмена
        </Button>
      </div>
    </form>
  );
}