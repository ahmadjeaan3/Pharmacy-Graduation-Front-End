import { HeartPulse } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Brand({ light = false, compact = false, markOnly = false }) {
  const { t } = useTranslation();
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-3"
      aria-label="العودة إلى الرئيسية"
    >
      <span
        className={`relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-[15px] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 ${light ? "bg-white/14 text-white ring-1 ring-white/20" : "bg-[#174b57] text-white shadow-[0_10px_24px_rgba(23,75,87,.2)]"}`}
      >
        <span className="absolute inset-x-0 top-0 h-px bg-white/45" />
        <HeartPulse size={23} strokeWidth={2.1} />
      </span>
      {!compact && !markOnly && (
        <span className="leading-tight">
          <strong
            className={`block text-[17px] font-extrabold tracking-tight ${light ? "text-white" : "text-[#102d34]"}`}
          >
            {t("حياة دوائية")}
          </strong>
          <small
            className={`block text-[10px] font-medium tracking-wide ${light ? "text-white/60" : "text-[#668087]"}`}
          >
            MEDICAL LIFE
          </small>
        </span>
      )}
    </Link>
  );
}
