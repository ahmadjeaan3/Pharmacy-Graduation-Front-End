import { useState } from "react";
import { Link } from "react-router-dom";

const basePath = import.meta.env.BASE_URL || "/";

export const DAWAAI_MARK = `${basePath}assets/app/brand/dawaai-logo-color.png`;

export function BrandMark({ className = "", alt = "دوائي" }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={`inline-flex items-center justify-center gap-2 text-[#216474] ${className}`}
      >
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className="h-10 w-10 shrink-0"
        >
          <circle cx="32" cy="32" r="29" fill="#e6f3f4" />
          <path
            d="M32 13v38M23 20h18M24 44h16M22 28c0-4 4-7 10-7s10 3 10 7-4 7-10 7-10 3-10 7 4 7 10 7 10-3 10-7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </svg>
        <span className="text-base font-bold tracking-[0.08em]">Dawaai</span>
      </span>
    );
  }

  return (
    <img
      src={DAWAAI_MARK}
      alt={alt}
      draggable={false}
      onError={() => setImageFailed(true)}
      className={className}
    />
  );
}

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
      <BrandMark
        className="
          h-[74px]
          w-[100px]
          object-contain
        "
      />
    </Link>
  );
}
