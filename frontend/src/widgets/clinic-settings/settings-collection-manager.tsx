"use client";

import {
  SubmitEvent,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentActionsMenu } from "@/widgets/admin-content/content-actions-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { cn } from "cn";
import { activityColorsStyles } from "@/shared/constants/colors";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { SortableCardList } from "@/components/shared/sortable-list/sortable-card-list";
import { SortableTableList } from "@/components/shared/sortable-list/sortable-table-list";
import { useReorder } from "@/shared/hooks/use-reorder";
import { ScrollArea } from "@/components/ui/scroll-area";

export type SettingsCollectionItem = {
  id: string;
  isActive: boolean;
  sortOrder: number;
};

type Props<T extends SettingsCollectionItem> = {
  title: string;
  description: string;
  emptyMessage: string;
  items: T[];
  createItem: (nextOrder: number) => T;
  renderFields: (
    item: T,
    update: (changes: Partial<T>) => void,
  ) => ReactNode;
  renderSummary: (item: T) => ReactNode;
  saveItem: (items: T[], item: T) => Promise<T[]>;
  setActive: (items: T[], item: T, isActive: boolean) => Promise<T[]>;
  deleteItem: (items: T[], item: T) => Promise<T[]>;
  reorderItems: (items: T[]) => Promise<void>;
};

