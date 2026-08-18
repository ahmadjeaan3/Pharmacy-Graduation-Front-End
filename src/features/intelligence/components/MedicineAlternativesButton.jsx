import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, FlaskConical, Pill, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { recommendMedicineAlternatives } from "../api/intelligenceApi";

export function MedicineAlternativesButton({
  medicineName,
  label,
  className = "btn-secondary justify-center",
  compact = false,
}) {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();
  const [open, setOpen] = useState(false);
  const alternatives = useMutation({
    mutationFn: () => recommendMedicineAlternatives(medicineName, 5),
  });
  const show = () => {
    setOpen(true);
    if (!alternatives.data && !alternatives.isPending) alternatives.mutate();
  };
  const result = alternatives.data;
  const emptyMessage =
    result?.status === "medicine_not_found"
      ? t(
          "لم يتم التعرف على الدواء في الدليل المعتمد. جرّب الاسم التجاري أو العربي الكامل.",
        )
      : result?.status === "insufficient_data"
        ? t("بيانات الدواء غير كافية لتقديم بدائل آمنة ومتطابقة.")
        : t("لم يتم العثور على بدائل موثوقة لهذا الدواء.");

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={show}
        aria-label={label || t("اقتراح البدائل")}
      >
        <Sparkles size={compact ? 15 : 17} />
        {!compact && (label || t("اقتراح البدائل"))}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[130] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div
            dir={language === "ar" ? "rtl" : "ltr"}
            lang={language}
            className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-[1.75rem] bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#174b57]/8 bg-white/95 p-5 backdrop-blur sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#174b57] text-[#f5cb72]">
                  <Sparkles size={20} />
                </span>
                <div>
                  <p className="text-xs font-black text-[#216474]">
                    {t("بدائل دوائية مقترحة")}
                  </p>
                  <h3 className="mt-1 text-xl font-black text-[#29464d]">
                    {result?.searchedArabicMedicine ||
                      result?.searchedMedicine ||
                      medicineName}
                  </h3>
                  {result?.searchedArabicMedicine &&
                    result?.searchedMedicine && (
                      <p
                        className="mt-0.5 text-xs font-bold text-[#71858a]"
                        dir="ltr"
                      >
                        {result.searchedMedicine}
                      </p>
                    )}
                </div>
              </div>
              <button
                className="icon-button grid"
                onClick={() => setOpen(false)}
                aria-label={t("إغلاق")}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 pt-0 sm:p-6 sm:pt-0">
              {alternatives.isPending ? (
                <div className="grid min-h-48 place-items-center text-sm font-bold text-[#71858a]">
                  {t("جاري تحليل المادة والتركيز والشكل الدوائي...")}
                </div>
              ) : alternatives.isError ? (
                <div className="mt-5 rounded-2xl bg-rose-50 p-5 text-center text-sm font-bold text-rose-700">
                  <p>{getApiErrorMessage(alternatives.error)}</p>
                  <button
                    className="btn-secondary mt-4"
                    onClick={() => alternatives.mutate()}
                  >
                    {t("إعادة المحاولة")}
                  </button>
                </div>
              ) : !result?.alternatives?.length ? (
                <div className="mt-5 rounded-2xl bg-[#f7faf9] p-8 text-center text-sm text-[#71858a]">
                  {emptyMessage}
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap gap-2 rounded-2xl border border-[#d9e4e5] bg-[#eef6f5] p-3 text-xs font-bold text-[#47666d]">
                    <span className="inline-flex items-center gap-1.5">
                      <FlaskConical size={14} className="text-[#216474]" />
                      {result.composition}
                    </span>
                    {result.strength && <span>• {result.strength}</span>}
                    {result.dosageForm && <span>• {result.dosageForm}</span>}
                  </div>
                  {result.alternatives.map((item, index) => (
                    <article
                      key={`${item.medicineName}-${index}`}
                      className="rounded-2xl border border-[#174b57]/9 bg-[#fbfdfc] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
                          <Pill size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <strong className="block text-[#142e35]">
                                {item.arabicMedicineName || item.medicineName}
                              </strong>
                              {item.arabicMedicineName && (
                                <span
                                  className="mt-0.5 block text-xs font-bold text-[#71858a]"
                                  dir="ltr"
                                >
                                  {item.medicineName}
                                </span>
                              )}
                            </div>
                            <span className="rounded-full bg-[#eaf4f3] px-2.5 py-1 text-[11px] font-black text-[#216474]">
                              {t("تطابق")}{" "}
                              {Math.round(
                                Math.min(1, Math.max(0, item.matchScore || 0)) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-6 text-[#71858a]">
                            {[
                              item.composition,
                              item.strength || item.size,
                              item.dosageForm || item.form,
                              item.packageSize,
                              item.manufacturer,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {[
                              [
                                item.activeIngredientMatches,
                                t("المادة الفعالة مطابقة"),
                              ],
                              [item.strengthMatches, t("العيار مطابق")],
                              [
                                item.dosageFormMatches,
                                t("الشكل الدوائي مطابق"),
                              ],
                            ]
                              .filter(([matched]) => matched === true)
                              .map(([, text]) => (
                                <span
                                  key={text}
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700"
                                >
                                  <CheckCircle2 size={12} />
                                  {text}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-800">
                {t(
                  "هذه اقتراحات مساعدة فقط. لا يتم استبدال الدواء أو تغيير الجرعة إلا بعد مراجعة صيدلي أو طبيب مختص.",
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
