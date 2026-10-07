"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PersonIdentityProps {
  name: string;
  subtitle: string;
  avatarUrl?: string;
  initials?: string;
}

export function PersonIdentity({
  name,
  subtitle,
  avatarUrl,
  initials,
}: PersonIdentityProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-10 shrink-0 rounded-full">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback>{initials || name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate font-medium">{name}</div>
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );
}
