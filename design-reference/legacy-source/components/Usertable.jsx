import React from "react";

export default function UserTables() {
  return (
    <>
      <div className="flex items-center justify-between p-8">
        <button className="w-[222px] h-[58px] bg-[#216474] text-white rounded-[10px] flex items-center justify-center gap-2 text-[20px] font-medium">
          <img src="/Icons/add.png" className="w-5 h-5" />
          مستخدم جديد
        </button>

        <div className="flex items-center gap-4">
          <div className="w-[345px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center px-4">
            <img src="/Icons/search.png" className="w-5 h-5 ml-3" />

            <input
              placeholder="بحث عن مستخدم .."
              className="w-full outline-none text-[18px]"
            />
          </div>

          <button className="w-[194px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center justify-center gap-2 text-[#216474] font-bold text-[20px]">
            <img src="/Icons/filter.png" className="w-5 h-5" />
            تصفية
          </button>

          <button className="w-[194px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center justify-center gap-2 text-[#216474] font-bold text-[20px]">
            <img src="/Icons/dwonload.png" className="w-5 h-5" />
            تصدير
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mx-8 mb-8 bg-white border border-[#EBEBEB] rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            {/* Header */}
            <div className="grid grid-cols-[1.3fr_1.6fr_1fr_1.2fr_0.6fr] bg-[#F7F8FA] h-[87px] items-center px-8 text-[20px] font-bold text-[#263238]">
              <div>المستخدم</div>

              <div>البريد الالكتروني</div>

              <div>الدور</div>

              <div>اخر تسجيل دخول</div>

              <div className="text-center">الاجراءات</div>
            </div>

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="grid grid-cols-[1.3fr_1.6fr_1fr_1.2fr_0.6fr] items-center px-8 h-[74px] border-b border-[#EBEBEB]"
              >
                <div className="font-bold text-[20px] text-[#263238]">
                  أ. أمجد سالم
                </div>

                <div className="text-[20px] text-[#717171] underline">
                  amjadaa@gmail.com
                </div>

                <div>
                  <span className="inline-flex items-center justify-center w-[136px] h-[39px] rounded-[10px] bg-[#E8EDF0] text-[16px] font-bold text-[#263238]">
                    صيدلي
                  </span>
                </div>

                <div className="text-[20px] text-[#717171]">
                  16 مايو 2026 - 10:30 ص
                </div>

                <div className="flex justify-center items-center gap-4">
                  <button>
                    <img src="/Icons/edit.png" className="w-5 h-5" />
                  </button>

                  <button>
                    <img src="/Icons/delete.png" className="w-5 h-5" />
                  </button>

                  <button>
                    <img src="/Icons/menu.png" />
                  </button>
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="flex items-center justify-between px-8 py-6">
              {/* Right */}
              <div className="flex items-center gap-4">
                <div className="w-[142px] h-[40px] border border-[#E0E0E0] rounded-[10px] flex items-center justify-center gap-2 text-[18px]">
                  <span>10</span>

                  <img
                    src="/Icons/ion_chevron-down-outline (1).png"
                    className="w-4 h-4"
                  />
                </div>

                <span className="text-[20px] text-[#B2B2B2]">
                  عرض 1-10 من 124 مستخدم
                </span>
              </div>

              {/* Left */}
              <div className="flex items-center gap-3">
                <button className="w-[112px] h-[58px] border border-[#E0E0E0] rounded-[10px] text-[20px] font-bold text-[#263238]">
                  السابق
                </button>

                <button className="w-[38px] h-[38px] rounded bg-[#216474] text-white font-medium">
                  1
                </button>

                <button className="w-[26px] text-[#717171] text-[18px]">
                  2
                </button>

                <button className="w-[26px] text-[#717171] text-[18px]">
                  3
                </button>

                <button className="w-[26px] text-[#717171] text-[18px]">
                  4
                </button>

                <button className="w-[26px] text-[#717171] text-[18px]">
                  5
                </button>

                <button className="w-[112px] h-[58px] border border-[#E0E0E0] rounded-[10px] text-[20px] font-bold text-[#263238]">
                  التالي
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
