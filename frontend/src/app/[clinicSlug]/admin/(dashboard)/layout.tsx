import { AuthProvider } from "@/features/auth/providers/auth-provider";
import { requireUserSession } from "@/features/auth/api/require-admin-session";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/widgets/app-sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";
import { publicServerApi } from "@/features/api/public-server-api";
import { redirect } from "next/navigation";

export default async function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const session = await requireUserSession(
    `/${encodeURIComponent(clinicSlug)}/admin/login`,
  );

  if (session.user.role !== "root") {
    const ownClinicSlug = session.user.clinicSlug;
    if (!ownClinicSlug) {
      redirect(`/${encodeURIComponent(clinicSlug)}/admin/login`);
    }
    if (clinicSlug !== ownClinicSlug) {
      redirect(`/${encodeURIComponent(ownClinicSlug)}/admin`);
    }
  }

  const clinic = await publicServerApi.clinic(clinicSlug);

  return (
    <AuthProvider initialUser={session.user}>
      {/* <AdminShell user={session.user}>{children}</AdminShell> */}
      <SidebarProvider
      >
        <AppSidebar user={session.user} clinic={clinic}></AppSidebar>
        <SidebarInset className="p-4 sm:p-6">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 "
              />
              <AdminBreadcrumbs />
            </div>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
