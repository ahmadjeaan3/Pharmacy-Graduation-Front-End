export default function PharmacyRequests() {
  return (
    <div className="flex-[1.5] min-w-0 h-[529px]  bg-white border border-[#E0E0E0] rounded-[20px] p-6 ">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[24px] font-medium text-[#0E1142]">
          طلبات التحقق من الصيدليات
        </h2>

        <button className="text-[#216474] text-[16px] font-medium ml-4">
          عرض الكل
        </button>
      </div>

      {/* ITEMS */}
      {[1, 2, 3, 4].map((item, index) => (
        <div key={index}>
          <div className="flex justify-between items-center py-5">
            {/* ICON */}
            <div className="w-[45px] h-[45px] rounded-[12px] bg-[#EBF5F7] flex items-center justify-center border border-[#216474] mr-5">
              <img
                src="/Icons/boxicons_pharmacy.png"
                alt=""
                className="w-[28px]"
              />
            </div>

            {/* INFO */}
            <div className="flex items-center gap-4 -mr-20">
              <div className="text-right">
                <h3 className="text-[14px] font-bold text-[#0E1142]">
                  صيدلية النور
                </h3>

                <p className="text-[13px] text-[#B2B2B2] mt-2">
                  اعزاز - منذ 30 دقيقة
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <button className="w-[90px] h-[38px] rounded-full bg-[#216474] text-white text-sm">
                الموافقة
              </button>

              <button className="w-[90px] h-[38px] rounded-full border border-[#E4B7C0] text-[#D96B83] text-sm">
                رفض
              </button>
            </div>
          </div>

          {index !== 3 && <div className="border-b border-[#D9E4E5]/70" />}
        </div>
      ))}
    </div>
  );
}
