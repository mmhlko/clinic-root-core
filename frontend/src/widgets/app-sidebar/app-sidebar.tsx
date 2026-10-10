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
  Building2,
  ArrowLeftIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { AuthUser } from "@/features/auth/types/auth.types";
import { useAuth } from "@/features/auth/providers/auth-provider";
import { useRouter } from "next/navigation";
import { SidebarItem } from "./types/app-sidebar.types";
import { Clinic } from "@/features/content/types/content.types";
import Link from "next/link";


const navItems: SidebarItem[] = [
  {
    title: "Клиники",
    href: "/admin/clinics",
    icon: Building2,
    roles: ["root"] as const,
  },
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
  clinic: Clinic
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

function scopeItemsToClinic(items: SidebarItem[], clinicSlug: string): SidebarItem[] {
  return items.map((item) => ({
    ...item,
    href: item.href ? `/${encodeURIComponent(clinicSlug)}${item.href}` : undefined,
    items: item.items ? scopeItemsToClinic(item.items, clinicSlug) : undefined,
  }));
}

export function AppSidebar({
  user,
  clinic,
  ...props
}: AppSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { logout, user: authUser } = useAuth();
  const currentUser = authUser ?? user;
  const contextualNavItems = clinic.isSystemDemo
    ? navItems
    : navItems.filter((item) => item.href !== "/admin/clinics");
  const visibleNavItems = scopeItemsToClinic(
    filterVisibleItems(contextualNavItems, currentUser.role),
    clinic.slug,
  );
  const handleLogout = async () => {
    await logout().catch(() => undefined);
    router.replace(`/${encodeURIComponent(clinic.slug)}/admin/login`);
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          {currentUser.role === "root" && !clinic.isSystemDemo && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Вернуться в платформу"
                render={
                  <Link href="/demo/admin">
                    <ArrowLeftIcon />
                    <span>В платформу</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={
                <Link href={`/${encodeURIComponent(clinic.slug)}/admin`}>
                  <Stethoscope className="size-5!" />
                  <span className="text-base font-semibold text-wrap capitalize">{clinic.slug}</span>
                </Link>
              }
            ></SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
