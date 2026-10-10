"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
      className="w-full min-w-0 max-w-full"
      value={value}
      aria-label="Фильтр списка"
      onValueChange={(nextValue) => {
        const nextItem = items.find((item) => item.value === nextValue);
        if (nextItem) onValueChange(nextItem.value);
      }}
    >
      <ScrollArea
        scrollbarOrientation="horizontal"
        className="h-12 w-full min-w-0 max-w-full"
      >
        <TabsList variant="line" className="w-max min-w-full justify-start">
          {items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="flex-none gap-1.5 px-2.5 text-xs sm:px-3 sm:text-sm"
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
      </ScrollArea>
    </Tabs>
  );
}
