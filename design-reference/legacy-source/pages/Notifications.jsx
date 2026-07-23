import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header_dashboard";
import StatsCards from "../components/StatsCards";
import ReportsFilters from "../components/ReportsFilters";
import DashboardBottomSection from "../components/DashboardBottomSection";
import NotificationsPanel from "../components/NotificationsPanel";
import Settings from "../pages/Settings";

export default function Notifications() {
  const filters = ["الكل", "غير المقروءة", "عاجلة", "متوسطة", "عادية"];

  const notifications = [
    { id: 1, text: "إشعار عاجل", type: "urgent" },
    { id: 2, text: "إشعار متوسط", type: "medium" },
    { id: 3, text: "إشعار عادي", type: "normal" },
    { id: 4, text: "غير مقروء", type: "unread" },
  ];
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { title: "لوحة التحكم", icon: "/Icons/ic_outline-home.png" },
    {
      title: "نظرة عامة",
      icon: "/Icons/Untitled/boxicons_grid.png",
      path: "/dashboard",
    },
    {
      title: "المستخدمين",
      icon: "/Icons/Untitled/humbleicons_users.png",
      path: "/users",
    },
    {
      title: "الصيدليات",
      icon: "/Icons/Untitled/bx_store.png",
      path: "/pharmacy",
    },
    {
      title: "المبادرات الخيرية",
      icon: "/Icons/Untitled/tabler_heart-handshake.png",
      path: "/Initiatives",
    },
    {
      title: "الطلبات",
      icon: "/Icons/Untitled/boxicons_chart-bar-big-columns.png",
      path: "/Orders",
    },
    { title: "التقارير", icon: "/Icons/Untitled/solar_clipboard-outline.png" },
    {
      title: "الإشعارات",
      icon: "/Icons/Untitled/lucide_bell.png",
      path: "/Notifications",
      active: true,
    },
    {
      title: "إعدادات المنصة",
      icon: "/Icons/Untitled/material-symbols-light_settings-rounded.png",
      path: "/Settings",
    },
  ];
  const badgeStyle = {
    urgent: "text-orange-500 border-orange-500",
    medium: "text-teal-600 border-teal-600",
    normal: "text-teal-600 border-teal-600",
    unread: "text-gray-400 border-gray-400",
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FB] font-[Tajawal]" dir="rtl">
      {/* SIDEBAR */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        menuItems={menuItems}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6">
        {/* HEADER */}
        <Header title=" الاشعارات " subtitle="إدارة الاشعارات  في النظام" />
        <NotificationsPanel />
      </div>
    </div>
  );
}
