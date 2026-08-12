export default function Footer() {
  return (
    <footer className="w-full bg-[#0F6B73] mt-16 py-8" dir="rtl">
      <div className="w-full max-w-[1600px] mx-auto px-10 mt-5">
        {/* Top Section */}
        <div className="flex flex-wrap justify-between items-start gap-10 -mr-40">
          {/* Right Links */}
          <div>
            <h3 className="text-white text-[20px] font-semibold mb-4 ">
              دوائي
            </h3>

            <ul className="space-y-2 text-[#D9E7E8] text-[16px] font-medium">
              <li className="cursor-pointer hover:text-white transition">
                من نحن
              </li>

              <li className="cursor-pointer hover:text-white transition">
                سياسة الخصوصية
              </li>

              <li className="cursor-pointer hover:text-white transition">
                الشروط والأحكام
              </li>

              <li className="cursor-pointer hover:text-white transition">
                تواصل معنا
              </li>
            </ul>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-[1px] h-[120px] bg-white/20"></div>

          {/* Center Links */}
          <div>
            <h3 className="text-white text-[20px] font-semibold mb-4">
              روابط سريعة
            </h3>

            <ul className="space-y-2 text-[#D9E7E8] text-[16px] font-medium">
              <li className="cursor-pointer hover:text-white transition">
                بحث عن دواء
              </li>

              <li className="cursor-pointer hover:text-white transition">
                الصيدليات
              </li>

              <li className="cursor-pointer hover:text-white transition">
                منتجات العناية
              </li>
            </ul>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-[1px] h-[120px] bg-white/20"></div>

          {/* Logo + Social */}
          <div className="flex flex-col items-center lg:items-end gap-5">
            {/* Logo */}
            <img
              src="/assets/app/brand/dawaai-mark.png"
              alt="دوائي"
              className="w-[200px] object-contain -ml-10"
            />

            {/* Social */}
            <div className="flex items-center gap-4">
              {[
                "/Icons/brandico_facebook.png",
                "/Icons/mynaui_instagram.png",
                "/Icons/ri_twitter-line.png",
                "/Icons/mynaui_youtube.png",
              ].map((icon, index) => (
                <div
                  key={index}
                  className="w-[42px] h-[42px] rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
                >
                  <img
                    src={icon}
                    alt="social"
                    className="w-[20px] h-[20px] object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className=" mt-8 pt-5">
          <p className="text-[#D9E7E8] text-[14px] font-normal text-center">
            جميع الحقوق محفوظة © دوائي 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
