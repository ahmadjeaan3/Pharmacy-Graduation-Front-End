import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  importSyrianMedicineCatalog,
  medicineKeys,
} from "../api/medicinesApi";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const metrics = [
  ["rowsRead", "الصفوف المقروءة"],
  ["distinctRows", "الأدوية المميزة"],
  ["insertedCount", "أدوية جديدة"],
  ["updatedCount", "أدوية محدّثة"],
  ["unchangedCount", "دون تغيير"],
  ["arabicNamesImportedCount", "أسماء عربية"],
  ["aliasesImportedCount", "أسماء بحث"],
  ["ambiguousDuplicateCount", "تكرارات تحتاج مراجعة"],
];

export function MedicineCatalogImportDialog({ open, onClose }) {
  const client = useQueryClient();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  const importer = useMutation({
    mutationFn: ({ selectedFile, dryRun }) =>
      importSyrianMedicineCatalog(selectedFile, dryRun),
    onSuccess: async (data) => {
      setResult(data);
      if (!data.dryRun) {
        await client.invalidateQueries({ queryKey: medicineKeys.root });
      }
    },
  });

  if (!open) return null;

  const selectFile = (selectedFile) => {
    setValidationError("");
    setResult(null);
    importer.reset();
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (!/\.xlsx$/i.test(selectedFile.name)) {
      setValidationError("اختر ملف Excel بصيغة XLSX فقط.");
      setFile(null);
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setValidationError("حجم الملف أكبر من الحد المسموح (20 ميغابايت).");
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  const run = (dryRun) => {
    if (!file) {
      setValidationError("اختر ملف الأدوية أولًا.");
      return;
    }
    setValidationError("");
    importer.mutate({ selectedFile: file, dryRun });
  };

  const completed = result && result.dryRun === false;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-import-title"
    >
      <div className="max-h-[94vh] w-full max-w-3xl overflow-auto rounded-[1.75rem] bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#174b57]/8 bg-white/95 p-5 backdrop-blur sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
              <FileSpreadsheet size={23} />
            </span>
            <div>
              <h2 id="catalog-import-title" className="text-xl font-black text-[#17363e]">
                استيراد دليل الأدوية السورية
              </h2>
              <p className="mt-1 text-xs leading-5 text-[#71858a]">
                افحص الملف أولًا، ثم أكّد إضافة الأسماء العربية وأسماء البحث إلى الدليل.
              </p>
            </div>
          </div>
          <button className="icon-button grid" onClick={onClose} aria-label="إغلاق">
            <X size={19} />
          </button>
        </header>

        <div className="space-y-5 p-5 sm:p-6">
          <label className="group block cursor-pointer rounded-[1.4rem] border border-dashed border-[#9bbdc2] bg-[#f7faf9] p-6 text-center transition hover:border-[#216474] hover:bg-[#eef7f6]">
            <input
              type="file"
              accept=".xlsx"
              className="sr-only"
              onChange={(event) => selectFile(event.target.files?.[0])}
            />
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-[#216474] shadow-sm transition group-hover:-translate-y-1">
              <Upload size={24} />
            </span>
            <strong className="mt-4 block text-sm text-[#29464d]">
              {file?.name || "اختر ملف Excel من جهازك"}
            </strong>
            <span className="mt-1 block text-xs text-[#829499]">
              XLSX — بحد أقصى 20 ميغابايت
            </span>
          </label>

          {(validationError || importer.isError) && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
              <AlertTriangle size={19} className="mt-0.5 shrink-0" />
              <span>{validationError || getApiErrorMessage(importer.error)}</span>
            </div>
          )}

          {result && (
            <section className="rounded-[1.4rem] border border-[#dce8ea] bg-white p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={21} />
                <div>
                  <h3 className="font-black text-[#17363e]">
                    {completed ? "اكتمل تحديث دليل الأدوية" : "اكتمل فحص الملف بنجاح"}
                  </h3>
                  <p className="mt-1 text-xs leading-6 text-[#71858a]">
                    {result.alreadyImported
                      ? "سبق استيراد هذا الملف؛ راجع الأرقام قبل المتابعة."
                      : completed
                        ? "تم حفظ نتائج الاستيراد في قاعدة البيانات."
                        : "هذه معاينة فقط ولم تُحفظ أي تغييرات بعد."}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {metrics.map(([key, label]) => (
                  <div key={key} className="rounded-xl bg-[#f5f9f8] p-3">
                    <strong className="block text-lg font-black text-[#174b57]">
                      {Number(result[key] || 0).toLocaleString("ar-SY")}
                    </strong>
                    <span className="mt-1 block text-[10px] leading-4 text-[#71858a]">{label}</span>
                  </div>
                ))}
              </div>

              {!!result.warnings?.length && (
                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <p className="flex items-center gap-2 text-xs font-black text-amber-800">
                    <AlertTriangle size={16} /> ملاحظات الاستيراد
                  </p>
                  <ul className="mt-2 max-h-32 list-disc space-y-1 overflow-auto ps-5 text-xs leading-5 text-amber-800/80">
                    {result.warnings.map((warning, index) => (
                      <li key={`${warning}-${index}`}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-[#174b57]/8 pt-5 sm:flex-row sm:justify-end">
            <button className="btn-secondary" onClick={onClose} disabled={importer.isPending}>
              {completed ? "إغلاق" : "إلغاء"}
            </button>
            {!completed && (
              <button
                className="btn-secondary"
                disabled={!file || importer.isPending}
                onClick={() => run(true)}
              >
                {importer.isPending && !result ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <FileSpreadsheet size={17} />
                )}
                فحص الملف
              </button>
            )}
            {result?.dryRun && (
              <button className="btn-primary" disabled={importer.isPending} onClick={() => run(false)}>
                {importer.isPending ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Upload size={17} />
                )}
                تأكيد الاستيراد
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
