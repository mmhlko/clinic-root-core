"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PencilIcon, SaveIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import {
  ContentActionsMenu,
  type ContentMenuAction,
} from "@/widgets/admin-content/content-actions-menu";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { ContentField } from "@/widgets/admin-content/content-field";
import { ContentList } from "@/widgets/admin-content/content-list";
import { ContentSheet } from "@/widgets/admin-content/content-sheet";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type { Promotion, Service } from "@/features/content/types/content.types";
import { statusColorsStyles } from "@/shared/constants/colors";
import { EStatusVariant } from "@/shared/types/admin";
import { cn } from "cn";
import { SortableCard } from "@/components/shared/sortable-list/sortable-card";
import { activityColorsStyles } from "@/shared/constants/colors";
import { ImageUpload } from "@/features/image-upload/hooks/image-upload";
import { useImageUpload } from "@/features/image-upload/hooks/use-image-upload";
import { UploadedImage } from "@/features/image-upload/types/images.types";

type SheetMode = "view" | "create" | "edit";

function toLocalDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getPromotionStatus(
  promotion: Promotion,
  now = Date.now(),
): { status: EStatusVariant; message: string } {
  const validFrom = promotion.validFrom
    ? new Date(promotion.validFrom).getTime()
    : null;
  const validTo = promotion.validTo
    ? new Date(promotion.validTo).getTime()
    : null;

  if (
    (validFrom !== null && !Number.isFinite(validFrom)) ||
    (validTo !== null && !Number.isFinite(validTo)) ||
    (validFrom !== null && validTo !== null && validFrom > validTo)
  ) {
    return {
      status: EStatusVariant.CANCELLED,
      message: "Некорректный период",
    };
  }

  if (validTo !== null && validTo <= now) {
    return {
      status: EStatusVariant.COMPLETED,
      message: "Завершена",
    };
  }

  if (validFrom !== null && validFrom > now) {
    return {
      status: EStatusVariant.NEW,
      message: "Запланирована",
    };
  }

  return {
    status: EStatusVariant.IN_PROGRESS,
    message: "Активна",
  };
}

