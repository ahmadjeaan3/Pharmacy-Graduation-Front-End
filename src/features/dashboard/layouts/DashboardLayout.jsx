import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Route,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  getPrimaryRole,
  getRoleDefinition,
} from "../../../shared/config/roles";
import {
  getLanguageDirection,
  normalizeLanguage,
} from "../../../shared/i18n/i18n";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  getUnreadNotificationCount,
  notificationKeys,
} from "../../notifications/api/notificationsApi";
import { NotificationBell } from "../../notifications/components/NotificationBell";

const DASHBOARD_LOGO_RTL =
  "/assets/app/brand/dashboard-logo.png";

const DASHBOARD_LOGO_LTR =
  "/assets/app/brand/dashboard-logo-left.png";


const ROLE_DRAWER_VISUALS = {
  User: {
    icon: UserRound,
    image: null,
  },
  Pharmacy: {
    icon: null,
    image:
      "/assets/app/home/icons/Asclepius.png",
  },
  Organization: {
    icon: HeartHandshake,
    image: null,
  },
  Warehouse: {
    icon: Warehouse,
    image: null,
  },
  Representative: {
    icon: Route,
    image: null,
  },
  Admin: {
    icon: ShieldCheck,
    image: null,
  },
};

const sharedItems = [
  {
    to: "/app",
    label: "نظرة عامة",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/app/notifications",
    label: "الإشعارات",
    icon: Bell,
  },
  {
    to: "/app/settings",
    label: "الإعدادات",
    icon: Settings,
  },
];

function getDashboardPageTitle(pathname) {
  if (
    pathname === "/app" ||
    pathname === "/app/"
  ) {
    return "لوحة التحكم";
  }

  /* =========================
     PHARMACY
  ========================== */

  if (
    pathname.startsWith(
      "/app/pharmacy/inventory",
    )
  ) {
    return "المخزون";
  }

  if (
    pathname.startsWith(
      "/app/pharmacy/supply",
    ) ||
    pathname.startsWith(
      "/app/pharmacy/supply-chain",
    ) ||
    pathname.startsWith(
      "/app/pharmacy/warehouses",
    )
  ) {
    return "توريد المستودعات";
  }

  if (
    pathname.startsWith(
      "/app/pharmacy/requests",
    )
  ) {
    return "طلبات الأدوية";
  }

  if (
    pathname.startsWith(
      "/app/pharmacy/reservations",
    ) ||
    pathname.startsWith(
      "/app/pharmacy/reserved-prescriptions",
    ) ||
    pathname.startsWith(
      "/app/pharmacy/prescriptions",
    )
  ) {
    return "الوصفات المحجوزة";
  }

  if (
    pathname.startsWith(
      "/app/pharmacy/donations",
    ) ||
    pathname.startsWith(
      "/app/pharmacy/donation-review",
    ) ||
    pathname.startsWith(
      "/app/pharmacy/donation-reviews",
    )
  ) {
    return "تحقق التبرعات";
  }

  if (
    pathname.startsWith(
      "/app/pharmacy/profile",
    )
  ) {
    return "الملف والموقع";
  }

  if (
    pathname.startsWith(
      "/app/pharmacy/working-hours",
    )
  ) {
    return "ساعات العمل";
  }

  /* =========================
     ORGANIZATION
  ========================== */

  if (
    pathname.startsWith(
      "/app/organization/campaigns",
    )
  ) {
    return "الحملات";
  }

  if (
    pathname.startsWith(
      "/app/organization/offers",
    )
  ) {
    return "عروض التبرع";
  }

  if (
    pathname.startsWith(
      "/app/organization/assistance",
    ) ||
    pathname.startsWith(
      "/app/organization/assistance-requests",
    )
  ) {
    return "طلبات المساعدة";
  }

  if (
    pathname.startsWith(
      "/app/organization/profile",
    ) ||
    pathname.startsWith(
      "/app/organization/verification",
    )
  ) {
    return "الملف والتحقق";
  }

  /* =========================
     SHARED
  ========================== */

  if (
    pathname.startsWith(
      "/app/notifications",
    )
  ) {
    return "الإشعارات";
  }

  if (
    pathname.startsWith(
      "/app/settings",
    )
  ) {
    return "الإعدادات";
  }

  return "لوحة التحكم";
}

