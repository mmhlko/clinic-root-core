"use client";

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

interface SortableCardListProps<T> {
  items: T[];
  getId: (item: T) => string;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void | Promise<void>;
  renderCard: (item: T, dragHandle: ReactNode) => ReactNode;
  emptyMessage?: string;
  dndId: string;
  reorderDisabled?: boolean;
}

interface SortableCardProps {
  id: string;
  children: (dragHandle: ReactNode) => ReactNode;
  reorderDisabled: boolean;
}

function DragHandle({
  attributes,
  listeners,
  disabled,
}: {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      className="touch-none cursor-grab text-muted-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      {...attributes}
      {...listeners}
      aria-label="Переместить"
    >
      <GripVertical className="size-5" />
    </button>
  );
}

function SortableCard({ id, children, reorderDisabled }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: reorderDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "relative z-10 opacity-70" : undefined}
    >
      {children(
        <DragHandle
          attributes={attributes}
          listeners={listeners}
          disabled={reorderDisabled}
        />,
      )}
    </div>
  );
}

export function SortableCardList<T>({
  items,
  getId,
  sensors,
  onDragEnd,
  renderCard,
  emptyMessage = "Элементов пока нет.",
  dndId,
  reorderDisabled = false,
}: SortableCardListProps<T>) {
  if (!items.length) {
    return (
      <div className="rounded-lg border py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <DndContext
      id={dndId}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      sensors={sensors}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={items.map(getId)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {items.map((item) => (
            <SortableCard
              key={getId(item)}
              id={getId(item)}
              reorderDisabled={reorderDisabled}
            >
              {(dragHandle) => renderCard(item, dragHandle)}
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}