import { Building2, Mail, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type {
  AdminUser,
  UserRole,
} from "@/features/content/types/content.types";
import { cn } from "cn";
import { activityColorsStyles } from "@/shared/constants/colors";

interface UserProfileCardProps {
  user: AdminUser;
  isOwnProfile: boolean
}

const roleLabels: Record<UserRole, string> = {
  root: "Суперадминистратор",
  admin: "Администратор",
  manager: "Менеджер",
};

const roleVariants: Record<
  UserRole,
  "default" | "secondary" | "outline"
> = {
  root: "default",
  admin: "secondary",
  manager: "outline",
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function UserProfileCard({
  user,
  isOwnProfile = false
}: UserProfileCardProps) {
  const location = user.location

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-20 shrink-0 rounded-xl">
            <AvatarImage
              src={user.photoMedia?.url ?? undefined}
              alt={fullName}
            />
            <AvatarFallback className="rounded-xl text-xl font-semibold">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                {fullName}
              </h1>

              <Badge variant={roleVariants[user.role]}>
                {roleLabels[user.role]}
                {isOwnProfile ? ", это вы" : ""}
              </Badge>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>

          <Badge
            className={cn(
              "self-start sm:self-center",
              activityColorsStyles[user.isActive ? "active" : "inactive"]
            )}
          >
            {user.isActive ? "Активен" : "Неактивен"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="border-t pt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4" />
              Роль
            </div>

            <p className="mt-2 font-medium">
              {roleLabels[user.role]}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="size-4" />
              Филиал
            </div>

            <p className="mt-2 font-medium">
              {location?.name ?? "Не относится к филиалу"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}