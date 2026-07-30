import { lazy } from "react";
import { AdminDashboardPage } from "../../admin/pages/AdminDashboardPage";
import { useAuth } from "../../auth/hooks/useAuth";
import { UserDashboardPage } from "../../user/pages/UserDashboardPage";
import { PharmacyDashboardPage } from "../../pharmacy/pages/PharmacyDashboardPage";
import { OrganizationDashboardPage } from "../../organization/pages/OrganizationDashboardPage";
import { getPrimaryRole } from "../../../shared/config/roles";

const SupplyChainWorkspacePage = lazy(() =>
  import("../../supply-chain/pages/SupplyChainWorkspacePage").then(
    (module) => ({
      default: module.SupplyChainWorkspacePage,
    }),
  ),
);

export function DashboardIndexPage() {
  const { user } = useAuth();
  const role = getPrimaryRole(user.roles);
  if (role === "Admin") return <AdminDashboardPage />;
  if (role === "Pharmacy") return <PharmacyDashboardPage />;
  if (role === "Organization") return <OrganizationDashboardPage />;
  if (role === "Warehouse" || role === "Representative")
    return <SupplyChainWorkspacePage />;
  return <UserDashboardPage />;
}
