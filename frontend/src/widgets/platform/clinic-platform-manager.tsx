"use client";

import { useState, type FormEvent } from "react";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type {
  Clinic,
  ClinicStatus,
  CreatedTenantClinic,
} from "@/features/content/types/content.types";
import { Button } from "@/components/ui/button";
import { ContentList } from "../admin-content/content-list";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { EStatusVariant } from "@/shared/types/admin";
import { statusColorsStyles } from "@/shared/constants/colors";
import { Badge } from "@/components/ui/badge";
import {
  ContentActionsMenu,
  ContentMenuAction,
} from "../admin-content/content-actions-menu";
import { SortableCard } from "@/components/shared/sortable-list/sortable-card";
import { PencilIcon, SaveIcon, XIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ContentField } from "@/widgets/admin-content/content-field";
import { ContentSheet } from "@/widgets/admin-content/content-sheet";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertBlock } from "@/components/shared/alert-block";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileJson2Icon } from "lucide-react";
import { ClinicImportPanel } from "./clinic-import-panel";

const statusLabels: Record<ClinicStatus, string> = {
  demo: "Демо",
  active: "Активна",
  archived: "Архив",
};

type ClinicPlatformManagerProps = {
  initialItems: Clinic[];
};

type SheetMode = "view" | "create" | "edit" | "import";

