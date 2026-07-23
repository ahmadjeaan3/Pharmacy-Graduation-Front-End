import React from "react";

const activities = [
  {
    user: "أ. أمجد سالم",
    action: "تسجيل دخول",
    details: "تم تسجيل الدخول الى النظام",
    time: "10:30 ص 16 مايو 2016",
    color: "#F9EAD4",
    icon: "/Icons/Vector (10).png",
  },
  {
    user: "د. محمد حسين",
    action: "تسجيل دخول",
    details: "تم تسجيل الدخول الى النظام",
    time: "10:30 ص 16 مايو 2016",
    color: "#E8EDF0",
    icon: "/Icons/Vector (8).png",
  },
  {
    user: "د. محمد حسين",
    action: "اضافة مستخدم جديد",
    details: "تم اضافة مستخدم جديد",
    time: "10:30 ص 16 مايو 2016",
    color: "#E8EDF0",
    icon: "/Icons/Vector (12).png",
  },
];

export default function ActivityLog() {
  return (
    <>
      {/* Actions */}
      <div className="flex items-center justify-between p-8">
        <div />

        <div className="flex items-center gap-4">
          <div className="w-[345px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center px-4">
            <img src="/Icons/search.png" alt="" className="w-5 h-5 ml-3" />

            <input
              placeholder="بحث في سجل النشاط .."
              className="w-full outline-none text-[18px]"
            />
          </div>

          <button className="w-[194px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center justify-center gap-2 text-[#216474] font-bold text-[20px]">
            <img src="/Icons/filter.png" alt="" className="w-5 h-5" />
            تصفية
          </button>

          <button className="w-[194px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center justify-center gap-2 text-[#216474] font-bold text-[20px]">
            <img src="/Icons/dwonload.png" alt="" className="w-5 h-5" />
            تصدير
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mx-8 mb-8 bg-white border border-[#EBEBEB] rounded-[20px] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1.4fr] bg-[#F7F8FA] h-[76px] items-center px-8 text-[20px] font-bold text-[#263238]">
          <div className="text-right">الوقت</div>

          <div className="text-center">المستخدم</div>

          <div className="text-center">النشاط</div>

          <div className="text-center">التفاصيل</div>
        </div>

        {/* Rows */}
        {activities.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.2fr_1fr_1fr_1.4fr] items-center min-h-[76px] px-8 border-b border-[#EBEBEB]"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-[47px] h-[47px] rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: item.color,
                }}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="w-5 h-5 object-contain"
                />
              </div>

              <span className="text-[20px] text-[#717171]">{item.time}</span>
            </div>

            <div className="text-center text-[20px] font-bold text-[#263238]">
              {item.user}
            </div>

            <div className="text-center text-[20px] font-bold text-[#263238]">
              {item.action}
            </div>

            <div className="text-center text-[20px] text-[#717171]">
              {item.details}
            </div>
          </div>
        ))}

        {/* Show More */}
        <div className="p-5">
          <button className="w-full h-[60px] border border-[#EBEBEB] rounded-[20px] text-[20px] font-bold text-[#000] flex items-center justify-center gap-3">
            عرض المزيد
            <img src="/Icons/Vector (13).png" alt="" />
          </button>
        </div>
      </div>
    </>
  );
}
