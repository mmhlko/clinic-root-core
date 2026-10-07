import { Skeleton } from "@/components/ui/skeleton";

export function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Загрузка дашборда"
      className="mx-auto w-full max-w-7xl space-y-6"
    >
      <header className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-36 max-w-full" />
          </div>
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 rounded-lg border p-4 sm:p-6">
          <Skeleton className="h-5 w-44" />
          <div className="flex h-56 items-end gap-3 border-b px-2">
            {[40, 65, 48, 80, 58, 92, 70, 52].map((height, index) => (
              <Skeleton
                key={index}
                className="flex-1 rounded-t-sm rounded-b-none"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-lg border p-4 sm:p-6">
          <Skeleton className="h-5 w-40" />
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-3 border-b pb-3 last:border-0">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="space-y-4 rounded-lg border p-4 sm:p-6">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-40 w-full" />
          </div>
        ))}
      </section>
    </main>
  );
}