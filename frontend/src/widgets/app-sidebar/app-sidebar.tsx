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
import { SidebarItem } from "./types/app-sidebar.types";


const navItems: SidebarItem[] = [
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
      { title: "Направления услуг", href: "/admin/directions", roles: ["root", "admin", "manager"] as const },
      { title: "Виды услуг", href: "/admin/services", roles: ["root", "admin", "manager"] as const },
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
    // href: "/admin/settings",
    icon: Settings,
    roles: ["root", "admin", "manager"] as const,
    items: [
      { title: "Общие", href: "/admin/settings/general", roles: ["root", "admin", "manager"] as const },
      { title: "Филиалы", href: "/admin/settings/branches", roles: ["root", "admin", "manager"] as const },
      { title: "Соцсети", href: "/admin/settings/socials", roles: ["root", "admin", "manager"] as const },
      { title: "Преимущества", href: "/admin/settings/benefits", roles: ["root", "admin", "manager"] as const },
      { title: "Статистика", href: "/admin/settings/stats", roles: ["root", "admin", "manager"] as const },
    ],
  },
];

type AppSidebarProps = {
  user: AuthUser;
};

function filterVisibleItems(
  items: SidebarItem[],
  role: AuthUser["role"],
): SidebarItem[] {
  return items
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      ...item,
      items: item.items ? filterVisibleItems(item.items, role) : undefined,
    }))
    .filter((item) => item.href || item.items?.length);
}

export function AppSidebar({
  user,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { logout, user: authUser } = useAuth();
  const currentUser = authUser ?? user;
  const visibleNavItems = filterVisibleItems(navItems, currentUser.role);
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
