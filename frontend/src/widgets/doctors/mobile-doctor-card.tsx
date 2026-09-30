import { ActiveSwitch } from "@/components/shared/active-switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DoctorListItem } from "@/features/doctors/types/doctors.types";
import { activityColorsStyles } from "@/shared/constants/colors";
import { getDoctorFullName } from "@/shared/helpers/getDoctorFullName";
import { getImageUrl } from "@/shared/helpers/getImageUrl";
import { Separator } from "@base-ui/react";
import { cn } from "cn";
import { ReactNode } from "react";

interface MobileDoctorCardProps {
  doctor: DoctorListItem;
  onSwitch: (id: string, isActive: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  deleting: boolean;
  dragHandle: ReactNode;
  menu: ReactNode
}

export const MobileDoctorCard = ({
  doctor,
  onSwitch,
  dragHandle,
  menu
}: MobileDoctorCardProps) => {
  const avatarUrl = getImageUrl(doctor.photoMedia?.url);

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="size-14 shrink-0">
            <AvatarImage
              src={avatarUrl}
              alt={getDoctorFullName(doctor)}
            />

            <AvatarFallback className="text-sm">
              {doctor.firstName?.[0] ?? "В"}
              {doctor.lastName?.[0] ?? ""}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="text-sm font-semibold leading-5">
              {getDoctorFullName(doctor)}
            </div>

            <div className="mt-0.5 truncate text-sm text-muted-foreground">
              {doctor.specialization}
            </div>

            <Badge
              variant={doctor.isActive ? "default" : "secondary"}
              className={cn(
                "mt-2 h-6 px-2 text-xs",
                activityColorsStyles[doctor.isActive ? "active" : "inactive"]
              )}
            >
              <span
                className={
                  doctor.isActive
                    ? "size-1.5 rounded-full bg-current"
                    : "size-1.5 rounded-full bg-muted-foreground"
                }
              />
              {doctor.isActive ? "Активен" : "Скрыт"}
            </Badge>
          </div>

          {/* Drag */}
          <div className="shrink-0">
            {dragHandle}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Footer */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <ActiveSwitch
              checked={doctor.isActive}
              onChange={(checked) => onSwitch(doctor.id, checked)}
              label=""
            />

            <div className="min-w-0">
              <div className="text-sm font-medium leading-4">
                Статус врача
              </div>

              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                {doctor.isActive
                  ? "Активен и принимает пациентов"
                  : "Временно не принимает пациентов"}
              </div>
            </div>
          </div>

          {/* Menu */}
          {menu}
        </div>
      </CardContent>
    </Card>
  );
}