export default function MedicalSections() {
  const cards = [
    {
      title: "منتجات العناية والجمال",
      image: "/Icons/beauty-products-svgrepo-com (1) 1.png",
      items: [
        "عناية بالبشرة",
        "عناية بالشعر",
        "عناية الأم والطفل",
        "واقي شمس",
        "Dermocosmetics",
      ],
      button: "عرض جميع المنتجات",
    },

    {
      title: "مستلزمات وأجهزة طبية",
      image: "/Icons/Vector (4).png",
      items: ["أجهزة ضغط", "أجهزة نبض", "Thermometers", "كمامات ومعقمات"],
      button: "عرض جميع المنتجات",
    },

    {
      title: "ركن السكري",
      image: "/Icons/sugar.png",
      items: [
        "إبر أنسولين",
        "أجهزة قياس السكر",
        "شرائط الفحص",
        "Lancets",
        "أجهزة مراقبة مستمرة",
      ],
      button: "عرض جميع المنتجات",
    },
    {
      title: "مساعدك الذكي",
      image: "/Icons/bot.png",
      items: ["بحث عن دواء", "اسأل عن جرعة", "تداخلات دوائية", "اقتراح بدائل"],
      button: "اسأل الآن",
    },

    {
      title: "عروض اليوم",
      image: "/Icons/offers.png",
      items: ["خصومات حصرية", "عروض الصيدليات", "باقات مرضى السكري"],
      button: "تصفح العروض",
    },

    {
      title: "بدائل الدواء",
      image: "/Icons/medicine-alt.png",
      items: ["بدائل أرخص", "أدوية مفقودة وبدائلها", "مقارنة بين الأدوية"],
      button: "ابحث عن بدائل",
    },
  ];

  return (
    <section className="w-full px-10 -mt-5 font-[Tajawal] mb-20">
      <div className="max-w-[1530px] mx-auto grid grid-cols-3 gap-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-[#E8EDF0] rounded-[20px] px-8 py-8 min-h-[326px] flex flex-col"
          >
            {/* Title */}
            <h2 className="text-[24px] font-bold text-[#216474] text-center mb-6">
              {card.title}
            </h2>

            {/* Content */}
            <div
              className="flex flex-row-reverse items-start justify-between flex-1  mt-5 mr-5"
              dir="ltr"
            >
              {/* TEXT RIGHT */}
              <div className="flex-1 text-right">
                <ul className="space-y-3">
                  {card.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start justify-end gap-3 text-[20px] font-medium text-[#0E1142]"
                    >
                      <span>{item}</span>

                      {/* Bullet */}
                      <span className="w-[8px] h-[8px] rounded-full bg-[#216474] mt-3 shrink-0"></span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* IMAGE LEFT */}
              <div className="w-[150px] flex justify-center items-center shrink-0 ml-5">
                <img
                  src={card.image}
                  alt={card.title}
                  className="max-h-[150px] object-contain"
                />
              </div>
            </div>

            {/* BUTTON */}
            <div className="flex justify-center mt-8">
              <button className="w-[230px] h-[45px] rounded-full border border-[#216474] text-[#216474] text-[16px] font-bold hover:bg-[#216474] hover:text-white transition duration-300">
                {card.button}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
