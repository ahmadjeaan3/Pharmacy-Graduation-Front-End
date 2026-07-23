import React from "react";
import heroImg from "../../public/assets/images/images_hero/1.png";
import { ArrowUpLeft, ChevronLeft } from "lucide-react";

const features = [
  {
    icon: "/assets/images/images_hero/2_4.png",
    title: "معلومات محدثة",
    desc: "بيانات الصيدليات تُحدَّث باستمرار",
  },
  {
    icon: "/assets/images/images_hero/2_3.png",
    title: "اختيار ذكي",
    desc: "اعثر على أفضل الصيدليات حسب احتياجك",
  },
  {
    icon: "/assets/images/images_hero/2_2.png",
    title: "دقة عالية",
    desc: "نحدد أقرب الصيدليات إليك بدقة",
  },
  {
    icon: "/assets/images/images_hero/2_1.png",
    title: "وصول سريع",
    desc: "ابحث عن دوائك بسرعة",
  },
];

export default function Hero() {
  return (
    <section
      dir="ltr"
      className="relative overflow-hidden w-full  pt-[120px] pb-20"
    >
      {/* Background SVG */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg
          className="absolute -top-[980px] -left-[900px] w-[2600px] h-[1700px] rotate-[-55deg]"
          viewBox="0 0 2600 1700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 18 }).map((_, i) => (
            <ellipse
              key={i}
              cx="1300"
              cy="850"
              rx={1200 - i * 24}
              ry={560 - i * 12}
             
              stroke="rgba(75,187,187,0.18)"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      </div> */}

      <div className="relative z-10 max-w-[1540px] mx-auto px-8">
        {/* HERO */}
        <div className="flex items-center justify-between gap-16 -mt-20">
          {/* IMAGE */}
          <div className="w-[620px] flex justify-center flex-none ">
            <img
              src={heroImg}
              alt="hero"
              className="w-[485px] object-contain mr-15"
            />
          </div>

          {/* TEXT */}
          <div className="w-[720px] flex flex-col items-end gap-10 mr-10">
            <div className="w-full flex flex-col gap-8">
              <div className="flex flex-col items-end gap-3">
                <span className="text-[25px] leading-[35px] text-[#444444]">
                  حل ذكي للعثور على الأدوية
                </span>

                <h1 className="text-[58px] font-medium leading-[120%] text-right text-[#333333]">
                  دواؤك...
                  <span className="text-[#DFAE0D]"> أقرب </span>
                  مما تتوقع
                </h1>
              </div>

              <p className="text-[19px] leading-[34px] text-right text-[#666666] max-w-[650px] ml-15">
                يساعدك في العثور على الأدوية المتوفرة في الصيدليات الأقرب منك
                بسرعة ودقة عالية.
              </p>
            </div>

            <div className="flex gap-4">
              <button className="w-[170px] h-[60px] rounded-xl border border-[#216474] text-[#216474] text-[20px] font-semibold flex items-center justify-center gap-2 hover:bg-[#216474] hover:text-white transition-all">
                <ChevronLeft size={20} />
                كيف يعمل
              </button>

              <button className="w-[170px] h-[60px] rounded-xl bg-[#174B57] text-white text-[20px] font-semibold flex items-center justify-center gap-2 hover:bg-[#216474] transition-all">
                <ArrowUpLeft size={20} />
                ابدأ الآن
              </button>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="mt-[60px] grid grid-cols-4 gap-8">
          {features.map((item, index) => (
            <div
              key={index}
              className="
        h-[220px]
        bg-white
        border
        border-[rgba(102,102,102,0.16)]
        rounded-[20px]
        flex
        flex-col
        justify-center
        items-center
        px-6
        py-6
        gap-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
            >
              <img
                src={item.icon}
                alt={item.title}
                className="h-[78px] object-contain"
              />

              <div className="flex flex-col items-center gap-4">
                <h3 className="text-[24px] font-medium text-[#333333] text-center">
                  {item.title}
                </h3>

                <p className="max-w-[260px] text-[17px] leading-[170%] text-[#A5A5A5] text-center">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
