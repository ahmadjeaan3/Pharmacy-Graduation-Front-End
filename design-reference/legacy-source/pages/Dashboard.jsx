import React, { useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header_dashboard";
import StatsCards from "../components/StatsCards";
import PharmacyRequests from "../components/PharmacyRequests";
import PendingInitiatives from "../components/PendingInitiatives";
import PlatformActivity from "../components/PlatformActivity";
import Settings from "../pages/Settings";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      title: "لوحة التحكم",
      icon: "/Icons/ic_outline-home.png",
    },
    {
      title: "نظرة عامة",
      icon: "/Icons/Untitled/boxicons_grid.png",
      active: true,
    },
    {
      title: "المستخدمين",
      icon: "/Icons/Untitled/humbleicons_users.png",
      path: "/users",
    },
    {
      title: "الصيدليات",
      icon: "/Icons/Untitled/bx_store.png",
    },
    {
      title: "المبادرات الخيرية",
      icon: "/Icons/Untitled/tabler_heart-handshake.png",
    },
    {
      title: "الطلبات",
      icon: "/Icons/Untitled/boxicons_chart-bar-big-columns.png",
    },
    {
      title: "التقارير",
      icon: "/Icons/Untitled/solar_clipboard-outline.png",
    },
    {
      title: "الإشعارات",
      icon: "/Icons/Untitled/lucide_bell.png",
    },
    {
      title: "إعدادات المنصة",
      icon: "/Icons/Untitled/material-symbols-light_settings-rounded.png",
      path: "/Settings",
    },
  ];

  const stats = [
    {
      title: "طلبات اليوم",
      value: "2,845",
      icon: "/Icons/orderes.png",
      graph: "/Icons/graph-1.png",
      color: "#F2B43D",
    },
    {
      title: "الصيدليات المسجلة",
      value: "2,845",
      icon: "/Icons/boxicons_pharmacy.png",
      graph: "/Icons/graph-2.png",
      color: "#27A59F",
    },
    {
      title: "الطلبات النشطة",
      value: "2,845",
      icon: "/Icons/Vector (7).png",
      graph: "/Icons/graph-2.png",
      color: "#27A59F",
    },
    {
      title: "إجمالي المستخدمين",
      value: "2,845",
      icon: "/Icons/Vector (9).png",
      graph: "/Icons/graph-2.png",
      color: "#27A59F",
    },
  ];

  return (
    <div
      dir="rtl"
      className="w-full min-h-screen bg-[#F7F9FA] overflow-hidden flex font-[Tajawal]"
    >
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        menuItems={menuItems}
      />

      <div className="flex-1 p-8 overflow-y-auto">
        <Header />

        <StatsCards stats={stats} />

        <div className="flex gap-6 mt-8">
          <PlatformActivity />

          <PendingInitiatives />
          <PharmacyRequests />
        </div>
      </div>
    </div>
  );
}
