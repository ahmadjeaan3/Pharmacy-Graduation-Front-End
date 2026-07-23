import React, { useEffect, useRef } from "react";
import QuickCategories from "./QuickCategories";
import NearbyPharmacies from "./NearbyPharmacies";
import MedicalSections from "./MedicalSections";
import Footer from "./Footer_user";

export default function PopularMedicines() {
  const medicines = [
    { id: 1, name: "أنسولين", image: "/Icons/ansolin.png" },
    { id: 2, name: "أوميبرازول", image: "/Icons/opmarazor.png" },
    { id: 3, name: "فولتارين", image: "/Icons/voltarin.png" },
    { id: 4, name: "أوجمنتين", image: "/Icons/augmantin.png" },
    { id: 5, name: "بانادول", image: "/Icons/panadol.png" },
    { id: 6, name: "أنسولين", image: "/Icons/ansolin.png" },
    { id: 7, name: "أوميبرازول", image: "/Icons/opmarazor.png" },
    { id: 8, name: "فولتارين", image: "/Icons/voltarin.png" },
    { id: 9, name: "أوجمنتين", image: "/Icons/augmantin.png" },
    { id: 10, name: "بانادول", image: "/Icons/panadol.png" },
  ];

  const trackRef = useRef(null);
  const position = useRef(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const speed = 0.5;

    const animate = () => {
      position.current -= speed;

      const width = el.scrollWidth / 2;

      if (Math.abs(position.current) >= width) {
        position.current = 0;
      }

      el.style.transform = `translateX(${position.current}px)`;

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  const looped = [...medicines, ...medicines];

  return (
    <section className="w-full px-10 font-[Tajawal]">
      {/* الكارد الرئيسي */}
      <div
        dir="rtl"
        className="relative max-w-[1500px] mx-auto bg-white border border-[#E0E0E0] rounded-[20px] py-6 px-10 overflow-hidden mb-8 -mt-16"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          {/* العنوان عاليمين */}
          <h2 className="text-[32px] font-bold text-[#151B33] order-1">
            الأدوية الأكثر بحثاً
          </h2>

          {/* عرض الكل عاليسار */}
          <button className="flex items-center gap-2 text-[#216474] text-[22px] font-bold order-2">
            <span>عرض الكل</span>
            <img
              src="/Icons/Vector_top.png"
              className="w-[10px] h-[15px] "
              alt="arrow"
            />
          </button>
        </div>

        {/* الأسهم */}
        <button className="absolute left-2 top-1/2 -translate-y-1/2 w-[55px] h-[55px] rounded-full bg-white shadow-md flex items-center justify-center z-50">
          <img
            src="/Icons/ion_chevron-left.png"
            className="w-[22px]"
            alt="left"
          />
        </button>

        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-[55px] h-[55px] rounded-full bg-white shadow-md flex items-center justify-center z-50">
          <img
            src="/Icons/ion_chevron-right.png"
            className="w-[22px]"
            alt="right"
          />
        </button>

        {/* TRACK */}
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-8 w-max will-change-transform"
          >
            {looped.map((item, index) => (
              <div
                key={index}
                className="w-[240px] h-[270px] shrink-0 border border-[#E4E4E4] rounded-[20px] flex flex-col items-center justify-between py-6 px-4 bg-white"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-h-[95px] object-contain"
                />

                <h3 className="text-[24px] font-bold text-[#0E1142]">
                  {item.name}
                </h3>

                <button className="w-full h-[50px] bg-[#216474] text-white rounded-full hover:opacity-90 transition">
                  عرض التفاصيل
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <QuickCategories />
      </div>
      <div className="flex justify-end">
        <NearbyPharmacies />
      </div>
      <div className="flex justify-end">
        <MedicalSections />
      </div>
      <div className="flex justify-end">
        <Footer />
      </div>
    </section>
  );
}
