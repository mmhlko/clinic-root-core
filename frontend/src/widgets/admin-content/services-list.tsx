"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ListIcon } from "lucide-react";
import { PencilIcon, SaveIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import {
  ContentActionsMenu,
  type ContentMenuAction,
} from "@/widgets/admin-content/content-actions-menu";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { ContentField } from "@/widgets/admin-content/content-field";
import { ContentList } from "@/widgets/admin-content/content-list";
import { ContentSheet } from "@/widgets/admin-content/content-sheet";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type { Service, ServiceDirection } from "@/features/content/types/content.types";
import { PromotionHoverCard } from "@/components/shared/promotion-hover-card";
import { SortableCard } from "@/components/shared/sortable-list/sortable-card";
import { activityColorsStyles } from "@/shared/constants/colors";
import {
  ContentFilterTabs,
  type ContentFilterTab,
} from "@/components/shared/content-filter-tabs";

type SheetMode = "view" | "create" | "edit";
const UNASSIGNED_DIRECTION = "__unassigned__";

export function ServicesList({
  initialItems,
  directions,
}: {
  initialItems: Service[];
  directions: ServiceDirection[];
}) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<Service | null>(null);
  const [mode, setMode] = useState<SheetMode>("view");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = useState("all");
  const [query, setQuery] = useState("");
  const filterTabs = useMemo<ContentFilterTab<string>[]>(
    () => [
      {
        value: "all",
        label: "Все направления",
        count: items.length,
        icon: ListIcon,
      },
      ...directions.map((direction) => ({
        value: direction.id,
        label: direction.name,
        count: items.filter(
          (item) => item.direction?.id === direction.id,
        ).length,
      })),
      {
        value: UNASSIGNED_DIRECTION,
        label: "Без направления",
        count: items.filter((item) => !item.direction).length,
      },
    ],
    [directions, items],
  );

  const serviceGroups = useMemo(() => {
    const orderedDirections = [...directions].sort((left, right) => left.sortOrder - right.sortOrder);
    return orderedDirections
      .filter((direction) => directionFilter === "all" || direction.id === directionFilter)
      .map((direction) => ({
        id: direction.id,
        title: direction.name,
        items: items
          .filter((item) => item.directionId === direction.id)
          .sort((left, right) => left.sortOrder - right.sortOrder),
      }))
      .filter((group) => group.items.length > 0 || directionFilter === group.id);
  }, [directions, directionFilter, items]);

  function openSheet(nextMode: SheetMode, item: Service | null = null) {
    setSelected(item);
    setMode(nextMode);
    setOpen(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      directionId: String(form.get("directionId")),
      name: String(form.get("name")),
      description: String(form.get("description") || ""),
      price: form.get("price") ? Number(form.get("price")) : null,
      isPriceFrom: form.get("isPriceFrom") === "true",
      sortOrder: selected?.sortOrder ?? items.length,
    };

    setSaving(true);
    try {
      const savedService = selected
        ? await contentClientApi.updateService(selected.id, body)
        : await contentClientApi.createService(body);
      const result = {
        ...savedService,
        direction: directions.find((direction) => direction.id === savedService.directionId) ?? null,
      };
      setItems((current) =>
        selected
          ? current.map((item) => (item.id === result.id ? result : item))
          : [...current, result],
      );
      setOpen(false);
      toast.add({
        type: "success",
        description: selected ? "Услуга обновлена." : "Услуга добавлена.",
      });
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось сохранить услугу."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function toggle(item: Service, isActive: boolean) {
    setBusyId(item.id);
    setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive } : value));
    try {
      const updated = await contentClientApi.setServiceActive(item.id, isActive);
      setItems((current) => current.map((value) => value.id === item.id ? updated : value));
    } catch (cause: unknown) {
      setItems((current) => current.map((value) => value.id === item.id ? { ...value, isActive: item.isActive } : value));
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось изменить статус услуги."),
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: Service) {
    try {
      await contentClientApi.deleteService(item.id);
      setItems((current) => current.filter((value) => value.id !== item.id));
      if (selected?.id === item.id) setOpen(false);
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(cause, "Не удалось удалить услугу."),
      });
    }
  }

  function getActions(): ContentMenuAction<Service>[] {
    return [
      { label: "Просмотреть", onSelect: (value) => openSheet("view", value) },
      { label: "Редактировать", onSelect: (value) => openSheet("edit", value) },
      {
        label: "Удалить",
        destructive: true,
        onSelect: remove,
        confirm: {
          title: "Удалить услугу?",
          description:
            "Удаление невозможно, пока к услуге привязаны заявки пациентов.",
        },
      },
    ];
  }

  function actionMenu(item: Service) {
    return (
      <ContentActionsMenu
        item={item}
        itemLabel={item.name}
        actions={getActions()}
      />
    );
  }


  return (
    <div className="flex flex-col gap-5">
      <ContentFilterTabs
        value={directionFilter}
        onValueChange={setDirectionFilter}
        items={filterTabs}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск услуг…"
          className="sm:max-w-sm"
        />
        <Button onClick={() => openSheet("create")}>Добавить услугу</Button>
      </div>
      {serviceGroups.map((group) => (
        <section key={group.id} className="space-y-2">
          <h2 className="text-lg font-semibold">{group.title}</h2>
          <ContentList
            title={group.title}
            items={group.items}
            showToolbar={false}
            searchValue={query}
            setItems={(update) => setItems((current) => {
              const currentGroup = current.filter((item) => item.directionId === group.id);
              const nextGroup = typeof update === "function" ? update(currentGroup) : update;
              const nextIds = new Set(nextGroup.map((item) => item.id));
              return [
                ...current.filter((item) => item.directionId !== group.id && !nextIds.has(item.id)),
                ...nextGroup.map((item, index) => ({ ...item, sortOrder: index })),
              ];
            })}
            getId={(item) => item.id}
            getSearchText={(item) =>
              `${item.name} ${item.description ?? ""} ${item.direction?.name ?? ""}`
            }
            reorder={(ids) => contentClientApi.reorderServices(group.id, ids)}
            onReorderError={() =>
              toast.add({
                type: "error",
                description: "Не удалось сохранить порядок услуг.",
              })
            }
            onAdd={() => openSheet("create")}
            onItemClick={(item) => openSheet("view", item)}
            columnCount={6}
            emptyMessage="Услуг пока нет."
            renderHeader={() => (
              <TableRow>
                <TableHead className="w-10 px-2">
                  <span className="sr-only">Перемещение</span>
                </TableHead>
                <TableHead>Услуга</TableHead>
                <TableHead>Направление</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Акция</TableHead>
                <TableHead>Видимость</TableHead>
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
                {item.name}
              </button>
            </TableCell>
            <TableCell>{item.direction?.name ?? "Без направления"}</TableCell>
            <TableCell>
              {item.price == null
                ? "Не указана"
                : `${item.isPriceFrom ? "от " : ""}${item.price} ₽`}
            </TableCell>
            <TableCell>
              {item.promotion && (
                <PromotionHoverCard promotion={item.promotion} />
              )}
            </TableCell>
            <TableCell>
              <Switch
                checked={item.isActive}
                disabled={busyId === item.id}
                onCheckedChange={(value) => void toggle(item, value)}
                aria-label={`Активность: ${item.name}`}
              />
            </TableCell>
            <TableCell className="text-right">{actionMenu(item)}</TableCell>
          </>
        )}
            renderCard={(item, dragHandle) => (
          <SortableCard
            item={item}
            dragHandle={dragHandle}
            onSwitch={(value) => void toggle(item, value)}
            switchDisabled={busyId === item.id}
            status={
              <Badge
                className={
                  activityColorsStyles[item.isActive ? "active" : "inactive"]
                }
              >
                {item.isActive ? "Активен" : "Скрыт"}
              </Badge>
            }
            actionsMenu={actionMenu(item)}          >
            <button
              className="w-full text-left"
              onClick={() => openSheet("view", item)}
            >
              <span className="block font-medium">{item.name}</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {item.direction?.name ?? "Без направления"}
              </span>
              <span className="mt-1 block text-sm">
                {item.price == null
                  ? "Цена не указана"
                  : `${item.isPriceFrom ? "от " : ""}${item.price} ₽`}
              </span>
            </button>
          </SortableCard>
        )}
          />
        </section>
      ))}

      <ContentSheet
        open={open}
        onOpenChange={setOpen}
        title={
          mode === "view"
            ? (selected?.name ?? "Услуга")
            : mode === "create"
              ? "Новая услуга"
              : "Редактировать услугу"
        }
        description={
          mode === "view"
            ? "Информация об услуге"
            : "Укажите направление, название и стоимость услуги."
        }
      >
        {mode === "view" && selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {selected.isActive ? "Активна" : "Скрыта"}
              </Badge>
              <Button variant="outline" onClick={() => setMode("edit")}>
                <PencilIcon data-icon="inline-start" />
                Редактировать
              </Button>
            </div>
            <dl className="divide-y rounded-lg border text-sm">
              <div className="grid grid-cols-[110px_1fr] gap-3 p-3">
                <dt className="text-muted-foreground">Направление</dt>
                <dd>{selected.direction?.name ?? "Без направления"}</dd>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3 p-3">
                <dt className="text-muted-foreground">Стоимость</dt>
                <dd>
                  {selected.price == null
                    ? "Не указана"
                    : `${selected.isPriceFrom ? "от " : ""}${selected.price} ₽`}
                </dd>
              </div>
              <div className="grid gap-1 p-3">
                <dt className="text-muted-foreground">Описание</dt>
                <dd className="whitespace-pre-wrap">
                  {selected.description || "Без описания"}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <form onSubmit={(event) => void save(event)} className="space-y-4">
            <ContentField
              label="Название"
              name="name"
              required
              defaultValue={selected?.name}
            />
            <div className="space-y-2">
              <Label htmlFor="directionId">Направление</Label>
              <Select
                items={[
                  { label: "Выберите направление", value: null },
                  ...directions
                    .filter((direction) => direction.isActive)
                    .map((direction) => ({
                      label: direction.name,
                      value: direction.id,
                    })),
                ]}
                id="directionId"
                name="directionId"
                defaultValue={selected?.directionId ?? null}
                required
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Выберите направление" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Направление</SelectLabel>
                    <SelectItem value={null} disabled>
                      Выберите направление
                    </SelectItem>
                    {directions
                      .filter((direction) => direction.isActive)
                      .map((direction) => (
                        <SelectItem key={direction.id} value={direction.id}>
                          {direction.name}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <ContentField
              label="Описание"
              name="description"
              textarea
              defaultValue={selected?.description}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ContentField
                label="Цена"
                name="price"
                type="number"
                min={0}
                defaultValue={selected?.price}
              />
              <div className="space-y-2">
                <Label htmlFor="isPriceFrom">Цена от</Label>
                <Select
                  items={[
                    { label: "Нет", value: "false" },
                    { label: "Да", value: "true" },
                  ]}
                  id="isPriceFrom"
                  name="isPriceFrom"
                  defaultValue={String(selected?.isPriceFrom ?? false)}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Цена от</SelectLabel>
                      <SelectItem value="false">Нет</SelectItem>
                      <SelectItem value="true">Да</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
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
