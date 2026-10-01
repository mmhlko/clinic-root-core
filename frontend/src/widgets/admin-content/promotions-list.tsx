"use client";

import { useState, type FormEvent } from "react";
import { PencilIcon, SaveIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ContentActionsMenu } from "@/widgets/admin-content/content-actions-menu";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { ContentField } from "@/widgets/admin-content/content-field";
import { ContentList } from "@/widgets/admin-content/content-list";
import { ContentSheet } from "@/widgets/admin-content/content-sheet";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type { Promotion, Service } from "@/features/content/types/content.types";

type SheetMode = "view" | "create" | "edit";

function toLocalDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
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
  const [error, setError] = useState("");

  function openSheet(nextMode: SheetMode, item: Promotion | null = null) {
    setSelected(item);
    setMode(nextMode);
    setError("");
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
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
    setError("");
    try {
      const result = selected
        ? await contentClientApi.updatePromotion(selected.id, body)
        : await contentClientApi.createPromotion(body);
      setItems((current) => selected ? current.map((item) => item.id === result.id ? result : item) : [...current, result]);
      setOpen(false);
    } catch (cause: unknown) {
      setError(getContentApiErrorMessage(cause, "Не удалось сохранить акцию."));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(item: Promotion, isActive: boolean) {
    setBusyId(item.id);
    setError("");
    setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive } : value));
    try {
      const updated = await contentClientApi.setPromotionActive(item.id, isActive);
      setItems((current) => current.map((value) => value.id === item.id ? updated : value));
    } catch (cause: unknown) {
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive: item.isActive } : value));
      setError(getContentApiErrorMessage(cause, "Не удалось изменить статус акции."));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: Promotion) {
    setError("");
    try {
      await contentClientApi.deletePromotion(item.id);
      setItems((current) => current.filter((value) => value.id !== item.id));
      if (selected?.id === item.id) setOpen(false);
    } catch (cause: unknown) {
      setError(getContentApiErrorMessage(cause, "Не удалось удалить акцию."));
    }
  }

  function actionMenu(item: Promotion) {
    return (
      <ContentActionsMenu
        item={item}
        itemLabel={item.title}
        actions={[
          { label: "Просмотреть", onSelect: (value) => openSheet("view", value) },
          { label: "Редактировать", onSelect: (value) => openSheet("edit", value) },
          { label: "Удалить", destructive: true, onSelect: remove, confirm: { title: "Удалить акцию?", description: "Акция будет удалена без возможности восстановления." } },
        ]}
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <ContentList
        title="Акции"
        items={items}
        setItems={setItems}
        getId={(item) => item.id}
        getSearchText={(item) => `${item.title} ${item.description ?? ""} ${item.service?.name ?? ""}`}
        reorder={(ids) => contentClientApi.reorderPromotions(ids)}
        onReorderError={() => setError("Не удалось сохранить порядок акций.")}
        onAdd={() => openSheet("create")}
        columnCount={5}
        emptyMessage="Акций пока нет."
        renderHeader={() => <TableRow><TableHead className="w-10 px-2"><span className="sr-only">Перемещение</span></TableHead><TableHead>Акция</TableHead><TableHead>Услуга и цена</TableHead><TableHead>Статус</TableHead><TableHead className="w-12 text-right" /></TableRow>}
        renderCells={(item, dragHandle) => (
          <>
            <TableCell className="w-10 px-2">{dragHandle}</TableCell>
            <TableCell><button className="text-left font-medium hover:underline" onClick={() => openSheet("view", item)}>{item.title}</button></TableCell>
            <TableCell>{item.service?.name ?? "Без услуги"}<span className="block text-xs text-muted-foreground">{item.newPrice == null ? "Цена не указана" : `${item.newPrice} ₽`}</span></TableCell>
            <TableCell><Switch checked={item.isActive} disabled={busyId === item.id} onCheckedChange={(value) => void toggle(item, value)} aria-label={`Активность: ${item.title}`} /></TableCell>
            <TableCell className="text-right">{actionMenu(item)}</TableCell>
          </>
        )}
        renderCard={(item, dragHandle) => (
          <article key={item.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">{dragHandle}<button className="min-w-0 flex-1 text-left" onClick={() => openSheet("view", item)}><span className="block font-medium">{item.title}</span><span className="mt-1 block text-sm text-muted-foreground">{item.service?.name ?? "Без услуги"}</span><span className="mt-1 block text-sm">{item.newPrice == null ? "Цена не указана" : `${item.newPrice} ₽`}</span></button>{actionMenu(item)}</div>
            <div className="mt-3 flex items-center justify-between border-t pt-3"><Badge variant="outline">{item.isActive ? "Активна" : "Скрыта"}</Badge><Switch checked={item.isActive} disabled={busyId === item.id} onCheckedChange={(value) => void toggle(item, value)} aria-label={`Активность: ${item.title}`} /></div>
          </article>
        )}
      />

      <ContentSheet open={open} onOpenChange={setOpen} title={mode === "view" ? selected?.title ?? "Акция" : mode === "create" ? "Новая акция" : "Редактировать акцию"} description={mode === "view" ? "Информация об акции" : "Укажите условия и срок действия акции."}>
        {mode === "view" && selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><Badge variant="outline">{selected.isActive ? "Активна" : "Скрыта"}</Badge><Button variant="outline" onClick={() => setMode("edit")}><PencilIcon data-icon="inline-start" />Редактировать</Button></div>
            <p className="whitespace-pre-wrap text-sm">{selected.description || "Без описания"}</p>
            <dl className="divide-y rounded-lg border text-sm"><div className="grid grid-cols-[110px_1fr] gap-3 p-3"><dt className="text-muted-foreground">Услуга</dt><dd>{selected.service?.name ?? "Без услуги"}</dd></div><div className="grid grid-cols-[110px_1fr] gap-3 p-3"><dt className="text-muted-foreground">Старая цена</dt><dd>{selected.oldPrice == null ? "Не указана" : `${selected.oldPrice} ₽`}</dd></div><div className="grid grid-cols-[110px_1fr] gap-3 p-3"><dt className="text-muted-foreground">Новая цена</dt><dd>{selected.newPrice == null ? "Не указана" : `${selected.newPrice} ₽`}</dd></div><div className="grid grid-cols-[110px_1fr] gap-3 p-3"><dt className="text-muted-foreground">Период</dt><dd>{selected.validFrom ? new Date(selected.validFrom).toLocaleDateString("ru-RU") : "Без ограничения"} — {selected.validTo ? new Date(selected.validTo).toLocaleDateString("ru-RU") : "без окончания"}</dd></div></dl>
          </div>
        ) : (
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            <ContentField label="Название" name="title" required defaultValue={selected?.title} />
            <ContentField label="Описание" name="description" textarea defaultValue={selected?.description} />
            <ContentField label="URL изображения" name="imageUrl" type="url" defaultValue={selected?.imageUrl} />
            <div className="grid gap-4 sm:grid-cols-2"><ContentField label="Старая цена" name="oldPrice" type="number" min={0} defaultValue={selected?.oldPrice} /><ContentField label="Новая цена" name="newPrice" type="number" min={0} defaultValue={selected?.newPrice} /></div>
            <div className="grid gap-4 sm:grid-cols-2"><ContentField label="Начало" name="validFrom" type="datetime-local" defaultValue={toLocalDateTime(selected?.validFrom)} /><ContentField label="Окончание" name="validTo" type="datetime-local" defaultValue={toLocalDateTime(selected?.validTo)} /></div>
            <div className="space-y-2"><Label htmlFor="serviceId">Услуга</Label><select id="serviceId" name="serviceId" defaultValue={selected?.serviceId ?? ""} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="">Без услуги</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button type="submit" disabled={saving}><SaveIcon data-icon="inline-start" />{saving ? "Сохранение…" : "Сохранить"}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}><XIcon data-icon="inline-start" />Отмена</Button></div>
          </form>
        )}
      </ContentSheet>
    </div>
  );
}