import { Navigate } from "react-router-dom";

import { LegacyPharmacyRequestRedirect } from "./LegacyPharmacyRequestRedirect";
import {
  AdminAccountDetailsPage,
  AdminAccountsPage,
  AdminApprovalsPage,
  AdminAuditLogsPage,
  AdminHomeTickerPage,
  AdminOrganizationReviewPage,
  AdminPharmacyReviewPage,
  ChatPage,
  CreateMedicinePage,
  DashboardIndexPage,
  DonationsPage,
  HealthProfilePage,
  LoginPage,
  MedicineCatalogPage,
  MedicineDetailsPage,
  MedicineRequestDetailsPage,
  MedicineRequestsPage,
  MedicineSearchPage,
  NotificationsPage,
  OrganizationAssistanceRequestsPage,
  OrganizationCampaignsPage,
  OrganizationDonationOffersPage,
  OrganizationProfilePage,
  OrganizationsDirectoryPage,
  PasswordRecoveryPage,
  PharmacyDetailsPage,
  PharmacyDonationReviewsPage,
  PharmacyInventoryPage,
  PharmacyLicenseVerificationPage,
  PharmacyMedicinesPage,
  PharmacyPrescriptionOrdersPage,
  PharmacyProfilePage,
  PharmacyRequestDetailsPage,
  PharmacyRequestsPage,
  PharmacyWorkingHoursPage,
  PublicOrganizationDetailsPage,
  RegisterPage,
  SearchHistoryPage,
  SettingsPage,
  SmartPrescriptionsPage,
  SosPage,
  SupplyChainWorkspacePage,
} from "./pageRegistry";

const redirect = (to) => <Navigate to={to} replace />;

export const publicOnlyRoutes = [
  { path: "/login", element: <LoginPage /> },
  { path: "/forgot-password", element: <PasswordRecoveryPage /> },
  { path: "/register", element: <RegisterPage /> },
];

export const sharedDashboardRoutes = [
  { index: true, element: <DashboardIndexPage /> },
  { path: "notifications", element: <NotificationsPage /> },
  { path: "settings", element: <SettingsPage /> },
];

