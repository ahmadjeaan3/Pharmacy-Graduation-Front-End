import React from "react";

export default function RolesPermissions() {
  const roles = [
    {
      role: "مدير النظام",
      users: 5,
      permissions: "28 صلاحية",
    },
    {
      role: "مدير الصيدليات",
      users: 24,
      permissions: "28 صلاحية",
    },
    {
      role: "صيدلي",
      users: 24,
      permissions: "18 صلاحية",
    },
  ];

  return (
    <div className="bg-[#F9FAFC] border border-[#EBEBEB] rounded-[20px] mt-6 overflow-hidden">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-8">
        <button className="w-[222px] h-[58px] bg-[#216474] text-white rounded-[10px] text-[20px] font-medium">
          إضافة دور جديد
        </button>

        <div className="flex flex-wrap gap-4">
          <div className="w-[345px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center px-4">
            <img src="/Icons/search.png" className="w-5 h-5 ml-2" alt="" />
            <input
              placeholder="بحث عن دور .."
              className="w-full outline-none text-[18px]"
            />
          </div>

          <button className="w-[194px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center justify-center gap-2 text-[#216474] font-bold text-[18px]">
            <img src="/Icons/filter.png" className="w-5 h-5" alt="" />
            تصفية
          </button>

          <button className="w-[194px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center justify-center gap-2 text-[#216474] font-bold text-[18px]">
            <img src="/Icons/dwonload.png" className="w-5 h-5" alt="" />
            تصدير
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mx-8 mb-8 bg-white border border-[#EBEBEB] rounded-[20px] overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr] bg-[#F7F8FA] h-[89px] items-center px-10 border-b border-[#EBEBEB]">
          <div className="text-[20px] font-bold text-[#263238]">الدور</div>

          <div className="text-center text-[20px] font-bold text-[#263238]">
            عدد المستخدمين
          </div>

          <div className="text-center text-[20px] font-bold text-[#263238]">
            الصلاحيات
          </div>

          <div className="text-center text-[20px] font-bold text-[#263238]">
            الإجراءات
          </div>
        </div>

        {/* Rows */}
        {roles.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr] items-center px-10 h-[78px] border-b border-[#EBEBEB]"
          >
            <div className="text-[20px] font-bold text-[#263238]">
              {item.role}
            </div>

            <div className="text-center text-[20px] font-bold text-[#717171]">
              {item.users}
            </div>

            <div className="text-center text-[20px] font-bold text-[#717171]">
              {item.permissions}
            </div>

            <div className="flex justify-center gap-5">
              <button>
                <img src="/Icons/edit.png" className="w-5 h-5" alt="" />
              </button>

              <button>
                <img src="/Icons/delete.png" className="w-5 h-5" alt="" />
              </button>

              <button>
                <img src="/Icons/menu.png" alt="" />
              </button>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#EBEBEB]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-[142px] h-[40px] border border-[#E0E0E0] rounded-[10px] flex items-center justify-center gap-2">
                <span>10</span>

                <img
                  src="/Icons/ion_chevron-down-outline (1).png"
                  className="w-4 h-4"
                  alt=""
                />
              </div>

              <span className="text-[#B2B2B2] text-[18px]">
                عرض 1-5 من 5 أدوار
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button className="w-[112px] h-[58px] border border-[#E0E0E0] rounded-[10px] font-bold text-[18px]">
                السابق
              </button>

              <button className="w-[44px] h-[44px] rounded bg-[#216474] text-white">
                1
              </button>

              <button className="w-[44px] h-[44px] text-[#717171]">2</button>

              <button className="w-[44px] h-[44px] text-[#717171]">3</button>

              <button className="w-[44px] h-[44px] text-[#717171]">4</button>

              <button className="w-[44px] h-[44px] text-[#717171]">5</button>

              <button className="w-[112px] h-[58px] border border-[#E0E0E0] rounded-[10px] font-bold text-[18px]">
                التالي
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
