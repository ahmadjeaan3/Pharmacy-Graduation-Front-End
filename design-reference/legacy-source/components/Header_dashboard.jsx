export default function Header({
  title = "مرحباً بك إيمان",
  subtitle = "نظرة عامة على أداء المنصة اليوم",
}) {
  return (
    <div className="w-full h-[128px] bg-white border border-[#EBEBEB] rounded-[20px] flex items-center justify-between px-10">
      {/* LEFT SIDE */}
      <div className="text-right">
        <div className="flex items-center gap-3 justify-end">
          <h1 className="text-[32px] font-bold text-[#0E1142] ml-13">
            {title}
          </h1>
        </div>

        <p className="text-[#717171] text-[20px] mt-2">{subtitle}</p>
      </div>

      {/* RIGHT SIDE ثابت */}
      <div className="flex items-center gap-6">
        <img src="/Icons/Untitled/noice.png" className="w-[28px]" alt="" />

        <div className="flex items-center gap-4">
          <img
            src="/Icons/ion_chevron-down-outline.png"
            alt="arrow"
            className="w-[16px] h-[16px]"
          />

          <div>
            <h2 className="text-[20px] font-bold">مرحبا إيمان</h2>

            <p className="text-[#717171] text-[16px]">مدير النظام</p>
          </div>

          <div className="w-[65px] h-[65px] rounded-full bg-[#F4F7F8] flex items-center justify-center">
            <img
              src="/Icons/user.png"
              alt="user"
              className="w-[28px] h-[28px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
