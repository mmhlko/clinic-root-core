"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { ImageUpload } from "@/features/image-upload/hooks/image-upload";
import { useImageUpload } from "@/features/image-upload/hooks/use-image-upload";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type {
  AdminUser,
  ClinicLocation,
  UserRole,
} from "@/features/content/types/content.types";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";

type UserAccountMode = "view" | "create" | "edit";

interface UserAccountPageProps {
  mode: UserAccountMode;
  user?: AdminUser;
  locations: ClinicLocation[];
  currentRole: UserRole;
  canEdit: boolean;
  isOwnProfile?: boolean;
}

const roleLabels: Record<UserRole, string> = {
  root: "Суперадминистратор",
  admin: "Администратор",
  manager: "Менеджер",
};

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("ru-RU");
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="break-all text-sm sm:text-right">{value}</span>
    </div>
  );
}

export function UserAccountPage({
  mode,
  user,
  locations,
  currentRole,
  canEdit,
  isOwnProfile = false,
}: UserAccountPageProps) {
  const router = useRouter();
  const { updateUser } = useAuth();
  const isView = mode === "view";
  const isCreate = mode === "create";
  const [role, setRole] = useState<UserRole>(user?.role ?? "manager");
  const [locationId, setLocationId] = useState(user?.locationId ?? "");
  const [saving, setSaving] = useState(false);
  const { image, isUploading, isDeleting, upload, remove, cleanup, commit } =
    useImageUpload({
      initialImage: user?.avatarUrl
        ? { id: `user-${user.id}`, url: user.avatarUrl }
        : null,
    });
  const [resetOpen, setResetOpen] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const canResetPassword =
    !isCreate &&
    !isOwnProfile &&
    user?.role === "manager" &&
    (currentRole === "admin" || currentRole === "root");
  const canChangeRole = currentRole === "root";
  const locationName =
    locations.find((location) => location.id === user?.locationId)?.name ??
    "Не указан";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || isUploading || isDeleting) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const password = String(form.get("password") ?? "");
    if ((isCreate || isOwnProfile) && password && password !== String(form.get("confirmPassword") ?? "")) {
      toast.add({
        type: "error",
        description: "Пароли не совпадают.",
      });
      return;
    }

    if (!isOwnProfile && role === "manager" && !locationId) {
      toast.add({
        type: "error",
        description: "Выберите филиал для менеджера.",
      });
      return;
    }

    const body: Record<string, unknown> = {
      firstName: String(form.get("firstName") ?? "").trim(),
      lastName: String(form.get("lastName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      locationId: role === "manager" ? locationId : null,
      avatarUrl: image?.url ?? null,
    };
    if (canChangeRole || isCreate) body.role = role;
    if (isCreate) body.password = password;

    setSaving(true);
    try {
      if (isCreate) {
        await contentClientApi.createUser(body);
      } else if (user && isOwnProfile) {
        const updated = await contentClientApi.updateMyProfile({
          firstName: String(form.get("firstName") ?? "").trim(),
          lastName: String(form.get("lastName") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
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
      } else if (user) {
        await contentClientApi.updateUser(user.id, body);
      }

      commit();
      toast.add({
        type: "success",
        description: isCreate
          ? "Пользователь добавлен."
          : isOwnProfile
            ? "Профиль успешно сохранён."
            : "Пользователь обновлён.",
      });
      if (isOwnProfile) {
        const passwordInput = formElement.elements.namedItem("password");
        if (passwordInput instanceof HTMLInputElement) passwordInput.value = "";
        const confirmInput = formElement.elements.namedItem("confirmPassword");
        if (confirmInput instanceof HTMLInputElement) confirmInput.value = "";
      } else {
        router.push("/admin/users");
      }
      router.refresh();
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(
          cause,
          isOwnProfile ? "Не удалось сохранить профиль." : "Не удалось сохранить пользователя.",
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    await cleanup();
    router.push(isOwnProfile ? "/admin" : "/admin/users");
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || resettingPassword) return;

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const password = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmNewPassword") ?? "");
    if (password !== confirmPassword) {
      toast.add({
        type: "error",
        description: "Пароли не совпадают.",
      });
      return;
    }

    setResettingPassword(true);
    try {
      await contentClientApi.updateUser(user.id, { password });
      toast.add({
        type: "success",
        description: "Пароль менеджера сброшен.",
      });
      formElement.reset();
      setResetOpen(false);
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

  if (isView && user) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Пользователь
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Информация об учётной записи
            </p>
          </div>
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/users/${user.id}/edit`)}
            >
              Редактировать
            </Button>
          )}
        </header>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Профиль пользователя</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Фото профиля</h3>
              <ImageUpload
                image={image}
                alt={`Фото ${user.firstName} ${user.lastName}`}
                onUpload={upload}
                onRemove={remove}
                isUploading={isUploading}
                isDeleting={isDeleting}
                disabled
              />
            </div>
            <div className="grid content-start gap-4 sm:grid-cols-2">
              <Detail label="Имя" value={user.firstName} />
              <Detail label="Фамилия" value={user.lastName} />
              <div className="sm:col-span-2">
                <Detail label="Email" value={user.email} />
              </div>
              <Detail label="Роль" value={roleLabels[user.role]} />
              <Detail
                label="Статус"
                value={user.isActive ? "Активен" : "Неактивен"}
              />
              <div className="sm:col-span-2">
                <Detail label="Филиал" value={locationName} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">
              Информация об учётной записи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Detail label="ID" value={user.id} />
            <Detail label="Создан" value={displayDate(user.createdAt)} />
            <Detail
              label="Последнее обновление"
              value={displayDate(user.updatedAt)}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleOptions: UserRole[] =
    currentRole === "root"
      ? [
          ...(user?.role === "root" ? ["root" as const] : []),
          "admin",
          "manager",
        ]
      : ["manager"];
  const roleItems = roleOptions.map((option) => ({
    value: option,
    label: roleLabels[option],
  }));
  const locationItems = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight">
          {isCreate ? "Создание пользователя" : isOwnProfile ? "Редактирование профиля" : "Редактирование пользователя"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isOwnProfile ? "Личные данные и фото пользователя" : "Укажите данные учётной записи и права доступа"}
        </p>
      </header>

      <form onSubmit={(event) => void save(event)} className="space-y-5">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Фото профиля</h3>
              <ImageUpload
                image={image}
                alt="Фото пользователя"
                onUpload={upload}
                onRemove={remove}
                isUploading={isUploading}
                isDeleting={isDeleting}
                disabled={!canEdit || saving}
              />
            </div>
            <div className="grid content-start gap-4 sm:grid-cols-2">
              <Field
                label="Имя"
                name="firstName"
                defaultValue={user?.firstName ?? ""}
                required
                disabled={!canEdit}
              />
              <Field
                label="Фамилия"
                name="lastName"
                defaultValue={user?.lastName ?? ""}
                required
                disabled={!canEdit}
              />
              <div className="sm:col-span-2">
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={user?.email ?? ""}
                  required
                  disabled={!canEdit}
                />
              </div>
              {(isCreate || (canChangeRole && canEdit && !isOwnProfile)) && (
                <div className="space-y-2">
                  <Label htmlFor="user-role" required>Роль</Label>
                  <Select<UserRole>
                    items={roleItems}
                    value={role}
                    onValueChange={(value) => {
                      if (value) setRole(value);
                    }}
                    disabled={!canEdit}
                  >
                    <SelectTrigger id="user-role" className="w-full">
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Роль пользователя</SelectLabel>
                        {roleItems.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!(isCreate || (canChangeRole && canEdit && !isOwnProfile)) && user && (
                <div className="space-y-2">
                  <Label>Роль</Label>
                  <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    {roleLabels[user.role]}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="user-location">Филиал для менеджера</Label>
                {isOwnProfile ? (
                  <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    {locationName}
                  </p>
                ) : (
                  <Select<string>
                    items={locationItems}
                    value={locationId || null}
                    onValueChange={(value) => {
                      if (value !== null) setLocationId(value);
                    }}
                    disabled={!canEdit}
                  >
                    <SelectTrigger id="user-location" className="w-full">
                      <SelectValue placeholder="Выберите филиал" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Филиал</SelectLabel>
                        {locationItems.map((location) => (
                          <SelectItem
                            key={location.value}
                            value={location.value}
                          >
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>
              {(isCreate || isOwnProfile) && (
                <>
                  <Field
                    label={isOwnProfile ? "Новый пароль" : "Пароль"}
                    name="password"
                    type="password"
                    required={!isOwnProfile}
                    minLength={6}
                  />
                  <Field
                    label="Повторите пароль"
                    name="confirmPassword"
                    type="password"
                    required={!isOwnProfile}
                    minLength={6}
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {user && (
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">
                Информация об учётной записи
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Detail label="ID" value={user.id} />
              {!isOwnProfile && (
                <>
                  <Detail
                    label="Статус"
                    value={user.isActive ? "Активен" : "Неактивен"}
                  />
                  <Detail label="Создан" value={displayDate(user.createdAt)} />
                  <Detail
                    label="Последнее обновление"
                    value={displayDate(user.updatedAt)}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div className="sticky bottom-0 z-20 -mx-4 flex flex-col-reverse gap-2 border-t bg-background/95 px-4 py-3 shadow-[0_-8px_24px_-18px_rgba(0,0,0,0.35)] backdrop-blur sm:mx-0 sm:flex-row sm:justify-end sm:rounded-lg sm:border sm:px-4">
          {canEdit && (
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={saving || isUploading || isDeleting}
            >
              {isUploading
                ? "Загрузка фото…"
                : saving
                  ? "Сохранение…"
                  : "Сохранить"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => void cancel()}
            disabled={saving || isUploading || isDeleting}
          >
            Отмена
          </Button>
        </div>
      </form>

      {canResetPassword && canEdit && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Пароль менеджера</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!resetOpen ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetOpen(true)}
              >
                Сбросить пароль
              </Button>
            ) : (
              <form
                onSubmit={(event) => void resetPassword(event)}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Задайте новый пароль для менеджера и подтвердите его.
                </p>
                <Field
                  label="Новый пароль"
                  name="newPassword"
                  type="password"
                  required
                  minLength={6}
                />
                <Field
                  label="Повторите новый пароль"
                  name="confirmNewPassword"
                  type="password"
                  required
                  minLength={6}
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={resettingPassword}>
                    {resettingPassword ? "Сохранение…" : "Сохранить пароль"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setResetOpen(false)}
                    disabled={resettingPassword}
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue = "",
  required = false,
  minLength,
  disabled = false,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`user-${name}`} required={required}>{label}</Label>
      <Input
        id={`user-${name}`}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        minLength={minLength}
        disabled={disabled}
      />
    </div>
  );
}
