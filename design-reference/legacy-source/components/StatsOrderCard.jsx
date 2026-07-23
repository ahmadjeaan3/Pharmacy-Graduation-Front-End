export default function StatsOrderCard({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-6 mt-8">
      {stats.map((item, index) => (
        <div
          key={index}
          className="relative bg-white border border-[#E0E0E0] rounded-[20px] h-[180px] overflow-hidden px-7 pt-6"
        >
          {/* HEADER */}
          <div className="flex justify-between items-start">
            {/* TEXT */}
            <div className="text-right flex flex-col w-full  mr-10 mt-2 ">
              <h3 className="text-[20px] font-medium text-black mr-7 leading-none">
                {item.title}
              </h3>

              <h2 className="text-[32px] font-bold text-black mt-6 mr-15 leading-none">
                {item.value}
              </h2>

              {/* CHANGE INFO */}
              <div className="flex items-center gap-2 mt-5 mb-15">
                <span className="text-[16px] text-[#717171] font-medium mr-15">
                  طلب
                </span>
              </div>
            </div>

            {/* ICON */}
            <div
              className="w-[90px] h-[90px] rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${item.color}15`,
              }}
            >
              <img
                src={item.icon}
                alt={item.title}
                className="w-[42px] h-[42px] object-contain"
              />
            </div>
          </div>

          {/* GRAPH */}
          {item.graph && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
              {typeof item.graph === "string" ? (
                <img
                  src={item.graph}
                  alt="graph"
                  className="w-[275px] h-[45px] object-contain"
                />
              ) : (
                item.graph
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
