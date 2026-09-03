
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Banknote,
  Beaker,
  Building2,
  FileText,
  Package,
  Pill,
  ShieldCheck,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  DashboardErrorState as AdminErrorState,
  DashboardLoadingState as AdminLoadingState,
} from "../../../shared/components/AsyncStates";
import { getMedicine, medicineKeys } from "../api/medicinesApi";
import { MedicineLocalizationEditor } from "../components/MedicineLocalizationEditor";
import {
  formatMedicineCurrency,
  formatMedicineNumber,
  medicineSubtitle,
} from "../utils/medicineFormatters";

export function MedicineDetailsPage() {
  const { medicineId } = useParams();
  const location = useLocation();

  const query = useQuery({
    queryKey: medicineKeys.detail(medicineId),
    queryFn: () => getMedicine(medicineId),
  });

  if (query.isLoading) {
    return <AdminLoadingState label="جاري تحميل بيانات الدواء..." />;
  }

  if (query.isError) {
    return (
      <AdminErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  }

  const medicine = query.data;

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-5 sm:space-y-6">
      {/* Back */}
      <Link
        to="/app/medicines"
        className="inline-flex max-w-full items-center gap-2 rounded-xl border border-[#DCE8EA] bg-white px-3.5 py-2.5 text-sm font-bold text-[#216474] shadow-[0_6px_20px_rgba(23,75,87,.04)] transition hover:border-[#AFC9CD] hover:bg-[#F8FBFB] sm:px-4"
      >
        <ArrowRight size={17} className="shrink-0" />
        <span className="truncate">العودة إلى دليل الأدوية</span>
      </Link>

      {/* Success message */}
      {location.state?.created && (
        <div className="rounded-xl border border-[#CFE4E7] bg-[#EAF4F3] px-4 py-3.5 text-sm font-bold leading-6 text-[#174B57] sm:px-5 sm:py-4">
          تمت إضافة الدواء إلى الدليل بنجاح.
        </div>
      )}

      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-[1.4rem] bg-[#174B57] px-4 py-5 text-white shadow-[0_18px_45px_rgba(23,75,87,.14)] sm:rounded-[1.6rem] sm:px-6 sm:py-7 lg:rounded-[1.8rem] lg:px-8 lg:py-8">
        <div className="noise absolute inset-0 -z-10" />

        <div className="relative flex min-w-0 flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/10 text-[#F5CB72] sm:size-14 sm:rounded-2xl lg:size-16">
              <Pill
                size={24}
                strokeWidth={1.8}
                className="sm:size-[27px]"
              />
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-[#8BD0CB] sm:text-xs">
                دواء مسجل في الدليل المركزي
              </p>

              <h1 className="mt-1.5 break-words text-2xl font-black leading-tight sm:mt-2 sm:text-3xl lg:text-4xl">
                {medicine.arabicName || medicine.name}
              </h1>

              {medicine.arabicName && (
                <p
                  className="mt-1 break-words text-xs font-bold text-white/70 sm:text-sm"
                  dir="ltr"
                >
                  {medicine.name}
                </p>
              )}

              <p className="mt-1.5 break-words text-xs leading-6 text-white/55 sm:mt-2 sm:text-sm sm:leading-7">
                {medicineSubtitle(medicine)}
              </p>
            </div>
          </div>

          {medicine.requiresPrescription ? (
            <span className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-[#F5CB72]/20 bg-[#F5CB72]/10 px-3.5 py-2 text-xs font-black text-[#F5CB72] sm:w-fit sm:px-4 sm:text-sm">
              <ShieldCheck size={16} className="shrink-0 sm:size-[17px]" />
              يتطلب وصفة طبية
            </span>
          ) : (
            <span className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-[#8BD0CB]/20 bg-[#8BD0CB]/10 px-3.5 py-2 text-xs font-black text-[#BCE7E3] sm:w-fit sm:px-4 sm:text-sm">
              <ShoppingBag size={16} className="shrink-0 sm:size-[17px]" />
              لا يتطلب وصفة
            </span>
          )}
        </div>
      </section>

      {/* Information and prices */}
      <div className="grid min-w-0 gap-5 sm:gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="min-w-0 overflow-hidden rounded-[1.35rem] border border-[#DCE8EA] bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)] sm:rounded-[1.55rem]">
          <SectionHeader
            icon={Beaker}
            title="المعلومات الدوائية"
            subtitle="البيانات الأساسية والتركيب الدوائي"
          />

          <div className="grid min-w-0 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6">
            <Detail
              icon={Beaker}
              label="الاسم العلمي"
              value={medicine.scientificName}
            />

            <Detail
              icon={Building2}
              label="الشركة المصنعة"
              value={medicine.manufacturer}
            />

            <Detail
              icon={Tag}
              label="الشكل الدوائي"
              value={medicine.dosageForm}
            />

            <Detail
              icon={Package}
              label="حجم العبوة"
              value={medicine.packageSize}
            />

            <Detail
              icon={Beaker}
              label="السعة أو التركيز"
              value={medicine.capacity}
            />

            <Detail
              icon={Package}
              label="الكمية المرجعية"
              value={formatMedicineNumber(medicine.quantityInStock)}
            />
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-[1.35rem] border border-[#DCE8EA] bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)] sm:rounded-[1.55rem]">
          <SectionHeader
            icon={Banknote}
            title="الأسعار المرجعية"
            subtitle="أسعار الشراء والبيع المسجلة"
          />

          <div className="p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-1 2xl:grid-cols-2">
              <Price
                label="سعر الشراء"
                value={medicine.purchasePrice}
              />

              <Price
                label="سعر البيع"
                value={medicine.sellingPrice}
                primary
              />
            </div>

            <p className="mt-4 rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] p-3.5 text-xs leading-6 text-[#71858A] sm:mt-5 sm:p-4">
              قد تختلف الأسعار والكميات المتاحة لدى كل صيدلية، وتُدار من خلال
              مخزونها المستقل.
            </p>
          </div>
        </section>
      </div>

      <MedicineLocalizationEditor medicine={medicine} />

      {/* Composition and description */}
      <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-2">
        <TextSection
          icon={Beaker}
          title="التركيب"
          text={medicine.composition}
        />

        <TextSection
          icon={FileText}
          title="الوصف"
          text={medicine.description}
        />
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-b border-[#E6EEF0] bg-[#FAFCFC] px-4 py-4 sm:px-6 sm:py-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474] sm:size-11">
        <Icon size={18} strokeWidth={1.8} className="sm:size-5" />
      </span>

      <div className="min-w-0">
        <h2 className="truncate font-black text-[#29464D]">{title}</h2>

        <p className="mt-0.5 truncate text-xs text-[#829499]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex min-h-[76px] min-w-0 items-center gap-3 rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] p-3.5 sm:min-h-[82px] sm:p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#216474] shadow-[0_4px_14px_rgba(23,75,87,.05)] sm:size-10">
        <Icon size={17} strokeWidth={1.8} className="sm:size-[18px]" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-[#829499]">{label}</p>

        <p
          className="mt-1 truncate text-sm font-black text-[#29464D]"
          title={value || ""}
        >
          {value || "غير محدد"}
        </p>
      </div>
    </div>
  );
}

function Price({ label, value, primary = false }) {
  return (
    <div
      className={`min-w-0 rounded-xl border p-4 sm:p-5 ${
        primary
          ? "border-[#174B57] bg-[#174B57] text-white"
          : "border-[#E6EEF0] bg-[#F8FBFB] text-[#29464D]"
      }`}
    >
      <span
        className={`grid size-9 place-items-center rounded-xl sm:size-10 ${
          primary
            ? "bg-white/10 text-[#F5CB72]"
            : "bg-[#EAF4F3] text-[#216474]"
        }`}
      >
        <Banknote
          size={18}
          strokeWidth={1.8}
          className="sm:size-5"
        />
      </span>

      <p
        className={`mt-3 text-xs sm:mt-4 ${
          primary ? "text-white/55" : "text-[#829499]"
        }`}
      >
        {label}
      </p>

      <strong className="mt-1 block truncate text-lg font-black sm:text-xl">
        {formatMedicineCurrency(value)}
      </strong>
    </div>
  );
}

function TextSection({ icon: Icon, title, text }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[1.35rem] border border-[#DCE8EA] bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)] sm:rounded-[1.55rem]">
      <div className="flex min-w-0 items-center gap-3 border-b border-[#E6EEF0] bg-[#FAFCFC] px-4 py-4 sm:px-6 sm:py-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474] sm:size-10">
          <Icon size={17} strokeWidth={1.8} className="sm:size-[18px]" />
        </span>

        <h3 className="truncate font-black text-[#29464D]">{title}</h3>
      </div>

      <p className="min-h-[120px] break-words whitespace-pre-line p-4 text-sm leading-7 text-[#60777D] sm:min-h-[130px] sm:p-6 sm:leading-8">
        {text || "لا توجد معلومات مسجلة."}
      </p>
    </section>
  );
}

