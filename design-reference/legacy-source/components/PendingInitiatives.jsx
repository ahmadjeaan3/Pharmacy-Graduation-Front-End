export default function PendingInitiatives() {
  return (
    <div className="flex-[1.4] min-w-0 h-[529px] bg-white border border-[#E0E0E0] rounded-[20px] p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-[24px] font-medium text-[#0E1142]">
          المبادرات قيد المراجعة
        </h2>

        <button className="text-[#216474] text-[16px] font-medium ml-4">
          عرض الكل
        </button>
      </div>

      {[1, 2, 3].map((item, index) => (
        <div key={index}>
          <div className="flex justify-between items-center py-6">
            {/* INFO */}
            <div className="flex items-start gap-4">
              {/* Timeline */}
              <div className="flex flex-col items-center -mb-15">
                <div className="w-[18px] h-[18px] rounded-full bg-[#216474]" />

                {index !== 2 && (
                  <div className="w-[2px] h-[88px] bg-[#E8EDF0]" />
                )}
              </div>

              {/* TEXT */}
              <div className="text-right">
                <h3 className="text-[16px] font-bold text-[#0E1142]">
                  {index === 1 ? "دعم مرضى السكري" : "حملة دواء لكل محتاج"}
                </h3>

                <p className="text-[13px] text-[#717171] mt-3">
                  {index === 1
                    ? "جمعية أمل - صحة المجتمع"
                    : "جمعية الرعاية الصحية"}
                </p>
              </div>
            </div>

            {/* STATUS */}
            <div className="w-[136px] h-[39px] bg-[#F9EAD4] rounded-[10px] flex items-center justify-center mb-6">
              <span className="text-[#FF9C0B] text-[13px] font-bold">
                قيد المراجعة
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
