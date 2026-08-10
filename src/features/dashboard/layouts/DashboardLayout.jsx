import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  Route,
  Settings,
  ShieldCheck,
  UserRound,
  Warehouse,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  getPrimaryRole,
  getRoleDefinition,
} from "../../../shared/config/roles";
import {
  getLanguageDirection,
  normalizeLanguage,
} from "../../../shared/i18n/i18n";
import { Brand } from "../../../shared/components/Brand";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  getUnreadNotificationCount,
  notificationKeys,
} from "../../notifications/api/notificationsApi";
import { NotificationBell } from "../../notifications/components/NotificationBell";

const ROLE_DRAWER_VISUALS = {
  User: {
    icon: UserRound,
    image: null,
  },
  Pharmacy: {
    icon: null,
    image: "/assets/app/home/icons/Asclepius.png",
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
  if (pathname === "/app" || pathname === "/app/") {
    return "لوحة التحكم";
  }

  /* =========================
     PHARMACY
  ========================== */

  if (pathname.startsWith("/app/pharmacy/inventory")) {
    return "المخزون";
  }

  if (
    pathname.startsWith("/app/pharmacy/supply") ||
    pathname.startsWith("/app/pharmacy/supply-chain") ||
    pathname.startsWith("/app/pharmacy/warehouses")
  ) {
    return "توريد المستودعات";
  }

  if (pathname.startsWith("/app/pharmacy/requests")) {
    return "طلبات الأدوية";
  }

  if (
    pathname.startsWith("/app/pharmacy/reservations") ||
    pathname.startsWith("/app/pharmacy/reserved-prescriptions") ||
    pathname.startsWith("/app/pharmacy/prescriptions")
  ) {
    return "الوصفات المحجوزة";
  }

  if (
    pathname.startsWith("/app/pharmacy/donations") ||
    pathname.startsWith("/app/pharmacy/donation-review") ||
    pathname.startsWith("/app/pharmacy/donation-reviews")
  ) {
    return "تحقق التبرعات";
  }

  if (pathname.startsWith("/app/pharmacy/profile")) {
    return "الملف والموقع";
  }

  if (pathname.startsWith("/app/pharmacy/license")) {
    return "الترخيص والتحقق";
  }

  if (pathname.startsWith("/app/pharmacy/working-hours")) {
    return "ساعات العمل";
  }

  /* =========================
     WAREHOUSE
  ========================== */

  if (pathname.startsWith("/app/warehouse/inventory")) {
    return "المخزون والدفعات";
  }
  if (pathname.startsWith("/app/warehouse/batches")) {
    return "الدُفعات الدوائية";
  }
  if (pathname.startsWith("/app/warehouse/orders")) {
    return "الطلبات والشحنات";
  }
  if (pathname.startsWith("/app/warehouse/shipments")) {
    return "الشحنات والتوصيل";
  }
  if (pathname.startsWith("/app/warehouse/representatives")) {
    return "إدارة المندوبين";
  }
  if (pathname.startsWith("/app/warehouse/invoices")) {
    return "الفواتير والمدفوعات";
  }
  if (pathname.startsWith("/app/warehouse/returns")) {
    return "المرتجعات";
  }
  if (pathname.startsWith("/app/warehouse/recalls")) {
    return "استدعاءات الدفعات";
  }
  if (pathname.startsWith("/app/supply-chain")) {
    return "مركز سلسلة التوريد";
  }

  /* =========================
     ORGANIZATION
  ========================== */

  if (pathname.startsWith("/app/organization/campaigns")) {
    return "الحملات";
  }

  if (pathname.startsWith("/app/organization/offers")) {
    return "عروض التبرع";
  }

  if (
    pathname.startsWith("/app/organization/assistance") ||
    pathname.startsWith("/app/organization/assistance-requests")
  ) {
    return "طلبات المساعدة";
  }

  if (
    pathname.startsWith("/app/organization/profile") ||
    pathname.startsWith("/app/organization/verification")
  ) {
    return "الملف والتحقق";
  }

  /* =========================
     ADMIN
  ========================== */

  if (pathname.startsWith("/app/approvals")) {
    return "طلبات الاعتماد";
  }

  if (pathname.startsWith("/app/accounts")) {
    return "إدارة الحسابات";
  }

  if (pathname.startsWith("/app/medicines")) {
    return "دليل الأدوية";
  }

  if (pathname.startsWith("/app/home-ticker")) {
    return "شريط الإعلانات";
  }

  /* =========================
     USER
  ========================== */

  if (pathname.startsWith("/app/search")) {
    return "البحث عن دواء";
  }

  if (pathname.startsWith("/app/pharmacies")) {
    return "تفاصيل الصيدلية";
  }

  if (pathname.startsWith("/app/requests")) {
    return "طلباتي";
  }

  if (pathname.startsWith("/app/health")) {
    return "ملفي الصحي";
  }

  if (pathname.startsWith("/app/prescriptions")) {
    return "الوصفة الذكية";
  }

  if (pathname.startsWith("/app/history")) {
    return "سجل البحث";
  }

  if (pathname.startsWith("/app/donations")) {
    return "التبرعات والمساعدة";
  }

  if (pathname.startsWith("/app/organizations")) {
    return "المنظمات والحملات";
  }

  if (pathname.startsWith("/app/chat")) {
    return "المساعد الدوائي";
  }

  /* =========================
     SHARED
  ========================== */

  if (pathname.startsWith("/app/notifications")) {
    return "الإشعارات";
  }

  if (pathname.startsWith("/app/settings")) {
    return "الإعدادات";
  }

  return "لوحة التحكم";
}

export function DashboardLayout() {
  const [open, setOpen] = useState(false);

  const { t, i18n } = useTranslation();

  const { user, signOut } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState("");

  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );

  const isArabic = currentLanguage === "ar";

  const direction = getLanguageDirection(currentLanguage);

  const locale =
    currentLanguage === "ar"
      ? "ar-SY"
      : currentLanguage === "tr"
        ? "tr-TR"
        : "en-US";

  const primaryRole = getPrimaryRole(user?.roles || []);

  const role = getRoleDefinition(primaryRole);

  const roleVisual =
    ROLE_DRAWER_VISUALS[primaryRole] || ROLE_DRAWER_VISUALS.User;

  const RoleDrawerIcon = roleVisual.icon || UserRound;

  const navItems = [
    sharedItems[0],
    ...(role?.navigation || []),
    ...sharedItems.slice(1),
  ];

  const searchableNavigation = navItems
    .filter((item) => item?.to && item?.label)
    .map((item) => ({
      ...item,
      translatedLabel: String(t(item.label)),
    }));

  const submitGlobalSearch = (event) => {
    event.preventDefault();
    const term = globalSearch.trim().toLocaleLowerCase(currentLanguage);
    if (!term) return;

    const match = searchableNavigation.find(({ label, translatedLabel }) =>
      `${label} ${translatedLabel}`
        .toLocaleLowerCase(currentLanguage)
        .includes(term),
    );

    if (match) {
      navigate(match.to);
      setGlobalSearch("");
    }
  };

  const currentPageTitle = getDashboardPageTitle(location.pathname);

  const unreadQuery = useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 10000,
  });

  const unreadCount = unreadQuery.data?.unreadCount || 0;

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="min-h-screen w-full overflow-x-hidden bg-[#f8fafc] text-[#333333]"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("فتح القائمة")}
        className="fixed start-4 top-4 z-[70] grid size-11 place-items-center rounded-xl border border-[#174b57]/10 bg-white text-[#174b57] shadow-lg lg:hidden"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <aside
        className={`fixed inset-y-0 z-50 flex w-[290px] flex-col overflow-hidden bg-[linear-gradient(180deg,#174b57_0%,#123f49_52%,#0c333c_100%)] px-3 py-6 text-white shadow-[0_0_55px_rgba(8,43,51,.22)] transition-transform duration-300 ${
          isArabic ? "right-0" : "left-0"
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
                isArabic ? "h-[52px] w-[242px]" : "h-[68px] w-[300px] mr-10"
              }`}
            />
          </div>
          <div className="mx-auto mt-2 h-px w-[233px] bg-white/15" />

          <div className="mx-auto mt-9 w-[251px] rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
            <div
              dir="ltr"
              className={`flex min-h-[58px] w-full items-center gap-3 ${
                isArabic ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/[0.09] text-[#d7e9ec]">
                {roleVisual.image ? (
                  <img
                    src={roleVisual.image}
                    alt={t(role?.label || "نوع الحساب")}
                    draggable={false}
                    className="h-8 w-8 select-none object-contain"
                  />
                ) : (
                  <RoleDrawerIcon size={22} strokeWidth={1.7} />
                )}
              </span>

              <div
                dir={direction}
                className={`min-w-0 flex-1 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                <strong className="block truncate text-sm font-semibold text-[#e6f3f6]">
                  {user?.fullName || ""}
                </strong>

                <p className="mt-1 truncate text-[10px] text-white/40">
                  {user?.email || ""}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#FFF4DE] px-3 py-1 text-[9px] font-medium text-[#DFAE0D]">
                {t(role?.label || "غير محدد")}
              </span>
            </div>
          </div>

          <p className="mx-auto mb-3 mt-8 w-[251px] px-3 text-[10px] font-medium tracking-wide text-white/35">
            {t("القائمة الرئيسية")}
          </p>

          <nav
            aria-label={t("القائمة الرئيسية")}
            className="mx-auto flex w-[251px] flex-col gap-1.5"
          >
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `relative flex min-h-[50px] w-full items-center gap-3 overflow-hidden rounded-xl border px-4 py-2.5 text-[13px] transition-all duration-200 ${
                    isActive
                      ? "border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,.16),rgba(255,255,255,.09))] font-bold text-white shadow-[0_8px_22px_rgba(7,31,37,.18)] after:absolute after:inset-y-2 after:start-0 after:w-[3px] after:rounded-full after:bg-[#F5CB72]"
                      : "border-transparent text-[#b8c7ca] hover:translate-x-[-2px] hover:border-white/[.06] hover:bg-white/[0.07] hover:text-white"
                  }`
                }
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[.06] text-[#d7e9ec]">
                  <Icon size={17} strokeWidth={1.8} />
                </span>

                <span className="min-w-0 flex-1">{t(label)}</span>

                {to === "/app/notifications" && unreadCount > 0 ? (
                  <span className="grid min-w-6 place-items-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold leading-5 text-white">
                    {unreadCount > 99
                      ? "+99"
                      : unreadCount.toLocaleString(locale)}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="relative z-20 mx-auto mt-3 w-[251px] shrink-0 border-t border-white/10 bg-[#174b57] pt-3">
          <button
            type="button"
            onClick={signOut}
            className="flex min-h-[54px] w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#ef4444] transition hover:bg-rose-400/10"
          >
            <LogOut size={18} strokeWidth={1.8} />

            <span>{t("تسجيل الخروج")}</span>
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("إغلاق القائمة")}
          className="fixed inset-0 z-40 bg-[#071f25]/55 backdrop-blur-sm lg:hidden"
        />
      )}

      <main
        className={`min-h-screen bg-[#f8fafc] ${
          isArabic ? "lg:mr-[290px]" : "lg:ml-[290px]"
        }`}
      >
        <header className="sticky top-0 z-30 h-[78px] w-full border-b border-[#174b57]/[.08] bg-white/90 shadow-[0_8px_30px_rgba(23,75,87,.035)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/82">
          <div className="grid h-full w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 ps-16 sm:px-6 sm:ps-16 lg:ps-8 xl:px-10">
            <div
              dir={direction}
              className={`flex flex-col justify-center justify-self-start ${
                isArabic ? "items-start text-right" : "items-start text-left"
              }`}
            >
              <h1 className="max-w-[60vw] truncate whitespace-nowrap text-lg font-medium leading-[33px] text-[#216474] sm:text-[22px] lg:max-w-[240px] xl:max-w-none">
                {t(currentPageTitle)}
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
              className="hidden h-11 w-full max-w-[553px] items-center justify-self-center gap-2 rounded-lg border border-[rgba(102,102,102,.16)] bg-white px-3 text-[#a5a5a5] xl:flex"
            >
              <input
                type="search"
                dir={direction}
                placeholder={t("ابحث هنا")}
                aria-label={t("ابحث هنا...")}
                className={`min-w-0 flex-1 border-0 bg-transparent text-xs text-[#333333] outline-none placeholder:text-[#a5a5a5] ${
                  isArabic ? "text-right" : "text-left"
                }`}
              />

              <Search size={18} strokeWidth={1.6} className="shrink-0" />
            </label>

            <div className="flex items-center justify-end">
              <NotificationBell
                unreadCount={unreadCount}
                roles={user?.roles || []}
              />
            </div>
          </div>
        </header>

        <div className="w-full bg-[radial-gradient(circle_at_90%_0%,rgba(139,208,203,.12),transparent_28rem)] px-4 py-6 sm:px-7 lg:px-8 lg:py-9 xl:px-10">
          <div
            key={location.pathname}
            className="dashboard-page-enter mx-auto w-full max-w-[1560px]"
          >
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
