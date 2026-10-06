import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Dispatch, SetStateAction } from "react";

interface UseReorderOptions<T> {
  items: T[];
  getId: (item: T) => string;
  setItems: Dispatch<SetStateAction<T[]>>;
  onReorder?: (ids: string[]) => Promise<{ success: boolean }>;
  onError?: () => void;
}

export function useReorder<T>({
  items,
  getId,
  setItems,
  onReorder,
  onError,
}: UseReorderOptions<T>) {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex(
      (item) => getId(item) === String(active.id),
    );

    const newIndex = items.findIndex(
      (item) => getId(item) === String(over.id),
    );

    if (oldIndex === -1 || newIndex === -1 || !onReorder) {
      return;
    }

    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);

    setItems(next);

    try {
      await onReorder(next.map(getId));
    } catch {
      setItems(previous);
      onError?.();
    }
  };

  return {
    sensors,
    handleDragEnd,
  };
}