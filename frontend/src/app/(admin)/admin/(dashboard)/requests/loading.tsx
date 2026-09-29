export default function RequestsLoading() {
  return (
    <div aria-busy="true" className="mx-auto w-full space-y-5">
      <div className="h-14 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-10 animate-pulse rounded-lg bg-muted" />
      <div className="h-96 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
