import { AuthUser } from "@/features/auth/types/auth.types";
import { LucideIcon } from "lucide-react";

export type SidebarItem = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  roles: readonly AuthUser["role"][];
  isActive?: boolean;
  items?: SidebarItem[];
}