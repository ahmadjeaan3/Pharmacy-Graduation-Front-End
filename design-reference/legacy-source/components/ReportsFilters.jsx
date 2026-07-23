import React from "react";

export default function ReportsFilters() {
  return (
    <div className="flex gap-4 w-full mt-8">
      {/* Filters */}
      <div className="flex-1 h-[140px] bg-white border border-[#EBEBEB] rounded-[10px] p-6">
        <div className="grid grid-cols-4 gap-6">
          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              من تاريخ
            </label>

            <div className="h-[52px] border border-[#EBEBEB] rounded-[10px] px-4 flex items-center justify-between bg-white">
              <span className="text-[#B2B2B2] text-sm">31/05/2026</span>

              <img
                src="/Icons/Report/uiw_date.png"
                alt=""
                className="w-6 h-6"
              />
            </div>
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              الى تاريخ
            </label>

            <div className="h-[52px] border border-[#EBEBEB] rounded-[10px] px-4 flex items-center justify-between bg-white">
              <span className="text-[#B2B2B2] text-sm">31/05/2026</span>

              <img
                src="/Icons/Report/uiw_date.png"
                alt=""
                className="w-6 h-6"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              المدينة
            </label>

            <div className="h-[52px] border border-[#EBEBEB] rounded-[10px] px-4 flex items-center justify-between bg-white">
              <span className="text-[#B2B2B2] text-sm">كل المدن</span>

              <img
                src="/Icons/Report/ion_chevron-down-outline.png"
                alt=""
                className="w-5 h-5"
              />
            </div>
          </div>

          {/* Pharmacy */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              الصيدلية
            </label>

            <div className="h-[52px] border border-[#EBEBEB] rounded-[10px] px-4 flex items-center justify-between bg-white">
              <span className="text-[#B2B2B2] text-sm">كل الصيدليات</span>

              <img
                src="/Icons/Report/ion_chevron-down-outline.png"
                alt=""
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Export Box */}
      <div className="w-[280px] h-[140px] bg-white border border-[#EBEBEB] rounded-[10px] flex items-center justify-center gap-6">
        <button className="transition hover:scale-105">
          <img
            src="/Icons/Report/file-icons_microsoft-excel.png"
            alt="Excel"
            className="w-[70px] h-[70px] object-contain"
          />
        </button>

        <button className="transition hover:scale-105">
          <img
            src="/Icons/Report/teenyicons_pdf-solid.png"
            alt="PDF"
            className="w-[70px] h-[70px] object-contain"
          />
        </button>
      </div>
    </div>
  );
}