export function PromotionsList({
  initialItems,
  services,
}: {
  initialItems: Promotion[];
  services: Service[];
}) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<Promotion | null>(null);
  const [mode, setMode] = useState<SheetMode>("view");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function openSheet(nextMode: SheetMode, item: Promotion | null = null) {
    setSelected(item);
    setMode(nextMode);
    setOpen(true);
  }

  async function save(form: FormData): Promise<boolean> {
    const body = {
      title: String(form.get("title")),
      description: String(form.get("description") || ""),
      imageUrl: String(form.get("imageUrl") || "") || null,
      oldPrice: form.get("oldPrice") ? Number(form.get("oldPrice")) : null,
      newPrice: form.get("newPrice") ? Number(form.get("newPrice")) : null,
      validFrom: String(form.get("validFrom") || "") || null,
      validTo: String(form.get("validTo") || "") || null,
      serviceId: String(form.get("serviceId") || "") || null,
      sortOrder: selected?.sortOrder ?? items.length,
    };

    setSaving(true);
    try {
      const result = selected
        ? await contentClientApi.updatePromotion(selected.id, body)
        : await contentClientApi.createPromotion(body);
      setItems((current) => selected ? current.map((item) => item.id === result.id ? result : item) : [...current, result]);
      setOpen(false);
      toast.add({
        type: "success",
        description: selected ? "Акция обновлена." : "Акция добавлена.",
      });
      return true;
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось сохранить акцию."),
      });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function toggle(item: Promotion, isActive: boolean) {
    setBusyId(item.id);
    setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive } : value));
    try {
      const updated = await contentClientApi.setPromotionActive(item.id, isActive);
      setItems((current) => current.map((value) => value.id === item.id ? updated : value));
    } catch (cause: unknown) {
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive: item.isActive } : value));
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось изменить статус акции."),
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: Promotion) {
    try {
      await contentClientApi.deletePromotion(item.id);
      setItems((current) => current.filter((value) => value.id !== item.id));
      if (selected?.id === item.id) setOpen(false);
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось удалить акцию."),
      });
    }
  }

  function getActions(): ContentMenuAction<Promotion>[] {
    return [
      { label: "Просмотреть", onSelect: (value) => openSheet("view", value) },
      { label: "Редактировать", onSelect: (value) => openSheet("edit", value) },
      {
        label: "Удалить",
        destructive: true,
        onSelect: remove,
        confirm: {
          title: "Удалить акцию?",
          description: "Акция будет удалена без возможности восстановления.",
        },
      },
    ];
  }

  function actionMenu(item: Promotion) {
    return (
      <ContentActionsMenu
        item={item}
        itemLabel={item.title}
        actions={getActions()}
      />
    );
  }

  return (
    <div className="space-y-3">
      <ContentList
        title="Акции"
        items={items}
        setItems={setItems}
        getId={(item) => item.id}
        getSearchText={(item) =>
          `${item.title} ${item.description ?? ""} ${item.service?.name ?? ""}`
        }
        reorder={(ids) => contentClientApi.reorderPromotions(ids)}
        onReorderError={() =>
          toast.add({
            type: "error",
            description: "Не удалось сохранить порядок акций.",
          })
        }
        onAdd={() => openSheet("create")}
        columnCount={5}
        emptyMessage="Акций пока нет."
        renderHeader={() => (
          <TableRow>
            <TableHead className="w-10 px-2">
              <span className="sr-only">Перемещение</span>
            </TableHead>
            <TableHead>Акция</TableHead>
            <TableHead>Услуга и цена</TableHead>
            <TableHead>Начало</TableHead>
            <TableHead>Окончание</TableHead>
            <TableHead>Статус акции</TableHead>
            <TableHead>Видимость</TableHead>
            <TableHead className="w-12 text-right" />
          </TableRow>
        )}
        renderCells={(item, dragHandle) => (
          <>
            <TableCell className="w-10 px-2">{dragHandle}</TableCell>
            <TableCell>
              <button
                className="text-left font-medium hover:underline"
                onClick={() => openSheet("view", item)}
              >
                {item.title}
              </button>
            </TableCell>
            <TableCell>
              {item.service?.name ?? "Без услуги"}
              <span className="block text-xs text-muted-foreground">
                {item.newPrice == null
                  ? "Цена не указана"
                  : `${item.newPrice} ₽`}
              </span>
            </TableCell>
            <TableCell>
              {item.validFrom ? new Date(item.validFrom).toLocaleDateString() : "Не указано"}
            </TableCell>
            <TableCell>
              {item.validTo ? new Date(item.validTo).toLocaleDateString() : "Не указано"}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn(
                statusColorsStyles[getPromotionStatus(item).status]
              )}>
                {getPromotionStatus(item) ? getPromotionStatus(item).message : "Неизвестно"}
              </Badge>
            </TableCell>
            <TableCell>
              <Switch
                checked={item.isActive}
                disabled={busyId === item.id}
                onCheckedChange={(value) => void toggle(item, value)}
                aria-label={`Активность: ${item.title}`}
              />
            </TableCell>
            <TableCell className="text-right">{actionMenu(item)}</TableCell>
          </>
        )}
        renderCard={(item, dragHandle) => {
          const status = getPromotionStatus(item);

          return (
            <SortableCard
              item={item}
              dragHandle={dragHandle}
              onSwitch={(value) => void toggle(item, value)}
              switchDisabled={busyId === item.id}
              status={
                <Badge
                  className={
                    activityColorsStyles[item.isActive ? "active" : "inactive"]
                  }
                >
                  {item.isActive ? "Активен" : "Скрыт"}
                </Badge>
              }
              actionsMenu={actionMenu(item)}
            >
              <button
                className="w-full text-left"
                onClick={() => openSheet("view", item)}
              >
                <span className="block font-medium">{item.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {item.service?.name ?? "Без услуги"}
                </span>
                <span className="mt-1 block text-sm">
                  {item.newPrice == null ? "Цена не указана" : `${item.newPrice} ₽`}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  Статус акции: {status.message}
                </span>
              </button>
            </SortableCard>
          );
        }}
      />

      <ContentSheet
        open={open}
        onOpenChange={setOpen}
        title={
          mode === "view"
            ? (selected?.title ?? "Акция")
            : mode === "create"
              ? "Новая акция"
              : "Редактировать акцию"
        }
        description={
          mode === "view"
            ? "Информация об акции"
            : "Укажите условия и срок действия акции."
        }
      >
        {mode === "view" && selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {selected.isActive ? "Активна" : "Скрыта"}
              </Badge>
              <Button variant="outline" onClick={() => setMode("edit")}>
                <PencilIcon data-icon="inline-start" />
                Редактировать
              </Button>
            </div>
            <p className="whitespace-pre-wrap text-sm">
              {selected.description || "Без описания"}
            </p>
            <dl className="divide-y rounded-lg border text-sm">
              <div className="grid grid-cols-[110px_1fr] gap-3 p-3">
                <dt className="text-muted-foreground">Услуга</dt>
                <dd>{selected.service?.name ?? "Без услуги"}</dd>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3 p-3">
                <dt className="text-muted-foreground">Старая цена</dt>
                <dd>
                  {selected.oldPrice == null
                    ? "Не указана"
                    : `${selected.oldPrice} ₽`}
                </dd>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3 p-3">
                <dt className="text-muted-foreground">Новая цена</dt>
                <dd>
                  {selected.newPrice == null
                    ? "Не указана"
                    : `${selected.newPrice} ₽`}
                </dd>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3 p-3">
                <dt className="text-muted-foreground">Период</dt>
                <dd>
                  {selected.validFrom
                    ? new Date(selected.validFrom).toLocaleDateString("ru-RU")
                    : "Без ограничения"}{" "}
                  —{" "}
                  {selected.validTo
                    ? new Date(selected.validTo).toLocaleDateString("ru-RU")
                    : "без окончания"}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <PromotionForm
            key={selected?.id ?? "new-promotion"}
            item={selected}
            saving={saving}
            services={services}
            onSave={save}
            onCancel={() => setOpen(false)}
          />
        )}
      </ContentSheet>
    </div>
  );
}

