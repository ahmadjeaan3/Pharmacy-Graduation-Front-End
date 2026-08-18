import { lazyNamed } from "./lazyNamed";

const page = (loader, exportName) => lazyNamed(loader, exportName);

export const AdminApprovalsPage = page(
  () => import("../../features/admin/pages/AdminApprovalsPage"),
  "AdminApprovalsPage",
);
export const AdminOrganizationReviewPage = page(
  () => import("../../features/admin/pages/AdminOrganizationReviewPage"),
  "AdminOrganizationReviewPage",
);
export const AdminHomeTickerPage = page(
  () => import("../../features/admin/pages/AdminHomeTickerPage"),
  "AdminHomeTickerPage",
);
export const AdminAccountsPage = page(
  () => import("../../features/admin/pages/AdminAccountsPage"),
  "AdminAccountsPage",
);
export const AdminAccountDetailsPage = page(
  () => import("../../features/admin/pages/AdminAccountDetailsPage"),
  "AdminAccountDetailsPage",
);
export const AdminPharmacyReviewPage = page(
  () => import("../../features/admin/pages/AdminPharmacyReviewPage"),
  "AdminPharmacyReviewPage",
);
export const AdminAuditLogsPage = page(
  () => import("../../features/admin/pages/AdminAuditLogsPage"),
  "AdminAuditLogsPage",
);
export const LoginPage = page(
  () => import("../../features/auth/pages/LoginPage"),
  "LoginPage",
);
export const PasswordRecoveryPage = page(
  () => import("../../features/auth/pages/PasswordRecoveryPage"),
  "PasswordRecoveryPage",
);
export const DashboardLayout = page(
  () => import("../../features/dashboard/layouts/DashboardLayout"),
  "DashboardLayout",
);
export const DashboardIndexPage = page(
  () => import("../../features/dashboard/pages/DashboardIndexPage"),
  "DashboardIndexPage",
);
export const DonationsPage = page(
  () => import("../../features/donations/pages/DonationsPage"),
  "DonationsPage",
);
export const LandingPage = page(
  () => import("../../features/home/pages/LandingPage"),
  "LandingPage",
);
export const NotFoundPage = page(
  () => import("../../features/home/pages/NotFoundPage"),
  "NotFoundPage",
);
export const PrivacyPolicyPage = page(
  () => import("../../features/legal/pages/PrivacyPolicyPage"),
  "PrivacyPolicyPage",
);
export const MedicineCatalogPage = page(
  () => import("../../features/medicines/pages/MedicineCatalogPage"),
  "MedicineCatalogPage",
);
export const CreateMedicinePage = page(
  () => import("../../features/medicines/pages/CreateMedicinePage"),
  "CreateMedicinePage",
);
export const MedicineDetailsPage = page(
  () => import("../../features/medicines/pages/MedicineDetailsPage"),
  "MedicineDetailsPage",
);
export const NotificationsPage = page(
  () => import("../../features/notifications/pages/NotificationsPage"),
  "NotificationsPage",
);
export const OrganizationProfilePage = page(
  () => import("../../features/organization/pages/OrganizationProfilePage"),
  "OrganizationProfilePage",
);
export const OrganizationCampaignsPage = page(
  () => import("../../features/organization/pages/OrganizationCampaignsPage"),
  "OrganizationCampaignsPage",
);
export const OrganizationDonationOffersPage = page(
  () =>
    import("../../features/organization/pages/OrganizationDonationOffersPage"),
  "OrganizationDonationOffersPage",
);
export const OrganizationAssistanceRequestsPage = page(
  () =>
    import(
      "../../features/organization/pages/OrganizationAssistanceRequestsPage"
    ),
  "OrganizationAssistanceRequestsPage",
);
export const OrganizationsDirectoryPage = page(
  () => import("../../features/organization/pages/OrganizationsDirectoryPage"),
  "OrganizationsDirectoryPage",
);
export const PublicOrganizationDetailsPage = page(
  () =>
    import("../../features/organization/pages/PublicOrganizationDetailsPage"),
  "PublicOrganizationDetailsPage",
);
export const PharmacyProfilePage = page(
  () => import("../../features/pharmacy/pages/PharmacyProfilePage"),
  "PharmacyProfilePage",
);
export const PharmacyLicenseVerificationPage = page(
  () => import("../../features/pharmacy/pages/PharmacyLicenseVerificationPage"),
  "PharmacyLicenseVerificationPage",
);
export const PharmacyWorkingHoursPage = page(
  () => import("../../features/pharmacy/pages/PharmacyWorkingHoursPage"),
  "PharmacyWorkingHoursPage",
);
export const PharmacyInventoryPage = page(
  () => import("../../features/pharmacy/pages/PharmacyInventoryPage"),
  "PharmacyInventoryPage",
);
export const PharmacyRequestsPage = page(
  () => import("../../features/pharmacy/pages/PharmacyRequestsPage"),
  "PharmacyRequestsPage",
);
export const PharmacyDonationReviewsPage = page(
  () => import("../../features/pharmacy/pages/PharmacyDonationReviewsPage"),
  "PharmacyDonationReviewsPage",
);
export const PharmacyRequestDetailsPage = page(
  () => import("../../features/pharmacy/pages/PharmacyRequestDetailsPage"),
  "PharmacyRequestDetailsPage",
);
export const PharmacyPrescriptionOrdersPage = page(
  () =>
    import("../../features/prescriptions/pages/PharmacyPrescriptionOrdersPage"),
  "PharmacyPrescriptionOrdersPage",
);
export const SmartPrescriptionsPage = page(
  () => import("../../features/prescriptions/pages/SmartPrescriptionsPage"),
  "SmartPrescriptionsPage",
);
export const RegisterPage = page(
  () => import("../../features/registration/pages/RegisterPage"),
  "RegisterPage",
);
export const SettingsPage = page(
  () => import("../../features/settings/pages/SettingsPage"),
  "SettingsPage",
);
export const SosPage = page(
  () => import("../../features/sos/pages/SosPage"),
  "SosPage",
);
export const SupplyChainWorkspacePage = page(
  () => import("../../features/supply-chain/pages/SupplyChainWorkspacePage"),
  "SupplyChainWorkspacePage",
);
export const HealthProfilePage = page(
  () => import("../../features/user/pages/HealthProfilePage"),
  "HealthProfilePage",
);
export const MedicineRequestDetailsPage = page(
  () => import("../../features/user/pages/MedicineRequestDetailsPage"),
  "MedicineRequestDetailsPage",
);
export const MedicineRequestsPage = page(
  () => import("../../features/user/pages/MedicineRequestsPage"),
  "MedicineRequestsPage",
);
export const MedicineSearchPage = page(
  () => import("../../features/user/pages/MedicineSearchPage"),
  "MedicineSearchPage",
);
export const PharmacyDetailsPage = page(
  () => import("../../features/user/pages/PharmacyDetailsPage"),
  "PharmacyDetailsPage",
);
export const PharmacyMedicinesPage = page(
  () => import("../../features/user/pages/PharmacyMedicinesPage"),
  "PharmacyMedicinesPage",
);
export const SearchHistoryPage = page(
  () => import("../../features/user/pages/SearchHistoryPage"),
  "SearchHistoryPage",
);
export const ChatPage = page(
  () => import("../../features/chat/pages/ChatPage"),
  "ChatPage",
);
