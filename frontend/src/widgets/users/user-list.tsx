"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ActiveSwitch } from "@/components/shared/active-switch";
import { ContentList } from "@/widgets/admin-content/content-list";
import {
  ContentActionsMenu,
  type ContentMenuAction,
} from "@/widgets/admin-content/content-actions-menu";
import { PersonIdentity } from "@/components/shared/person-identity";
import { SortableCard } from "@/components/shared/sortable-list/sortable-card";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { contentClientApi } from "@/features/content/api/content-client-api";
import type {
  AdminUser,
  UserRole,
} from "@/features/content/types/content.types";
import { getContentApiErrorMessage } from "@/widgets/admin-content/content-api-error";
import { getImageUrl } from "@/shared/helpers/getImageUrl";
import { activityColorsStyles } from "@/shared/constants/colors";

interface UserListProps {
  users: AdminUser[];
  currentRole: UserRole;
  currentUserId: string;
}

const roleLabels: Record<UserRole, string> = {
  root: "Суперадминистратор",
  admin: "Администратор",
  manager: "Менеджер",
};

function getUserName(user: AdminUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
}

export function UserList({
  users: initialUsers,
  currentRole,
  currentUserId,
}: UserListProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleActive(user: AdminUser, isActive: boolean) {
    setBusyId(user.id);
    setUsers((current) =>
      current.map((item) => (item.id === user.id ? { ...item, isActive } : item)),
    );
    try {
      const result = await contentClientApi.setUserActive(user.id, isActive);
      setUsers((current) =>
        current.map((item) => (item.id === result.id ? result : item)),
      );
    } catch (cause: unknown) {
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, isActive: user.isActive } : item,
        ),
      );
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(
          cause,
          "Не удалось изменить статус пользователя.",
        ),
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(user: AdminUser) {
    setBusyId(user.id);
    try {
      await contentClientApi.deleteUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      toast.add({
        type: "success",
        description: "Пользователь удалён.",
      });
    } catch (cause: unknown) {
      toast.add({
        type: "error",
        description: getContentApiErrorMessage(
          cause,
          "Не удалось удалить пользователя.",
        ),
      });
    } finally {
      setBusyId(null);
    }
  }

  function canEdit(user: AdminUser) {
    return currentRole === "root" ||
      user.id === currentUserId ||
      (currentRole === "admin" && user.role === "manager");
  }

  function canManage(user: AdminUser) {
    return user.id !== currentUserId &&
      (currentRole === "root" ||
        (currentRole === "admin" && user.role === "manager"));
  }

  function getUserActions(user: AdminUser): ContentMenuAction<AdminUser>[] {
    return [
      {
        label: "Просмотреть",
        onSelect: (item) => router.push(`/admin/users/${item.id}`),
      },
      {
        label: "Редактировать",
        disabled: !canEdit(user) || busyId === user.id,
        onSelect: (item) => router.push(`/admin/users/${item.id}/edit`),
      },
      {
        label: "Удалить",
        destructive: true,
        disabled: !canManage(user) || busyId === user.id,
        onSelect: remove,
        confirm: {
          title: "Удалить пользователя?",
          description: `${getUserName(user)} будет удалён без возможности восстановления.`,
        },
      },
    ];
  }

  function userMenu(user: AdminUser) {
    return (
      <ContentActionsMenu
        item={user}
        itemLabel={getUserName(user)}
        actions={getUserActions(user)}
      />
    );
  }

  function identity(user: AdminUser) {
    const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;
    return (
      <PersonIdentity
        name={getUserName(user)}
        subtitle={roleLabels[user.role]}
        avatarUrl={getImageUrl(user.avatarUrl)}
        initials={initials || user.email[0]?.toUpperCase() || "П"}
      />
    );
  }

  function statusSwitch(user: AdminUser) {
    return (
      <ActiveSwitch
        checked={user.isActive}
        disabled={!canManage(user) || busyId === user.id}
        onChange={(isActive) => toggleActive(user, isActive)}
        label={user.isActive ? "Активен" : "Неактивен"}
      />
    );
  }

  return (
    <div className="space-y-3">
      <ContentList
        title="Пользователи"
        items={users}
        setItems={setUsers}
        getId={(user) => user.id}
        getSearchText={(user) =>
          `${getUserName(user)} ${user.email} ${roleLabels[user.role]}`
        }
        onAdd={() => router.push("/admin/users/new")}
        columnCount={3}
        emptyMessage="Пользователей пока нет."
        renderHeader={() => (
          <TableRow>
            <TableHead>Пользователь</TableHead>
            <TableHead>Статус активности</TableHead>
            <TableHead className="w-12 text-right">
              <span className="sr-only">Действия</span>
            </TableHead>
          </TableRow>
        )}
        renderCells={(user) => (
          <>
            <TableCell>{identity(user)}</TableCell>
            <TableCell>{statusSwitch(user)}</TableCell>
            <TableCell className="text-right">{userMenu(user)}</TableCell>
          </>
        )}
        renderCard={(user, dragHandle) => (
          <SortableCard
            item={user}
            dragHandle={dragHandle}
            actions={getUserActions(user)}
            onSwitch={(isActive) => toggleActive(user, isActive)}
            switchDisabled={!canManage(user) || busyId === user.id}
            switchLabel={`Активность пользователя: ${getUserName(user)}`}
            activeDescription="Учетная запись активна"
            inactiveDescription="Учетная запись неактивна"
            itemLabel={getUserName(user)}
            status={
              <Badge
                className={
                  activityColorsStyles[user.isActive ? "active" : "inactive"]
                }
              >
                {user.isActive ? "Активен" : "Скрыт"}
              </Badge>
            }
          >
            <button
              className="w-full text-left"
              onClick={() => router.push(`/admin/users/${user.id}`)}
            >
              {identity(user)}
            </button>
            <div className="mt-2 truncate text-sm text-muted-foreground">
              {user.email}
            </div>
          </SortableCard>
        )}
      />
    </div>
  );
}
