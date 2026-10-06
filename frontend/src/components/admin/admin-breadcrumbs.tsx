"use client";

import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Crumb = {
  label: string;
  href?: string;
};

const dashboardCrumb: Crumb = { label: "Дашборд", href: "/admin" };

const pageCrumbs: Record<string, Crumb[]> = {
  "/admin": [{ label: "Дашборд" }],
  "/admin/requests": [dashboardCrumb, { label: "Заявки" }],
  "/admin/doctors": [dashboardCrumb, { label: "Врачи" }],
  "/admin/doctors/new": [
    dashboardCrumb,
    { label: "Врачи", href: "/admin/doctors" },
    { label: "Новый врач" },
  ],
  "/admin/services": [dashboardCrumb, { label: "Услуги" }],
  "/admin/directions": [
    dashboardCrumb,
    { label: "Услуги", href: "/admin/services" },
    { label: "Направления" },
  ],
  "/admin/promotions": [dashboardCrumb, { label: "Акции" }],
  "/admin/reviews": [dashboardCrumb, { label: "Отзывы" }],
  "/admin/documents": [dashboardCrumb, { label: "Документы" }],
  "/admin/faq": [dashboardCrumb, { label: "FAQ" }],
  "/admin/users": [dashboardCrumb, { label: "Пользователи" }],
  "/admin/users/new": [
    dashboardCrumb,
    { label: "Пользователи", href: "/admin/users" },
    { label: "Новый пользователь" },
  ],
  "/admin/settings": [
    dashboardCrumb,
    { label: "Настройки клиники" },
  ],
  "/admin/settings/general": [
    dashboardCrumb,
    { label: "Настройки клиники", href: "/admin/settings/general" },
    { label: "Общие" },
  ],
  "/admin/settings/branches": [
    dashboardCrumb,
    { label: "Настройки клиники", href: "/admin/settings/general" },
    { label: "Филиалы" },
  ],
  "/admin/settings/socials": [
    dashboardCrumb,
    { label: "Настройки клиники", href: "/admin/settings/general" },
    { label: "Соцсети" },
  ],
  "/admin/settings/benefits": [
    dashboardCrumb,
    { label: "Настройки клиники", href: "/admin/settings/general" },
    { label: "Преимущества" },
  ],
  "/admin/settings/stats": [
    dashboardCrumb,
    { label: "Настройки клиники", href: "/admin/settings/general" },
    { label: "Статистика" },
  ],
  "/admin/profile": [dashboardCrumb, { label: "Профиль" }],
};

function getCrumbs(pathname: string): Crumb[] {
  const exactMatch = pageCrumbs[pathname];
  if (exactMatch) return exactMatch;

  if (pathname.startsWith("/admin/doctors/") && pathname.endsWith("/edit")) {
    return [
      dashboardCrumb,
      { label: "Врачи", href: "/admin/doctors" },
      { label: "Редактирование врача" },
    ];
  }

  const userDetailsMatch = pathname.match(/^\/admin\/users\/([^/]+)$/);
  if (userDetailsMatch && userDetailsMatch[1] !== "new") {
    return [
      dashboardCrumb,
      { label: "Пользователи", href: "/admin/users" },
      { label: "Пользователь" },
    ];
  }

  const userEditMatch = pathname.match(/^\/admin\/users\/([^/]+)\/edit$/);
  if (userEditMatch) {
    return [
      dashboardCrumb,
      { label: "Пользователи", href: "/admin/users" },
      {
        label: "Пользователь",
        href: `/admin/users/${userEditMatch[1]}`,
      },
      { label: "Редактирование" },
    ];
  }

  return [dashboardCrumb];
}

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const crumbs = getCrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-2 text-sm">
        {crumbs.map((crumb, index) => {
          const isCurrent = index === crumbs.length - 1;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isCurrent || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}