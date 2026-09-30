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
}

interface SortableCardProps {
  id: string;
  children: (dragHandle: ReactNode) => ReactNode;
}

function DragHandle({
  attributes,
  listeners,
}: {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
}) {
  return (
    <button
      type="button"
      className="touch-none cursor-grab text-muted-foreground active:cursor-grabbing"
      {...attributes}
      {...listeners}
      aria-label="Переместить"
    >
      <GripVertical className="size-5" />
    </button>
  );
}

function SortableCard({ id, children }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
        <DragHandle attributes={attributes} listeners={listeners} />,
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
            <SortableCard key={getId(item)} id={getId(item)}>
              {(dragHandle) => renderCard(item, dragHandle)}
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}