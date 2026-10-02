"use client";

import { MoreHorizontalIcon } from "lucide-react";
import { Fragment, useState } from "react";

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
  const [pendingAction, setPendingAction] =
    useState<ContentMenuAction<T> | null>(null);

  return (
    <>
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
                <DropdownMenuItem
                  variant={isDestructive ? "destructive" : "default"}
                  disabled={action.disabled}
                  onClick={() => {
                    if (action.confirm) {
                      setPendingAction(action);
                    } else {
                      void action.onSelect(item);
                    }
                  }}
                >
                  {action.label}
                </DropdownMenuItem>
              </Fragment>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {pendingAction?.confirm && (
        <ConfirmDialog
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) setPendingAction(null);
          }}
          title={pendingAction.confirm.title}
          description={pendingAction.confirm.description}
          confirmText={pendingAction.label}
          confirmButtonVariant={
            pendingAction.destructive ? "destructive" : "default"
          }
          disabled={pendingAction.disabled}
          onConfirm={() => pendingAction.onSelect(item)}
        />
      )}
    </>
  );
}