export function SettingsCollectionManager<T extends SettingsCollectionItem>({
  title,
  description,
  emptyMessage,
  items: initialItems,
  createItem,
  renderFields,
  renderSummary,
  saveItem,
  setActive,
  deleteItem,
  reorderItems,
}: Props<T>) {
  const [items, setItems] = useState(() =>
    initialItems.slice().sort((left, right) => left.sortOrder - right.sortOrder),
  );
  const [draft, setDraft] = useState<T | null>(null);
  const [saving, setSaving] = useState(false);

  const updateDraft = (changes: Partial<T>) => {
    setDraft((current) =>
      current ? Object.assign({}, current, changes) : current,
    );
  };

  const run = async (
    operation: () => Promise<T[]>,
    successMessage: string,
    failureMessage: string,
  ) => {
    setSaving(true);
    try {
      setItems(await operation());
      toast.add({ type: "success", description: successMessage });
      return true;
    } catch (error) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(error, failureMessage),
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const saved = await run(
      () => saveItem(items, draft),
      "Изменения сохранены.",
      "Не удалось сохранить изменения.",
    );
    if (saved) setDraft(null);
  };

  const handleActiveChange = (item: T, isActive: boolean) => {
    void run(
      () => setActive(items, item, isActive),
      isActive ? "Запись активирована." : "Запись деактивирована.",
      "Не удалось изменить статус.",
    );
  };

  const handleDelete = (item: T) =>
    run(
      () => deleteItem(items, item),
      "Запись удалена.",
      "Не удалось удалить запись.",
    ).then(() => undefined);

  const setOrderedItems: Dispatch<SetStateAction<T[]>> = (update) => {
    setItems((current) => {
      const next = typeof update === "function" ? update(current) : update;
      return next.map((item, index) => ({ ...item, sortOrder: index }));
    });
  };

  const { sensors, handleDragEnd } = useReorder({
    items,
    getId: (item) => item.id,
    setItems: setOrderedItems,
    onReorder: async (ids) => {
      const orderedItems = ids
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is T => item !== undefined)
        .map((item, sortOrder) => ({ ...item, sortOrder }));
      await reorderItems(orderedItems);
      return { success: true };
    },
    onError: () => {
      toast.add({
        type: "error",
        description: "Не удалось сохранить порядок записей.",
      });
    },
  });

  const renderActions = (item: T) => (
    <ContentActionsMenu
      item={item}
      itemLabel={title.toLowerCase()}
      actions={[
        {
          label: "Редактировать",
          disabled: saving,
          onSelect: setDraft,
        },
        {
          label: "Удалить",
          disabled: saving,
          destructive: true,
          confirm: {
            title: "Удалить запись?",
            description: "Это действие нельзя отменить.",
          },
          onSelect: handleDelete,
        },
      ]}
    />
  );

  const renderCard = (item: T, dragHandle: ReactNode) => (
    <Card key={item.id} className="gap-0 overflow-hidden py-0">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {dragHandle}
          <div className="min-w-0 flex-1 pt-0.5">
            {renderSummary(item)}
            <Badge
              className={cn(
                "mt-2 h-6 px-2 text-xs",
                activityColorsStyles[item.isActive ? "active" : "inactive"],
              )}
            >
              <span
                className={`size-1.5 rounded-full ${
                  item.isActive ? "bg-current" : "bg-muted-foreground"
                }`}
              />
              {item.isActive ? "Активно" : "Скрыто"}
            </Badge>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {renderActions(item)}
          </div>
        </div>
        <div className="my-4 border-t" />
        <div className="flex items-center gap-3">
          <Switch
            checked={item.isActive}
            disabled={saving}
            aria-label={`Активность: ${title}`}
            onCheckedChange={(checked) => handleActiveChange(item, checked)}
          />
          <div className="min-w-0">
            <div className="text-sm font-medium leading-4">
              Активность записи
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {item.isActive
                ? "Отображается на сайте"
                : "Не отображается на сайте"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const handleSortedDragEnd = (event: DragEndEvent) => {
    if (saving) return;
    return handleDragEnd(event);
  };

  const startCreating = () => {
    setDraft(
      createItem(
        items.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1,
      ),
    );
  };

  return (
    <section className="space-y-4">
      <div className="hidden justify-end sm:flex">
        <Button
          type="button"
          className="sm:w-auto"
          disabled={saving}
          onClick={startCreating}
        >
          <Plus className="size-4" />
          Добавить
        </Button>
      </div>

      <ScrollArea className="h-[calc(100dvh-16rem)] min-h-48 md:h-auto">
        <div className="pb-24 sm:pb-0">
          <div className="md:hidden">
            <SortableCardList
              items={items}
              getId={(item) => item.id}
              sensors={sensors}
              onDragEnd={handleSortedDragEnd}
              dndId={`${title}-settings-mobile-dnd`}
              emptyMessage={emptyMessage}
              renderCard={renderCard}
            />
          </div>

          <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
            <SortableTableList
              items={items}
              getId={(item) => item.id}
              sensors={sensors}
              onDragEnd={handleSortedDragEnd}
              dndId={`${title}-settings-desktop-dnd`}
              columnCount={4}
              emptyMessage={emptyMessage}
              dragLabel={`Переместить: ${title.toLowerCase()}`}
              renderHeader={() => (
                <TableRow>
                  <TableHead className="w-10 px-2">
                    <span className="sr-only">Перемещение</span>
                  </TableHead>
                  <TableHead>{title}</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="w-24 text-right" />
                </TableRow>
              )}
              renderCells={(item, dragHandle) => (
                <>
                  <TableCell className="w-10 px-2">{dragHandle}</TableCell>
                  <TableCell className="max-w-0">{renderSummary(item)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.isActive}
                        disabled={saving}
                        aria-label={`Активность: ${title}`}
                        onCheckedChange={(checked) =>
                          handleActiveChange(item, checked)
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.isActive ? "Активно" : "Скрыто"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="w-24 text-right">
                    {renderActions(item)}
                  </TableCell>
                </>
              )}
            />
          </div>
        </div>
      </ScrollArea>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-lg backdrop-blur sm:hidden">
        <Button
          type="button"
          className="w-full"
          disabled={saving}
          onClick={startCreating}
        >
          <Plus className="size-4" />
          Добавить
        </Button>
      </div>

      <Sheet
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setDraft(null);
        }}
      >
        <SheetContent
          side="responsive"
          className="flex max-h-[90dvh] flex-col sm:max-h-none"
        >
          <SheetHeader className="border-b">
            <SheetTitle>
              {draft?.id.startsWith("new-") ? "Новая запись" : "Редактирование"}
            </SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          {draft && (
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={handleSave}
            >
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                {renderFields(draft, updateDraft)}
              </div>
              <SheetFooter className="mt-0 border-t bg-muted/50 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => setDraft(null)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Сохранение..." : "Сохранить"}
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}

export function CollectionTextField({
  label,
  value,
  onChange,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  const id = `collection-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} required={required}>{label}</Label>
      <Input
        id={id}
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-lg border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function CollectionTextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `collection-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-24 w-full rounded-lg border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
