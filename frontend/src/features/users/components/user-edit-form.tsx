"use client";

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

import { ImageUpload } from "@/features/image-upload/hooks/image-upload";
import type {
  AdminUser,
  ClinicLocation,
  UserRole,
} from "@/features/content/types/content.types";

interface UserEditFormProps {
  user?: AdminUser;
  locations?: ClinicLocation[];
  currentRole: UserRole;
  isOwnProfile: boolean;
  canEdit: boolean;

  image: {
    id: string;
    url: string;
  } | null;

  isUploading: boolean;
  isDeleting: boolean;

  upload: (file: File) => Promise<void>;
  remove: () => Promise<void>;

  saving: boolean;

  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    locationId: string | null;
    password?: string;
    confirmPassword?: string;
  }) => void | Promise<void>;

  onCancel: () => void | Promise<void>;
}

const roleLabels: Record<UserRole, string> = {
  root: "Суперадминистратор",
  admin: "Администратор",
  manager: "Менеджер",
};

export function UserEditForm({
  user,
  locations = [],
  currentRole,
  isOwnProfile,
  canEdit,
  image,
  isUploading,
  isDeleting,
  upload,
  remove,
  saving,
  onSubmit,
  onCancel,
}: UserEditFormProps) {
  const isCreate = !user;

  const [role, setRole] = useState<UserRole>(
    user?.role ?? "manager",
  );

  const [locationId, setLocationId] = useState(
    user?.location?.id ?? user?.locationId ?? "",
  );

  const roleOptions: UserRole[] =
    currentRole === "root"
      ? [
          ...(user?.role === "root" ? ["root" as const] : []),
          "admin",
          "manager",
        ]
      : ["manager"];

  const roleItems = roleOptions.map((value) => ({
    value,
    label: roleLabels[value],
  }));

  const locationItems = locations.map((location) => ({
    value: location.id,
    label: location.name,
  }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving || isUploading || isDeleting) {
      return;
    }

    const form = new FormData(event.currentTarget);

    void onSubmit({
      firstName: String(form.get("firstName") ?? "").trim(),
      lastName: String(form.get("lastName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      role,
      locationId: role === "manager" ? locationId || null : null,
      password: String(form.get("password") ?? ""),
      confirmPassword: String(
        form.get("confirmPassword") ?? "",
      ),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Основная информация
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              Фото профиля
            </h3>

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

          <div className="grid content-start gap-5 sm:grid-cols-2">
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

            {!isOwnProfile && (
              <div className="space-y-2">
                <Label htmlFor="user-role">
                  Роль
                </Label>

                <Select<UserRole>
                  items={roleItems}
                  value={role}
                  onValueChange={(value) => {
                    if (value) {
                      setRole(value);
                    }
                  }}
                  disabled={
                    !canEdit || currentRole !== "root"
                  }
                >
                  <SelectTrigger
                    id="user-role"
                    className="w-full"
                  >
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>
                        Роль пользователя
                      </SelectLabel>

                      {roleItems.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isOwnProfile && role === "manager" && (
              <div className="space-y-2">
                <Label htmlFor="user-location">
                  Филиал
                </Label>

                <Select<string>
                  items={locationItems}
                  value={locationId || null}
                  onValueChange={(value) => {
                    if (value !== null) {
                      setLocationId(value);
                    }
                  }}
                  disabled={!canEdit}
                >
                  <SelectTrigger
                    id="user-location"
                    className="w-full"
                  >
                    <SelectValue placeholder="Выберите филиал" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>
                        Филиал
                      </SelectLabel>

                      {locationItems.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Пароль
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Пароль"
              name="password"
              type="password"
              required={isCreate}
              minLength={6}
              disabled={!canEdit}
            />

            <Field
              label="Повторите пароль"
              name="confirmPassword"
              type="password"
              required={isCreate}
              minLength={6}
              disabled={!canEdit}
            />
          </CardContent>
        </Card>
      )}

      <div className="sticky bottom-0 z-20 -mx-4 flex flex-col-reverse gap-2 bg-background/95 px-4 py-3 sm:mx-0 sm:flex-row sm:justify-end sm:rounded-lg border-t sm:border-none sm:px-4">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => void onCancel()}
          disabled={
            saving ||
            isUploading ||
            isDeleting
          }
        >
          Отмена
        </Button>

        {canEdit && (
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={
              saving ||
              isUploading ||
              isDeleting
            }
          >
            {isUploading
              ? "Загрузка фото…"
              : saving
                ? "Сохранение…"
                : "Сохранить"}
          </Button>
        )}
      </div>
    </form>
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
      <Label
        htmlFor={`user-${name}`}
        required={required}
      >
        {label}
      </Label>

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

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="break-all text-sm sm:text-right">
        {value}
      </span>
    </div>
  );
}

function displayDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("ru-RU");
}