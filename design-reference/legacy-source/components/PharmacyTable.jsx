import React from "react";

export default function UserTables() {
  const pharmacies = [
    {
      name: "صيدلية الشفاء",
      owner: "د. امجد سالم",
      region: "ادلب",
      license: "PH-2026-1234",
      status: "نشطة",
      date: "2026-05-15",
    },
    {
      name: "صيدلية النور",
      owner: "د. سارة علي",
      region: "حلب",
      license: "PH-2026-7788",
      status: "غير نشطة",
      date: "2026-05-12",
    },
    {
      name: "صيدلية الحياة",
      owner: "د. محمد حسن",
      region: "دمشق",
      license: "PH-2026-9911",
      status: "تحتاج موافقة",
      date: "2026-05-10",
    },
    {
      name: "صيدلية الحياة",
      owner: "د. محمد حسن",
      region: "دمشق",
      license: "PH-2026-9911",
      status: "تحتاج موافقة",
      date: "2026-05-10",
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "نشطة":
        return "bg-[#E8EDF0] text-[#27A59F]-700";
      case "غير نشطة":
        return "bg-gray-100 text-gray-600";
      case "تحتاج موافقة":
        return "bg-[#F9EAD4] text-yellow-700";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <>
      {/* HEADER ACTIONS */}
      <div className="flex items-center justify-between p-8">
        <button className="w-[222px] h-[58px] bg-[#216474] text-white rounded-[10px] flex items-center justify-center gap-2 text-[20px] font-medium">
          <img src="/Icons/add.png" className="w-5 h-5" />
          صيدلية جديدة
        </button>

        <div className="flex items-center gap-4">
          <div className="w-[345px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center px-4">
            <img src="/Icons/search.png" className="w-5 h-5 ml-3" />
            <input
              placeholder="بحث عن صيدلية .."
              className="w-full outline-none text-[18px]"
            />
          </div>

          <button className="w-[194px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center justify-center gap-2 text-[#216474] font-bold text-[20px]">
            <img src="/Icons/filter.png" className="w-5 h-5" />
            تصفية
          </button>

          <button className="w-[194px] h-[58px] border border-[#EBEBEB] rounded-[10px] flex items-center justify-center gap-2 text-[#216474] font-bold text-[20px]">
            <img src="Icons/dwonload.png" className="w-5 h-5" />
            تصدير
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="mx-8 mb-8 bg-white border border-[#EBEBEB] rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* HEADER */}
            <div className="grid grid-cols-7 bg-[#F7F8FA] h-[87px] items-center px-8 text-[20px] font-bold text-[#263238]">
              <div>اسم الصيدلية</div>
              <div>المالك</div>
              <div>المنطقة</div>
              <div>رقم الترخيص</div>
              <div>الحالة</div>
              <div>تاريخ الإضافة</div>
              <div className="text-center">الإجراءات</div>
            </div>

            {/* ROWS */}
            {pharmacies.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-7 items-center px-8 h-[74px] border-b border-[#EBEBEB]"
              >
                {/* name */}
                <div className="font-bold text-[20px] text-[#263238]">
                  {item.name}
                </div>

                {/* owner */}
                <div className="text-[20px] text-[#717171]">{item.owner}</div>

                {/* region */}
                <div className="text-[20px] text-[#717171]">{item.region}</div>

                {/* license */}
                <div className="text-[20px] text-[#717171] ">
                  {item.license}
                </div>

                {/* status */}
                <div className="flex justify-center -mr-38">
                  <span
                    className={`px-4 py-1 rounded-[10px] text-[14px] font-bold  ${getStatusStyle(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                {/* date */}
                <div className="text-[20px] text-[#717171] mr-10">
                  {item.date}
                </div>

                {/* actions */}
                <div className="flex justify-center items-center gap-4">
                  <button title="تعديل">
                    <img src="/Icons/edit.png" className="w-5 h-5" />
                  </button>

                  <button title="حذف">
                    <img src="/Icons/delete.png" className="w-5 h-5" />
                  </button>

                  <button title="تفاصيل">
                    <img src="/Icons/menu.png" />
                  </button>
                </div>
              </div>
            ))}

            {/* FOOTER */}
            <div className="flex items-center justify-between px-8 py-6">
              <span className="text-[20px] text-[#B2B2B2]">
                عرض 1-10 من 124 صيدلية
              </span>

              <div className="flex items-center gap-3">
                <button className="w-[112px] h-[58px] border rounded-[10px] ml-4">
                  السابق
                </button>

                {[1, 2, 3, 4, 5].map((p) => (
                  <button
                    key={p}
                    className={`w-[38px] h-[38px] rounded ${
                      p === 1 ? "bg-[#216474] text-white" : "text-[#717171]"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button className="w-[112px] h-[58px] border rounded-[10px]">
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
