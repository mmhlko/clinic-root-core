export default function DoctorsLoading() {
  return (
    <div aria-busy="true" className="mx-auto w-full max-w-5xl space-y-5">
      <div className="h-16 animate-pulse rounded-lg bg-muted" />
      {[0, 1, 2, 3].map((section) => (
        <div key={section} className="h-48 animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  );
}
