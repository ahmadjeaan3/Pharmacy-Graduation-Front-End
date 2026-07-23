import React from "react";
import PopularMedicines from "../components/PopularMedicines";

export default function HeroSection() {
  return (
    <div dir="rtl" className="w-full min-h-screen bg-white font-[Tajawal]">
      {/* ================= HEADER ================= */}
      <header
        className="
          fixed top-0 left-0 w-full h-[120px]
          bg-white/80 backdrop-blur-md
          border-b border-[#EBEBEB]
          shadow-sm
          flex items-center justify-between
          px-[70px]
          z-50
        "
      >
        {/* LOGO */}
        <div className="flex items-center">
          <img
            src="/images/Button.png"
            alt="logo"
            className="w-[160px] object-contain hover:scale-105 transition"
          />
        </div>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-[52px] text-[24px] font-medium">
          <button className="relative text-[#216474] font-bold">
            الرئيسية
            <span className="absolute bottom-[-6px] right-0 w-full h-[2px] bg-[#216474]" />
          </button>

          <button className="text-[#0D0D0D] hover:text-[#216474] transition">
            بحث عن الدواء
          </button>

          <button className="text-[#0D0D0D] hover:text-[#216474] transition">
            الصيدليات
          </button>

          <button className="text-[#0D0D0D] hover:text-[#216474] transition">
            منتجات العناية
          </button>
        </nav>

        <div className="flex items-center gap-[14px]">
          {/* chevron */}
          <img
            src="/Icons/ion_chevron-down-outline.png"
            alt="arrow"
            className="w-[16px] h-[16px]"
          />

          {/* TEXT */}
          <div className="flex flex-col items-end leading-tight">
            <h2 className="text-[20px] font-bold text-[#263238]">
              مرحبا ايمان
            </h2>
            <p className="text-[15px] text-[#717171] mt-2">ملفي الشخصي</p>
          </div>

          {/* USER ICON */}
          <div className="w-[65px] h-[65px] rounded-full bg-[#F4F7F8] flex items-center justify-center">
            <img
              src="/Icons/user.png"
              alt="user"
              className="w-[28px] h-[28px]"
            />
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="pt-[180px] px-[70px]  ">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between  ">
          {/* TEXT */}
          <div className="w-[55%] mt-[-100px] ">
            {/* TITLE + ICON */}
            <div className="flex items-center gap-3 ">
              <h1 className="text-[64px] leading-[77px] font-medium text-[#151B33] mb-15 mr-5">
                ابحث عن أي دواء
              </h1>

              {/* pill icon (رجعت) */}
              <img
                src="/Icons/freepik--Pill--inject-100.png"
                alt="pill"
                className="w-[60px] h-[55px] mb-15"
              />
            </div>

            {/* SUBTITLE */}
            <p className="text-[24px] text-[#0E1142] mt-[-40px] mb-40 mr-6">
              وتابع طلبك من أقرب الصيدليات إليك
            </p>

            {/* SEARCH BAR */}
            <div className="h-[78px] border border-[#E8EDF0] rounded-full flex items-center overflow-hidden mt-[-100px]">
              {/* SEARCH BUTTON + ICON */}
              <button className="w-[170px] h-[58px] bg-[#216474] rounded-full flex items-center justify-center gap-2 mr-4">
                <span className="text-white text-[20px] font-medium">بحث</span>
                <img
                  src="/Icons/Vector (3).png"
                  alt="search"
                  className="w-[20px] h-[20px]"
                />
              </button>

              {/* INPUT */}
              <input
                type="text"
                placeholder="ابحث عن اسم الدواء أو المادة الفعالة"
                className="flex-1 h-full px-6 text-right text-[20px] outline-none text-[#151B33]"
              />

              {/* LOCATION */}
              <div className="w-[230px] h-[57px] bg-[#E8EDF0] rounded-full flex items-center justify-center gap-2 ml-4">
                <img
                  src="/Icons/ion_chevron.png"
                  alt="location"
                  className="w-[20px] h-[25px]"
                />

                <span className="text-[#216474] text-[20px] font-medium">
                  موقعي الحالي
                </span>
                <img
                  src="/Icons/Vector.png"
                  alt="location"
                  className="w-[20px] h-[25px]"
                />
              </div>
            </div>
          </div>

          {/* IMAGE */}
          <div className="w-[35%] flex justify-start mb-40">
            <img
              src="/Icons/Group 1171275479.png"
              alt="medicine"
              className="w-[500px]"
            />
          </div>
        </div>
      </section>
      <PopularMedicines />
    </div>
  );
}
