import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  PackageOpen,
  Pill,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  DashboardEmptyState as AdminEmptyState,
  DashboardErrorState as AdminErrorState,
  DashboardLoadingState as AdminLoadingState,
} from "../../../shared/components/AsyncStates";
import { getMedicines, medicineKeys } from "../api/medicinesApi";
import { MedicinePageHeader } from "../components/MedicinePageHeader";
import {
  formatMedicineCurrency,
  formatMedicineNumber,
  medicineSubtitle,
} from "../utils/medicineFormatters";

export function MedicineCatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [queryTerm, setQueryTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueryTerm(searchTerm.trim());
      setPageNumber(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);
  const params = { searchTerm: queryTerm, pageNumber, pageSize: 18 };
  const query = useQuery({
    queryKey: medicineKeys.list(params),
    queryFn: () => getMedicines(params),
    placeholderData: (previous) => previous,
  });
  const data = query.data;
  return (
    <div>
      <MedicinePageHeader
        title="دليل الأدوية"
        description="إدارة المرجع الأساسي للأدوية الذي تعتمد عليه الصيدليات والطلبات والمبادرات داخل المنصة."
        actions={
          <Link to="/app/medicines/new" className="btn-primary">
            <Plus size={17} />
            إضافة دواء جديد
          </Link>
        }
      />
      <section className="surface mb-5 flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
        <div className="field-control flex-1">
          <span className="field-icon-shell">
            <Search size={17} />
          </span>
          <input
            className="form-input has-field-icon"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxLength={200}
            placeholder="ابحث بالاسم التجاري أو العلمي أو الشركة المصنعة"
          />
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-[#f3f8f7] px-4 py-3 text-sm">
          <PackageOpen size={18} className="text-[#216474]" />
          <span className="text-[#71858a]">إجمالي الأدوية</span>
          <strong className="text-[#17363e]">
            {formatMedicineNumber(data?.totalCount)}
          </strong>
        </div>
      </section>
      {query.isLoading ? (
        <AdminLoadingState label="جاري تحميل دليل الأدوية..." />
      ) : query.isError ? (
        <AdminErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !data?.items?.length ? (
        <AdminEmptyState
          title="لا توجد أدوية مطابقة"
          description={
            queryTerm
              ? "غيّر عبارة البحث أو أضف الدواء إلى الدليل إذا لم يكن مسجلاً."
              : "ابدأ بإضافة أول دواء إلى الدليل المركزي."
          }
        />
      ) : (
        <>
          <section
            className={`grid gap-4 md:grid-cols-2 2xl:grid-cols-3 ${query.isFetching ? "opacity-60" : ""}`}
          >
            {data.items.map((medicine) => (
              <Link
                key={medicine.id}
                to={`/app/medicines/${medicine.id}`}
                className="surface group relative overflow-hidden p-5 transition hover:-translate-y-1 hover:border-[#216474]/25 hover:shadow-[0_20px_45px_rgba(23,75,87,.11)]"
              >
                <div className="absolute -left-9 -top-9 size-28 rounded-full bg-[#eaf4f3] transition group-hover:scale-125" />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#174b57] text-white shadow-lg shadow-[#174b57]/15">
                    <Pill size={21} />
                  </span>
                  {medicine.requiresPrescription && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
                      <ShieldCheck size={13} />
                      بوصفة طبية
                    </span>
                  )}
                </div>
                <h3 className="relative mt-5 truncate text-lg font-black text-[#17363e]">
                  {medicine.name}
                </h3>
                <p className="mt-1 truncate text-xs text-[#829499]">
                  {medicineSubtitle(medicine)}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#f7faf9] p-3">
                    <p className="text-[10px] text-[#829499]">
                      سعر البيع المرجعي
                    </p>
                    <strong className="mt-1 block text-sm">
                      {formatMedicineCurrency(medicine.sellingPrice)}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-[#f7faf9] p-3">
                    <p className="text-[10px] text-[#829499]">الشركة المصنعة</p>
                    <strong className="mt-1 block truncate text-sm">
                      {medicine.manufacturer || "غير محددة"}
                    </strong>
                  </div>
                </div>
                <div className="mt-5 flex items-center border-t border-[#174b57]/8 pt-4 text-sm font-bold text-[#216474]">
                  عرض التفاصيل{" "}
                  <ArrowLeft
                    size={16}
                    className="mr-auto transition group-hover:-translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </section>
          <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#174b57]/8 bg-white p-4 sm:flex-row">
            <p className="text-sm text-[#71858a]">
              الصفحة{" "}
              <strong className="text-[#17363e]">
                {formatMedicineNumber(data.pageNumber)}
              </strong>{" "}
              من{" "}
              <strong className="text-[#17363e]">
                {formatMedicineNumber(Math.max(data.totalPages, 1))}
              </strong>
            </p>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                disabled={pageNumber <= 1 || query.isFetching}
                onClick={() => setPageNumber((page) => page - 1)}
              >
                <ChevronRight size={17} />
                السابق
              </button>
              <button
                className="btn-secondary"
                disabled={pageNumber >= data.totalPages || query.isFetching}
                onClick={() => setPageNumber((page) => page + 1)}
              >
                التالي <ChevronLeft size={17} />
              </button>
            </div>
          </div>
        </>
      )}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-cyan-900">
        <FlaskConical size={19} className="mt-0.5 shrink-0" />
        <p className="text-xs leading-6">
          الدليل هنا يمثل بيانات الدواء الأساسية. كميات كل صيدلية وأسعارها
          الفعلية تُدار بصورة مستقلة من مخزون الصيدلية.
        </p>
      </div>
    </div>
  );
}
