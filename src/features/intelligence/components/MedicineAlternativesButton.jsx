import { useMutation } from "@tanstack/react-query";
import { Pill, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { recommendMedicineAlternatives } from "../api/intelligenceApi";

export function MedicineAlternativesButton({
  medicineName,
  className = "btn-secondary justify-center",
  compact = false,
}) {
  const [open, setOpen] = useState(false);
  const alternatives = useMutation({
    mutationFn: () => recommendMedicineAlternatives(medicineName, 5),
  });
  const show = () => {
    setOpen(true);
    if (!alternatives.data && !alternatives.isPending) alternatives.mutate();
  };

  return (
    <>
      <button type="button" className={className} onClick={show}>
        <Sparkles size={compact ? 15 : 17} />
        {!compact && "اقتراح البدائل"}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[130] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-[1.75rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black text-violet-600">
                  محرك البدائل الدوائية
                </p>
                <h3 className="mt-1 text-xl font-black">{medicineName}</h3>
              </div>
              <button
                className="icon-button grid"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>
            {alternatives.isPending ? (
              <div className="grid min-h-48 place-items-center text-sm font-bold text-[#71858a]">
                جاري تحليل المادة والتركيز والشكل الدوائي...
              </div>
            ) : alternatives.isError ? (
              <div className="mt-5 rounded-2xl bg-rose-50 p-5 text-center text-sm font-bold text-rose-700">
                <p>{getApiErrorMessage(alternatives.error)}</p>
                <button
                  className="btn-secondary mt-4"
                  onClick={() => alternatives.mutate()}
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : !alternatives.data?.alternatives?.length ? (
              <div className="mt-5 rounded-2xl bg-[#f7faf9] p-8 text-center text-sm text-[#71858a]">
                لم يتم العثور على بدائل موثوقة لهذا الدواء.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {alternatives.data.alternatives.map((item, index) => (
                  <article
                    key={`${item.medicineName}-${index}`}
                    className="rounded-2xl border border-[#174b57]/9 bg-[#fbfdfc] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                        <Pill size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <strong>{item.medicineName}</strong>
                          <span className="rounded-full bg-[#eaf4f3] px-2.5 py-1 text-[11px] font-black text-[#216474]">
                            تطابق {Math.round(item.matchScore)}%
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-6 text-[#71858a]">
                          {[item.composition, item.form, item.size]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                        <p className="mt-2 text-xs font-bold text-[#216474]">
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-800">
              هذه اقتراحات مساعدة فقط. لا يتم استبدال الدواء أو تغيير الجرعة إلا
              بعد مراجعة صيدلي أو طبيب مختص.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
