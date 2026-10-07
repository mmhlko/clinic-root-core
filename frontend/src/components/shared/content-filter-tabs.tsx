"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "cn";

export interface ContentFilterTab<T extends string> {
  value: T;
  label: string;
  count?: number;
  badge?: ReactNode;
  icon?: LucideIcon;
  badgeStyle?: string;
}

interface ContentFilterTabsProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  items: ContentFilterTab<T>[];
}

export function ContentFilterTabs<T extends string>({
  value,
  onValueChange,
  items,
}: ContentFilterTabsProps<T>) {
  return (
    <Tabs
      value={value}
      aria-label="Фильтр списка"
      onValueChange={(nextValue) => {
        const nextItem = items.find((item) => item.value === nextValue);
        if (nextItem) onValueChange(nextItem.value);
      }}
    >
      <div className="overflow-x-auto scrollbar-none">
        <TabsList variant="line" className="w-max min-w-full justify-start">
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="shrink-0 gap-1.5 px-2.5 text-xs sm:px-3 sm:text-sm"
            >
              {item.icon && <item.icon className="size-3.5 sm:size-4" />}
              {item.label}

              {item.count !== undefined && (
                <Badge variant="secondary" className={cn(item.badgeStyle)}>
                  {item.count}
                </Badge>
              )}

              {item.badge}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
