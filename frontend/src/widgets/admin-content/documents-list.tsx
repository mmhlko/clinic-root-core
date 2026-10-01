"use client";

import { useState, type FormEvent } from "react";
import { ExternalLinkIcon, PencilIcon, SaveIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ContentActionsMenu } from "@/widgets/admin-content/content-actions-menu";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { ContentField } from "@/widgets/admin-content/content-field";
import { ContentList } from "@/widgets/admin-content/content-list";
import { ContentSheet } from "@/widgets/admin-content/content-sheet";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type { DocumentItem } from "@/features/content/types/content.types";

type SheetMode = "view" | "create" | "edit";

export function DocumentsList({ initialItems }: { initialItems: DocumentItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<DocumentItem | null>(null);
  const [mode, setMode] = useState<SheetMode>("view");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function openSheet(nextMode: SheetMode, item: DocumentItem | null = null) {
    setSelected(item);
    setMode(nextMode);
    setError("");
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = new FormData();
    payload.append("title", String(form.get("title")));
    payload.append("description", String(form.get("description") || ""));
    payload.append("sortOrder", String(form.get("sortOrder") || 0));
    const file = form.get("file");
    if (file instanceof File && file.size > 0) payload.append("file", file);

    setSaving(true);
    setError("");
    try {
      const result = selected
        ? await contentClientApi.updateDocument(selected.id, payload)
        : await contentClientApi.createDocument(payload);
      setItems((current) => selected ? current.map((item) => item.id === result.id ? result : item) : [...current, result]);
      setOpen(false);
    } catch (cause: unknown) {
      setError(getContentApiErrorMessage(cause, "Не удалось сохранить документ."));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(item: DocumentItem, isActive: boolean) {
    setBusyId(item.id);
    setError("");
    setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive } : value));
    try {
      const updated = await contentClientApi.setDocumentActive(item.id, isActive);
      setItems((current) => current.map((value) => value.id === item.id ? updated : value));
    } catch (cause: unknown) {
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive: item.isActive } : value));
      setError(getContentApiErrorMessage(cause, "Не удалось изменить статус документа."));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: DocumentItem) {
    setError("");
    try {
      await contentClientApi.deleteDocument(item.id);
      setItems((current) => current.filter((value) => value.id !== item.id));
      if (selected?.id === item.id) setOpen(false);
    } catch (cause: unknown) {
      setError(getContentApiErrorMessage(cause, "Не удалось удалить документ."));
    }
  }

  function actionMenu(item: DocumentItem) {
    return (
      <ContentActionsMenu
        item={item}
        itemLabel={item.title}
        actions={[
          { label: "Просмотреть", onSelect: (value) => openSheet("view", value) },
          { label: "Редактировать", onSelect: (value) => openSheet("edit", value) },
          { label: "Удалить", destructive: true, onSelect: remove, confirm: { title: "Удалить документ?", description: "Документ и загруженный файл будут удалены без возможности восстановления." } },
        ]}
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <ContentList
        title="Документы"
        items={items}
        setItems={setItems}
        getId={(item) => item.id}
        getSearchText={(item) => `${item.title} ${item.description ?? ""} ${item.fileName}`}
        reorder={(ids) => contentClientApi.reorderDocuments(ids)}
        onReorderError={() => setError("Не удалось сохранить порядок документов.")}
        onAdd={() => openSheet("create")}
        columnCount={5}
        emptyMessage="Документов пока нет."
        renderHeader={() => <TableRow><TableHead className="w-10 px-2"><span className="sr-only">Перемещение</span></TableHead><TableHead>Документ</TableHead><TableHead>Файл</TableHead><TableHead>Статус</TableHead><TableHead className="w-12 text-right" /></TableRow>}
        renderCells={(item, dragHandle) => (
          <>
            <TableCell className="w-10 px-2">{dragHandle}</TableCell>
            <TableCell><button className="text-left font-medium hover:underline" onClick={() => openSheet("view", item)}>{item.title}</button><span className="block max-w-md truncate text-xs text-muted-foreground">{item.description}</span></TableCell>
            <TableCell>{item.fileName}<span className="block text-xs text-muted-foreground">{item.fileType}</span></TableCell>
            <TableCell><Switch checked={item.isActive} disabled={busyId === item.id} onCheckedChange={(value) => void toggle(item, value)} aria-label={`Активность: ${item.title}`} /></TableCell>
            <TableCell className="text-right">{actionMenu(item)}</TableCell>
          </>
        )}
        renderCard={(item, dragHandle) => (
          <article key={item.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">{dragHandle}<button className="min-w-0 flex-1 text-left" onClick={() => openSheet("view", item)}><span className="block font-medium">{item.title}</span><span className="mt-1 block truncate text-sm text-muted-foreground">{item.fileName} · {item.fileType}</span></button>{actionMenu(item)}</div>
            <div className="mt-3 flex items-center justify-between border-t pt-3"><Badge variant="outline">{item.isActive ? "Активен" : "Скрыт"}</Badge><Switch checked={item.isActive} disabled={busyId === item.id} onCheckedChange={(value) => void toggle(item, value)} aria-label={`Активность: ${item.title}`} /></div>
          </article>
        )}
      />

      <ContentSheet open={open} onOpenChange={setOpen} title={mode === "view" ? selected?.title ?? "Документ" : mode === "create" ? "Новый документ" : "Редактировать документ"} description={mode === "view" ? "Информация о документе" : "Укажите описание и выберите файл."}>
        {mode === "view" && selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><Badge variant="outline">{selected.isActive ? "Активен" : "Скрыт"}</Badge><Button variant="outline" onClick={() => setMode("edit")}><PencilIcon data-icon="inline-start" />Редактировать</Button></div>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selected.description || "Без описания"}</p>
            <dl className="divide-y rounded-lg border text-sm"><div className="grid grid-cols-[100px_1fr] gap-3 p-3"><dt className="text-muted-foreground">Файл</dt><dd className="break-all">{selected.fileName}</dd></div><div className="grid grid-cols-[100px_1fr] gap-3 p-3"><dt className="text-muted-foreground">Формат</dt><dd>{selected.fileType}</dd></div></dl>
            <Button variant="outline" nativeButton={false} render={<a href={selected.fileUrl} target="_blank" rel="noreferrer" />}><ExternalLinkIcon data-icon="inline-start" />Открыть файл</Button>
          </div>
        ) : (
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            <ContentField label="Название" name="title" required defaultValue={selected?.title} />
            <ContentField label="Описание" name="description" textarea defaultValue={selected?.description} />
            <ContentField label="Сортировка" name="sortOrder" type="number" min={0} defaultValue={selected?.sortOrder ?? items.length} />
            <div className="space-y-2"><Label htmlFor="file">Файл {selected ? "(необязательно при редактировании)" : ""}</Label><Input id="file" name="file" type="file" accept=".pdf,.doc,.docx" required={!selected} /></div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2"><Button type="submit" disabled={saving}><SaveIcon data-icon="inline-start" />{saving ? "Сохранение…" : "Сохранить"}</Button><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}><XIcon data-icon="inline-start" />Отмена</Button></div>
          </form>
        )}
      </ContentSheet>
    </div>
  );
}