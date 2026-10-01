"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    href?: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      href: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const isPathActive = (href: string) =>
    pathname === href ||
    (href !== "/admin" && pathname.startsWith(`${href}/`));

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const children = item.items ?? [];
          const hasChildren = children.length > 0;
          const isActive = hasChildren
            ? children.some((child) => isPathActive(child.href))
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
                  render={item.href ? <Link href={item.href} /> : undefined}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              defaultOpen={isActive || item.isActive}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton tooltip={item.title} isActive={isActive} />
                }
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {children.map((child) => (
                    <SidebarMenuSubItem key={child.title}>
                      <SidebarMenuSubButton
                        isActive={isPathActive(child.href)}
                        render={<Link href={child.href}>{child.title}</Link>}
                      />
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}