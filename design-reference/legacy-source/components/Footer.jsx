import React from "react";

export default function FooterCTA() {
  return (
    <footer className="w-full bg-[#174B57] flex justify-center" dir="rtl">
      <div className="w-[1850px] px-16 py-10">
        {/* Top */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src="/assets/images/FooterCTA/LOGO.png"
              alt="Medicallife"
              className="w-[65px] h-[63px] object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center mr-20">
            <h2 className="text-[28px] font-semibold text-white">
              ابدأ رحلتك الآن مع Medicallife
            </h2>

            <p className="mt-3 text-[16px] leading-7 text-[#EEEEEE] text-center max-w-[620px]">
              ابحث عن دوائك، ادعم جمعيتك أو انضم إلينا كصيدلية موثوقة.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              className="
                w-[130px]
                h-[45px]
                rounded-[8px]
                bg-white
                text-[#216474]
                text-[18px]
                font-medium
                transition-all
                duration-300
                hover:bg-gray-100
              "
            >
              إنشاء حساب
            </button>

            <button
              className="
                w-[130px]
                h-[45px]
                rounded-[8px]
                border
                border-white
                text-white
                text-[18px]
                font-medium
                transition-all
                duration-300
                hover:bg-white
                hover:text-[#174B57]
                mr-1
              "
            >
              تسجيل دخول
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-white/30" />

        {/* Copyright */}
        <p className="mt-5 text-center text-[15px] text-white/60 ml-30">
          © 2026 medicallife.com
        </p>
      </div>
    </footer>
  );
}
