import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronDown,
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
import { ProfileAvatar } from "../../../shared/components/ProfileAvatar";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  accountKeys,
  getAccountProfile,
} from "../../settings/api/accountApi";
import {
  getUnreadNotificationCount,
  notificationKeys,
} from "../../notifications/api/notificationsApi";
import { NotificationBell } from "../../notifications/components/NotificationBell";

const dashboardLogo = "/assets/app/brand/dawaai-app-icon-192.png";
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

  const accountProfileQuery = useQuery({
    queryKey: accountKeys.profile,
    queryFn: getAccountProfile,
    staleTime: 30_000,
  });

  const accountProfile = accountProfileQuery.data ?? user;

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

  const isUserAccount = primaryRole === "User";

  const userTopNavItems = [
    {
      to: "/app",
      label: "الرئيسية",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/app/search",
      label: "بحث عن دواء",
      icon: Search,
    },
    {
      to: "/app/chat",
      label: "المساعد الدوائي",
      icon: Route,
    },
    {
      to: "/app/requests",
      label: "طلباتي",
      icon: Bell,
    },
    {
      to: "/app/donations",
      label: "التبرعات والمساعدة",
      icon: HeartHandshake,
    },
    {
      to: "/app/organizations",
      label: "المنظمات والحملات",
      icon: Warehouse,
    },
  ];

  if (isUserAccount) {
    const userFirstName =
      user?.fullName?.trim()?.split(/\s+/)?.[0] || "";

    return (
      <div
        dir={direction}
        lang={currentLanguage}
        className="min-h-screen w-full bg-[#F8FAFC] text-[#333333]"
      >
        {/* =========================
            USER NAVBAR - FIGMA MATCH
        ========================== */}
        <header className="sticky top-0 z-50 h-20 w-full border-b border-[rgba(102,102,102,.16)] bg-white">
          <div className="mx-auto flex h-full w-full max-w-[1640px] items-center px-4 sm:px-6 lg:px-10 xl:px-[120px]">
            <div
              className={`flex h-full w-full items-center justify-between ${
                isArabic ? "flex-row" : "flex-row-reverse"
              }`}
            >
              {/* Logo */}
              <NavLink
                to="/app"
                aria-label={t("الرئيسية")}
                className="flex h-[60px] w-[62px] shrink-0 items-center justify-center"
              >
                <img
                  src={dashboardLogo}
                  alt="Dawaai"
                  draggable={false}
                  className="h-[60px] w-[62px] select-none object-contain"
                />
              </NavLink>

              {/* Main user navigation - text only like Figma */}
              <nav
                aria-label={t("القائمة الرئيسية")}
                className="hidden h-full min-w-0 flex-1 items-center justify-center lg:flex"
              >
                <div
                  className={`flex h-full items-center gap-6 xl:gap-8 ${
                    isArabic ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {userTopNavItems.map(({ to, label, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        `flex h-full items-center whitespace-nowrap px-1 transition-colors ${
                          isActive
                            ? "font-medium text-[#216474]"
                            : "font-medium text-[#4F4F4F] hover:text-[#216474]"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <span
                          className={`relative inline-flex items-center ${
                            isActive ? "text-[18px]" : "text-[16px]"
                          }`}
                        >
                          {t(label)}

                          {isActive ? (
                            <span className="absolute -bottom-[9px] left-0 right-0 h-[2px] rounded-full bg-[#DFAE0D]" />
                          ) : null}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </nav>

              {/* User profile - like Figma */}
              <div className="relative hidden shrink-0 lg:block">
                <button
  type="button"
  onClick={() => setOpen((value) => !value)}
  className={`flex h-14 min-w-[170px] items-center gap-3 rounded-xl px-1 transition hover:bg-[#F8FAFC] ${
    isArabic ? "flex-row-reverse" : "flex-row"
  }`}
>
  {/* صورة المستخدم */}
  <ProfileAvatar
    user={accountProfile}
    sizeClass="size-11"
    className="shrink-0 rounded-full bg-[#EAF4F3] text-[#216474]"
    fallbackIcon
  />

  {/* الاسم + السهم + ملفي الشخصي */}
  <span
    className={`flex min-w-0 flex-1 flex-col ${
      isArabic
        ? "items-end text-right"
        : "items-start text-left"
    }`}
  >
    {/* الاسم والسهم */}
    <span
      dir={isArabic ? "rtl" : "ltr"}
      className="inline-flex items-center gap-2 text-[14px] font-medium text-[#216474] ml-4"
    >
      {/* السهم على اليمين في العربية */}
      {isArabic && (
        <ChevronDown
          size={15}
          strokeWidth={1.7}
          className={`shrink-0 text-[#333333] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      )}

      <span className="whitespace-nowrap">
        {t("مرحباً")} {userFirstName}
      </span>

      {/* السهم على اليسار في الإنجليزية */}
      {!isArabic && (
        <ChevronDown
          size={15}
          strokeWidth={1.7}
          className={`shrink-0 text-[#333333] transition-transform duration-200  ${
            open ? "rotate-180" : ""
          }`}
        />
      )}
    </span>

    {/* النص أسفل الاسم */}
    <span className="mt-1 whitespace-nowrap text-[12px] text-[#666666] ml-4">
      {t("ملفي الشخصي")}
    </span>
  </span>
</button>

                {open ? (
                  <div
                    dir={direction}
                    className={`absolute top-[calc(100%+10px)] z-[60] w-[220px] overflow-hidden rounded-[12px] border border-[#174B57]/10 bg-white shadow-[0_18px_45px_rgba(23,75,87,.14)] ${
                      isArabic ? "left-0" : "right-0"
                    }`}
                  >
                    <div className="flex flex-col items-center px-4 pb-3 pt-4 text-center">
                      <ProfileAvatar
                        user={accountProfile}
                        sizeClass="size-14"
                        className="rounded-full bg-[#EAF4F3] text-[#216474]"
                        fallbackIcon
                      />

                      <strong className="mt-2 max-w-full truncate text-[13px] font-medium text-[#333333]">
                        {accountProfile?.fullName || user?.fullName || userFirstName}
                      </strong>
                    </div>

                    <div className="mx-3 h-px bg-[#EEF2F3]" />

                    <nav className="px-2 py-2">
                      <NavLink
                        to="/app/health"
                        onClick={() => setOpen(false)}
                        className="flex min-h-[40px] items-center gap-3 rounded-lg px-3 text-[13px] text-[#5F7479] transition hover:bg-[#F4F8F8] hover:text-[#216474]"
                      >
                        <UserRound size={16} strokeWidth={1.7} className="shrink-0" />
                        <span className="flex-1 text-right">{t("ملفي الصحي")}</span>
                      </NavLink>

                      <NavLink
                        to="/app/history"
                        onClick={() => setOpen(false)}
                        className="flex min-h-[40px] items-center gap-3 rounded-lg px-3 text-[13px] text-[#5F7479] transition hover:bg-[#F4F8F8] hover:text-[#216474]"
                      >
                        <Search size={16} strokeWidth={1.7} className="shrink-0" />
                        <span className="flex-1 text-right">{t("سجل البحث")}</span>
                      </NavLink>

                      <NavLink
                        to="/app/settings"
                        onClick={() => setOpen(false)}
                        className="flex min-h-[40px] items-center gap-3 rounded-lg px-3 text-[13px] text-[#5F7479] transition hover:bg-[#F4F8F8] hover:text-[#216474]"
                      >
                        <Settings size={16} strokeWidth={1.7} className="shrink-0" />
                        <span className="flex-1 text-right">{t("الإعدادات")}</span>
                      </NavLink>

                      <div className="my-1 h-px bg-[#EEF2F3]" />

                      <button
                        type="button"
                        onClick={signOut}
                        className="flex min-h-[40px] w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut size={16} strokeWidth={1.8} className="shrink-0" />
                        <span className="flex-1 text-right">{t("تسجيل الخروج")}</span>
                      </button>
                    </nav>
                  </div>
                ) : null}
              </div>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={t("فتح القائمة")}
                className="grid size-11 place-items-center rounded-xl border border-[#174b57]/10 bg-white text-[#174b57] lg:hidden"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile menu - dropdown from top */}
          {open ? (
            <div className="border-t border-[#174B57]/8 bg-white px-4 py-4 shadow-lg lg:hidden">
              <nav className="mx-auto grid max-w-xl gap-2">
                {userTopNavItems.map(({ to, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm ${
                        isActive
                          ? "bg-[#EAF4F3] font-semibold text-[#216474]"
                          : "text-[#60777C] hover:bg-[#F4F8F8]"
                      }`
                    }
                  >
                    <span className="flex-1">{t(label)}</span>
                  </NavLink>
                ))}

                <NavLink
                  to="/app/health"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm text-[#60777C] hover:bg-[#F4F8F8]"
                >
                  {t("ملفي الصحي")}
                </NavLink>

                <NavLink
                  to="/app/history"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm text-[#60777C] hover:bg-[#F4F8F8]"
                >
                  {t("سجل البحث")}
                </NavLink>

                <NavLink
                  to="/app/settings"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm text-[#60777C] hover:bg-[#F4F8F8]"
                >
                  {t("الإعدادات")}
                </NavLink>

                <button
                  type="button"
                  onClick={signOut}
                  className="flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  {t("تسجيل الخروج")}
                </button>
              </nav>
            </div>
          ) : null}
        </header>

        {/* USER PAGE CONTENT */}
        <main className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_90%_0%,rgba(139,208,203,.12),transparent_28rem)]">
          {location.pathname === "/app" || location.pathname === "/app/" ? (
            <div
              key={location.pathname}
              className="dashboard-page-enter w-full overflow-x-hidden"
            >
              <Outlet />
            </div>
          ) : (
            /*
              باقي صفحات المستخدم تبقى بنفس الحاوية الحالية
              حتى لا يتغير تصميمها.
            */
            <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-8 xl:px-[120px]">
              <div
                key={location.pathname}
                className="dashboard-page-enter w-full"
              >
                <Outlet />
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

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