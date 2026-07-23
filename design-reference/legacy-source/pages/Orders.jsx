import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header_dashboard";
import StatsOrderCards from "../components/StatsOrderCard";
import role from "../components/Roles";
import RolesPermissions from "../components/Roles";
import UserTables from "../components/Usertable";
import ActivityLog from "../components/ActivityLog";
import Initiatives from "../pages/Initiatives";
import TableOrder from "../components/TableOrder";
import Report from "../pages/Reports";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";

export default function Orders() {
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
      active: true,
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
      title: " اجمالي الطلبات",
      value: "38",
      icon: "/Icons/orders/Vector.png",
      color: "#27A59F",
    },
    {
      title: " قيد المراجعة",
      value: "18",
      icon: "/Icons/orders/charm_hourglass.png",
      color: "#F2B43D",
    },
    {
      title: " المقبولة ",
      value: "12",
      icon: "/Icons/orders/charm_circle-tick.png",

      color: "#27A59F",
    },
    {
      title: " المرفوضة",
      value: "6",
      icon: "/Icons/orders/Group.png",

      color: "#27A59F",
    },
  ];
  const [activeTab, setActiveTab] = useState("users");
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
        <Header title=" الطلبات " subtitle="إدارة الطلبات في النظام" />
        {/* CARDS */}
        <StatsOrderCards stats={stats} />

        <TableOrder />
      </div>
    </div>
  );
}
