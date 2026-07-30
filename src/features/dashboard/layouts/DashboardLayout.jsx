import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Brand } from "../../../shared/components/Brand";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  getPrimaryRole,
  getRoleDefinition,
} from "../../../shared/config/roles";
import {
  getUnreadNotificationCount,
  notificationKeys,
} from "../../notifications/api/notificationsApi";
import { NotificationBell } from "../../notifications/components/NotificationBell";
import { LanguageSwitcher } from "../../../shared/components/LanguageSwitcher";
import { useLanguage } from "../../../shared/i18n/useLanguage";
import { ProfileAvatar } from "../../../shared/components/ProfileAvatar";

const sharedItems = [
  { to: "/app", label: "نظرة عامة", icon: LayoutDashboard, end: true },
  { to: "/app/notifications", label: "الإشعارات", icon: Bell },
  { to: "/app/settings", label: "الإعدادات", icon: Settings },
];

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { locale, t } = useLanguage();
  const { user, signOut } = useAuth();
  const role = getRoleDefinition(getPrimaryRole(user.roles));
  const navItems = [
    sharedItems[0],
    ...role.navigation,
    ...sharedItems.slice(1),
  ];
  const unreadQuery = useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
  const unreadCount = unreadQuery.data?.unreadCount || 0;

  return (
    <div className="dashboard-shell min-h-screen bg-[#f4f7f6] text-[#17363e]">
      <button
        className="dashboard-menu-button fixed start-4 top-4 z-50 grid size-11 place-items-center rounded-xl bg-white shadow-lg lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label={t("فتح القائمة")}
      >
        {open ? <X /> : <Menu />}
      </button>
      <aside
        data-open={open}
        className="dashboard-sidebar fixed inset-y-0 z-40 flex w-[286px] flex-col overflow-hidden bg-[#123f49] px-5 py-6 text-white shadow-2xl transition-transform"
      >
        <Brand light />
        <div className="mt-9 rounded-2xl border border-white/10 bg-white/[.065] p-4">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              user={user}
              sizeClass="size-11"
              className="rounded-xl"
            />
            <div className="min-w-0">
              <p className="truncate font-bold">{user.fullName}</p>
              <p className="mt-0.5 truncate text-xs text-white/45">
                {user.email}
              </p>
            </div>
          </div>
          <span className="mt-3 inline-flex rounded-full bg-[#8bd0cb]/12 px-2.5 py-1 text-[11px] font-bold text-[#8bd0cb]">
            {t("حساب {{role}}", { role: t(role.label) })}
          </span>
        </div>
        <p className="mb-2 mt-7 px-3 text-[10px] font-bold tracking-[.14em] text-white/30">
          {t("القائمة الرئيسية")}
        </p>
        <nav
          className="dashboard-nav-scroll min-h-0 flex-1 space-y-1 overflow-y-auto pb-3 pe-2"
          aria-label={t("القائمة الرئيسية")}
        >
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${isActive ? "bg-white text-[#174b57] shadow-lg" : "text-white/62 hover:bg-white/[.07] hover:text-white"}`
              }
            >
              <Icon size={19} />
              <span className="flex-1">{t(label)}</span>
              {to === "/app/notifications" && unreadCount > 0 ? (
                <span className="grid min-w-6 place-items-center rounded-full bg-rose-500 px-1.5 text-[10px] font-black leading-5 text-white">
                  {unreadCount > 99
                    ? "+99"
                    : unreadCount.toLocaleString(locale)}
                </span>
              ) : (
                <ChevronDown
                  size={14}
                  className="rotate-90 opacity-0 transition group-hover:opacity-50"
                />
              )}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="mt-3 flex shrink-0 items-center gap-3 rounded-xl border border-white/10 px-3.5 py-3 text-sm font-semibold text-white/60 transition hover:border-rose-300/20 hover:bg-rose-400/10 hover:text-rose-200"
        >
          <LogOut size={18} /> {t("تسجيل الخروج")}
        </button>
      </aside>
      {open && (
        <button
          className="fixed inset-0 z-30 bg-[#071f25]/55 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-label={t("إغلاق القائمة")}
        />
      )}
      <main className="dashboard-main min-h-screen">
        <header className="sticky top-0 z-20 flex h-[82px] items-center justify-between border-b border-[#174b57]/8 bg-white/82 px-5 backdrop-blur-xl lg:px-9">
          <div className="dashboard-welcome ms-14 lg:ms-0">
            <p className="text-xs font-medium text-[#829398]">
              {t("مرحباً بعودتك، {{name}}", {
                name: user.fullName?.split(" ")[0],
              })}
            </p>
            <h1 className="mt-1 font-extrabold text-[#17363e]">
              {t("لوحة {{role}}", { role: t(role.label) })}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <NotificationBell
              unreadCount={unreadCount}
              roles={user.roles || []}
            />
          </div>
        </header>
        <div className="p-5 lg:p-9">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
