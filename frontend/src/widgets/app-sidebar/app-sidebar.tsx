"use client";

import * as React from "react";
import {
  BriefcaseMedical,
  FileText,
  HelpCircle,
  LayoutGrid,
  MessageSquareText,
  Star,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { AuthUser } from "@/features/auth/types/auth.types";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { useRouter } from "next/navigation";

const navItems = [
  {
    title: "Дашборд",
    href: "/admin",
    icon: LayoutGrid,
    roles: ["root", "admin", "manager"] as const,
  },
  {
    title: "Заявки",
    href: "/admin/requests",
    icon: FileText,
    roles: ["root", "admin", "manager"] as const,
  },
  {
    title: "Врачи",
    href: "/admin/doctors",
    icon: Stethoscope,
    roles: ["root", "admin", "manager"] as const,
  },
  {
    title: "Услуги",
    icon: BriefcaseMedical,
    roles: ["root", "admin", "manager"] as const,
    isActive: true,
    items: [
      { title: "Направления услуг", href: "/admin/directions" },
      { title: "Виды услуг", href: "/admin/services" },
    ],
  },
  {
    title: "Акции",
    href: "/admin/promotions",
    icon: MessageSquareText,
    roles: ["root", "admin", "manager"] as const,
  },
  {
    title: "Отзывы",
    href: "/admin/reviews",
    icon: Star,
    roles: ["root", "admin", "manager"] as const,
  },
  {
    title: "Документы",
    href: "/admin/documents",
    icon: FileText,
    roles: ["root", "admin", "manager"] as const,
  },
  {
    title: "FAQ",
    href: "/admin/faq",
    icon: HelpCircle,
    roles: ["root", "admin", "manager"] as const,
  },
  {
    title: "Пользователи",
    href: "/admin/users",
    icon: Users,
    roles: ["root", "admin"] as const,
  },
  {
    title: "Настройки",
    href: "/admin/settings",
    icon: Settings,
    roles: ["root", "admin"] as const,
  },
];

type AppSidebarProps = {
  user: AuthUser;
};

export function AppSidebar({
  user,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { logout, user: authUser } = useAuth();
  const currentUser = authUser ?? user;
  const visibleNavItems = navItems.filter(({ roles }) =>
    roles.some((role) => role === currentUser.role),
  );
  const handleLogout = async () => {
    await logout().catch(() => undefined);
    router.replace("/admin/login");
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white">
            УД
          </div>
          <div>
            <div className="text-lg font-semibold">УльтраДент</div>
            <div className="text-xs text-slate-500">Администрация</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} onLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
