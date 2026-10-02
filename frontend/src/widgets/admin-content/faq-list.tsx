"use client";

import { useState, type FormEvent } from "react";
import { PencilIcon, SaveIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ContentActionsMenu } from "@/widgets/admin-content/content-actions-menu";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { ContentField } from "@/widgets/admin-content/content-field";
import { ContentList } from "@/widgets/admin-content/content-list";
import { ContentSheet } from "@/widgets/admin-content/content-sheet";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type { FaqItem } from "@/features/content/types/content.types";

type SheetMode = "view" | "create" | "edit";

function toPayload(items: FaqItem[]) {
  return items.map(({ id, ...item }) =>
    id.startsWith("new-") ? item : { id, ...item },
  );
}

export function FaqList({ initialItems }: { initialItems: FaqItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<FaqItem | null>(null);
  const [mode, setMode] = useState<SheetMode>("view");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftActive, setDraftActive] = useState(true);

  function openSheet(nextMode: SheetMode, item: FaqItem | null = null) {
    setSelected(item);
    setMode(nextMode);
    setDraftActive(item?.isActive ?? true);
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entry: FaqItem = {
      id: selected?.id ?? `new-${Date.now()}`,
      question: String(form.get("question")),
      answer: String(form.get("answer")),
      sortOrder: selected?.sortOrder ?? items.length,
      isActive: draftActive,
    };
    const nextItems = selected
      ? items.map((item) => (item.id === selected.id ? entry : item))
      : [...items, entry];

    setSaving(true);
    try {
      const result = await contentClientApi.saveFaq(
        toPayload(nextItems) as FaqItem[],
      );
      setItems(result);
      setOpen(false);
      toast.add({
        type: "success",
        description: selected ? "Вопрос FAQ обновлён." : "Вопрос FAQ добавлен.",
      });
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось сохранить FAQ."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggle(item: FaqItem, isActive: boolean) {
    const nextItems = items.map((value) =>
      value.id === item.id ? { ...value, isActive } : value,
    );
    setSaving(true);
    try {
      const result = await contentClientApi.saveFaq(
        toPayload(nextItems) as FaqItem[],
      );
      setItems(result);
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(
          cause,
          "Не удалось изменить статус вопроса.",
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: FaqItem) {
    const nextItems = items
      .filter((value) => value.id !== item.id)
      .map((value, index) => ({ ...value, sortOrder: index }));
    setSaving(true);
    try {
      const result = await contentClientApi.saveFaq(
        toPayload(nextItems) as FaqItem[],
      );
      setItems(result);
      if (selected?.id === item.id) setOpen(false);
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось удалить вопрос."),
      });
    } finally {
      setSaving(false);
    }
  }

  function actionMenu(item: FaqItem) {
    return (
      <ContentActionsMenu
        item={item}
        itemLabel={item.question}
        actions={[
          {
            label: "Просмотреть",
            onSelect: (value) => openSheet("view", value),
          },
          {
            label: "Редактировать",
            onSelect: (value) => openSheet("edit", value),
          },
          {
            label: "Удалить",
            destructive: true,
            disabled: saving,
            onSelect: remove,
            confirm: {
              title: "Удалить вопрос?",
              description: "Вопрос будет удалён из FAQ.",
            },
          },
        ]}
      />
    );
  }

  return (
    <div className="space-y-3">
      <ContentList
        title="FAQ"
        items={items}
        setItems={setItems}
        getId={(item) => item.id}
        getSearchText={(item) => `${item.question} ${item.answer}`}
        reorder={(ids) => contentClientApi.reorderFaq(ids)}
        onReorderError={() =>
          toast.add({
            type: "error",
            description: "Не удалось сохранить порядок вопросов.",
          })
        }
        onAdd={() => openSheet("create")}
        columnCount={4}
        emptyMessage="Вопросов пока нет."
        renderHeader={() => (
          <TableRow>
            <TableHead className="w-10 px-2">
              <span className="sr-only">Перемещение</span>
            </TableHead>
            <TableHead>Вопрос</TableHead>
            <TableHead>Статус</TableHead>
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
                {item.question}
              </button>
              <span className="block max-w-xl truncate text-xs text-muted-foreground">
                {item.answer}
              </span>
            </TableCell>
            <TableCell>
              <Switch
                checked={item.isActive}
                disabled={saving}
                onCheckedChange={(value) => void toggle(item, value)}
                aria-label={`Активность вопроса: ${item.question}`}
              />
            </TableCell>
            <TableCell className="text-right">{actionMenu(item)}</TableCell>
          </>
        )}
        renderCard={(item, dragHandle) => (
          <article key={item.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              {dragHandle}
              <button
                className="min-w-0 flex-1 text-left"
                onClick={() => openSheet("view", item)}
              >
                <span className="block font-medium">{item.question}</span>
                <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
                  {item.answer}
                </span>
              </button>
              {actionMenu(item)}
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <Badge variant="outline">
                {item.isActive ? "Активен" : "Скрыт"}
              </Badge>
              <Switch
                checked={item.isActive}
                disabled={saving}
                onCheckedChange={(value) => void toggle(item, value)}
                aria-label={`Активность вопроса: ${item.question}`}
              />
            </div>
          </article>
        )}
      />

      <ContentSheet
        open={open}
        onOpenChange={setOpen}
        title={
          mode === "view"
            ? "Вопрос и ответ"
            : mode === "create"
              ? "Новый вопрос"
              : "Редактировать вопрос"
        }
        description={
          mode === "view"
            ? "Содержание FAQ"
            : "Добавьте формулировку вопроса и ответ."
        }
      >
        {mode === "view" && selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {selected.isActive ? "Активен" : "Скрыт"}
              </Badge>
              <Button
                variant="outline"
                onClick={() => openSheet("edit", selected)}
              >
                <PencilIcon data-icon="inline-start" />
                Редактировать
              </Button>
            </div>
            <section className="space-y-2">
              <h3 className="text-sm font-medium">{selected.question}</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {selected.answer}
              </p>
            </section>
          </div>
        ) : (
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            <ContentField
              label="Вопрос"
              name="question"
              required
              defaultValue={selected?.question}
            />
            <ContentField
              label="Ответ"
              name="answer"
              textarea
              required
              defaultValue={selected?.answer}
            />
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">Показывать на сайте</span>
              <Switch
                checked={draftActive}
                onCheckedChange={setDraftActive}
                aria-label="Активность вопроса"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                <SaveIcon data-icon="inline-start" />
                {saving ? "Сохранение…" : "Сохранить"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
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
