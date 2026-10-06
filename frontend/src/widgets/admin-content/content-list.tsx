"use client";

import {
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortableCardList } from "@/components/shared/sortable-list/sortable-card-list";
import { SortableTableList } from "@/components/shared/sortable-list/sortable-table-list";
import { useReorder } from "@/shared/hooks/use-reorder";

interface ContentListProps<T> {
  title: string;
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  getId: (item: T) => string;
  getSearchText?: (item: T) => string;
  reorder?: (ids: string[]) => Promise<{ success: boolean }>;
  onReorderError?: () => void;
  onAdd: () => void;
  renderHeader: () => ReactNode;
  renderCells: (item: T, dragHandle: ReactNode) => ReactNode;
  renderCard: (item: T, dragHandle: ReactNode) => ReactNode;
  columnCount: number;
  emptyMessage: string;
}

export function ContentList<T>({
  title,
  items,
  setItems,
  getId,
  getSearchText,
  reorder,
  onReorderError,
  onAdd,
  renderHeader,
  renderCells,
  renderCard,
  columnCount,
  emptyMessage,
}: ContentListProps<T>) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    if (!normalizedQuery || !getSearchText) return items;
    return items.filter((item) =>
      getSearchText(item).toLowerCase().includes(normalizedQuery),
    );
  }, [getSearchText, items, normalizedQuery]);

  const setOrderedItems: Dispatch<SetStateAction<T[]>> = (update) => {
    setItems((current) => {
      const next = typeof update === "function" ? update(current) : update;
      return next.map((item, index) => {
        if (typeof item !== "object" || item === null || !("sortOrder" in item)) {
          return item;
        }
        return { ...item, sortOrder: index };
      }) as T[];
    });
  };

  const { sensors, handleDragEnd } = useReorder({
    items,
    getId,
    setItems: setOrderedItems,
    onReorder: reorder,
    onError: onReorderError,
  });
  const handleFilteredDragEnd = (event: DragEndEvent) => {
    if (normalizedQuery) return;
    return handleDragEnd(event);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Поиск: ${title.toLowerCase()}…`}
          className="sm:max-w-sm"
        />
        <Button onClick={onAdd}>
          <PlusIcon data-icon="inline-start" />
          Добавить
        </Button>
      </div>

      <div className="space-y-3 md:hidden">
        <SortableCardList
          items={filteredItems}
          getId={getId}
          sensors={sensors}
          onDragEnd={handleFilteredDragEnd}
          dndId={`${title}-mobile-dnd`}
          emptyMessage={normalizedQuery ? "Ничего не найдено." : emptyMessage}
          renderCard={renderCard}
        />
      </div>

      <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
        <SortableTableList
          items={filteredItems}
          getId={getId}
          sensors={sensors}
          onDragEnd={handleFilteredDragEnd}
          dndId={`${title}-desktop-dnd`}
          columnCount={columnCount}
          dragLabel={`Переместить: ${title.toLowerCase()}`}
          emptyMessage={normalizedQuery ? "Ничего не найдено." : emptyMessage}
          renderHeader={renderHeader}
          renderCells={renderCells}
        />
      </div>
    </div>
  );
}