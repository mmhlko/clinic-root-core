import { Skeleton } from "@/components/ui/skeleton";

type AdminPageLoadingProps = {
  variant?: "list" | "form";
};

export function AdminPageLoading({ variant = "list" }: AdminPageLoadingProps) {
  return (
    <main
      aria-busy="true"
      aria-label="Загрузка страницы"
      className="mx-auto w-full max-w-7xl space-y-6"
    >
      <header className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </header>

      {variant === "form" ? (
        <div className="space-y-5">
          {[0, 1, 2].map((section) => (
            <section key={section} className="space-y-4 rounded-lg border p-4 sm:p-6">
              <Skeleton className="h-5 w-40" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                {section === 0 && <Skeleton className="h-24 sm:col-span-2" />}
              </div>
            </section>
          ))}
          <Skeleton className="h-10 w-32" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-10 w-full sm:max-w-sm" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-3 md:hidden">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="space-y-3 rounded-lg border p-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
          <div className="hidden overflow-hidden rounded-lg border md:block">
            <div className="space-y-px bg-border">
              <Skeleton className="h-11 rounded-none" />
              {[0, 1, 2, 3, 4].map((item) => (
                <Skeleton key={item} className="h-14 rounded-none" />
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}