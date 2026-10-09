"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SidebarItem } from "./types/app-sidebar.types";
import { cn } from "cn";

function NavGroup({
  item,
  isActive,
  isPathActive,
  onNavigate,
}: {
  item: SidebarItem;
  isActive: boolean;
  isPathActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(isActive || item.isActive === true);

  return (
    <Collapsible
      key={item.title}
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip={item.title} isActive={isActive} />}
      >
        {item.icon && <item.icon />}
        <span>{item.title}</span>
        <ChevronRight
          className={cn([
            "ml-auto",
            "transition-transform",
            "duration-200",
            "group-data-[open]/collapsible:rotate-90",
          ])}
        />{" "}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {(item.items ?? []).map((child) =>
            child.href ? (
              <SidebarMenuSubItem key={child.title}>
                <SidebarMenuSubButton
                  isActive={isPathActive(child.href)}
                  render={
                    <Link href={child.href} onClick={onNavigate}>
                      {child.title}
                    </Link>
                  }
                />
              </SidebarMenuSubItem>
            ) : null,
          )}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function NavMain({ items }: { items: SidebarItem[] }) {
  const currentPathname = usePathname();
  const pathname = currentPathname.replace(/^\/[^/]+(?=\/admin(?:\/|$))/, "");
  const { isMobile, setOpenMobile } = useSidebar();
  const isPathActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
  const closeMobileSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const children = item.items ?? [];
          const hasChildren = children.length > 0;
          const isActive = hasChildren
            ? children.some((child) => child.href && isPathActive(child.href))
            : item.href
              ? isPathActive(item.href)
              : false;

          if (!hasChildren) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive}
                  disabled={!item.href}
                  render={
                    item.href ? (
                      <Link href={item.href} onClick={closeMobileSidebar} />
                    ) : undefined
                  }
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <NavGroup
              key={`${item.title}-${isActive}`}
              item={item}
              isActive={isActive}
              isPathActive={isPathActive}
              onNavigate={closeMobileSidebar}
            />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
