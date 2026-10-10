import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/providers/auth-provider";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
