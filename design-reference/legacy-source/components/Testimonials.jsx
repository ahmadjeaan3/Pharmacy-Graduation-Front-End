import React from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export default function Testimonials() {
  const quoteIcon = "/assets/images/Testimonials/Left quotes sign.png";

  const reviews = [
    {
      name: "نور موفق",
      role: "مستخدم",
      image: "/assets/images/Testimonials/Ellipse1.png",
      text: "تطبيق رائع وسهل الاستخدام، أقدر ألاقي أي دواء وأقرب صيدلية في ثواني، وفر علي وقت وجهد كبير!",
    },
    {
      name: "شينوبو",
      role: "مستخدم",
      image: "/assets/images/Testimonials/Ellipse2.png",
      text: "تطبيق رائع وسهل الاستخدام، أقدر ألاقي أي دواء وأقرب صيدلية في ثواني، وفر علي وقت وجهد كبير!",
    },
    {
      name: "لينا حياني",
      role: "مستخدم",
      image: "/assets/images/Testimonials/Ellipse3.png",
      text: "تطبيق رائع وسهل الاستخدام، أقدر ألاقي أي دواء وأقرب صيدلية في ثواني، وفر علي وقت وجهد كبير!",
    },
  ];

  return (
    <section className="w-full py-[110px]" dir="rtl">
      <div className="max-w-[1320px] mx-auto flex flex-col items-center gap-[40px]">
        {/* Header */}
        <div className="w-full flex items-end justify-between">
          <button
            className="w-[52px] h-[52px] rounded-full border border-[rgba(102,102,102,.16)]
            flex items-center justify-center"
          >
            <ChevronRight size={18} color="#444" />
          </button>

          <div className="flex flex-col items-center gap-5 flex-1">
            <h2 className="text-[32px] font-medium text-[#333333]">
              آراء عملائنا
            </h2>

            <p className="text-[18px] text-[#A5A5A5] leading-[163%] text-center max-w-[527px]">
              نفتخر بثقة عملائنا، وهذه بعض آرائهم عن تجربتهم معنا.
            </p>
          </div>

          <button
            className="w-[52px] h-[52px] rounded-full border border-[rgba(102,102,102,.16)]
            flex items-center justify-center"
          >
            <ChevronLeft size={18} color="#444" />
          </button>
        </div>

        {/* Cards */}
        <div className="flex gap-7 w-full justify-between">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="
                w-[420px]
                h-[245px]
                border border-[rgba(102,102,102,.16)]
                rounded-[10px]
                bg-white
                p-[28px]
                flex
                flex-col
                gap-5
              "
            >
              {/* Top */}
              <div className="flex justify-between items-center">
                <div className="flex gap-[2px]">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>

                <img src={quoteIcon} alt="" className="w-[34px] h-[34px]" />
              </div>

              {/* Text */}
              <p className="text-[17px] leading-[28px] text-right text-[#333333]">
                "{review.text}"
              </p>

              {/* User */}
              <div className="flex items-center gap-3 mt-auto">
                <img
                  src={review.image}
                  className="w-[56px] h-[56px] rounded-full object-cover"
                  alt=""
                />

                <div className="flex flex-col">
                  <span className="text-[19px] font-medium text-[#444444]">
                    {review.name}
                  </span>

                  <span className="text-[15px] text-[#A5A5A5]">
                    {review.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-[6px] mt-3">
          <div className="w-[55px] h-[10px] rounded-full bg-[#216474]" />

          <div className="w-[10px] h-[10px] rounded-full bg-[#D6D6D6]" />

          <div className="w-[10px] h-[10px] rounded-full bg-[#D6D6D6]" />

          <div className="w-[10px] h-[10px] rounded-full bg-[#D6D6D6]" />
        </div>
      </div>
    </section>
  );
}
