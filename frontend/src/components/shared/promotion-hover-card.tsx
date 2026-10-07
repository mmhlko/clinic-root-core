"use client";

import { CalendarDays, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { Service } from "@/features/content/types/content.types";
import { cn } from "cn";
import { statusColorsStyles } from "@/shared/constants/colors";
import { EStatusVariant } from "@/shared/types/admin";

type Promotion = NonNullable<Service["promotion"]>;

export function PromotionHoverCard({
  promotion,
}: {
  promotion: Promotion;
}) {
  const oldPrice = Number(promotion.oldPrice);
  const newPrice = Number(promotion.newPrice);

  const discount =
    oldPrice > 0 && newPrice < oldPrice
      ? Math.round(((oldPrice - newPrice) / oldPrice) * 100)
      : null;

  return (
    <HoverCard>
      <HoverCardTrigger
        delay={10}
        closeDelay={100}
        render={
          <button type="button" className="cursor-pointer">
            <Badge
              variant="secondary"
              className={cn(
                "gap-1",
                statusColorsStyles[EStatusVariant.IN_PROGRESS],
              )}
            >
              <Tag className="size-3" />
              Акция
              {discount !== null && ` −${discount}%`}
            </Badge>
          </button>
        }
      />

      <HoverCardContent
        align="start"
        side="right"
        className="w-64 space-y-2.5 p-3"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug">
            {promotion.title}
          </p>
          {discount !== null && (
            <Badge className="shrink-0 bg-emerald-600 px-1.5 text-[10px] text-white hover:bg-emerald-600">
              −{discount}%
            </Badge>
          )}
        </div>

        {promotion.description && (
          <p className="text-xs text-muted-foreground">
            {promotion.description}
          </p>
        )}

        <div className="flex items-baseline gap-2">
          {promotion.oldPrice != null && (
            <span className="text-xs text-muted-foreground line-through">
              {oldPrice.toLocaleString("ru-RU")} ₽
            </span>
          )}
          {promotion.newPrice != null && (
            <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {newPrice.toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>

        {(promotion.validFrom || promotion.validTo) && (
          <div className="flex items-center gap-1.5 border-t pt-2 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3.5 shrink-0" />
            <span>
              {promotion.validFrom
                ? new Date(promotion.validFrom).toLocaleDateString("ru-RU")
                : "Без даты начала"}
              {" — "}
              {promotion.validTo
                ? new Date(promotion.validTo).toLocaleDateString("ru-RU")
                : "Бессрочно"}
            </span>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
