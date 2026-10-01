import { Skeleton } from "@/components/ui/skeleton";

export default function RequestsLoading() {
  return (
    <main aria-busy="true" aria-label="Загрузка заявок" className="mx-auto w-full max-w-7xl space-y-5">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row"><Skeleton className="h-10 w-full sm:max-w-sm" /><Skeleton className="h-10 w-40" /></div>
      <div className="space-y-3 md:hidden">{[0, 1, 2].map((item) => <div key={item} className="space-y-3 rounded-lg border p-4"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-9 w-32" /></div>)}</div>
      <div className="hidden space-y-px rounded-lg border p-1 md:block">{[0, 1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-16 rounded-md" />)}</div>
    </main>
  );
}
