const categories = [
  {
    title: "أدوية مزمنة",
    image: "/Icons/material-symbols-light_ecg-heart-sharp (1).png",
    bg: "bg-[#FFEACB]",
  },
  {
    title: "فيتامينات",
    image: "/Icons/solar_jar-of-pills-2-bold-duotone.png",
    bg: "bg-[#E8EDF0]",
  },
  {
    title: "مسكنات",
    image: "/Icons/ion_bandage-outline.png",
    bg: "bg-[#E8EDF0]",
  },
  {
    title: "أطفال",
    image: "/Icons/fluent-emoji-flat_baby-medium-light.png",
    bg: "bg-[#E8EDF0]",
  },
  {
    title: "جلدية",
    image: "/Icons/twemoji_lotion-bottle.png",
    bg: "bg-[#E8EDF0]",
  },
  {
    title: "نسائية",
    image: "/Icons/solar_women-outline.png",
    bg: "bg-[#E8EDF0]",
  },
  {
    title: "سكري",
    image: "/Icons/streamline-pixel_health-laboratory-test-blood-sugar.png",
    bg: "bg-[#E8EDF0]",
  },
  {
    title: "ضغط",
    image: "/Icons/material-symbols-light_ecg-heart-sharp (1).png",
    bg: "bg-[#FFEACB]",
  },
];

export default function QuickCategories() {
  return (
    <section className="w-full px-10 font-[Tajawal] mt-9 mb-50">
      <div className="max-w-[1530px] mx-auto bg-white border border-[#E0E0E0] rounded-[20px] px-8 py-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          {/* Title */}
          <h2 className="text-[30px] font-bold text-[#151B33]">
            تصنيفات سريعة
          </h2>

          {/* Show All */}
          <button
            className="
              group flex items-center gap-2
              text-[#216474]
              text-[18px]
              font-semibold
              transition-all duration-300
              hover:gap-4
              hover:text-[#184D59]
            "
          >
            <span>عرض الكل</span>

            <img
              src="/Icons/Vector_top.png"
              className="
                w-[10px] h-[15px]
                transition-transform duration-300
                group-hover:-translate-x-1
              "
              alt="arrow"
            />
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-between gap-y-8">
          {categories.map((item, index) => (
            <div
              key={index}
              className="
                group
                flex flex-col items-center gap-4
                min-w-[120px]
                cursor-pointer
                rounded-[18px]
                px-4 py-4
                transition-all duration-300 ease-out
                hover:-translate-y-2
                hover:scale-[1.03]
                hover:bg-[#F8FBFC]
                hover:shadow-[0_10px_30px_rgba(33,100,116,0.08)]
              "
            >
              {/* Icon Circle */}
              <div
                className={`
                  w-[78px] h-[78px]
                  rounded-full
                  flex items-center justify-center
                  ${item.bg}
                  transition-all duration-300
                  shadow-sm
                  group-hover:shadow-md
                  group-hover:scale-110
                `}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="
                    w-[42px] h-[42px]
                    object-contain
                    transition-all duration-300
                    group-hover:scale-110
                    group-hover:rotate-6
                  "
                />
              </div>

              {/* Title */}
              <span className="relative text-[19px] font-semibold text-[#0E1142] text-center">
                {item.title}

                {/* Animated underline */}
                <span
                  className="
                    absolute bottom-[-6px] left-1/2
                    h-[2px] w-0
                    bg-[#216474]
                    transition-all duration-300
                    group-hover:w-full
                    group-hover:left-0
                  "
                ></span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
