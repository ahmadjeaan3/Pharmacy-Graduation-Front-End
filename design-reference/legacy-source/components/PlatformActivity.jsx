export default function PlatformActivity() {
  return (
    <div className="flex-[1.6] min-w-0 h-[529px] bg-white border border-[#D9E4E5] rounded-[20px] p-6 ">
      {/* HEADER */}
      <div className="relative flex items-center justify-between mb-6">
        {/* TITLE */}
        <h2 className="text-[24px] font-medium text-[#0E1142]">نشاط المنصة</h2>

        {/* FILTER */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="w-[161px] h-[38px] bg-white border border-[#D9E4E5] rounded-[10px] flex items-center justify-center gap-2">
            <span className="text-[16px] font-medium text-[#717171]">
              آخر 7 أيام
            </span>

            <img
              src="/Icons/ion_chevron-down-outline.png"
              className="w-[18px] h-[18px]"
              alt=""
            />
          </div>
        </div>

        {/* BUTTON */}
        <button className="text-[#216474] text-[16px] font-medium ml-4">
          عرض الكل
        </button>
      </div>

      {/* CHART */}
      <div className="flex justify-center mt-6">
        <img
          src="/Icons/chart.png"
          alt="chart"
          className="w-[584px] h-[340px] object-contain"
        />
      </div>
    </div>
  );
}
