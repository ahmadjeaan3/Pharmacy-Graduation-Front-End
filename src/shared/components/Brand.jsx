import { Link } from "react-router-dom";

export const DAWAAI_MARK = "/assets/app/brand/dawaai-logo-color.png";

export function Brand({ to = "/", className = "" }) {
  return (
    <Link
      to={to}
      className={`
        inline-flex
        h-[70px]
        w-[100px]
        shrink-0
        items-center
        justify-center
        ${className}
      `}
      aria-label="دوائي — العودة إلى الرئيسية"
    >
      <img
        src={DAWAAI_MARK}
        alt="دوائي"
        draggable={false}
        className="
          h-[74px]
          w-[100px]
          object-contain
        "
      />
    </Link>
  );
}
