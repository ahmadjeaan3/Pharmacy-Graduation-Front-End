import React from "react";

export default function Categories() {
  const checkIcon = "/assets/images/Categories/qlementine-icons_success.png";

  const data = [
    {
      title: "مستخدم",
      desc: "يبحث عن الأدوية بسهولة ويجد أقرب الصيدليات المتوفرة حسب موقعه",
      img: "/assets/images/Categories/1.png",
      imageClass: "w-[156px] h-[140px]",
      items: [
        "البحث عن الأدوية",
        "عرض أقرب الصيدليات",
        "عرض تفاصيل الصيدلية وموقعها",
        "الحصول على معلومات دقيقة",
      ],
    },
    {
      title: "صيدلية",
      desc: "تدير معلومات الصيدلية والأدوية والمخزون بطريقة دقيقة",
      img: "/assets/images/Categories/2.png",
      imageClass: "w-[166px] h-[140px]",
      items: [
        "إدارة معلومات الصيدلية",
        "إضافة الأدوية وتحديث المخزون",
        "تحديث توفر الأدوية والأسعار",
        "متابعة الطلبات والتنبيهات",
      ],
    },
    {
      title: "آدمن",
      desc: "يدير النظام بشكل كامل ويتابع بيانات الصيدليات والمستخدمين لضمان أفضل تجربة",
      img: "/assets/images/Categories/3.png",
      imageClass: "w-[235px] h-[140px]",
      items: [
        "إدارة المستخدمين والصيدليات",
        "متابعة البيانات والتقارير",
        "التحكم في الأدوية والتصنيفات",
        "إدارة الإعدادات والتنبيهات",
      ],
    },
  ];

  return (
    <section className="w-full  py-[100px]" dir="rtl">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-5">
          <h2 className="text-[32px] font-medium text-[#333333]">
            الفئات المستخدمة
          </h2>

          <p className="max-w-[527px] text-center text-[18px] leading-[163%] text-[#A5A5A5]">
            نظامنا مصمم لثلاث فئات رئيسية تعمل معًا لتوفير تجربة سهلة وفعالة.
          </p>
        </div>

        {/* Cards */}
        <div className="flex justify-between gap-8">
          {data.map((card, index) => (
            <div
              key={index}
              className="
                w-[386px]
                h-[540px]
                rounded-[16px]
                border
                border-[rgba(102,102,102,0.16)]
                bg-white
                px-5
                pt-7
                pb-8
                flex
                justify-center
                transition-all
                duration-300
                hover:shadow-lg
              "
            >
              <div className="w-[331px] flex flex-col items-center">
                {/* Image */}
                <img
                  src={card.img}
                  alt={card.title}
                  className={`${card.imageClass} object-contain`}
                />

                {/* Title */}
                <h3 className="mt-5 text-[24px] font-medium tracking-[0.04em] text-[#333333] text-center">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="mt-4 text-center text-[18px] leading-[163%] tracking-[0.01em] text-[#666666]">
                  {card.desc}
                </p>

                {/* Divider */}
                <div className="w-full border-t border-[rgba(102,102,102,0.16)] mt-6 mb-6" />

                {/* List */}
                <div className="w-full flex flex-col gap-4 pb-6">
                  {card.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[24px_1fr] items-center gap-4"
                    >
                      <img src={checkIcon} alt="" className="w-6 h-6" />

                      <span className="text-[18px] leading-[167%] tracking-[0.01em] text-[#666666] text-right">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
