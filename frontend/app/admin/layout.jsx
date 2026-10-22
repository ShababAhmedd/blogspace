import DashboardShell from "@/components/DashboardShell";
import { RequireAdmin } from "@/components/RouteGuards";

export default function AdminLayout({ children }) {
  return (
    <DashboardShell>
      <RequireAdmin>{children}</RequireAdmin>
    </DashboardShell>
  );
}
