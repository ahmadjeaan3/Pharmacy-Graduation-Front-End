import { Check, Languages } from "lucide-react";
import { useState } from "react";
import { languages } from "../i18n/LanguageProvider";
import { useLanguage } from "../i18n/useLanguage";

export function LanguageSwitcher({ dark = false, compact = false }) {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const selected = languages.find(({ code }) => code === language);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${
          dark
            ? "border-white/10 bg-white/[.06] text-white/75 hover:bg-white/10 hover:text-white"
            : "border-[#174b57]/10 bg-white text-[#36555c] hover:bg-[#eef6f5]"
        }`}
        aria-label={t("اللغة")}
        aria-expanded={open}
      >
        <Languages size={17} />
        {!compact && <span>{selected.label}</span>}
        {compact && <span>{selected.shortLabel}</span>}
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            aria-label={t("إغلاق القائمة")}
          />
          <div className="absolute end-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-xl border border-[#174b57]/10 bg-white p-1.5 text-[#29464d] shadow-xl">
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                lang={item.code}
                onClick={() => {
                  setLanguage(item.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition hover:bg-[#eef6f5] ${
                  language === item.code ? "bg-[#eaf4f3] text-[#174b57]" : ""
                }`}
              >
                {item.label}
                {language === item.code && <Check size={15} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
