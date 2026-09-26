export default async function AdminHomePage() {

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Панель управления
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">
          Добро пожаловать, {/* {user.firstName ?? "администратор"} */}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Здесь собраны заявки, контент, сотрудники и параметры клиники. Используйте левое меню для навигации.
        </p>
      </section>
    </div>
  );
}