export function ClinicPlatformManager({
  initialItems,
}: ClinicPlatformManagerProps) {
  const [clinics, setClinics] = useState<Clinic[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedTenantClinic | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Clinic | null>(null);
  const [mode, setMode] = useState<SheetMode>("view");

  function openSheet(nextMode: SheetMode, item: Clinic | null = null) {
    setSelected(item);
    setMode(nextMode);
    setOpen(true);
  }

  async function createClinic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    setSaving(true);
    setError(null);
    setCreated(null);
    try {
      const result = await contentClientApi.createPlatformClinic({
        clinic: {
          name: value("clinicName"),
          slug: value("slug").toLowerCase(),
        },
        admin: {
          firstName: value("firstName"),
          lastName: value("lastName"),
          email: value("email").toLowerCase(),
          password: String(form.get("password") ?? ""),
        },
      });
      setCreated(result);
      setClinics((current) => [result.clinic, ...current]);
      setOpen(false);
      formElement.reset();
    } catch (cause) {
      setError(
        typeof cause === "object" && cause && "response" in cause
          ? "Не удалось создать клинику. Проверьте уникальность slug и email администратора."
          : "Не удалось создать клинику.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateClinic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selected) return;

    const form = new FormData(event.currentTarget);

    const slug = String(form.get("slug") ?? "")
      .trim()
      .toLowerCase();
    const status = String(form.get("status") ?? "") as ClinicStatus;

    setSaving(true);

    try {
      const updated = await contentClientApi.updatePlatformClinic(selected.id, {
        slug,
        status,
      });

      setClinics((current) =>
        current.map((clinic) => (clinic.id === updated.id ? updated : clinic)),
      );

      setSelected(updated);
      setOpen(false);

      toast.add({
        type: "success",
        description: "Клиника обновлена.",
      });
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(
          cause,
          "Не удалось сохранить клинику.",
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  const siteUrl = created
    ? `${window.location.origin}/${created.clinic.slug}`
    : "";

  const adminUrl = created ? `${siteUrl}/admin` : "";

  const accessText = created
    ? [
        `Клиника: ${created.clinic.name}`,
        `Публичный сайт: ${siteUrl}`,
        `Админ-панель: ${adminUrl}`,
        `Логин: ${created.admin.email}`,
        `Пароль: ${created.admin.initialPassword}`,
      ].join("\n")
    : "";

  // function identity(user: AdminUser) {
  //   const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;
  //   return (
  //     <PersonIdentity
  //       name={getPersonName(user.firstName, user.lastName)}
  //       subtitle={user.role}
  //       avatarUrl={getImageUrl(user.photoMedia?.url)}
  //       initials={initials || user.email[0]?.toUpperCase() || "П"}
  //     />
  //   );
  // }

  function getClinicStatusColor(status: Clinic["status"]) {
    switch (status) {
      case "active":
        return statusColorsStyles[EStatusVariant.COMPLETED];
      case "demo":
        return statusColorsStyles[EStatusVariant.IN_PROGRESS];
      case "archived":
        return statusColorsStyles[EStatusVariant.CANCELLED];
    }
  }

  function getActions(): ContentMenuAction<Clinic>[] {
    return [
      { label: "Просмотреть", onSelect: (value) => openSheet("view", value) },
      { label: "Редактировать", onSelect: (value) => openSheet("edit", value) },
      {
        label: "Удалить",
        destructive: true,
        onSelect: () => {
          console.log("Удалить");
        },
        confirm: {
          title: "Удалить акцию?",
          description: "Акция будет удалена без возможности восстановления.",
        },
      },
    ];
  }

  function actionMenu(item: Clinic) {
    return (
      <ContentActionsMenu
        item={item}
        itemLabel={item.name}
        actions={getActions()}
      />
    );
  }

  return (
    <div className="space-y-5">
      {error && <AlertBlock title="Ошибка" description={error} variant="destructive" />}

      {created && (
        <section
          className="rounded-xl border border-primary/40 bg-primary/5 p-5"
          aria-live="polite"
        >
          <h2 className="font-semibold">
            Клиника создана. Данные для передачи клиенту
          </h2>
          <p className="mt-2">
            {created.clinic.name}:{" "}
            <a className="underline" href={`/${created.clinic.slug}/admin`}>
              открыть админку
            </a>
          </p>
          <p className="mt-1">
            Логин: <strong>{created.admin.email}</strong>
          </p>
          <p className="mt-1">
            Пароль: <strong>{created.admin.initialPassword}</strong>
          </p>
          <Button
            className="mt-3"
            type="button"
            variant="outline"
            onClick={() => void navigator.clipboard.writeText(accessText)}
          >
            Скопировать доступ
          </Button>
        </section>
      )}

      <ContentList
        title="Существующие клиники"
        items={clinics}
        // filter
        disableReorder={true}
        setItems={setClinics}
        getId={(item) => item.id}
        getSearchText={(item) => `${item.name} ${item.slug ?? ""}`}
        onAdd={() => openSheet("create")}
        onItemClick={(item) => openSheet("view", item)}
        columnCount={4}
        emptyMessage="Список клиник пуст"
        renderHeader={() => (
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="w-12 text-right" />
          </TableRow>
        )}
        renderCells={(clinic) => (
          <>
            <TableCell className="font-medium">
              <div className="flex flex-col">{clinic.name}</div>
            </TableCell>
            <TableCell className="">{clinic.slug}</TableCell>
            <TableCell>
              <Badge className={getClinicStatusColor(clinic.status)}>
                {statusLabels[clinic.status]}
              </Badge>
            </TableCell>
            <TableCell className="text-right">{actionMenu(clinic)}</TableCell>
          </>
        )}
        renderCard={(clinic, dragHandle) => (
          <SortableCard
            item={{ ...clinic, isActive: true }}
            dragHandle={dragHandle}
            status={
              <Badge className={getClinicStatusColor(clinic.status)}>
                {statusLabels[clinic.status]}
              </Badge>
            }
            actionsMenu={actionMenu(clinic)}
          >
            <button
              type="button"
              className="block text-left font-medium hover:underline"
              onClick={() => openSheet("view", clinic)}
            >
              {clinic.name}
            </button>
            <span className="mt-1 block text-sm text-muted-foreground">
              {statusLabels[clinic.status]}
            </span>
          </SortableCard>
        )}
      />

      <ContentSheet
        open={open}
        onOpenChange={setOpen}
        title={
          mode === "import"
            ? `Импорт данных: ${selected?.name ?? ""}`
            : mode === "view"
            ? `Клиника: ${selected?.name ?? ""}`
            : mode === "create"
              ? "Новая клиника"
              : "Редактировать клинику"
        }
        description={
          mode === "import"
            ? "Проверьте структуру JSON перед импортом."
            : mode === "view"
            ? "Информация о клинике и ссылки."
            : mode === "create"
              ? "Создайте клинику и учётную запись администратора."
              : "Измените параметры клиники."
        }
      >
        {mode === "import" && selected ? (
          <ClinicImportPanel
            clinicSlug={selected.slug}
            onBack={() => setMode("view")}
            onClinicUpdated={(profile) => {
              const updated = { ...selected, ...profile };
              setSelected(updated);
              setClinics((current) => current.map((clinic) => clinic.id === updated.id ? updated : clinic));
            }}
          />
        ) : mode === "view" && selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Badge className={getClinicStatusColor(selected.status)}>
                {statusLabels[selected.status]}
              </Badge>

              <Button
                type="button"
                variant="outline"
                onClick={() => setMode("edit")}
              >
                <PencilIcon data-icon="inline-start" />
                Редактировать
              </Button>
            </div>

            <dl className="divide-y rounded-lg border text-sm">
              <div className="grid grid-cols-[100px_1fr] gap-3 p-3">
                <dt className="text-muted-foreground">Название</dt>
                <dd className="font-medium">{selected.name}</dd>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-3 p-3">
                <dt className="text-muted-foreground">Slug</dt>
                <dd className="break-all">{selected.slug}</dd>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-3 p-3">
                <dt className="text-muted-foreground">Тип</dt>
                <dd>Клиника</dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <a
                    href={`/${selected.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Открыть сайт
                  </a>
                }
              ></Button>

              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <a
                    href={`/${selected.slug}/admin`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Открыть админку
                  </a>
                }
              ></Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileJson2Icon /> Импорт данных сайта
                </CardTitle>
                <CardDescription>
                  Добавьте или обновите контент клиники из JSON. Отсутствующие записи сохранятся.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button type="button" variant="outline" onClick={() => setMode("import")}>
                  Импортировать JSON
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <form
            key={`${mode}-${selected?.id ?? "new"}`}
            onSubmit={(event) => {
              if (mode === "create") {
                void createClinic(event);
              } else {
                void updateClinic(event);
              }
            }}
            className="space-y-4"
          >
            <ContentField
              label="Название клиники"
              name={mode === "create" ? "clinicName" : "name"}
              required
              defaultValue={mode === "edit" ? selected?.name : ""}
            />

            <ContentField
              label="Slug"
              name="slug"
              required
              defaultValue={mode === "edit" ? selected?.slug : ""}
            />

            {mode === "edit" ? (
              <div className="space-y-2">
                <label htmlFor="clinic-status" className="text-sm font-medium">
                  Статус
                </label>

                <Select
                  items={Object.entries(statusLabels).map(([value, label]) => ({
                    label,
                    value,
                  }))}
                  id="clinic-status"
                  name="status"
                  defaultValue={selected?.status}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Статус</SelectLabel>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="border-t pt-4">
                  <h3 className="font-medium">Администратор клиники</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Учётная запись для входа в админ-панель.
                  </p>
                </div>

                <ContentField label="Имя" name="firstName" required />

                <ContentField label="Фамилия" name="lastName" required />

                <ContentField
                  label="Email"
                  name="email"
                  type="email"
                  required
                />

                <ContentField
                  label="Начальный пароль"
                  name="password"
                  type="text"
                  required
                />
              </>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                <SaveIcon data-icon="inline-start" />
                {saving
                  ? "Сохранение…"
                  : mode === "create"
                    ? "Создать клинику"
                    : "Сохранить"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => setOpen(false)}
              >
                <XIcon data-icon="inline-start" />
                Отмена
              </Button>
            </div>
          </form>
        )}
      </ContentSheet>
    </div>
  );
}
