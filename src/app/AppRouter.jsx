import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import {
  ProtectedRoute,
  PublicOnlyRoute,
  RoleRoute,
} from "../features/auth/components/RouteGuards";
import { AdminApprovalsPage } from "../features/admin/pages/AdminApprovalsPage";
import { AdminOrganizationReviewPage } from "../features/admin/pages/AdminOrganizationReviewPage";
import { AdminHomeTickerPage } from "../features/admin/pages/AdminHomeTickerPage";
import { AdminAccountsPage } from "../features/admin/pages/AdminAccountsPage";
import { AdminAccountDetailsPage } from "../features/admin/pages/AdminAccountDetailsPage";
import { AdminPharmacyReviewPage } from "../features/admin/pages/AdminPharmacyReviewPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { PasswordRecoveryPage } from "../features/auth/pages/PasswordRecoveryPage";
import { DashboardLayout } from "../features/dashboard/layouts/DashboardLayout";
import { DashboardIndexPage } from "../features/dashboard/pages/DashboardIndexPage";
import { LandingPage } from "../features/home/pages/LandingPage";
import { NotFoundPage } from "../features/home/pages/NotFoundPage";
import { RegisterPage } from "../features/registration/pages/RegisterPage";

const HealthProfilePage = lazy(() =>
  import("../features/user/pages/HealthProfilePage").then((module) => ({
    default: module.HealthProfilePage,
  })),
);
const MedicineRequestDetailsPage = lazy(() =>
  import("../features/user/pages/MedicineRequestDetailsPage").then(
    (module) => ({ default: module.MedicineRequestDetailsPage }),
  ),
);
const MedicineRequestsPage = lazy(() =>
  import("../features/user/pages/MedicineRequestsPage").then((module) => ({
    default: module.MedicineRequestsPage,
  })),
);
const MedicineSearchPage = lazy(() =>
  import("../features/user/pages/MedicineSearchPage").then((module) => ({
    default: module.MedicineSearchPage,
  })),
);
const PharmacyDetailsPage = lazy(() =>
  import("../features/user/pages/PharmacyDetailsPage").then((module) => ({
    default: module.PharmacyDetailsPage,
  })),
);
const SearchHistoryPage = lazy(() =>
  import("../features/user/pages/SearchHistoryPage").then((module) => ({
    default: module.SearchHistoryPage,
  })),
);
const PharmacyProfilePage = lazy(() =>
  import("../features/pharmacy/pages/PharmacyProfilePage").then((module) => ({
    default: module.PharmacyProfilePage,
  })),
);
const PharmacyLicenseVerificationPage = lazy(() =>
  import("../features/pharmacy/pages/PharmacyLicenseVerificationPage").then(
    (module) => ({ default: module.PharmacyLicenseVerificationPage }),
  ),
);
const PharmacyWorkingHoursPage = lazy(() =>
  import("../features/pharmacy/pages/PharmacyWorkingHoursPage").then(
    (module) => ({ default: module.PharmacyWorkingHoursPage }),
  ),
);
const PharmacyInventoryPage = lazy(() =>
  import("../features/pharmacy/pages/PharmacyInventoryPage").then((module) => ({
    default: module.PharmacyInventoryPage,
  })),
);
const PharmacyRequestsPage = lazy(() =>
  import("../features/pharmacy/pages/PharmacyRequestsPage").then((module) => ({
    default: module.PharmacyRequestsPage,
  })),
);
const PharmacyDonationReviewsPage = lazy(() =>
  import("../features/pharmacy/pages/PharmacyDonationReviewsPage").then(
    (module) => ({ default: module.PharmacyDonationReviewsPage }),
  ),
);
const PharmacyRequestDetailsPage = lazy(() =>
  import("../features/pharmacy/pages/PharmacyRequestDetailsPage").then(
    (module) => ({ default: module.PharmacyRequestDetailsPage }),
  ),
);
const MedicineCatalogPage = lazy(() =>
  import("../features/medicines/pages/MedicineCatalogPage").then((module) => ({
    default: module.MedicineCatalogPage,
  })),
);
const CreateMedicinePage = lazy(() =>
  import("../features/medicines/pages/CreateMedicinePage").then((module) => ({
    default: module.CreateMedicinePage,
  })),
);
const MedicineDetailsPage = lazy(() =>
  import("../features/medicines/pages/MedicineDetailsPage").then((module) => ({
    default: module.MedicineDetailsPage,
  })),
);
const NotificationsPage = lazy(() =>
  import("../features/notifications/pages/NotificationsPage").then(
    (module) => ({ default: module.NotificationsPage }),
  ),
);
const DonationsPage = lazy(() =>
  import("../features/donations/pages/DonationsPage").then((module) => ({
    default: module.DonationsPage,
  })),
);
const OrganizationProfilePage = lazy(() =>
  import("../features/organization/pages/OrganizationProfilePage").then(
    (module) => ({ default: module.OrganizationProfilePage }),
  ),
);
const OrganizationCampaignsPage = lazy(() =>
  import("../features/organization/pages/OrganizationCampaignsPage").then(
    (module) => ({ default: module.OrganizationCampaignsPage }),
  ),
);
const OrganizationDonationOffersPage = lazy(() =>
  import("../features/organization/pages/OrganizationDonationOffersPage").then(
    (module) => ({ default: module.OrganizationDonationOffersPage }),
  ),
);
const OrganizationAssistanceRequestsPage = lazy(() =>
  import(
    "../features/organization/pages/OrganizationAssistanceRequestsPage"
  ).then((module) => ({ default: module.OrganizationAssistanceRequestsPage })),
);
const OrganizationsDirectoryPage = lazy(() =>
  import("../features/organization/pages/OrganizationsDirectoryPage").then(
    (module) => ({ default: module.OrganizationsDirectoryPage }),
  ),
);
const PublicOrganizationDetailsPage = lazy(() =>
  import("../features/organization/pages/PublicOrganizationDetailsPage").then(
    (module) => ({ default: module.PublicOrganizationDetailsPage }),
  ),
);
const ChatPage = lazy(() =>
  import("../features/chat/pages/ChatPage").then((module) => ({
    default: module.ChatPage,
  })),
);
const SettingsPage = lazy(() =>
  import("../features/settings/pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);
const SmartPrescriptionsPage = lazy(() =>
  import("../features/prescriptions/pages/SmartPrescriptionsPage").then(
    (module) => ({ default: module.SmartPrescriptionsPage }),
  ),
);
const PharmacyPrescriptionOrdersPage = lazy(() =>
  import("../features/prescriptions/pages/PharmacyPrescriptionOrdersPage").then(
    (module) => ({ default: module.PharmacyPrescriptionOrdersPage }),
  ),
);
const SupplyChainWorkspacePage = lazy(() =>
  import("../features/supply-chain/pages/SupplyChainWorkspacePage").then(
    (module) => ({ default: module.SupplyChainWorkspacePage }),
  ),
);

export function AppRouter() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-[#f4f7f6] text-sm font-bold text-[#60777c]">
          جاري تجهيز الصفحة...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<DashboardIndexPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route
              element={
                <RoleRoute
                  allowedRoles={[
                    "Warehouse",
                    "Representative",
                    "Pharmacy",
                    "Admin",
                  ]}
                />
              }
            >
              <Route
                path="supply-chain"
                element={<SupplyChainWorkspacePage />}
              />
            </Route>
            <Route element={<RoleRoute allowedRoles={["Warehouse"]} />}>
              <Route
                path="warehouse/inventory"
                element={<SupplyChainWorkspacePage />}
              />
              <Route
                path="warehouse/orders"
                element={<SupplyChainWorkspacePage />}
              />
              <Route
                path="warehouse/shipments"
                element={<Navigate to="/app/warehouse/orders" replace />}
              />
              <Route
                path="warehouse/representatives"
                element={<SupplyChainWorkspacePage />}
              />
              <Route
                path="warehouse/batches"
                element={<Navigate to="/app/warehouse/inventory" replace />}
              />
              <Route
                path="warehouse/invoices"
                element={<SupplyChainWorkspacePage />}
              />
              <Route
                path="warehouse/returns"
                element={<SupplyChainWorkspacePage />}
              />
              <Route
                path="warehouse/recalls"
                element={<SupplyChainWorkspacePage />}
              />
              <Route
                path="warehouse/profile"
                element={<Navigate to="/app/settings" replace />}
              />
              <Route
                path="warehouse/working-hours"
                element={<Navigate to="/app/settings" replace />}
              />
            </Route>
            <Route element={<RoleRoute allowedRoles={["Representative"]} />}>
              <Route
                path="representative/deliveries"
                element={<SupplyChainWorkspacePage />}
              />
              <Route
                path="representative/route"
                element={<SupplyChainWorkspacePage />}
              />
              <Route
                path="representative/history"
                element={<SupplyChainWorkspacePage />}
              />
              <Route
                path="representative/profile"
                element={<Navigate to="/app/settings" replace />}
              />
            </Route>
            <Route element={<RoleRoute allowedRoles={["Admin"]} />}>
              <Route path="approvals" element={<AdminApprovalsPage />} />
              <Route path="home-ticker" element={<AdminHomeTickerPage />} />
              <Route path="accounts" element={<AdminAccountsPage />} />
              <Route
                path="accounts/:userId"
                element={<AdminAccountDetailsPage />}
              />
              <Route
                path="organizations/:organizationId/review"
                element={<AdminOrganizationReviewPage />}
              />
              <Route
                path="pharmacies/:pharmacyId/review"
                element={<AdminPharmacyReviewPage />}
              />
              <Route path="medicines" element={<MedicineCatalogPage />} />
              <Route path="medicines/new" element={<CreateMedicinePage />} />
              <Route
                path="medicines/:medicineId"
                element={<MedicineDetailsPage />}
              />
            </Route>
            <Route element={<RoleRoute allowedRoles={["User"]} />}>
              <Route path="search" element={<MedicineSearchPage />} />
              <Route
                path="pharmacies/:pharmacyId"
                element={<PharmacyDetailsPage />}
              />
              <Route path="requests" element={<MedicineRequestsPage />} />
              <Route
                path="requests/:requestId"
                element={<MedicineRequestDetailsPage />}
              />
              <Route path="health" element={<HealthProfilePage />} />
              <Route
                path="prescriptions"
                element={<SmartPrescriptionsPage />}
              />
              <Route path="history" element={<SearchHistoryPage />} />
              <Route path="donations" element={<DonationsPage />} />
              <Route
                path="organizations"
                element={<OrganizationsDirectoryPage />}
              />
              <Route
                path="organizations/:organizationId"
                element={<PublicOrganizationDetailsPage />}
              />
              <Route path="chat" element={<ChatPage />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={["Pharmacy"]} />}>
              <Route
                path="pharmacy/inventory"
                element={<PharmacyInventoryPage />}
              />
              <Route
                path="pharmacy/requests"
                element={<PharmacyRequestsPage />}
              />
              <Route
                path="pharmacy/prescriptions"
                element={<PharmacyPrescriptionOrdersPage />}
              />
              <Route
                path="pharmacy/donations"
                element={<PharmacyDonationReviewsPage />}
              />
              <Route
                path="pharmacy/requests/:requestId"
                element={<PharmacyRequestDetailsPage />}
              />
              <Route
                path="pharmacy/profile"
                element={<PharmacyProfilePage />}
              />
              <Route
                path="pharmacy/license"
                element={<PharmacyLicenseVerificationPage />}
              />
              <Route
                path="pharmacy/working-hours"
                element={<PharmacyWorkingHoursPage />}
              />
              <Route
                path="pharmacy-inventory"
                element={<Navigate to="/app/pharmacy/inventory" replace />}
              />
              <Route
                path="pharmacy-requests"
                element={<Navigate to="/app/pharmacy/requests" replace />}
              />
              <Route
                path="pharmacy-requests/:requestId"
                element={<LegacyPharmacyRequestRedirect />}
              />
              <Route
                path="pharmacy-profile"
                element={<Navigate to="/app/pharmacy/profile" replace />}
              />
              <Route
                path="pharmacy-hours"
                element={<Navigate to="/app/pharmacy/working-hours" replace />}
              />
            </Route>
            <Route element={<RoleRoute allowedRoles={["Organization"]} />}>
              <Route
                path="organization/profile"
                element={<OrganizationProfilePage />}
              />
              <Route
                path="organization/campaigns"
                element={<OrganizationCampaignsPage />}
              />
              <Route
                path="organization/offers"
                element={<OrganizationDonationOffersPage />}
              />
              <Route
                path="organization/assistance"
                element={<OrganizationAssistanceRequestsPage />}
              />
              <Route
                path="campaigns"
                element={<Navigate to="/app/organization/campaigns" replace />}
              />
              <Route
                path="verification"
                element={<Navigate to="/app/organization/profile" replace />}
              />
            </Route>
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Route>
        </Route>
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

function LegacyPharmacyRequestRedirect() {
  const { requestId } = useParams();
  return <Navigate to={`/app/pharmacy/requests/${requestId}`} replace />;
}