function PromotionForm({
  item,
  saving,
  services,
  onSave,
  onCancel,
}: {
  item: Promotion | null;
  saving: boolean;
  services: Service[];
  onSave: (form: FormData) => Promise<boolean>;
  onCancel: () => void;
}) {
  const initialImage: UploadedImage | null = item?.imageUrl
    ? { id: item.imageUrl, url: item.imageUrl }
    : null;
  const { image, isUploading, isDeleting, upload, remove, cleanup, commit } =
    useImageUpload({ initialImage });

  useEffect(() => () => { void cleanup(); }, [cleanup]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("imageUrl", image?.url ?? "");
    const saved = await onSave(form);
    if (saved) commit();
  }

  async function cancel() {
    await cleanup();
    onCancel();
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <ContentField label="Название" name="title" required defaultValue={item?.title} />
      <ContentField label="Описание" name="description" textarea defaultValue={item?.description} />
      <div className="space-y-2">
        <Label>Изображение</Label>
        <ImageUpload
          image={image}
          alt={item?.title ?? "Изображение акции"}
          onUpload={upload}
          onRemove={remove}
          isUploading={isUploading}
          isDeleting={isDeleting}
          aspectRatio="16/9"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ContentField label="Старая цена" name="oldPrice" type="number" min={0} defaultValue={item?.oldPrice} />
        <ContentField label="Новая цена" name="newPrice" type="number" min={0} defaultValue={item?.newPrice} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ContentField label="Начало" name="validFrom" type="datetime-local" defaultValue={toLocalDateTime(item?.validFrom)} />
        <ContentField label="Окончание" name="validTo" type="datetime-local" defaultValue={toLocalDateTime(item?.validTo)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="serviceId">Услуга</Label>
        <select id="serviceId" name="serviceId" defaultValue={item?.serviceId ?? ""} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
          <option value="">Без услуги</option>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving || isUploading || isDeleting}>
          <SaveIcon data-icon="inline-start" />
          {saving ? "Сохранение…" : "Сохранить"}
        </Button>
        <Button type="button" variant="outline" onClick={() => void cancel()} disabled={saving || isUploading || isDeleting}>
          <XIcon data-icon="inline-start" />
          Отмена
        </Button>
      </div>
    </form>
  );
}
