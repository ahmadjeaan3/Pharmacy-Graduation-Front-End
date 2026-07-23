import React, { useState } from "react";
const notifications = [
  {
    id: 1,
    title: "طلب تسجيل صيدلية جديدة",
    subtitle: "صيدلية النور - دمشق",
    type: "عاجلة",
    color: "text-[#216474]",
    border: "border-[#216474]",
    icon: "/Icons/Notifications/pharmacy.png",
  },
  {
    id: 2,
    title: "دواء insulin غير متوفر في المخزون",
    subtitle: "في مدينة دمشق",
    type: "عاجلة",
    color: "text-[#FF9C0B]",
    border: "border-[#FF9C0B]",
    icon: "/Icons/Notifications/Vector.png",
  },
  {
    id: 3,
    title: "تم تحديث بيانات صيدلية الحياة",
    subtitle: "تم تحديث رقم الهاتف بنجاح",
    type: "متوسطة",
    color: "text-[#216474]",
    border: "border-[#216474]",
    icon: "/Icons/Notifications/Vector (1).png",
  },
  {
    id: 4,
    title: "مبادرة خيرية جديدة بانتظار الموافقة",
    subtitle: "مبادرة دعم مرضى السكري",
    type: "متوسطة",
    color: "text-[#216474]",
    border: "border-[#216474]",
    icon: "/Icons/Notifications/Group.png",
  },
  {
    id: 5,
    title: "مستخدم جديد قام بالتسجيل",
    subtitle: "أمجد سالم",
    type: "عادية",
    color: "text-[#216474]",
    border: "border-[#216474]",
    icon: "/Icons/Notifications/Vector (2).png",
  },
];

export default function NotificationsPanel() {
  const [active, setActive] = useState("الكل");

  const tabs = ["الكل", "غير المقروءة", "عاجلة", "متوسطة", "عادية"];

  return (
    <div className="min-h-screen bg-white p-8 font-[Tajawal]">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div
            className="flex flex-row-reverse justify-start gap-3 mb-6 mr-5"
            dir="ltr"
          >
            {tabs.map((tab) => {
              const isActive = active === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  className={`
              px-6 py-3 rounded-xl text-base font-medium transition
              border
              ${
                isActive
                  ? "bg-white border-[#216474] text-[#216474]"
                  : "bg-[#FAFAFA] border-[#EBEBEB] text-gray-500 hover:border-[#216474] hover:text-[#216474] hover:bg-white"
              }
            `}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <div className="border border-[#EBEBEB] rounded-[20px] overflow-hidden w-full h-155">
            {/* Header */}
            <div className="bg-[#F3F8F9] h-[80px] flex items-center border-b border-[#EBEBEB]">
              <div className="w-1/2 text-start mr-23 text-lg font-medium">
                الإشعارات
              </div>
              {/* النوع */}
              <div className="w-1/2 text-center text-lg font-medium ml-7">
                النوع
              </div>
            </div>

            {/* Rows */}
            {notifications.map((item) => (
              <div
                key={item.id}
                className="flex border-b border-[#EBEBEB] h-[110px]"
              >
                <div className="w-1/2 flex flex-col justify-center px-4">
                  {/* icon + title */}
                  <div className="flex items-center gap-3 mr-15">
                    <div className="w-14 h-14 bg-[#F3F8F9] rounded-lg flex items-center justify-center">
                      <img
                        src={item.icon}
                        alt=""
                        className="w-7 h-7 object-contain"
                      />
                    </div>

                    <div className="flex flex-col">
                      {/* العنوان */}
                      <h3 className="text-[#216474] font-medium">
                        {item.title}
                      </h3>

                      {/* تحت العنوان مباشرة */}
                      <p className="text-[#B2B2B2] text-xs mt-2">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* النوع (left column) */}
                <div className="w-1/2 flex items-center justify-center">
                  <div
                    className={`px-4 py-2 rounded-lg border text-sm font-medium ${item.border} ${item.color}`}
                  >
                    {item.type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Sidebar */}
        <div className="w-[360px] space-y-6">
          <div className="border border-[#EBEBEB] rounded-xl p-8 bg-white text-center">
            <img
              src="/Icons/Report/Group .png"
              alt=""
              className="w-20 h-20 mx-auto mb-4"
            />

            <p className="text-[#9BA3AC] text-xl mb-6">لديك 8 إشعارات جديدة</p>

            <button className="w-full bg-[#216474] text-white py-3 rounded-xl font-bold">
              تحديد الكل كمقروء
            </button>
          </div>

          <div className="border border-[#EBEBEB] rounded-xl p-6">
            <h2 className="text-[#216474] text-2xl font-medium mb-6">
              تصفية الإشعارات
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-lg font-medium">
                  نوع الإشعار
                </label>

                <select className="w-full h-14 border border-[#EBEBEB] rounded-xl px-4">
                  <option>اختر النوع</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-lg font-medium">
                  التاريخ
                </label>

                <input
                  type="date"
                  className="w-full h-14 border border-[#EBEBEB] rounded-xl px-4"
                />
              </div>

              <button className="w-full h-14 bg-[#216474] text-white rounded-xl text-lg">
                تصفية
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
