import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Brand } from "./Brand";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../i18n/useLanguage";

const links = [
  ["الخدمات", "#services"],
  ["كيف تعمل المنصة", "#journey"],
  ["لمن المنصة؟", "#roles"],
  ["الأمان", "#security"],
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-[#174b57]/8 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1360px] items-center justify-between px-5 lg:px-8">
        <Brand />
        <nav
          className="hidden items-center gap-10 text-[15px] font-bold text-[#40575d] lg:flex"
          aria-label={t("التنقل الرئيسي")}
        >
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="group relative px-1 py-2 transition-colors duration-200 hover:text-[#174b57] focus-visible:outline-none"
            >
              <span className="relative">
                {t(label)}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1.5 inset-x-0 h-0.5 rounded-full bg-[#f2b84b] transition-all duration-200 group-hover:h-[3px] group-hover:bg-[#216474]"
                />
              </span>
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          <LanguageSwitcher compact />
          <Link to="/login" className="btn-quiet">
            {t("تسجيل الدخول")}
          </Link>
          <Link to="/register" className="btn-primary">
            {t("إنشاء حساب")}
          </Link>
        </div>
        <button
          type="button"
          className="icon-button grid sm:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? t("إغلاق القائمة") : t("فتح القائمة")}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl sm:hidden">
          <nav className="grid gap-1">
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="group rounded-xl px-3 py-3 font-semibold text-slate-600 hover:bg-[#eef6f5]"
              >
                <span className="border-b-2 border-[#f2b84b] pb-1 transition-colors group-hover:border-[#216474]">
                  {t(label)}
                </span>
              </a>
            ))}
          </nav>
          <div className="mt-3">
            <LanguageSwitcher />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link to="/login" className="btn-secondary justify-center">
              {t("الدخول")}
            </Link>
            <Link to="/register" className="btn-primary justify-center">
              {t("حساب جديد")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
