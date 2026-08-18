import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FlaskConical,
  PackageOpen,
  Pill,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  DashboardEmptyState as AdminEmptyState,
  DashboardErrorState as AdminErrorState,
  DashboardLoadingState as AdminLoadingState,
} from "../../../shared/components/AsyncStates";
import { getMedicines, medicineKeys } from "../api/medicinesApi";
import { MedicineCatalogImportDialog } from "../components/MedicineCatalogImportDialog";
import {
  formatMedicineCurrency,
  formatMedicineNumber,
  medicineSubtitle,
} from "../utils/medicineFormatters";

const ADMIN_HERO_IMAGE = "/assets/app/home/background_hero_admin.png";

export function MedicineCatalogPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = String(
    i18n.resolvedLanguage || i18n.language || "ar",
  )
    .split("-")[0]
    .toLowerCase();

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const [searchTerm, setSearchTerm] = useState("");
  const [queryTerm, setQueryTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQueryTerm(searchTerm.trim());
      setPageNumber(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const params = {
    searchTerm: queryTerm,
    pageNumber,
    pageSize: 18,
  };

  const query = useQuery({
    queryKey: medicineKeys.list(params),
    queryFn: () => getMedicines(params),
    placeholderData: (previous) => previous,
  });

  const data = query.data;

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="space-y-5 sm:space-y-6"
    >
      {/* =====================================================
          HERO - same admin design
      ====================================================== */}
      <section className="relative isolate min-h-[230px] overflow-hidden rounded-[16px] bg-[#10505A] px-5 py-7 text-white shadow-[0_22px_55px_rgba(23,75,87,.14)] sm:min-h-[250px] sm:px-7 sm:py-8 lg:min-h-[271px] lg:px-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-[position:38%_center] bg-no-repeat"
          style={{
            backgroundImage: `url("${ADMIN_HERO_IMAGE}")`,
          }}
        />

        <div
          aria-hidden="true"
          className={`absolute inset-0 -z-10 ${
            isArabic
              ? "bg-[linear-gradient(270deg,#10505A_0%,rgba(16,80,90,.90)_35%,rgba(33,100,116,.46)_69%,rgba(33,100,116,.08)_100%)]"
              : "bg-[linear-gradient(90deg,#10505A_0%,rgba(16,80,90,.90)_35%,rgba(33,100,116,.46)_69%,rgba(33,100,116,.08)_100%)]"
          }`}
        />

        <div className="noise absolute inset-0 -z-[5] opacity-25" />

        <div
          aria-hidden="true"
          className={`absolute -top-24 -z-[4] size-72 rounded-full border-[44px] border-white/[.035] ${
            isArabic ? "-left-12" : "-right-12"
          }`}
        />

        <div className="relative flex min-h-[175px] flex-col justify-center gap-6 sm:min-h-[190px] lg:min-h-[207px] lg:flex-row lg:items-center lg:justify-between">
          <div className={isArabic ? "text-right" : "text-left"}>
            <p className="flex items-center gap-2 text-sm font-bold text-[#8BD0CB]">
              <FileSpreadsheet size={16} />
              {t("إدارة المرجع الدوائي")}
            </p>

            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
              {t("دليل الأدوية")}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-[15px]">
              {t(
                "إدارة المرجع الأساسي للأدوية الذي تعتمد عليه الصيدليات والطلبات والمبادرات داخل المنصة.",
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 text-[13px] font-bold text-white backdrop-blur-sm transition hover:bg-white/18"
            >
              <FileSpreadsheet size={17} />
              {t("استيراد ملف الأدوية")}
            </button>

            <Link
              to="/app/medicines/new"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[13px] font-bold text-[#216474] shadow-[0_10px_24px_rgba(8,52,61,.12)] transition hover:-translate-y-0.5 hover:bg-[#F7FBFB]"
            >
              <Plus size={17} />
              {t("إضافة دواء جديد")}
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH + TOTAL
      ====================================================== */}
      <section className="rounded-[14px] border border-[#174B57]/8 bg-white p-4 shadow-[0_10px_30px_rgba(23,75,87,.035)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#6E969E] ${
                isArabic ? "right-4" : "left-4"
              }`}
            />

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              maxLength={200}
              placeholder={t(
                "ابحث بالاسم التجاري أو العلمي أو الشركة المصنعة",
              )}
              aria-label={t("البحث في دليل الأدوية")}
              className={`h-12 w-full rounded-xl border border-[#DCE8EA] bg-white text-[14px] text-[#29464D] outline-none transition placeholder:text-[12px] placeholder:text-[#A5A5A5] hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                isArabic ? "pl-4 pr-12 text-right" : "pl-12 pr-4 text-left"
              }`}
            />
          </div>

          <div className="flex min-h-12 items-center gap-3 rounded-xl border border-[#DCE8EA] bg-[#F8FBFB] px-4">
            <span className="grid size-9 place-items-center rounded-lg bg-[#EAF4F3] text-[#216474]">
              <PackageOpen size={18} />
            </span>

            <span className="text-[12px] font-semibold text-[#71858A]">
              {t("إجمالي الأدوية")}
            </span>

            <strong className="text-base font-black text-[#17363E]">
              {formatMedicineNumber(data?.totalCount)}
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      {query.isLoading ? (
        <AdminLoadingState label={t("جاري تحميل دليل الأدوية...")} />
      ) : query.isError ? (
        <AdminErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !data?.items?.length ? (
        <AdminEmptyState
          title={t("لا توجد أدوية مطابقة")}
          description={
            queryTerm
              ? t(
                  "غيّر عبارة البحث أو أضف الدواء إلى الدليل إذا لم يكن مسجلاً.",
                )
              : t("ابدأ بإضافة أول دواء إلى الدليل المركزي.")
          }
        />
      ) : (
        <>
          <section
            className={`grid gap-4 md:grid-cols-2 2xl:grid-cols-3 ${
              query.isFetching ? "opacity-60" : ""
            }`}
          >
            {data.items.map((medicine) => (
              <Link
                key={medicine.id}
                to={`/app/medicines/${medicine.id}`}
                className="group relative overflow-hidden rounded-[14px] border border-[#174B57]/8 bg-white p-5 shadow-[0_10px_30px_rgba(23,75,87,.035)] transition duration-300 hover:-translate-y-1 hover:border-[#216474]/25 hover:shadow-[0_20px_45px_rgba(23,75,87,.10)]"
              >
                <div className="absolute -left-9 -top-9 size-28 rounded-full bg-[#EAF4F3] transition group-hover:scale-125" />

                <div className="relative flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#216474] text-white shadow-[0_8px_20px_rgba(33,100,116,.16)]">
                    <Pill size={21} />
                  </span>

                  {medicine.requiresPrescription && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7DF] px-2.5 py-1 text-[10px] font-black text-[#C98F13]">
                      <ShieldCheck size={13} />
                      {t("بوصفة طبية")}
                    </span>
                  )}
                </div>

                <h3 className="relative mt-5 truncate text-lg font-black text-[#17363E]">
                  {medicine.name}
                </h3>

                <p className="mt-1 truncate text-xs text-[#829499]">
                  {medicineSubtitle(medicine)}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] p-3">
                    <p className="text-[10px] text-[#829499]">
                      {t("سعر البيع المرجعي")}
                    </p>

                    <strong className="mt-1 block text-sm text-[#29464D]">
                      {formatMedicineCurrency(medicine.sellingPrice)}
                    </strong>
                  </div>

                  <div className="rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] p-3">
                    <p className="text-[10px] text-[#829499]">
                      {t("الشركة المصنعة")}
                    </p>

                    <strong className="mt-1 block truncate text-sm text-[#29464D]">
                      {medicine.manufacturer || t("غير محددة")}
                    </strong>
                  </div>
                </div>

                <div className="mt-5 flex items-center border-t border-[#E6EEF0] pt-4 text-sm font-bold text-[#216474]">
                  {t("عرض التفاصيل")}

                  <ArrowLeft
                    size={16}
                    className="ms-auto transition group-hover:-translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </section>

          {/* Pagination */}
          <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-[14px] border border-[#174B57]/8 bg-white p-4 shadow-[0_8px_24px_rgba(23,75,87,.025)] sm:flex-row">
            <p className="text-sm text-[#71858A]">
              {t("الصفحة")}{" "}
              <strong className="text-[#17363E]">
                {formatMedicineNumber(data.pageNumber)}
              </strong>{" "}
              {t("من")}{" "}
              <strong className="text-[#17363E]">
                {formatMedicineNumber(Math.max(data.totalPages, 1))}
              </strong>
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={pageNumber <= 1 || query.isFetching}
                onClick={() => setPageNumber((page) => page - 1)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D5E3E5] bg-white px-4 text-[12px] font-bold text-[#216474] transition hover:bg-[#EAF4F3] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <ChevronRight size={17} />
                {t("السابق")}
              </button>

              <button
                type="button"
                disabled={
                  pageNumber >= data.totalPages || query.isFetching
                }
                onClick={() => setPageNumber((page) => page + 1)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#216474] px-4 text-[12px] font-bold text-white transition hover:bg-[#174B57] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {t("التالي")}
                <ChevronLeft size={17} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Info note */}
      <div className="mt-6 flex items-start gap-3 rounded-[14px] border border-[#CFE4E7] bg-[#F0F8F8] p-4 text-[#36555C]">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#216474]">
          <FlaskConical size={18} />
        </span>

        <p className="text-xs leading-6">
          {t(
            "الدليل هنا يمثل بيانات الدواء الأساسية. كميات كل صيدلية وأسعارها الفعلية تُدار بصورة مستقلة من مخزون الصيدلية.",
          )}
        </p>
      </div>

      <MedicineCatalogImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
    </div>
  );
}

export default MedicineCatalogPage;