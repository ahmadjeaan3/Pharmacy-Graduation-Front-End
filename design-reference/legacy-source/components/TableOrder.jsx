import React from "react";

export default function TableOrder() {
  const data = [
    {
      id: "PH-2026-1234",
      pharmacy: "صيدلية الشفاء",
      owner: "د. محمد العيسى",
      phone: "0500000000",
      city: "إدلب",
      date: "16 مايو 2026",
      time: "10:30 ص",
      status: "قيد المراجعة",
    },
    {
      id: "PH-2026-1235",
      pharmacy: "صيدلية الشفاء",
      owner: "د. محمد العيسى",
      phone: "0500000000",
      city: "إدلب",
      date: "16 مايو 2026",
      time: "10:30 ص",
      status: "مقبولة",
    },
    {
      id: "PH-2026-1236",
      pharmacy: "صيدلية الشفاء",
      owner: "د. محمد العيسى",
      phone: "0500000000",
      city: "إدلب",
      date: "16 مايو 2026",
      time: "10:30 ص",
      status: "مرفوضة",
    },
    {
      id: "PH-2026-1237",
      pharmacy: "صيدلية الشفاء",
      owner: "د. محمد العيسى",
      phone: "0500000000",
      city: "إدلب",
      date: "16 مايو 2026",
      time: "10:30 ص",
      status: "قيد المراجعة",
    },
    {
      id: "PH-2026-1238",
      pharmacy: "صيدلية الشفاء",
      owner: "د. محمد العيسى",
      phone: "0500000000",
      city: "إدلب",
      date: "16 مايو 2026",
      time: "10:30 ص",
      status: "مقبولة",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "قيد المراجعة":
        return "bg-[#FFF1D8] text-[#F59E0B]";
      case "مقبولة":
        return "bg-[#EDF2F7] text-[#374151]";
      case "مرفوضة":
        return "bg-[#EDF2F7] text-[#374151]";
      default:
        return "";
    }
  };

  return (
    <div
      dir="rtl"
      className="bg-[#F8F9FB] border border-[#E5E7EB] rounded-[20px] p-6 mt-10"
    >
      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        {/* Search */}
        <div className="relative">
          <img
            src="/Icons/search.png"
            alt=""
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5"
          />

          <input
            type="text"
            placeholder="بحث برقم الطلب أو اسم الصيدلية"
            className="w-[320px] h-[46px] bg-white border border-[#E5E7EB] rounded-xl pr-12 pl-4 outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="h-[46px] px-6 bg-white border border-[#E5E7EB] rounded-xl flex items-center gap-2">
            الحالة : الكل
            <img src="/Icons/orders/arrow-down.png" alt="" />
          </button>

          <button className="h-[46px] px-6 bg-white border border-[#E5E7EB] rounded-xl flex items-center gap-2">
            المدينة : الكل
            <img src="/Icons/orders/arrow-down.png" alt="" />
          </button>

          <button className="h-[46px] px-6 bg-white border border-[#E5E7EB] rounded-xl flex items-center gap-2">
            <img src="/Icons/orders/uiw_date.png" alt="" className="w-4 h-4" />
            تاريخ الطلب
          </button>
          <button className="h-[46px] px-6 bg-white border border-[#E5E7EB] rounded-xl flex items-center gap-2">
            <img src="/Icons/orders/download.png" alt="" className="w-4 h-4" />
            تصدير
          </button>

          <button className="h-[46px] px-6 bg-white border border-[#E5E7EB] rounded-xl flex items-center gap-2">
            <img src="/Icons/filter.png" alt="" className="w-4 h-4" />
            تصفية
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F9FB] text-[#374151]">
              <th className="py-5">رقم الطلب</th>
              <th>اسم الصيدلية</th>
              <th>المالك / المسؤول</th>
              <th>المدينة</th>
              <th>تاريخ الطلب</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-t border-[#F1F3F5]">
                <td className="py-5 text-center font-medium">{row.id}</td>

                <td className="text-center">
                  <div className="font-semibold">{row.pharmacy}</div>

                  <div className="text-xs text-gray-400 mt-1">حي النخيل</div>
                </td>

                <td className="text-center">
                  <div>{row.owner}</div>

                  <div className="text-xs text-gray-400 mt-1">{row.phone}</div>
                </td>

                <td className="text-center">{row.city}</td>

                <td className="text-center">
                  <div>{row.date}</div>

                  <div className="text-xs text-gray-400">{row.time}</div>
                </td>

                <td className="text-center">
                  <span
                    className={`px-4 py-2 rounded-lg text-xs font-medium ${getStatusStyle(
                      row.status,
                    )}`}
                  >
                    {row.status}
                  </span>
                </td>

                <td>
                  <div className="flex justify-center gap-4">
                    <button>
                      <img
                        src="/Icons/edit.png"
                        alt="edit"
                        className="w-5 h-5"
                      />
                    </button>

                    <button>
                      <img
                        src="/Icons/delete.png"
                        alt="delete"
                        className="w-5 h-5"
                      />
                    </button>
                    <button>
                      <img src="/Icons/menu.png" alt="delete" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">عرض 1-10 من 36 طلب</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-[80px] h-[40px] border border-[#E5E7EB] rounded-xl bg-white">
            التالي
          </button>

          <button className="w-8 h-8 rounded bg-[#E9ECEF]">1</button>

          <button className="w-8 h-8">2</button>
          <button className="w-8 h-8">3</button>
          <button className="w-8 h-8">4</button>
          <button className="w-8 h-8">5</button>

          <button className="w-[80px] h-[40px] border border-[#E5E7EB] rounded-xl bg-white">
            السابق
          </button>
        </div>
      </div>
    </div>
  );
}
