"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";

export function useClinicAdminPath() {
  const pathname = usePathname();
  const clinicSlug = pathname.match(/^\/([^/]+)\/admin(?:\/|$)/)?.[1] ?? "demo";

  return useCallback(
    (adminPath: string) => {
      const normalizedPath = adminPath.startsWith("/")
        ? adminPath
        : `/${adminPath}`;
      return `/${encodeURIComponent(clinicSlug)}${normalizedPath}`;
    },
    [clinicSlug],
  );
}
