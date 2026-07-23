import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header_dashboard";
import StatsCards from "../components/StatsCards";
import ReportsFilters from "../components/ReportsFilters";
import DashboardBottomSection from "../components/DashboardBottomSection";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";
export default function Report() {
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
    {
      title: "التقارير",
      icon: "/Icons/Untitled/solar_clipboard-outline.png",
      path: "/Report",
      active: true,
    },
    {
      title: "الإشعارات",
      icon: "/Icons/Untitled/lucide_bell.png",
      path: "/Notifications",
    },
    {
      title: "إعدادات المنصة",
      icon: "/Icons/Untitled/material-symbols-light_settings-rounded.png",
      path: "/Settings",
    },
  ];
  const stats = [
    {
      title: " اجمالي المستخدمين",
      value: "108",
      icon: "/Icons/user1.png",

      color: "#F2B43D",
    },
    {
      title: "المستخدمين النشطين",
      value: "78",
      icon: "/Icons/user.png",

      color: "#27A59F",
    },
    {
      title: "المستخدمين غير النشطين",
      value: "18",
      icon: "/Icons/user2.png",

      color: "#27A59F",
    },
    {
      title: "المستخدمين الموقوفين",
      value: "8",
      icon: "/Icons/user3.png",

      color: "#27A59F",
    },
  ];
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
        <Header title=" التقارير " subtitle="إدارة التقارير في النظام" />
        {/* CARDS */}
        {/* <StatsCards stats={stats} /> */}
        <ReportsFilters />
        <DashboardBottomSection />
      </div>
    </div>
  );
}