export function DashboardLayout() {
  const [open, setOpen] =
    useState(false);

  const { t, i18n } =
    useTranslation();

  const { user, signOut } =
    useAuth();

  const location = useLocation();

  const currentLanguage =
    normalizeLanguage(
      i18n.resolvedLanguage ||
        i18n.language ||
        "ar",
    );

  const isArabic =
    currentLanguage === "ar";

  const direction =
    getLanguageDirection(
      currentLanguage,
    );

  const dashboardLogo =
    isArabic
      ? DASHBOARD_LOGO_RTL
      : DASHBOARD_LOGO_LTR;

  const locale =
    currentLanguage === "ar"
      ? "ar-SY"
      : currentLanguage === "tr"
        ? "tr-TR"
        : "en-US";

  const primaryRole = getPrimaryRole(
    user?.roles || [],
  );

  const role = getRoleDefinition(
    primaryRole,
  );

  const roleVisual =
    ROLE_DRAWER_VISUALS[
      primaryRole
    ] ||
    ROLE_DRAWER_VISUALS.User;

  const RoleDrawerIcon =
    roleVisual.icon ||
    UserRound;

  const navItems = [
    sharedItems[0],
    ...(role?.navigation || []),
    ...sharedItems.slice(1),
  ];

  const currentPageTitle =
    getDashboardPageTitle(
      location.pathname,
    );

  const unreadQuery = useQuery({
    queryKey:
      notificationKeys.unreadCount,
    queryFn:
      getUnreadNotificationCount,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const unreadCount =
    unreadQuery.data?.unreadCount ||
    0;

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="min-h-screen w-full overflow-x-hidden bg-[#f8fafc] text-[#333333]"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) => !value,
          )
        }
        aria-label={t(
          "فتح القائمة",
        )}
        className="fixed start-4 top-4 z-[70] grid size-11 place-items-center rounded-xl border border-[#174b57]/10 bg-white text-[#174b57] shadow-lg lg:hidden"
      >
        {open ? (
          <X size={22} />
        ) : (
          <Menu size={22} />
        )}
      </button>

      <aside
        className={`fixed inset-y-0 z-50 flex w-[290px] flex-col overflow-hidden bg-[#174b57] px-3 py-6 text-white shadow-2xl transition-transform duration-300 ${
          isArabic
            ? "right-0"
            : "left-0"
        } ${
          open
            ? "translate-x-0"
            : isArabic
              ? "translate-x-full lg:translate-x-0"
              : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -end-12 -top-16 size-48 rounded-full bg-cyan-300/30 blur-[120px]"
        />

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4 no-scrollbar">
        <div
  className={`flex items-center ${
    isArabic
      ? "mx-auto h-[52px] w-[242px] justify-center"
      : "h-[68px] w-full justify-start pl-3"
  }`}
>
  <img
    src={dashboardLogo}
    alt="Medical Life"
    draggable={false}
    className={`select-none object-contain ${
      isArabic
        ? "h-[52px] w-[242px]"
        : "h-[68px] w-[300px] mr-10"
    }`}
  />
</div>
          <div className="mx-auto mt-2 h-px w-[233px] bg-white/15" />

          <div className="mx-auto mt-9 w-[251px] rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
            <div
              dir="ltr"
              className={`flex min-h-[58px] w-full items-center gap-3 ${
                isArabic
                  ? "flex-row-reverse"
                  : "flex-row"
              }`}
            >
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/[0.09] text-[#d7e9ec]">
                {roleVisual.image ? (
                  <img
                    src={roleVisual.image}
                    alt={t(
                      role?.label ||
                        "نوع الحساب",
                    )}
                    draggable={false}
                    className="h-8 w-8 select-none object-contain"
                  />
                ) : (
                  <RoleDrawerIcon
                    size={22}
                    strokeWidth={1.7}
                  />
                )}
              </span>

              <div
                dir={direction}
                className={`min-w-0 flex-1 ${
                  isArabic
                    ? "text-right"
                    : "text-left"
                }`}
              >
                <strong className="block truncate text-sm font-semibold text-[#e6f3f6]">
                  {user?.fullName ||
                    ""}
                </strong>

                <p className="mt-1 truncate text-[10px] text-white/40">
                  {user?.email || ""}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#FFF4DE] px-3 py-1 text-[9px] font-medium text-[#DFAE0D]">
  {t(
    role?.label ||
      "غير محدد",
  )}
</span>
            </div>
          </div>

          <p className="mx-auto mb-3 mt-9 w-[219px] px-4 text-[10px] font-medium text-white/35">
            {t(
              "القائمة الرئيسية",
            )}
          </p>

          <nav
            aria-label={t(
              "القائمة الرئيسية",
            )}
            className="mx-auto flex w-[219px] flex-col gap-3"
          >
            {navItems.map(
              ({
                to,
                label,
                icon: Icon,
                end,
              }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() =>
                    setOpen(false)
                  }
                  className={({
                    isActive,
                  }) =>
                    `flex min-h-[54px] w-full items-center gap-3 rounded-[15px] px-4 py-3 text-sm transition ${
                      isActive
                        ? "bg-white/15 font-medium text-[#e6f3f6]"
                        : "text-[#a5a5a5] hover:bg-white/[0.07] hover:text-white"
                    }`
                  }
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className="shrink-0"
                  />

                  <span className="min-w-0 flex-1">
                    {t(label)}
                  </span>

                  {to ===
                    "/app/notifications" &&
                  unreadCount > 0 ? (
                    <span className="grid min-w-6 place-items-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-5 text-white">
                      {unreadCount >
                      99
                        ? "+99"
                        : unreadCount.toLocaleString(
                            locale,
                          )}
                    </span>
                  ) : null}
                </NavLink>
              ),
            )}
          </nav>
        </div>

        <div className="relative z-20 mx-auto mt-3 w-[219px] shrink-0 border-t border-white/10 bg-[#174b57] pt-3">
          <button
            type="button"
            onClick={signOut}
            className="flex min-h-[54px] w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#ef4444] transition hover:bg-rose-400/10"
          >
            <LogOut
              size={18}
              strokeWidth={1.8}
            />

            <span>
              {t(
                "تسجيل الخروج",
              )}
            </span>
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          onClick={() =>
            setOpen(false)
          }
          aria-label={t(
            "إغلاق القائمة",
          )}
          className="fixed inset-0 z-40 bg-[#071f25]/55 backdrop-blur-sm lg:hidden"
        />
      )}

      <main
        className={`min-h-screen bg-[#f8fafc] ${
          isArabic
            ? "lg:mr-[290px]"
            : "lg:ml-[290px]"
        }`}
      >
        <header className="sticky top-0 z-30 h-[84px] w-full border-b border-[rgba(102,102,102,.16)] bg-white">
          <div className="grid h-full w-full grid-cols-[180px_minmax(280px,553px)_60px] items-center justify-between gap-6 px-5 sm:px-7 lg:px-10">
            <div
              dir={direction}
              className={`flex flex-col justify-center justify-self-start ${
                isArabic
                  ? "items-start text-right"
                  : "items-start text-left"
              }`}
            >
              <h1 className="whitespace-nowrap text-[22px] font-medium leading-[33px] text-[#216474]">
                {t(
                  currentPageTitle,
                )}
              </h1>

              <span
                className={`h-0.5 w-[107px] self-start ${
                  isArabic
                    ? "bg-[linear-gradient(to_left,#eeb73a,rgba(238,183,58,0))]"
                    : "bg-[linear-gradient(to_right,#eeb73a,rgba(238,183,58,0))]"
                }`}
              />
            </div>

            <label
              dir="ltr"
              className="flex h-11 w-full max-w-[553px] items-center justify-self-center gap-2 rounded-lg border border-[rgba(102,102,102,.16)] bg-white px-3 text-[#a5a5a5]"
            >
              <input
                type="search"
                dir={direction}
                placeholder={t(
                  "ابحث هنا",
                )}
                aria-label={t(
                  "ابحث هنا...",
                )}
                className={`min-w-0 flex-1 border-0 bg-transparent text-xs text-[#333333] outline-none placeholder:text-[#a5a5a5] ${
                  isArabic
                    ? "text-right"
                    : "text-left"
                }`}
              />

              <Search
                size={18}
                strokeWidth={1.6}
                className="shrink-0"
              />
            </label>

            <div className="flex items-center justify-end">
              <NotificationBell
                unreadCount={
                  unreadCount
                }
                roles={
                  user?.roles || []
                }
              />
            </div>
          </div>
        </header>

        <div className="w-full px-5 py-6 sm:px-7 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}