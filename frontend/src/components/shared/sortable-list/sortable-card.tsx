import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ReactNode } from "react";
import { ActiveSwitch } from "../active-switch";

interface SortableCardItem {
  id: string;
  isActive: boolean;
}

type SortableCardProps<T extends SortableCardItem> = {
  item: T;
  dragHandle: ReactNode;
  children: ReactNode;
  onSwitch?: (checked: boolean) => Promise<void> | void;
  switchDisabled?: boolean;
  switchLabel?: string;
  activeDescription?: string;
  inactiveDescription?: string;
  statusLabel?: string;
  status?: ReactNode;
  actionsMenu?: ReactNode;
};

export function SortableCard<T extends SortableCardItem>({
  item,
  dragHandle,
  children,
  onSwitch,
  switchDisabled,
  switchLabel,
  activeDescription = "Отображается на сайте",
  inactiveDescription = "Временно не отображается на сайте",
  statusLabel = "Статус",
  status,
  actionsMenu,
}: SortableCardProps<T>) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 text-left">{children}</div>

          <div className="shrink-0">{dragHandle}</div>
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {onSwitch && (
            <ActiveSwitch
              checked={item.isActive}
              onChange={onSwitch}
              disabled={switchDisabled}
              label={switchLabel}
            />
          )}
          {status && (
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-medium leading-4">
                <span>{statusLabel}</span>
                {status}
              </div>
              {onSwitch && (
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {item.isActive ? activeDescription : inactiveDescription}
                </div>
              )}
            </div>
          )}
        </div>

        {actionsMenu}
      </CardFooter>
    </Card>
  );
}
