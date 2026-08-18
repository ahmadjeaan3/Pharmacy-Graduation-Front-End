import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import {
  ProtectedRoute,
  PublicOnlyRoute,
  RoleRoute,
} from "../features/auth/components/RouteGuards";
import {
  dashboardRouteGroups,
  publicOnlyRoutes,
  sharedDashboardRoutes,
} from "./routes/routeDefinitions";
import {
  DashboardLayout,
  LandingPage,
  NotFoundPage,
  PrivacyPolicyPage,
} from "./routes/pageRegistry";

function renderRoutes(routes) {
  return routes.map((route) => (
    <Route
      key={route.index ? "index" : route.path}
      index={route.index}
      path={route.path}
      element={route.element}
    />
  ));
}

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
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        <Route element={<PublicOnlyRoute />}>
          {renderRoutes(publicOnlyRoutes)}
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<DashboardLayout />}>
            {renderRoutes(sharedDashboardRoutes)}
            {dashboardRouteGroups.map((group) => (
              <Route
                key={group.key}
                element={<RoleRoute allowedRoles={group.allowedRoles} />}
              >
                {renderRoutes(group.routes)}
              </Route>
            ))}
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Route>
        </Route>

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
