"use client";

import { useState } from "react";
import { ChevronsUpDown, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DoctorReferenceOption } from "../types/doctors.types";
import { cn } from "cn";

interface DoctorReferenceMultiSelectProps {
  options: DoctorReferenceOption[];
  selectedIds: string[];
  placeholder: string;
  searchPlaceholder: string;
  emptyLabel: string;
  allowCreate?: boolean;
  onChange: (ids: string[]) => void;
  onCreate?: (name: string) => Promise<DoctorReferenceOption>;
}

export function DoctorReferenceMultiSelect({
  options,
  selectedIds,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  allowCreate = false,
  onChange,
  onCreate,
}: DoctorReferenceMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const normalizedQuery = query.trim();
  const exactMatch = options.some(
    (option) => option.name.toLocaleLowerCase() === normalizedQuery.toLocaleLowerCase(),
  );
  const canCreate = allowCreate && Boolean(normalizedQuery) && !exactMatch && Boolean(onCreate);

  const toggleOption = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  };

  const createOption = async () => {
    if (!onCreate || !normalizedQuery) {
      return;
    }

    setCreating(true);
    try {
      const createdOption = await onCreate(normalizedQuery);
      onChange([...selectedIds, createdOption.id]);
      setQuery("");
      setOpen(false);
    } catch {
      toast.add({
        type: "error",
        description: "Не удалось добавить навык. Возможно, он уже существует.",
      });
    } finally {
      setCreating(false);
    }
  };

  const selectedNames = options
    .filter((option) => selectedIds.includes(option.id))
    .map((option) => option.name);

  return (
    <div className="space-y-2">
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setQuery("");
          }
        }}
      >
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-10 w-full justify-between font-normal cursor-pointer"
            >
              <span className="truncate">
                {placeholder}
              </span>
              <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
            </Button>
          }
        />
        <PopoverContent align="start" className="w-[var(--anchor-width)] p-0">
          <Command shouldFilter>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
            />
            <CommandList>
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              <CommandGroup >
                {options.map((option) => {
                  const selected = selectedIds.includes(option.id);

                  return (
                    <CommandItem
                      key={option.id}
                      value={option.name}
                      onSelect={() => toggleOption(option.id)}
                      data-checked={selected}
                      className={cn(
                        'cursor-pointer',
                        selected ? "bg-accent" : ""
                      )}
                    >
                      <span className="flex-1 truncate">{option.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {canCreate && (
                <CommandGroup>
                  <CommandItem
                    value={`создать ${normalizedQuery}`}
                    disabled={creating}
                    onSelect={() => void createOption()}
                    className="cursor-pointer"
                  >
                    <Plus className="size-4" />
                    {creating ? "Добавление..." : `Добавить навык «${normalizedQuery}»`}
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {options
            .filter((option) => selectedIds.includes(option.id))
            .map((option) => (
              <span
                key={option.id}
                className="inline-flex min-h-8 items-center gap-2 rounded-md border bg-muted/40 px-2.5 text-xs"
              >
                {option.name}
                <button
                  type="button"
                  className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Убрать ${option.name}`}
                  onClick={() => toggleOption(option.id)}
                >
                  <X size={12} className="cursor-pointer" />
                </button>
              </span>
            ))}
        </div>
      )}

    </div>
  );
}
