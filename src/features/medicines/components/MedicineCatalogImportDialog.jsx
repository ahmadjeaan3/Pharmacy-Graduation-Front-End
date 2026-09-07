
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

export function MedicineCatalogImportDialog({
  open,
  onClose,
}) {
  const client = useQueryClient();

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = (event) =>
      event.key === "Escape" && onClose();

    window.addEventListener("keydown", closeOnEscape);

    return () =>
      window.removeEventListener(
        "keydown",
        closeOnEscape,
      );
  }, [open, onClose]);

  const importer = useMutation({
    mutationFn: ({ selectedFile, dryRun }) =>
      importSyrianMedicineCatalog(
        selectedFile,
        dryRun,
      ),

    onSuccess: async (data) => {
      setResult(data);

      if (!data.dryRun) {
        await client.invalidateQueries({
          queryKey: medicineKeys.root,
        });
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
      setValidationError(
        "اختر ملف Excel بصيغة XLSX فقط.",
      );
      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setValidationError(
        "حجم الملف أكبر من الحد المسموح (20 ميغابايت).",
      );
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const run = (dryRun) => {
    if (!file) {
      setValidationError(
        "اختر ملف الأدوية أولًا.",
      );
      return;
    }

    setValidationError("");

    importer.mutate({
      selectedFile: file,
      dryRun,
    });
  };

  const completed =
    result && result.dryRun === false;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-[#071f25]/65 p-2 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-import-title"
    >
      <div className="max-h-[96vh] w-full max-w-3xl overflow-auto rounded-[1.4rem] bg-white shadow-2xl sm:max-h-[94vh] sm:rounded-[1.75rem]">

        {/* Header */}
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#174b57]/8 bg-white/95 p-4 backdrop-blur sm:gap-4 sm:p-6">

          <div className="flex min-w-0 items-start gap-3">

            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474] sm:size-12 sm:rounded-2xl">
              <FileSpreadsheet
                size={20}
                className="sm:h-[23px] sm:w-[23px]"
              />
            </span>

            <div className="min-w-0">

              <h2
                id="catalog-import-title"
                className="text-base font-black text-[#17363e] sm:text-xl"
              >
                استيراد دليل الأدوية السورية
              </h2>

              <p className="mt-1 text-[11px] leading-5 text-[#71858a] sm:text-xs">
                افحص الملف أولًا، ثم أكّد إضافة الأسماء
                العربية وأسماء البحث إلى الدليل.
              </p>

            </div>
          </div>

          <button
            className="icon-button grid shrink-0"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>

        </header>

        {/* Content */}
        <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">

          {/* File Upload */}
          <label className="group block cursor-pointer rounded-[1.25rem] border border-dashed border-[#9bbdc2] bg-[#f7faf9] p-5 text-center transition hover:border-[#216474] hover:bg-[#eef7f6] sm:rounded-[1.4rem] sm:p-6">

            <input
              type="file"
              accept=".xlsx"
              className="sr-only"
              onChange={(event) =>
                selectFile(
                  event.target.files?.[0],
                )
              }
            />

            <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-[#216474] shadow-sm transition group-hover:-translate-y-1 sm:size-14 sm:rounded-2xl">
              <Upload
                size={21}
                className="sm:h-6 sm:w-6"
              />
            </span>

            <strong className="mt-3 block break-all text-xs text-[#29464d] sm:mt-4 sm:text-sm">
              {file?.name ||
                "اختر ملف Excel من جهازك"}
            </strong>

            <span className="mt-1 block text-[10px] text-[#829499] sm:text-xs">
              XLSX — بحد أقصى 20 ميغابايت
            </span>

          </label>

          {/* Error */}
          {(validationError || importer.isError) && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-100 bg-rose-50 p-3 text-xs font-bold text-rose-700 sm:gap-3 sm:p-4 sm:text-sm">

              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <span>
                {validationError ||
                  getApiErrorMessage(
                    importer.error,
                  )}
              </span>

            </div>
          )}

          {/* Result */}
          {result && (
            <section className="rounded-[1.25rem] border border-[#dce8ea] bg-white p-3.5 sm:rounded-[1.4rem] sm:p-5">

              <div className="flex items-start gap-2.5 sm:gap-3">

                <CheckCircle2
                  className="mt-0.5 shrink-0 text-emerald-600"
                  size={20}
                />

                <div className="min-w-0">

                  <h3 className="text-sm font-black text-[#17363e] sm:text-base">
                    {completed
                      ? "اكتمل تحديث دليل الأدوية"
                      : "اكتمل فحص الملف بنجاح"}
                  </h3>

                  <p className="mt-1 text-[11px] leading-5 text-[#71858a] sm:text-xs sm:leading-6">
                    {result.alreadyImported
                      ? "سبق استيراد هذا الملف؛ راجع الأرقام قبل المتابعة."
                      : completed
                        ? "تم حفظ نتائج الاستيراد في قاعدة البيانات."
                        : "هذه معاينة فقط ولم تُحفظ أي تغييرات بعد."}
                  </p>

                </div>

              </div>

              {/* Metrics */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-4 sm:gap-3">

                {metrics.map(
                  ([key, label]) => (
                    <div
                      key={key}
                      className="min-w-0 rounded-xl bg-[#f5f9f8] p-2.5 sm:p-3"
                    >

                      <strong className="block truncate text-base font-black text-[#174b57] sm:text-lg">
                        {Number(
                          result[key] || 0,
                        ).toLocaleString(
                          "ar-SY-u-nu-latn",
                        )}
                      </strong>

                      <span className="mt-1 block text-[9px] leading-4 text-[#71858a] sm:text-[10px]">
                        {label}
                      </span>

                    </div>
                  ),
                )}

              </div>

              {/* Warnings */}
              {!!result.warnings?.length && (
                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 sm:mt-4 sm:p-4">

                  <p className="flex items-center gap-2 text-[11px] font-black text-amber-800 sm:text-xs">
                    <AlertTriangle size={15} />
                    ملاحظات الاستيراد
                  </p>

                  <ul className="mt-2 max-h-32 list-disc space-y-1 overflow-auto ps-5 text-[10px] leading-5 text-amber-800/80 sm:text-xs">
                    {result.warnings.map(
                      (warning, index) => (
                        <li
                          key={`${warning}-${index}`}
                        >
                          {warning}
                        </li>
                      ),
                    )}
                  </ul>

                </div>
              )}

            </section>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-[#174b57]/8 pt-4 sm:flex-row sm:justify-end sm:pt-5">

            <button
              className="btn-secondary w-full justify-center sm:w-auto"
              onClick={onClose}
              disabled={importer.isPending}
            >
              {completed
                ? "إغلاق"
                : "إلغاء"}
            </button>

            {!completed && (
              <button
                className="btn-secondary w-full justify-center sm:w-auto"
                disabled={
                  !file ||
                  importer.isPending
                }
                onClick={() => run(true)}
              >
                {importer.isPending &&
                !result ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <FileSpreadsheet
                    size={17}
                  />
                )}

                فحص الملف
              </button>
            )}

            {result?.dryRun && (
              <button
                className="btn-primary w-full justify-center sm:w-auto"
                disabled={importer.isPending}
                onClick={() => run(false)}
              >
                {importer.isPending ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
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

