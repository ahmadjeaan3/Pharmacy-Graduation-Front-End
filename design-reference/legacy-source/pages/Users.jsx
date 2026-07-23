import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header_dashboard";
import StatsCards from "../components/StatsCards";
import role from "../components/Roles";
import RolesPermissions from "../components/Roles";
import UserTables from "../components/Usertable";
import ActivityLog from "../components/ActivityLog";
import Initiatives from "../pages/Initiatives";
import Orders from "../pages/Orders";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";

import Report from "../pages/Reports";
export default function UsersDashboard() {
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
      active: true,
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
        <Header
          title="المستخدمين و الأدوار"
          subtitle="إدارة المستخدمين في النظام"
        />
        {/* CARDS */}
        <StatsCards stats={stats} />

        <div className="w-full bg-[#F9FAFC] border border-[#EBEBEB] rounded-[20px] mt-6 overflow-hidden">
          {/* Tabs */}
          <div className="h-[80px] bg-white border-b border-[#EBEBEB] px-8">
            <div className="flex h-full items-center gap-20 text-[20px] font-medium">
              <button
                onClick={() => setActiveTab("users")}
                className={`relative h-full flex items-center ${
                  activeTab === "users" ? "text-[#216474]" : "text-[#000000]"
                }`}
              >
                جميع المستخدمين
                {activeTab === "users" && (
                  <div className="absolute bottom-0 right-0 w-full h-[3px] bg-[#216474]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("roles")}
                className={`relative h-full flex items-center ${
                  activeTab === "roles" && <RolesPermissions />
                    ? "text-[#216474]"
                    : "text-[#000000]"
                }`}
              >
                الأدوار والصلاحيات
                {activeTab === "roles" && (
                  <div className="absolute bottom-0 right-0 w-full h-[3px] bg-[#216474]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("activity")}
                className={`relative h-full flex items-center ${
                  activeTab === "activity" ? "text-[#216474]" : "text-[#000000]"
                }`}
              >
                سجل النشاط
                {activeTab === "activity" && (
                  <div className="absolute bottom-0 right-0 w-full h-[3px] bg-[#216474]" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}

          {activeTab === "users" && <UserTables />}

          {activeTab === "roles" && <RolesPermissions />}

          {activeTab === "activity" && <ActivityLog />}
        </div>
      </div>
    </div>
  );
}

/* CARD COMPONENT */
function Card({ title, value, change }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <h2 className="text-3xl font-bold">{value}</h2>
      <p className="text-gray-700 mt-1">{title}</p>
      <p className="text-gray-400 text-sm">عن الشهر الماضي</p>
      <p className="text-red-500 mt-2 text-sm">{change}</p>
    </div>
  );
}
