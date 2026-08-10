import { Link } from "react-router-dom";

export const DAWAAI_MARK = "/assets/app/brand/dawaai-mark.png";

export function Brand({
  light = false,
  compact = false,
  markOnly = false,
  responsive = false,
  to = "/",
  className = "",
}) {
  const showWordmark = !compact && !markOnly;

  return (
    <Link
      to={to}
      dir="rtl"
      className={`group inline-flex shrink-0 items-center gap-3 rounded-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-[#f5cb72] focus-visible:ring-offset-4 ${className}`}
      aria-label="دوائي — العودة إلى الرئيسية"
    >
      <span
        className={`relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-[17px] transition duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-2deg] group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none ${
          light
            ? "bg-white/[0.09] ring-1 ring-white/15 shadow-[0_12px_28px_rgba(3,25,31,.2)]"
            : "bg-[linear-gradient(145deg,#176276,#0d3f4a)] ring-1 ring-[#0d3f4a]/10 shadow-[0_12px_28px_rgba(15,76,89,.2)]"
        }`}
      >
        <span
          aria-hidden="true"
          className="absolute -end-2 -top-3 size-8 rounded-full bg-[#f5cb72]/20 blur-md"
        />
        <img
          src={DAWAAI_MARK}
          alt=""
          draggable={false}
          className="relative size-[43px] select-none object-contain"
        />
      </span>
      {showWordmark && (
        <span
          className={`min-w-0 leading-none ${responsive ? "hidden sm:block" : "block"}`}
        >
          <strong
            className={`block whitespace-nowrap text-[22px] font-black tracking-[-0.035em] ${light ? "text-white" : "text-[#102f37]"}`}
          >
            دوائي
          </strong>
          <small
            dir="ltr"
            className={`mt-1 block whitespace-nowrap text-[8px] font-bold tracking-[0.22em] ${light ? "text-[#c8e5e5]/65" : "text-[#588089]"}`}
          >
            DAWAAI
          </small>
        </span>
      )}
    </Link>
  );
}
