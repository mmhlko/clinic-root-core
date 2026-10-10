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
  filter?: (item: T) => boolean;
  disableReorder?: boolean;
  showToolbar?: boolean;
  searchValue?: string;
  setItems: Dispatch<SetStateAction<T[]>>;
  getId: (item: T) => string;
  getSearchText?: (item: T) => string;
  reorder?: (ids: string[]) => Promise<{ success: boolean }>;
  onReorderError?: () => void;
  onAdd: () => void;
  addDisabled?: boolean;
  onItemClick?: (item: T) => void;
  renderHeader: () => ReactNode;
  renderCells: (item: T, dragHandle: ReactNode) => ReactNode;
  renderCard: (item: T, dragHandle: ReactNode) => ReactNode;
  columnCount: number;
  emptyMessage: string;
}

export function ContentList<T>({
  title,
  items,
  filter,
  disableReorder = false,
  showToolbar = true,
  searchValue,
  setItems,
  getId,
  getSearchText,
  reorder,
  onReorderError,
  onAdd,
  addDisabled = false,
  onItemClick,
  renderHeader,
  renderCells,
  renderCard,
  columnCount,
  emptyMessage,
}: ContentListProps<T>) {
  const [localQuery, setLocalQuery] = useState("");
  const query = searchValue ?? localQuery;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter && !filter(item)) return false;
      return (
        !normalizedQuery ||
        !getSearchText ||
        getSearchText(item).toLowerCase().includes(normalizedQuery)
      );
    });
  }, [filter, getSearchText, items, normalizedQuery]);
  const reorderingDisabled =
    disableReorder ||
    normalizedQuery.length > 0 ||
    filteredItems.length !== items.length;

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
    if (reorderingDisabled) return;
    return handleDragEnd(event);
  };

  return (
    <div className="space-y-4">
      {showToolbar && <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(event) => setLocalQuery(event.target.value)}
          placeholder={`Поиск: ${title.toLowerCase()}…`}
          className="sm:max-w-sm"
        />
        <Button onClick={onAdd} disabled={addDisabled}>
          <PlusIcon data-icon="inline-start" />
          Добавить
        </Button>
      </div>}

      <div className="space-y-3 md:hidden">
        <SortableCardList
          items={filteredItems}
          getId={getId}
          sensors={sensors}
          onDragEnd={handleFilteredDragEnd}
          dndId={`${title}-mobile-dnd`}
          reorderDisabled={reorderingDisabled}
          onItemClick={onItemClick}
          emptyMessage={
            normalizedQuery
              ? "Ничего не найдено."
              : disableReorder
                ? "Нет элементов в этой категории."
                : emptyMessage
          }
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
          reorderDisabled={reorderingDisabled}
          columnCount={columnCount}
          dragLabel={`Переместить: ${title.toLowerCase()}`}
          emptyMessage={
            normalizedQuery
              ? "Ничего не найдено."
              : disableReorder
                ? "Нет элементов в этой категории."
                : emptyMessage
          }
          renderHeader={renderHeader}
          renderCells={renderCells}
          onItemClick={onItemClick}
        />
      </div>
    </div>
  );
}
