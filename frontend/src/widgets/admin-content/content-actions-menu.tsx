"use client";

import { MoreHorizontalIcon } from "lucide-react";
import { Fragment } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ContentMenuAction<T> {
  label: string;
  onSelect: (item: T) => void | Promise<void>;
  disabled?: boolean;
  destructive?: boolean;
  confirm?: {
    title: string;
    description: string;
  };
}

interface ContentActionsMenuProps<T> {
  item: T;
  itemLabel: string;
  actions: ContentMenuAction<T>[];
}

export function ContentActionsMenu<T>({
  item,
  itemLabel,
  actions,
}: ContentActionsMenuProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Действия: ${itemLabel}`}
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => {
          const isDestructive = action.destructive ?? false;
          const previousAction = actions[index - 1];
          const needsSeparator =
            isDestructive && index > 0 && !previousAction?.destructive;

          return (
            <Fragment key={action.label}>
              {needsSeparator && <DropdownMenuSeparator />}
              {action.confirm ? (
                <ConfirmDialog
                  trigger={
                    <DropdownMenuItem
                      variant={isDestructive ? "destructive" : "default"}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  }
                  title={action.confirm.title}
                  description={action.confirm.description}
                  confirmText={action.label}
                  confirmButtonVariant={isDestructive ? "destructive" : "default"}
                  disabled={action.disabled}
                  onConfirm={() => action.onSelect(item)}
                />
              ) : (
                <DropdownMenuItem
                  variant={isDestructive ? "destructive" : "default"}
                  disabled={action.disabled}
                  onClick={() => void action.onSelect(item)}
                >
                  {action.label}
                </DropdownMenuItem>
              )}
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}