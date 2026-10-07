"use client";

import { useState, type FormEvent } from "react";
import { PencilIcon, SaveIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ContentActionsMenu, ContentMenuAction } from "@/widgets/admin-content/content-actions-menu";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { ContentField } from "@/widgets/admin-content/content-field";
import { ContentList } from "@/widgets/admin-content/content-list";
import { ContentSheet } from "@/widgets/admin-content/content-sheet";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type { ServiceDirection } from "@/features/content/types/content.types";
import { SortableCard } from "@/components/shared/sortable-list/sortable-card";
import { activityColorsStyles } from "@/shared/constants/colors";

type SheetMode = "view" | "create" | "edit";

export function DirectionsList({ initialItems }: { initialItems: ServiceDirection[] }) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<ServiceDirection | null>(null);
  const [mode, setMode] = useState<SheetMode>("view");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function openSheet(nextMode: SheetMode, item: ServiceDirection | null = null) {
    setSelected(item);
    setMode(nextMode);
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      name: String(form.get("name")),
      description: String(form.get("description") || ""),
      sortOrder: selected?.sortOrder ?? items.length,
    };

    setSaving(true);
    try {
      const result = selected
        ? await contentClientApi.updateDirection(selected.id, body)
        : await contentClientApi.createDirection(body);
      setItems((current) =>
        selected
          ? current.map((item) => (item.id === result.id ? result : item))
          : [...current, result],
      );
      setOpen(false);
      toast.add({
        type: "success",
        description: selected
          ? "Направление обновлено."
          : "Направление добавлено.",
      });
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось сохранить направление."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: ServiceDirection) {
    try {
      await contentClientApi.deleteDirection(item.id);
      setItems((current) => current.filter((value) => value.id !== item.id));
      if (selected?.id === item.id) setOpen(false);
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось удалить направление."),
      });
    }
  }

  const getActions = (): ContentMenuAction<ServiceDirection>[] => {
    return [
      { label: "Просмотреть", onSelect: (value) => openSheet("view", value) },
      { label: "Редактировать", onSelect: (value) => openSheet("edit", value) },
      {
        label: "Удалить",
        destructive: true,
        onSelect: remove,
        confirm: {
          title: "Удалить направление?",
          description:
            "Удаление невозможно, пока направление привязано к услугам или врачам.",
        },
      },
    ];
  };

    function actionMenu(item: ServiceDirection) {
      return (
        <ContentActionsMenu
          item={item}
          itemLabel={item.name}
          actions={getActions()}
        />
      );
    }

  return (
    <div className="space-y-3">
      <ContentList
        title="Направления"
        items={items}
        setItems={setItems}
        getId={(item) => item.id}
        getSearchText={(item) => `${item.name} ${item.description ?? ""}`}
        reorder={(ids) => contentClientApi.reorderDirections(ids)}
        onReorderError={() =>
          toast.add({
            type: "error",
            description: "Не удалось сохранить порядок направлений.",
          })
        }
        onAdd={() => openSheet("create")}
        columnCount={4}
        emptyMessage="Направлений пока нет."
        renderHeader={() => (
          <TableRow>
            <TableHead className="w-10 px-2"><span className="sr-only">Перемещение</span></TableHead>
            <TableHead>Направление</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead className="w-12 text-right" />
          </TableRow>
        )}
        renderCells={(item, dragHandle) => (
          <>
            <TableCell className="w-10 px-2">{dragHandle}</TableCell>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell className="max-w-xl truncate text-muted-foreground">{item.description || "Без описания"}</TableCell>
            <TableCell className="text-right">{actionMenu(item)}</TableCell>
          </>
        )}
        renderCard={(item, dragHandle) => (
          <SortableCard
            item={item}
            dragHandle={dragHandle}
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
              <span className="block font-medium">{item.name}</span>
              <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
                {item.description || "Без описания"}
              </span>
            </button>
          </SortableCard>
        )}
      />

      <ContentSheet
        open={open}
        onOpenChange={setOpen}
        title={mode === "view" ? selected?.name ?? "Направление" : mode === "create" ? "Новое направление" : "Редактировать направление"}
        description={mode === "view" ? "Информация о направлении" : "Укажите название и описание направления."}
      >
        {mode === "view" && selected ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Описание</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{selected.description || "Без описания"}</p>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <Badge variant="outline">{selected.isActive ? "Активно" : "Скрыто"}</Badge>
              <Button variant="outline" onClick={() => setMode("edit")}>
                <PencilIcon data-icon="inline-start" />
                Редактировать
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            <ContentField label="Название" name="name" required defaultValue={selected?.name} />
            <ContentField label="Описание" name="description" textarea defaultValue={selected?.description} />
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                <SaveIcon data-icon="inline-start" />
                {saving ? "Сохранение…" : "Сохранить"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
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