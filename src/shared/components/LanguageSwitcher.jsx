import { useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { Check, ChevronDown, Languages } from "lucide-react";

import { changeAppLanguage, languages, normalizeLanguage } from "../i18n/i18n";

export function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef(null);

  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language || "ar",
  );

  const selectedLanguage =
    languages.find(({ code }) => code === currentLanguage) ?? languages[0];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectLanguage = async (languageCode) => {
    if (languageCode === currentLanguage) {
      setIsOpen(false);
      return;
    }

    await changeAppLanguage(languageCode);

    setIsOpen(false);
  };

  return (
    <div ref={containerRef} dir="ltr" className="relative z-[100]">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Change language"
        className={`flex items-center justify-center rounded-lg border border-[#216474]/20 bg-white font-medium text-[#216474] transition hover:border-[#216474]/40 hover:bg-[#f7fbfb] ${
          compact
            ? "h-11 min-w-[118px] gap-2 px-3 text-sm"
            : "h-10 min-w-[82px] gap-2 px-3 text-sm"
        }`}
      >
        <Languages size={compact ? 18 : 17} aria-hidden="true" />

        <span>
          {compact ? selectedLanguage.label : selectedLanguage.shortLabel}
        </span>

        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-label="Language"
          className="absolute left-0 top-[calc(100%+8px)] z-[110] min-w-[160px] overflow-hidden rounded-xl border border-[#216474]/15 bg-white p-1.5 shadow-[0_14px_35px_rgba(23,75,87,0.16)]"
        >
          {languages.map((language) => {
            const isSelected = language.code === currentLanguage;

            return (
              <button
                key={language.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => selectLanguage(language.code)}
                className={`flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-[#eaf4f3] font-semibold text-[#174b57]"
                    : "text-[#555555] hover:bg-[#f5f8f8] hover:text-[#216474]"
                }`}
              >
                <span>{language.label}</span>

                {isSelected ? (
                  <Check size={16} className="text-[#216474]" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
