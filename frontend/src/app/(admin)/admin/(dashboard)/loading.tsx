export default function DashboardLoading() {
  return (
    <main aria-busy="true" aria-label="Загрузка дашборда" className="mx-auto w-full max-w-7xl space-y-8">
      <section className="space-y-4">
        <div className="h-7 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </section>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
      </div>
    </main>
  );
}
