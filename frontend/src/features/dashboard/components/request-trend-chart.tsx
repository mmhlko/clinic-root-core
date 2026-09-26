"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DashboardRequestTrend } from "../types/dashboard.types";

const chartConfig = {
  count: {
    label: "Заявки",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const ranges = [
  { days: 7, label: "7 дней" },
  { days: 30, label: "1 месяц" },
  { days: 90, label: "3 месяца" },
] as const;

function formatDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("ru-RU", options).format(
    new Date(`${value}T12:00:00`),
  );
}

export function RequestTrendChart({ data }: { data: DashboardRequestTrend[] }) {
  const [range, setRange] = useState<number>(7);
  const visibleData = data.slice(-range);
  const rangeLabel = ranges.find((item) => item.days === range)?.label;

  return (
    <section className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">Заявки за период</h3>
          <p className="mt-1 text-sm text-muted-foreground">Количество обращений по дням</p>
        </div>
        <ToggleGroup
          aria-label="Период графика заявок"
          multiple={false}
          value={[String(range)]}
          onValueChange={(value) => {
            const selectedRange = Number(value[0]);
            if (selectedRange === 7 || selectedRange === 30 || selectedRange === 90) {
              setRange(selectedRange);
            }
          }}
          variant="outline"
          size="sm"
          spacing={0}
        >
          {ranges.map((item) => (
            <ToggleGroupItem
              key={item.days}
              value={String(item.days)}
              aria-label={item.label}
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <ChartContainer config={chartConfig} className="aspect-auto h-[230px] w-full">
        <AreaChart data={visibleData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(value: string) =>
              formatDate(value, { day: "numeric", month: "short" })
            }
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(value) =>
                  formatDate(String(value), {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                }
              />
            }
          />
          <Area
            dataKey="count"
            type="monotone"
            stroke="var(--color-count)"
            fill="var(--color-count)"
            fillOpacity={0.16}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ChartContainer>
      <p className="sr-only" aria-live="polite">
        Показаны заявки за {rangeLabel}.
      </p>
    </section>
  );
}
