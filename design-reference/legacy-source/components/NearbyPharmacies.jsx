import { motion } from "framer-motion";

export default function NearbyPharmacies() {
  const pharmacies = [
    { id: 1, status: "مفتوحة الآن", distance: "على بعد 3 كم", rating: 4.2 },
    { id: 2, status: "مفتوحة الآن", distance: "على بعد 3 كم", rating: 4.2 },
    { id: 3, status: "مفتوحة الآن", distance: "على بعد 3 كم", rating: 4.2 },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0 },
  };

  const mapAnim = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="w-full px-10 -mt-30 mb-30 font-[Tajawal]">
      <div
        dir="rtl"
        className="max-w-[1530px] mx-auto bg-white border border-[#E0E0E0] rounded-[20px] p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[32px] font-bold text-[#151B33]">
            أقرب الصيدليات إليك
          </h2>

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

        {/* Content */}
        <div className="grid grid-cols-12 gap-8">
          {/* Right Side */}
          <div className="col-span-5 flex flex-col">
            {/* Filters */}
            <div className="flex gap-4 mb-5">
              {["المناوبة", "المفتوحة الآن", "تقييم عالي"].map((text, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-[183px] h-[43px] rounded-full text-[20px] ${
                    text === "المفتوحة الآن"
                      ? "bg-[#D0DEE1] text-[#216474] font-bold"
                      : "border border-[#216474] text-[#216474] font-medium"
                  }`}
                >
                  {text}
                </motion.button>
              ))}
            </div>

            {/* Pharmacy Cards (SCROLL ANIMATION HERE) */}
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="flex flex-col gap-6"
            >
              {pharmacies.map((item) => (
                <motion.div
                  key={item.id}
                  variants={card}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0px 10px 25px rgba(0,0,0,0.08)",
                  }}
                  className="h-[83px] border border-[#216474] rounded-[20px] px-5 flex items-center justify-between bg-white"
                >
                  <div className="w-[63px] h-[63px] flex items-center justify-center">
                    <img
                      src="/Icons/boxicons_pharmacy.png"
                      alt="pharmacy"
                      className="w-[50px] h-[50px]"
                    />
                  </div>

                  <div className="flex items-center gap-3 flex-1 justify-end ml-10">
                    <span className="text-[16px] font-bold text-[#0E1142]">
                      {item.status}
                    </span>

                    <img
                      src="/Icons/location.png"
                      className="w-[14px] h-[14px]"
                    />

                    <span className="text-[16px] font-bold text-[#717171B8]">
                      {item.distance}
                    </span>

                    <img src="/Icons/Star.png" className="w-[16px] h-[16px]" />

                    <span className="text-[16px] font-bold text-[#0E1142]">
                      {item.rating}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-[139px] h-[45px] rounded-full border border-[#216474] text-[#216474] text-[16px] font-bold hover:bg-[#216474] hover:text-white transition"
                  >
                    عرض الأدوية
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Left Map (SCROLL ANIMATION HERE TOO) */}
          <div className="col-span-7">
            <motion.div
              variants={mapAnim}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.5 }}
              className="w-full h-[349px] rounded-[20px] overflow-hidden"
            >
              <img
                src="/Icons/map.png"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
