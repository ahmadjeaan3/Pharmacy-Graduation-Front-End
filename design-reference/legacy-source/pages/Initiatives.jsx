import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header_dashboard";
import InitiativeCard from "../components/InitiativeCard";
import Report from "../pages/Reports";
import Settings from "../pages/Settings";

export default function Initiatives() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("الكل");

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
      active: true,
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
    },
    {
      title: "إعدادات المنصة",
      icon: "/Icons/Untitled/material-symbols-light_settings-rounded.png",
      path: "/Settings",
    },
  ];

  const categories = [
    "الكل",
    "مبادرات السكري",
    "مبادرات الأدوية",
    "دعم الجمعيات",
  ];

  const initiatives = [
    {
      title: "مبادرة أمراض القلب",
      category: "دعم المرضى المحتاجين",
      target: "100%",
      current: "100%",
      progress: 100,
      image: "/Icons/heartbeat.png",
      bg: "#EAF5F8",
      progressColor: "#227F89",
    },
    {
      title: "التبرع بالأدوية",
      category: "توفير الأدوية للمرضى",
      target: "200 عبوة",
      current: "120 عبوة",
      progress: 60,
      image: "/Icons/medicine.png",
      bg: "#EAF5F8",
      progressColor: "#227F89",
    },
    {
      title: "برنامج التوعية الصحية",
      category: "رفع الوعي الصحي",
      target: "200 عبوة",
      current: "85 عبوة",
      progress: 42,
      image: "/Icons/pills.png",
      bg: "#FCEFD9",
      progressColor: "#FF9C0B",
    },
    {
      title: "مبادرات التوعية بالسكري",
      category: "دعم مرضى السكري",
      target: "200 عبوة",
      current: "120 عبوة",
      progress: 60,
      image: "/Icons/medicine2.png",
      bg: "#EAF5F8",
      progressColor: "#227F89",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F7FB] font-[Tajawal]" dir="rtl">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        menuItems={menuItems}
      />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Header
          title="المبادرات الخيرية"
          subtitle="إدارة المبادرات في النظام"
        />

        <div className="p-8 bg-[#F8F9FB] min-h-screen">
          {/* Top Section */}
          <div className="flex justify-between items-center mb-8 mt-10">
            {/* Categories */}
            <div className="flex gap-4 ml-10 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    h-11
                    px-7
                    rounded-xl
                    text-sm
                    font-medium
                    transition-all
                    duration-300
                    shadow-sm

                    ${
                      selectedCategory === category
                        ? "bg-[#216474] text-white border border-[#216474] shadow-md"
                        : "bg-white text-[#216474] border border-[#EBEBEB] hover:border-[#216474] hover:bg-[#F6FAFB] hover:shadow-md"
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Add Initiative */}
            <button
              className="
    bg-[#216474]
    text-white
    px-8
    h-12
    rounded-xl
    font-medium
    shadow-md
    transition-all
    duration-300
    hover:shadow-lg
    hover:-translate-y-[1px]
    mr-5
    ml-10
    flex
    items-center
    gap-2
  "
            >
              <img
                src="/Icons/add.png"
                alt="add"
                className="w-5 h-5 object-contain"
              />
              إضافة مبادرة جديدة
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {initiatives.map((item, index) => (
              <InitiativeCard key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
