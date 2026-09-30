import { cn } from "cn";
import { Users } from "lucide-react";

type StatsProps = {
  total: number;
  active: number;
  inactive: number;
};

export const ListStats = ({
  total,
  active,
  inactive,
}: StatsProps) => {
  return (
    <div className={cn(
      "rounded-2xl px-5 py-4 md:px-8 md:py-5",
      "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 border"
    )}>
      <div className="grid grid-cols-3">
        {/* Total */}
        <div className="flex items-center gap-3 pr-4 md:gap-4 md:pr-8">
          <div className="flex size-9 shrink-0 items-center justify-center text-muted-foreground md:size-10">
            <Users className="size-6 md:size-7" />
          </div>

          <div className="min-w-0">
            <div className="text-xs text-muted-foreground md:text-sm">
              Всего
            </div>

            <div className="mt-0.5 text-lg font-semibold tracking-tight md:text-2xl">
              {total}
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center gap-3 border-l pl-4 md:gap-4 md:px-8">
          <span className="size-2.5 shrink-0 rounded-full bg-emerald-500" />

          <div className="min-w-0">
            <div className="text-xs text-muted-foreground md:text-sm">
              Активные
            </div>

            <div className="mt-0.5 text-lg font-semibold tracking-tight md:text-2xl">
              {active}
            </div>
          </div>
        </div>

        {/* Inactive */}
        <div className="flex items-center gap-3 border-l pl-4 md:gap-4 md:px-8">
          <span className="size-2.5 shrink-0 rounded-full bg-slate-400" />

          <div className="min-w-0">
            <div className="text-xs text-muted-foreground md:text-sm">
              Скрытые
            </div>

            <div className="mt-0.5 text-lg font-semibold tracking-tight md:text-2xl">
              {inactive}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}