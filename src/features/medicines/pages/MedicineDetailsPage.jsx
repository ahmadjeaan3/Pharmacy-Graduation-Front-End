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
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Back */}
      <Link
        to="/app/medicines"
        className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8EA] bg-white px-4 py-2.5 text-sm font-bold text-[#216474] shadow-[0_6px_20px_rgba(23,75,87,.04)] transition hover:border-[#AFC9CD] hover:bg-[#F8FBFB]"
      >
        <ArrowRight size={17} />
        العودة إلى دليل الأدوية
      </Link>

      {/* Success message */}
      {location.state?.created && (
        <div className="rounded-xl border border-[#CFE4E7] bg-[#EAF4F3] px-5 py-4 text-sm font-bold text-[#174B57]">
          تمت إضافة الدواء إلى الدليل بنجاح.
        </div>
      )}

      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-[1.8rem] bg-[#174B57] px-6 py-8 text-white shadow-[0_22px_55px_rgba(23,75,87,.16)] lg:px-8">
        <div className="noise absolute inset-0 -z-10" />

        <div
          aria-hidden="true"
          className="absolute -left-16 -top-20 -z-10 size-64 rounded-full border-[38px] border-white/[.035]"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-28 right-[35%] -z-10 size-60 rounded-full bg-[#6E969E]/10 blur-3xl"
        />

        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-[#F5CB72]">
              <Pill size={29} strokeWidth={1.8} />
            </span>

            <div className="min-w-0">
              <p className="text-xs font-bold text-[#8BD0CB]">
                دواء مسجل في الدليل المركزي
              </p>

              <h1 className="mt-2 truncate text-3xl font-black sm:text-4xl">
                {medicine.arabicName || medicine.name}
              </h1>

              {medicine.arabicName && (
                <p className="mt-1 text-sm font-bold text-white/70" dir="ltr">
                  {medicine.name}
                </p>
              )}

              <p className="mt-2 text-sm leading-7 text-white/55">
                {medicineSubtitle(medicine)}
              </p>
            </div>
          </div>

          {medicine.requiresPrescription ? (
            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#F5CB72]/20 bg-[#F5CB72]/10 px-4 py-2 text-sm font-black text-[#F5CB72]">
              <ShieldCheck size={17} />
              يتطلب وصفة طبية
            </span>
          ) : (
            <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#8BD0CB]/20 bg-[#8BD0CB]/10 px-4 py-2 text-sm font-black text-[#BCE7E3]">
              <ShoppingBag size={17} />
              لا يتطلب وصفة
            </span>
          )}
        </div>
      </section>

      {/* Information and prices */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="overflow-hidden rounded-[1.55rem] border border-[#DCE8EA] bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
          <SectionHeader
            icon={Beaker}
            title="المعلومات الدوائية"
            subtitle="البيانات الأساسية والتركيب الدوائي"
          />

          <div className="grid gap-4 p-6 sm:grid-cols-2">
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

        <section className="overflow-hidden rounded-[1.55rem] border border-[#DCE8EA] bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
          <SectionHeader
            icon={Banknote}
            title="الأسعار المرجعية"
            subtitle="أسعار الشراء والبيع المسجلة"
          />

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Price label="سعر الشراء" value={medicine.purchasePrice} />

              <Price label="سعر البيع" value={medicine.sellingPrice} primary />
            </div>

            <p className="mt-5 rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] p-4 text-xs leading-6 text-[#71858A]">
              قد تختلف الأسعار والكميات المتاحة لدى كل صيدلية، وتُدار من خلال
              مخزونها المستقل.
            </p>
          </div>
        </section>
      </div>

      <MedicineLocalizationEditor medicine={medicine} />

      {/* Composition and description */}
      <div className="grid gap-6 lg:grid-cols-2">
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
    <div className="flex items-center gap-3 border-b border-[#E6EEF0] bg-[#FAFCFC] px-6 py-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
        <Icon size={20} strokeWidth={1.8} />
      </span>

      <div>
        <h2 className="font-black text-[#29464D]">{title}</h2>

        <p className="mt-0.5 text-xs text-[#829499]">{subtitle}</p>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex min-h-[82px] items-center gap-3 rounded-xl border border-[#E6EEF0] bg-[#F8FBFB] p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#216474] shadow-[0_4px_14px_rgba(23,75,87,.05)]">
        <Icon size={18} strokeWidth={1.8} />
      </span>

      <div className="min-w-0">
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
      className={`rounded-xl border p-5 ${
        primary
          ? "border-[#174B57] bg-[#174B57] text-white"
          : "border-[#E6EEF0] bg-[#F8FBFB] text-[#29464D]"
      }`}
    >
      <span
        className={`grid size-10 place-items-center rounded-xl ${
          primary ? "bg-white/10 text-[#F5CB72]" : "bg-[#EAF4F3] text-[#216474]"
        }`}
      >
        <Banknote size={20} strokeWidth={1.8} />
      </span>

      <p
        className={`mt-4 text-xs ${
          primary ? "text-white/55" : "text-[#829499]"
        }`}
      >
        {label}
      </p>

      <strong className="mt-1 block text-xl font-black">
        {formatMedicineCurrency(value)}
      </strong>
    </div>
  );
}

function TextSection({ icon: Icon, title, text }) {
  return (
    <section className="overflow-hidden rounded-[1.55rem] border border-[#DCE8EA] bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
      <div className="flex items-center gap-3 border-b border-[#E6EEF0] bg-[#FAFCFC] px-6 py-5">
        <span className="grid size-10 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
          <Icon size={18} strokeWidth={1.8} />
        </span>

        <h3 className="font-black text-[#29464D]">{title}</h3>
      </div>

      <p className="min-h-[130px] whitespace-pre-line p-6 text-sm leading-8 text-[#60777D]">
        {text || "لا توجد معلومات مسجلة."}
      </p>
    </section>
  );
}
