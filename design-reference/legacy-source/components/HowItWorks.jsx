import React from "react";

const steps = [
  {
    image: "/assets/images/HowItWorks/4.png",
    title: "اختر الصيدلية",
    desc: "شاهد التفاصيل مثل المسافة وأوقات العمل واختر الأنسب لك",
    imageClass: "w-[250px] h-[330px]",
    cardClass: "w-[300px]",
  },
  {
    image: "/assets/images/HowItWorks/3.png",
    title: "ابحث عن الدواء",
    desc: "اكتب اسم الدواء الذي تبحث عنه واكتشف أقرب الصيدليات إليك",
    imageClass: "w-[320px] h-[320px]",
    cardClass: "w-[320px]",
  },
  {
    image: "/assets/images/HowItWorks/2.png",
    title: "حدد موقعك",
    desc: "قم بتفعيل الموقع لتحديد أقرب الصيدليات إليك بدقة وسرعة",
    imageClass: "w-[320px] h-[320px]",
    cardClass: "w-[320px]",
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full  py-[110px]" dir="rtl">
      <div className="max-w-[1420px] mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-5">
          <h2 className="text-[36px] font-medium text-[#333333]">كيف يعمل</h2>

          <p className="max-w-[620px] text-center text-[20px] leading-[170%] text-[#A5A5A5]">
            ثلاث خطوات بسيطة للعثور على الدواء الذي تحتاجه في أقرب صيدلية إليك
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 flex items-center justify-between gap-6">
          {/* STEP 1 */}
          <div className={`${steps[0].cardClass} flex flex-col items-center`}>
            <img
              src={steps[0].image}
              alt={steps[0].title}
              className={`${steps[0].imageClass} object-contain`}
            />

            <div className="mt-6 flex flex-col items-center gap-4">
              <h3 className="text-[28px] font-medium text-[#333333] tracking-[0.04em]">
                {steps[0].title}
              </h3>

              <p className="text-center text-[20px] leading-[170%] text-[#A5A5A5]">
                {steps[0].desc}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <img
            src="/assets/images/HowItWorks/Arrow.png"
            alt=""
            className="w-[140px] object-contain"
          />

          {/* STEP 2 */}
          <div className={`${steps[1].cardClass} flex flex-col items-center`}>
            <img
              src={steps[1].image}
              alt={steps[1].title}
              className={`${steps[1].imageClass} object-contain`}
            />

            <div className="mt-6 flex flex-col items-center gap-4">
              <h3 className="text-[28px] font-medium text-[#333333] tracking-[0.04em]">
                {steps[1].title}
              </h3>

              <p className="text-center text-[20px] leading-[170%] text-[#A5A5A5]">
                {steps[1].desc}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <img
            src="/assets/images/HowItWorks/Arrow.png"
            alt=""
            className="w-[140px] object-contain"
          />

          {/* STEP 3 */}
          <div className={`${steps[2].cardClass} flex flex-col items-center`}>
            <img
              src={steps[2].image}
              alt={steps[2].title}
              className={`${steps[2].imageClass} object-contain`}
            />

            <div className="mt-6 flex flex-col items-center gap-4">
              <h3 className="text-[28px] font-medium text-[#333333] tracking-[0.04em]">
                {steps[2].title}
              </h3>

              <p className="text-center text-[20px] leading-[170%] text-[#A5A5A5]">
                {steps[2].desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
