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
  dragLabel?: string;
}

interface SortableTableRowProps<T> {
  item: T;
  getId: (item: T) => string;
  renderCells: (item: T, dragHandle: ReactNode) => ReactNode;
  dragLabel: string;
}

interface DragHandleProps {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
}

function DragHandle({
  attributes,
  listeners,
  label,
}: DragHandleProps & { label: string }) {

  return (
    <Button
      {...attributes}
      {...listeners}
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 cursor-grab text-muted-foreground hover:bg-transparent active:cursor-grabbing"
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
  });

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
    >
      {renderCells(
        item,
        <DragHandle attributes={attributes} listeners={listeners} label={dragLabel} />,
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
  dragLabel = "Переместить врача",
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
                />
              ))
            )}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  );
}
