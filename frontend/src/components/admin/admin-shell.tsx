"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bell,
  BriefcaseMedical,
  CircleUserRound as ProfileIcon,
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
  DropdownMenuGroup,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Дашборд", href: "/admin", icon: LayoutGrid, roles: ["root", "admin", "manager"] as const },
  { label: "Заявки", href: "/admin/requests", icon: FileText , roles: ["root", "admin", "manager"] as const },
  { label: "Врачи", href: "/admin/doctors", icon: Stethoscope , roles: ["root", "admin", "manager"] as const },
  { label: "Услуги", href: "/admin/services", icon: BriefcaseMedical , roles: ["root", "admin", "manager"] as const },
  { label: "Направления", href: "/admin/directions", icon: Sparkles , roles: ["root", "admin", "manager"] as const },
  { label: "Акции", href: "/admin/promotions", icon: MessageSquareText , roles: ["root", "admin", "manager"] as const },
  { label: "Отзывы", href: "/admin/reviews", icon: MessageSquareText , roles: ["root", "admin", "manager"] as const },
  { label: "Документы", href: "/admin/documents", icon: FileText , roles: ["root", "admin", "manager"] as const },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle , roles: ["root", "admin", "manager"] as const },
  { label: "Пользователи", href: "/admin/users", icon: Users, roles: ["root", "admin"] as const },
  { label: "Настройки", href: "/admin/settings", icon: Settings, roles: ["root", "admin"] as const },
];

type AdminShellProps = {
  user: AuthUser;
  children: React.ReactNode;
};

type SidebarUserMenuProps = {
  user: AuthUser;
  onLogout: () => void;
};

const roleLabels: Record<string, string> = {
  root: "Супер администратор",
  admin: "Администратор",
  manager: "Менеджер",
};

function SidebarUserMenu({ user, onLogout }: SidebarUserMenuProps) {
  const fullName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-auto w-full justify-start gap-3 px-2 py-2 text-left"
          >
            <Avatar className="h-9 w-9 shrink-0 rounded-full">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={fullName} />
              <AvatarFallback>
                {user.firstName?.[0] ?? "A"}
                {user.lastName?.[0] ?? ""}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-900">
                {fullName}
              </span>
              <span className="block truncate text-xs text-slate-500">
                {roleLabels[user.role] ?? user.role}
              </span>
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block truncate">{user.email}</span>
            <span className="mt-1 block font-normal text-muted-foreground">
              {roleLabels[user.role] ?? user.role}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<Link href="/admin/profile" />}
          className="cursor-pointer"
        >
          <ProfileIcon className="h-4 w-4" />
          Профиль
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          <LogOut className="h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNavItems = useMemo(() => navItems.filter((item) => !item.roles || item.roles.includes(user.role)), [user.role]);

  const currentSection = useMemo(() => {
    if (pathname === "/admin") {
      return "Дашборд";
    }
    if (pathname === "/admin/profile") {
      return "Профиль";
    }

    const match = visibleNavItems.find((item) => item.href !== "/admin" && pathname.startsWith(`${item.href}/`)) ?? visibleNavItems.find((item) => item.href === pathname);
    return match?.label ?? "Дашборд";
  }, [pathname, visibleNavItems]);

  const handleLogout = async () => {
    await logout().catch(() => undefined);
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-dvh max-h-dvh w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
              УД
            </div>
            <div>
              <div className="text-lg font-semibold">УльтраДент</div>
              <div className="text-xs text-slate-500">Администрация</div>
            </div>
          </div>
          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-4">
            {visibleNavItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-200 p-3">
            <SidebarUserMenu user={user} onLogout={handleLogout} />
          </div>
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
                  {mobileOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {currentSection}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Уведомления"
                  disabled
                >
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-72 flex-col p-0 lg:hidden">
          <SheetHeader className="border-b border-slate-200">
            <SheetTitle>УльтраДент · Администрация</SheetTitle>
          </SheetHeader>
          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-4">
            {visibleNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === href
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-200 p-3">
            <SidebarUserMenu user={user} onLogout={handleLogout} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
