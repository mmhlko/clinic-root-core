"use client";

import { useState, type FormEvent } from "react";
import { CheckIcon, PencilIcon, SaveIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ContentActionsMenu } from "@/widgets/admin-content/content-actions-menu";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { ContentField } from "@/widgets/admin-content/content-field";
import { ContentList } from "@/widgets/admin-content/content-list";
import { ContentSheet } from "@/widgets/admin-content/content-sheet";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type { Review } from "@/features/content/types/content.types";

type SheetMode = "view" | "create" | "edit";
type DoctorOption = { id: string; firstName: string; lastName: string };

export function ReviewsList({
  initialItems,
  doctors,
}: {
  initialItems: Review[];
  doctors: DoctorOption[];
}) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<Review | null>(null);
  const [mode, setMode] = useState<SheetMode>("view");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function openSheet(nextMode: SheetMode, item: Review | null = null) {
    setSelected(item);
    setMode(nextMode);
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      authorName: String(form.get("authorName")),
      text: String(form.get("text")),
      rating: Number(form.get("rating")),
      reviewDate: String(form.get("reviewDate") || "") || null,
      doctorId: String(form.get("doctorId") || "") || null,
      sortOrder: selected?.sortOrder ?? items.length,
    };

    setSaving(true);
    try {
      const result = selected
        ? await contentClientApi.updateReview(selected.id, body)
        : await contentClientApi.createReview(body);
      setItems((current) => selected ? current.map((item) => item.id === result.id ? result : item) : [...current, result]);
      setOpen(false);
      toast.add({
        type: "success",
        description: selected ? "Отзыв обновлён." : "Отзыв добавлен.",
      });
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось сохранить отзыв."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function moderate(item: Review, action: "publish" | "reject") {
    try {
      const result = action === "publish"
        ? await contentClientApi.publishReview(item.id)
        : await contentClientApi.rejectReview(item.id);
      setItems((current) => current.map((value) => value.id === result.id ? result : value));
      setSelected((current) => current?.id === result.id ? result : current);
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось изменить статус отзыва."),
      });
    }
  }

  async function toggle(item: Review, isActive: boolean) {
    setBusyId(item.id);
    setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive } : value));
    try {
      const updated = await contentClientApi.setReviewActive(item.id, isActive);
      setItems((current) => current.map((value) => value.id === item.id ? updated : value));
    } catch (cause: unknown) {
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive: item.isActive } : value));
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось изменить статус отзыва."),
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: Review) {
    try {
      await contentClientApi.deleteReview(item.id);
      setItems((current) => current.filter((value) => value.id !== item.id));
      if (selected?.id === item.id) setOpen(false);
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось удалить отзыв."),
      });
    }
  }

  function actionMenu(item: Review) {
    return (
      <ContentActionsMenu
        item={item}
        itemLabel={item.authorName}
        actions={[
          { label: "Просмотреть", onSelect: (value) => openSheet("view", value) },
          { label: "Редактировать", onSelect: (value) => openSheet("edit", value) },
          ...(item.status === "pending" ? [
            { label: "Опубликовать", onSelect: (value: Review) => moderate(value, "publish") },
            { label: "Отклонить", onSelect: (value: Review) => moderate(value, "reject") },
          ] : []),
          { label: "Удалить", destructive: true, onSelect: remove, confirm: { title: "Удалить отзыв?", description: "Отзыв будет удалён без возможности восстановления." } },
        ]}
      />
    );
  }

  return (
    <div className="space-y-3">
      <ContentList
        title="Отзывы"
        items={items}
        setItems={setItems}
        getId={(item) => item.id}
        getSearchText={(item) => `${item.authorName} ${item.text} ${item.doctor?.lastName ?? ""} ${item.doctor?.firstName ?? ""}`}
        reorder={(ids) => contentClientApi.reorderReviews(ids)}
        onReorderError={() =>
          toast.add({
            type: "error",
            description: "Не удалось сохранить порядок отзывов.",
          })
        }
        onAdd={() => openSheet("create")}
        columnCount={7}
        emptyMessage="Отзывов пока нет."
        renderHeader={() => <TableRow><TableHead className="w-10 px-2"><span className="sr-only">Перемещение</span></TableHead><TableHead>Автор</TableHead><TableHead>Оценка</TableHead><TableHead>Дата</TableHead><TableHead>Статус</TableHead><TableHead>Показ</TableHead><TableHead className="w-12 text-right" /></TableRow>}
        renderCells={(item, dragHandle) => (
          <>
            <TableCell className="w-10 px-2">{dragHandle}</TableCell>
            <TableCell><button className="text-left font-medium hover:underline" onClick={() => openSheet("view", item)}>{item.authorName}</button><span className="block max-w-sm truncate text-xs text-muted-foreground">{item.text}</span></TableCell>
            <TableCell>{"★".repeat(item.rating)}</TableCell>
            <TableCell>{item.reviewDate ? new Date(item.reviewDate).toLocaleDateString("ru-RU") : "Не указана"}</TableCell>
            <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
            <TableCell><Switch checked={item.isActive} disabled={item.status !== "published" || busyId === item.id} onCheckedChange={(value) => void toggle(item, value)} aria-label={`Показ отзыва: ${item.authorName}`} /></TableCell>
            <TableCell className="text-right">{actionMenu(item)}</TableCell>
          </>
        )}
        renderCard={(item, dragHandle) => (
          <article key={item.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">{dragHandle}<button className="min-w-0 flex-1 text-left" onClick={() => openSheet("view", item)}><span className="block font-medium">{item.authorName}</span><span className="mt-1 block text-sm">{"★".repeat(item.rating)}</span><span className="mt-2 line-clamp-3 block whitespace-pre-wrap text-sm text-muted-foreground">{item.text}</span></button>{actionMenu(item)}</div>
            <div className="mt-3 flex items-center justify-between border-t pt-3"><Badge variant="outline">{item.status}</Badge><Switch checked={item.isActive} disabled={item.status !== "published" || busyId === item.id} onCheckedChange={(value) => void toggle(item, value)} aria-label={`Показ отзыва: ${item.authorName}`} /></div>
          </article>
        )}
      />

      <ContentSheet open={open} onOpenChange={setOpen} title={mode === "view" ? `Отзыв: ${selected?.authorName ?? ""}` : mode === "create" ? "Новый отзыв" : "Редактировать отзыв"} description={mode === "view" ? "Отзыв пациента" : "Укажите автора, текст и оценку."}>
        {mode === "view" && selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><Badge variant="outline">{selected.status}</Badge><Button variant="outline" onClick={() => setMode("edit")}><PencilIcon data-icon="inline-start" />Редактировать</Button></div>
            <p className="whitespace-pre-wrap text-sm">{selected.text}</p>
            <dl className="divide-y rounded-lg border text-sm"><div className="grid grid-cols-[110px_1fr] gap-3 p-3"><dt className="text-muted-foreground">Оценка</dt><dd>{"★".repeat(selected.rating)}</dd></div><div className="grid grid-cols-[110px_1fr] gap-3 p-3"><dt className="text-muted-foreground">Врач</dt><dd>{selected.doctor ? `${selected.doctor.lastName} ${selected.doctor.firstName}` : "Без врача"}</dd></div><div className="grid grid-cols-[110px_1fr] gap-3 p-3"><dt className="text-muted-foreground">Дата</dt><dd>{selected.reviewDate ? new Date(selected.reviewDate).toLocaleDateString("ru-RU") : "Не указана"}</dd></div></dl>
            {selected.status === "pending" && <div className="flex gap-2"><Button onClick={() => void moderate(selected, "publish")}><CheckIcon data-icon="inline-start" />Опубликовать</Button><Button variant="outline" onClick={() => void moderate(selected, "reject")}><XIcon data-icon="inline-start" />Отклонить</Button></div>}
          </div>
        ) : (
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            <ContentField label="Автор" name="authorName" required defaultValue={selected?.authorName} />
            <ContentField label="Текст" name="text" textarea required defaultValue={selected?.text} />
            <div className="grid gap-4 sm:grid-cols-2"><ContentField label="Оценка 1–5" name="rating" type="number" min={1} max={5} required defaultValue={selected?.rating ?? 5} /><ContentField label="Дата" name="reviewDate" type="date" defaultValue={selected?.reviewDate ? new Date(selected.reviewDate).toISOString().slice(0, 10) : ""} /></div>
            <div className="space-y-2"><Label htmlFor="doctorId">Врач</Label><select id="doctorId" name="doctorId" defaultValue={selected?.doctorId ?? ""} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value="">Без врача</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.lastName} {doctor.firstName}</option>)}</select></div>
            <div className="flex gap-2"><Button type="submit" disabled={saving}><SaveIcon data-icon="inline-start" />{saving ? "Сохранение…" : "Сохранить"}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}><XIcon data-icon="inline-start" />Отмена</Button></div>
          </form>
        )}
      </ContentSheet>
    </div>
  );
}