export const dashboardRouteGroups = [
  {
    key: "urgent-assistance",
    allowedRoles: ["User", "Pharmacy", "Admin"],
    routes: [{ path: "sos", element: <SosPage /> }],
  },
  {
    key: "supply-chain-access",
    allowedRoles: ["Warehouse", "Representative", "Pharmacy", "Admin"],
    routes: [{ path: "supply-chain", element: <SupplyChainWorkspacePage /> }],
  },
  {
    key: "warehouse",
    allowedRoles: ["Warehouse"],
    routes: [
      { path: "warehouse/inventory", element: <SupplyChainWorkspacePage /> },
      { path: "warehouse/orders", element: <SupplyChainWorkspacePage /> },
      {
        path: "warehouse/shipments",
        element: redirect("/app/warehouse/orders"),
      },
      {
        path: "warehouse/representatives",
        element: <SupplyChainWorkspacePage />,
      },
      {
        path: "warehouse/batches",
        element: redirect("/app/warehouse/inventory"),
      },
      { path: "warehouse/invoices", element: <SupplyChainWorkspacePage /> },
      { path: "warehouse/returns", element: <SupplyChainWorkspacePage /> },
      { path: "warehouse/recalls", element: <SupplyChainWorkspacePage /> },
      { path: "warehouse/profile", element: redirect("/app/settings") },
      { path: "warehouse/working-hours", element: redirect("/app/settings") },
    ],
  },
  {
    key: "representative",
    allowedRoles: ["Representative"],
    routes: [
      {
        path: "representative/deliveries",
        element: <SupplyChainWorkspacePage />,
      },
      { path: "representative/route", element: <SupplyChainWorkspacePage /> },
      { path: "representative/history", element: <SupplyChainWorkspacePage /> },
      { path: "representative/profile", element: redirect("/app/settings") },
    ],
  },
  {
    key: "admin",
    allowedRoles: ["Admin"],
    routes: [
      { path: "approvals", element: <AdminApprovalsPage /> },
      { path: "home-ticker", element: <AdminHomeTickerPage /> },
      { path: "accounts", element: <AdminAccountsPage /> },
      { path: "audit-logs", element: <AdminAuditLogsPage /> },
      { path: "accounts/:userId", element: <AdminAccountDetailsPage /> },
      {
        path: "organizations/:organizationId/review",
        element: <AdminOrganizationReviewPage />,
      },
      {
        path: "pharmacies/:pharmacyId/review",
        element: <AdminPharmacyReviewPage />,
      },
      { path: "medicines", element: <MedicineCatalogPage /> },
      { path: "medicines/new", element: <CreateMedicinePage /> },
      { path: "medicines/:medicineId", element: <MedicineDetailsPage /> },
    ],
  },
  {
    key: "user",
    allowedRoles: ["User"],
    routes: [
      { path: "search", element: <MedicineSearchPage /> },
      { path: "pharmacies/:pharmacyId", element: <PharmacyDetailsPage /> },
      {
        path: "pharmacies/:pharmacyId/medicines",
        element: <PharmacyMedicinesPage />,
      },
      { path: "requests", element: <MedicineRequestsPage /> },
      { path: "requests/:requestId", element: <MedicineRequestDetailsPage /> },
      { path: "health", element: <HealthProfilePage /> },
      { path: "prescriptions", element: <SmartPrescriptionsPage /> },
      { path: "history", element: <SearchHistoryPage /> },
      { path: "donations", element: <DonationsPage /> },
      { path: "organizations", element: <OrganizationsDirectoryPage /> },
      {
        path: "organizations/:organizationId",
        element: <PublicOrganizationDetailsPage />,
      },
      { path: "chat", element: <ChatPage /> },
    ],
  },
  {
    key: "pharmacy",
    allowedRoles: ["Pharmacy"],
    routes: [
      { path: "pharmacy/inventory", element: <PharmacyInventoryPage /> },
      { path: "pharmacy/requests", element: <PharmacyRequestsPage /> },
      {
        path: "pharmacy/prescriptions",
        element: <PharmacyPrescriptionOrdersPage />,
      },
      { path: "pharmacy/donations", element: <PharmacyDonationReviewsPage /> },
      {
        path: "pharmacy/requests/:requestId",
        element: <PharmacyRequestDetailsPage />,
      },
      { path: "pharmacy/profile", element: <PharmacyProfilePage /> },
      {
        path: "pharmacy/license",
        element: <PharmacyLicenseVerificationPage />,
      },
      { path: "pharmacy/working-hours", element: <PharmacyWorkingHoursPage /> },
      {
        path: "pharmacy-inventory",
        element: redirect("/app/pharmacy/inventory"),
      },
      {
        path: "pharmacy-requests",
        element: redirect("/app/pharmacy/requests"),
      },
      {
        path: "pharmacy-requests/:requestId",
        element: <LegacyPharmacyRequestRedirect />,
      },
      { path: "pharmacy-profile", element: redirect("/app/pharmacy/profile") },
      {
        path: "pharmacy-hours",
        element: redirect("/app/pharmacy/working-hours"),
      },
    ],
  },
  {
    key: "organization",
    allowedRoles: ["Organization"],
    routes: [
      { path: "organization/profile", element: <OrganizationProfilePage /> },
      {
        path: "organization/campaigns",
        element: <OrganizationCampaignsPage />,
      },
      {
        path: "organization/offers",
        element: <OrganizationDonationOffersPage />,
      },
      {
        path: "organization/assistance",
        element: <OrganizationAssistanceRequestsPage />,
      },
      { path: "campaigns", element: redirect("/app/organization/campaigns") },
      { path: "verification", element: redirect("/app/organization/profile") },
    ],
  },
];
