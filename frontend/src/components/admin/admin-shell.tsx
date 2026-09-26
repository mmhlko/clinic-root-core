"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bell,
  BriefcaseMedical,
  FileText,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  Sparkles,
  Stethoscope,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/features/auth/providers/auth-provider";
import type { AuthUser } from "@/features/auth/types/auth.types";

const navItems = [
  { label: "Дашборд", href: "/admin", icon: LayoutGrid },
  { label: "Заявки", href: "/admin/requests", icon: FileText },
  { label: "Врачи", href: "/admin/doctors", icon: Stethoscope },
  { label: "Услуги", href: "/admin/services", icon: BriefcaseMedical },
  { label: "Направления", href: "/admin/directions", icon: Sparkles },
  { label: "Акции", href: "/admin/promotions", icon: MessageSquareText },
  { label: "Отзывы", href: "/admin/reviews", icon: MessageSquareText },
  { label: "Документы", href: "/admin/documents", icon: FileText },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { label: "Пользователи", href: "/admin/users", icon: Users },
  { label: "Настройки", href: "/admin/settings", icon: Settings },
];

type AdminShellProps = {
  user: AuthUser;
  children: React.ReactNode;
};

const roleLabels: Record<string, string> = {
  root: "Супер администратор",
  admin: "Администратор",
  manager: "Менеджер",
};

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentSection = useMemo(() => {
    if (pathname === "/admin") {
      return "Дашборд";
    }

    const match = navItems.find((item) => pathname.startsWith(item.href));
    return match?.label ?? "Дашборд";
  }, [pathname]);

  const handleLogout = async () => {
    await logout().catch(() => undefined);
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
              УД
            </div>
            <div>
              <div className="text-lg font-semibold">УльтраДент</div>
              <div className="text-xs text-slate-500">Администрация</div>
            </div>
          </div>
          <nav className="space-y-1 p-4">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setMobileOpen((value) => !value)}
                  aria-label="Меню"
                >
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Клиника</p>
                  <h1 className="text-xl font-semibold text-slate-900">{currentSection}</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" aria-label="Уведомления" disabled>
                  <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" className="h-auto gap-3 rounded-full px-2 py-1.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                          {user.firstName?.[0] ?? "A"}
                          {user.lastName?.[0] ?? ""}
                        </span>
                        <span className="hidden text-left sm:block">
                          <span className="block text-sm font-medium text-slate-900">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {roleLabels[user.role] ?? user.role}
                          </span>
                        </span>
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <span className="block truncate">{user.email}</span>
                      <span className="mt-1 block font-normal text-muted-foreground">
                        {roleLabels[user.role] ?? user.role}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => void handleLogout()}>
                      <LogOut className="h-4 w-4" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0 lg:hidden">
          <SheetHeader className="border-b border-slate-200">
            <SheetTitle>УльтраДент · Администрация</SheetTitle>
          </SheetHeader>
          <nav className="space-y-1 p-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === href ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
