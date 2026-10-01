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
import type { Service, ServiceDirection } from "@/features/content/types/content.types";

type SheetMode = "view" | "create" | "edit";

export function ServicesList({
  initialItems,
  directions,
}: {
  initialItems: Service[];
  directions: ServiceDirection[];
}) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<Service | null>(null);
  const [mode, setMode] = useState<SheetMode>("view");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function openSheet(nextMode: SheetMode, item: Service | null = null) {
    setSelected(item);
    setMode(nextMode);
    setError("");
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      directionId: String(form.get("directionId")),
      name: String(form.get("name")),
      description: String(form.get("description") || ""),
      price: form.get("price") ? Number(form.get("price")) : null,
      isPriceFrom: form.get("isPriceFrom") === "true",
      sortOrder: Number(form.get("sortOrder") || 0),
    };

    setSaving(true);
    setError("");
    try {
      const result = selected
        ? await contentClientApi.updateService(selected.id, body)
        : await contentClientApi.createService(body);
      setItems((current) =>
        selected
          ? current.map((item) => (item.id === result.id ? result : item))
          : [...current, result],
      );
      setOpen(false);
    } catch (cause: unknown) {
      setError(getContentApiErrorMessage(cause, "Не удалось сохранить услугу."));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(item: Service, isActive: boolean) {
    setBusyId(item.id);
    setError("");
    setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive } : value));
    try {
      const updated = await contentClientApi.setServiceActive(item.id, isActive);
      setItems((current) => current.map((value) => value.id === item.id ? updated : value));
    } catch (cause: unknown) {
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive: item.isActive } : value));
      setError(getContentApiErrorMessage(cause, "Не удалось изменить статус услуги."));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: Service) {
    setError("");
    try {
      await contentClientApi.deleteService(item.id);
      setItems((current) => current.filter((value) => value.id !== item.id));
      if (selected?.id === item.id) setOpen(false);
    } catch (cause: unknown) {
      setError(getContentApiErrorMessage(cause, "Не удалось удалить услугу."));
    }
  }

  function actionMenu(item: Service) {
    return (
      <ContentActionsMenu
        item={item}
        itemLabel={item.name}
        actions={[
          { label: "Просмотреть", onSelect: (value) => openSheet("view", value) },
          { label: "Редактировать", onSelect: (value) => openSheet("edit", value) },
          { label: "Удалить", destructive: true, onSelect: remove, confirm: { title: "Удалить услугу?", description: "Удаление невозможно, пока к услуге привязаны заявки пациентов." } },
        ]}
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <ContentList
        title="Услуги"
        items={items}
        setItems={setItems}
        getId={(item) => item.id}
        getSearchText={(item) => `${item.name} ${item.description ?? ""} ${item.direction?.name ?? ""}`}
        reorder={(ids) => contentClientApi.reorderServices(ids)}
        onReorderError={() => setError("Не удалось сохранить порядок услуг.")}
        onAdd={() => openSheet("create")}
        columnCount={6}
        emptyMessage="Услуг пока нет."
        renderHeader={() => (
          <TableRow>
            <TableHead className="w-10 px-2"><span className="sr-only">Перемещение</span></TableHead>
            <TableHead>Услуга</TableHead>
            <TableHead>Направление</TableHead>
            <TableHead>Цена</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="w-12 text-right" />
          </TableRow>
        )}
        renderCells={(item, dragHandle) => (
          <>
            <TableCell className="w-10 px-2">{dragHandle}</TableCell>
            <TableCell>
              <button className="text-left font-medium hover:underline" onClick={() => openSheet("view", item)}>{item.name}</button>
            </TableCell>
            <TableCell>{item.direction?.name ?? "Без направления"}</TableCell>
            <TableCell>{item.price == null ? "Не указана" : `${item.isPriceFrom ? "от " : ""}${item.price} ₽`}</TableCell>
            <TableCell>
              <Switch checked={item.isActive} disabled={busyId === item.id} onCheckedChange={(value) => void toggle(item, value)} aria-label={`Активность: ${item.name}`} />
            </TableCell>
            <TableCell className="text-right">{actionMenu(item)}</TableCell>
          </>
        )}
        renderCard={(item, dragHandle) => (
          <article key={item.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              {dragHandle}
              <button className="min-w-0 flex-1 text-left" onClick={() => openSheet("view", item)}>
                <span className="block font-medium">{item.name}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{item.direction?.name ?? "Без направления"}</span>
                <span className="mt-1 block text-sm">{item.price == null ? "Цена не указана" : `${item.isPriceFrom ? "от " : ""}${item.price} ₽`}</span>
              </button>
              {actionMenu(item)}
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <Badge variant="outline">{item.isActive ? "Активна" : "Скрыта"}</Badge>
              <Switch checked={item.isActive} disabled={busyId === item.id} onCheckedChange={(value) => void toggle(item, value)} aria-label={`Активность: ${item.name}`} />
            </div>
          </article>
        )}
      />

      <ContentSheet
        open={open}
        onOpenChange={setOpen}
        title={mode === "view" ? selected?.name ?? "Услуга" : mode === "create" ? "Новая услуга" : "Редактировать услугу"}
        description={mode === "view" ? "Информация об услуге" : "Укажите направление, название и стоимость услуги."}
      >
        {mode === "view" && selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{selected.isActive ? "Активна" : "Скрыта"}</Badge>
              <Button variant="outline" onClick={() => setMode("edit")}><PencilIcon data-icon="inline-start" />Редактировать</Button>
            </div>
            <dl className="divide-y rounded-lg border text-sm">
              <div className="grid grid-cols-[110px_1fr] gap-3 p-3"><dt className="text-muted-foreground">Направление</dt><dd>{selected.direction?.name ?? "Без направления"}</dd></div>
              <div className="grid grid-cols-[110px_1fr] gap-3 p-3"><dt className="text-muted-foreground">Стоимость</dt><dd>{selected.price == null ? "Не указана" : `${selected.isPriceFrom ? "от " : ""}${selected.price} ₽`}</dd></div>
              <div className="grid gap-1 p-3"><dt className="text-muted-foreground">Описание</dt><dd className="whitespace-pre-wrap">{selected.description || "Без описания"}</dd></div>
            </dl>
          </div>
        ) : (
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            <ContentField label="Название" name="name" required defaultValue={selected?.name} />
            <div className="space-y-2">
              <Label htmlFor="directionId">Направление</Label>
              <select id="directionId" name="directionId" required defaultValue={selected?.directionId ?? ""} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                <option value="" disabled>Выберите направление</option>
                {directions.filter((direction) => direction.isActive).map((direction) => <option key={direction.id} value={direction.id}>{direction.name}</option>)}
              </select>
            </div>
            <ContentField label="Описание" name="description" textarea defaultValue={selected?.description} />
            <div className="grid gap-4 sm:grid-cols-2">
              <ContentField label="Цена" name="price" type="number" min={0} defaultValue={selected?.price} />
              <div className="space-y-2">
                <Label htmlFor="isPriceFrom">Цена от</Label>
                <select id="isPriceFrom" name="isPriceFrom" defaultValue={String(selected?.isPriceFrom ?? false)} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="false">Нет</option><option value="true">Да</option></select>
              </div>
            </div>
            <ContentField label="Сортировка" name="sortOrder" type="number" min={0} defaultValue={selected?.sortOrder ?? items.length} />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button type="submit" disabled={saving}><SaveIcon data-icon="inline-start" />{saving ? "Сохранение…" : "Сохранить"}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}><XIcon data-icon="inline-start" />Отмена</Button></div>
          </form>
        )}
      </ContentSheet>
    </div>
  );
}