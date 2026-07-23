import React from "react";

export default function DashboardBottomSection() {
  const topPharmacies = [
    {
      id: 1,
      pharmacy: "صيدلية الشفاء",
      orders: 125,
      city: "دمشق",
      rating: 4.8,
    },
    {
      id: 2,
      pharmacy: "صيدلية الحكمة",
      orders: 98,
      city: "حلب",
      rating: 4.6,
    },
    {
      id: 3,
      pharmacy: "صيدلية الأمل",
      orders: 76,
      city: "حمص",
      rating: 4.5,
    },
    {
      id: 4,
      pharmacy: "صيدلية الحياة",
      orders: 65,
      city: "ادلب",
      rating: 4.3,
    },
    {
      id: 5,
      pharmacy: "صيدلية النور",
      orders: 58,
      city: "ادلب",
      rating: 3.2,
    },
  ];

  const alerts = [
    {
      medicine: "إنسولين",
      cities: "دمشق، حلب، حمص",
    },
    {
      medicine: "فيتتولين",
      cities: "حلب، إدلب",
    },
    {
      medicine: "كلاريتيف",
      cities: "دمشق",
    },
    {
      medicine: "بانادول",
      cities: "حمص، اللاذقية",
    },
  ];

  const reports = [
    {
      title: "تقرير الصيدليات",
      icon: "/Icons/Report/bx_store.png",
      download: "/Icons/Report/download.png",
    },
    {
      title: "تقرير الطلبات",
      icon: "/Icons/Report/order.png",
      download: "/Icons/Report/download.png",
    },
    {
      title: "تقارير الأدوية",
      icon: "/Icons/Report/pill.png",
      download: "/Icons/Report/download.png",
    },
    {
      title: "تقارير توفر الأدوية",
      icon: "/Icons/Report/Group .png",
      download: "/Icons/Report/download.png",
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-6 mt-10">
      {/* التقارير الجاهزة */}
      <div className="col-span-4 bg-white border border-[#EBEBEB] rounded-xl p-5">
        <h3 className="font-bold text-[15px] mb-8">التقارير الجاهزة</h3>

        <div className="grid grid-cols-2 gap-4">
          {reports.map((report, index) => (
            <div
              key={index}
              className="border border-[#EBEBEB] rounded-xl h-[88px] px-4 flex items-center justify-between hover:shadow-md transition"
            >
              <img
                src={report.icon}
                alt=""
                className="w-10 h-10 object-contain"
              />

              <div className="text-center flex-1">
                <p className="text-[15px] font-medium">{report.title}</p>
              </div>

              <img
                src={report.download}
                alt=""
                className="w-5 h-5 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* أفضل الصيدليات */}
      <div className="col-span-5 bg-white border border-[#EBEBEB] rounded-xl overflow-hidden">
        <div className="p-5">
          <h3 className="font-bold text-[15px]">
            أفضل الصيدليات (حسب عدد الطلبات)
          </h3>
        </div>

        <div className="bg-[#E8EDF084] px-5 py-3 grid grid-cols-5 text-sm font-medium">
          <span>#</span>
          <span>الصيدلية</span>
          <span>عدد الطلبات</span>
          <span>المدينة</span>
          <span>التقييم</span>
        </div>

        {topPharmacies.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-5 items-center px-5 py-4 border-b border-[#EBEBEB]"
          >
            <span>{item.id}</span>

            <span>{item.pharmacy}</span>

            <span className="mr-6">{item.orders}</span>

            <span>{item.city}</span>

            <div className="flex items-center gap-2">
              <img src="/Icons/Report/star.png" alt="" className="w-4 h-4" />
              <span>{item.rating}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="col-span-3 bg-white border border-[#EBEBEB] rounded-xl overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <img src="/Icons/Report/warning.png" alt="" className="w-5 h-5" />
            <h3 className="font-bold text-[15px]">تنبيهات توفر الأدوية</h3>
          </div>
        </div>

        <div className="bg-[#E8EDF084] px-5 py-3 grid grid-cols-2 text-sm font-medium">
          <span className="text-right">الدواء</span>
          <span className="text-center ">المدن المتأثرة</span>
        </div>

        {alerts.map((item, index) => (
          <div
            key={index}
            className="px-5 py-4 flex justify-between items-center border-b border-[#EBEBEB]"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#216474]"></span>
              <span>{item.medicine}</span>
            </div>

            <span className="text-sm w-[150px] text-right block">
              {item.cities}
            </span>
          </div>
        ))}

        <div className="p-4">
          <button className="w-full h-10 border border-[#227F89] rounded-lg text-[#216474] hover:bg-[#216474] hover:text-white transition">
            عرض كل التنبيهات
          </button>
        </div>
      </div>
    </div>
  );
}
