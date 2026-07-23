import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header_dashboard";
import StatsCards from "../components/StatsCards";
import PharmacyTable from "../components/PharmacyTable";
import Initiatives from "../pages/Initiatives";
import Orders from "../pages/Orders";
import Report from "../pages/Reports";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";
export default function Pharmacy() {
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
      active: true,
    },
    {
      title: "المبادرات الخيرية",
      icon: "/Icons/Untitled/tabler_heart-handshake.png",
      path: "/Initiatives",
    },
    {
      title: "الطلبات",
      icon: "/Icons/Untitled/boxicons_chart-bar-big-columns.png",
      path: "/Report",
    },
    {
      title: "التقارير",
      icon: "/Icons/Untitled/solar_clipboard-outline.png",
      path: "/Report",
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
      title: " تحتاج موافقة ",
      value: "8",
      icon: "/Icons/icon-park-outline_add-two.png",
      color: "#27A59F",
    },
    {
      title: " الصيدليات غير النشطة",
      value: "27",
      icon: "/Icons/Vector (14).png",

      color: "#cecdcd",
    },
    {
      title: "الصيدليات النشطة  ",
      value: "103",
      icon: "/Icons/Vector (15).png",
      color: "#F2B43D",
    },
    {
      title: "اجمالي الصيدليات ",
      value: "200",
      icon: "/Icons/Vector (16).png",

      color: "#27A59F",
    },
  ];
  const [activeTab, setActiveTab] = useState("pharmecy");
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
        <Header title="الصيدليات  " subtitle="إدارة الصيدليات في النظام" />
        {/* CARDS */}
        <StatsCards stats={stats} />
        <PharmacyTable />
      </div>
    </div>
  );
}
