"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReactNode } from "react";

interface SortableTableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void | Promise<void>;
  renderHeader: () => ReactNode;
  renderCells: (item: T, dragHandle: ReactNode) => ReactNode;
  emptyMessage?: string;
  columnCount: number;
  dndId: string;
  reorderDisabled?: boolean;
  dragLabel?: string;
  onItemClick?: (item: T) => void;
}

interface SortableTableRowProps<T> {
  item: T;
  getId: (item: T) => string;
  renderCells: (item: T, dragHandle: ReactNode) => ReactNode;
  dragLabel: string;
  reorderDisabled: boolean;
  onItemClick?: (item: T) => void;
}

interface DragHandleProps {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
  disabled: boolean;
}

function DragHandle({
  attributes,
  listeners,
  label,
  disabled,
}: DragHandleProps & { label: string }) {

  return (
    <Button
      {...attributes}
      {...listeners}
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 cursor-grab text-muted-foreground hover:bg-transparent active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
    >
      <GripVerticalIcon className="size-4" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}

function SortableTableRow<T>({
  item,
  getId,
  renderCells,
  dragLabel,
  reorderDisabled,
  onItemClick,
}: SortableTableRowProps<T>) {
  const id = getId(item);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: reorderDisabled,
  });

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      data-dragging={isDragging}
      className={`relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 ${onItemClick ? "cursor-pointer" : ""}`}
      tabIndex={onItemClick ? 0 : undefined}
      onClick={(event) => {
        if (!onItemClick) return;
        const target = event.target;
        if (
          target instanceof Element &&
          target.closest(
            "button, a, input, textarea, select, [role='button'], [role='switch'], [role^='menuitem'], [data-slot='dropdown-menu-item']",
          )
        ) {
          return;
        }
        onItemClick(item);
      }}
      onKeyDown={(event) => {
        if (!onItemClick || event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onItemClick(item);
        }
      }}
    >
      {renderCells(
        item,
        <DragHandle
          attributes={attributes}
          listeners={listeners}
          label={dragLabel}
          disabled={reorderDisabled}
        />,
      )}
    </TableRow>
  );
}

export function SortableTableList<T>({
  items,
  getId,
  sensors,
  onDragEnd,
  renderHeader,
  renderCells,
  emptyMessage = "Элементов пока нет.",
  columnCount,
  dndId,
  reorderDisabled = false,
  dragLabel = "Переместить врача",
  onItemClick,
}: SortableTableListProps<T>) {
  const itemsIds = items.map(getId);

  return (
    <DndContext
      id={dndId}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      sensors={sensors}
      onDragEnd={onDragEnd}
    >
      <Table>
        <TableHeader className="">{renderHeader()}</TableHeader>
        <TableBody>
          <SortableContext
            items={itemsIds}
            strategy={verticalListSortingStrategy}
          >
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <SortableTableRow
                  key={getId(item)}
                  item={item}
                  getId={getId}
                  renderCells={renderCells}
                  dragLabel={dragLabel}
                  reorderDisabled={reorderDisabled}
                  onItemClick={onItemClick}
                />
              ))
            )}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  );
}
