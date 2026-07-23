export default function InitiativeCard({
  title,
  category,
  current,
  target,
  progress,
  image,
  bg,
  progressColor,
}) {
  return (
    <div className="bg-white border border-[#EBEBEB] rounded-[10px] w-[370px]  overflow-hidden">
      {/* Image Area */}
      <div
        className="h-[180px] flex items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        <img
          src={image}
          alt={title}
          className="w-[110px] h-[110px] object-contain"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-[#216474] text-[18px] font-bold text-center">
          {title}
        </h3>

        <p className="text-[#C3C5CA] text-sm text-center mt-2">{category}</p>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#8D99AE]">الهدف</span>
            <span>{target}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[#8D99AE]">تم جمع</span>
            <span className="text-[#216474]">{current}</span>
          </div>

          <div className="w-full h-[8px] bg-[#E5E5E5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
        </div>

        <button className="w-full h-[42px] mt-5 border border-[#227F89] rounded-[10px] text-[#216474] text-sm font-medium">
          عرض التفاصيل
        </button>
      </div>
    </div>
  );
}
