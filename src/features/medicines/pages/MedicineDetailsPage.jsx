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
  if (query.isLoading)
    return <AdminLoadingState label="جاري تحميل بيانات الدواء..." />;
  if (query.isError)
    return (
      <AdminErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  const medicine = query.data;
  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/app/medicines" className="btn-quiet mb-5">
        <ArrowRight size={17} />
        العودة إلى دليل الأدوية
      </Link>
      {location.state?.created && (
        <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          تمت إضافة الدواء إلى الدليل بنجاح.
        </div>
      )}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#123f49] p-6 text-white shadow-[0_25px_70px_rgba(18,63,73,.18)] lg:p-8">
        <div className="absolute -left-16 -top-20 size-64 rounded-full bg-[#f5cb72]/12 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/10">
              <Pill size={27} />
            </span>
            <div>
              <p className="text-xs font-bold text-[#8bd0cb]">
                دواء مسجل في الدليل المركزي
              </p>
              <h2 className="mt-2 text-3xl font-black">{medicine.name}</h2>
              <p className="mt-2 text-sm text-white/55">
                {medicineSubtitle(medicine)}
              </p>
            </div>
          </div>
          {medicine.requiresPrescription ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-300/15 px-4 py-2 text-sm font-black text-amber-200">
              <ShieldCheck size={17} />
              يتطلب وصفة طبية
            </span>
          ) : (
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-300/15 px-4 py-2 text-sm font-black text-emerald-200">
              <ShoppingBag size={17} />
              لا يتطلب وصفة
            </span>
          )}
        </div>
      </section>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="surface p-6">
          <h3 className="text-lg font-black">المعلومات الدوائية</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
        <section className="surface p-6">
          <h3 className="text-lg font-black">الأسعار المرجعية</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Price label="سعر الشراء" value={medicine.purchasePrice} />
            <Price label="سعر البيع" value={medicine.sellingPrice} primary />
          </div>
          <p className="mt-5 rounded-xl bg-[#f7faf9] p-3 text-xs leading-6 text-[#71858a]">
            قد تختلف الأسعار والكميات المتاحة لدى كل صيدلية، وتُدار من خلال
            مخزونها المستقل.
          </p>
        </section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f7faf9] p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#216474] shadow-sm">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-[#829499]">{label}</p>
        <p className="mt-1 truncate text-sm font-black">
          {value || "غير محدد"}
        </p>
      </div>
    </div>
  );
}
function Price({ label, value, primary }) {
  return (
    <div
      className={`rounded-2xl p-5 ${primary ? "bg-[#174b57] text-white" : "bg-[#f3f8f7]"}`}
    >
      <Banknote
        size={20}
        className={primary ? "text-[#f5cb72]" : "text-[#216474]"}
      />
      <p
        className={`mt-4 text-xs ${primary ? "text-white/50" : "text-[#829499]"}`}
      >
        {label}
      </p>
      <strong className="mt-1 block text-xl">
        {formatMedicineCurrency(value)}
      </strong>
    </div>
  );
}
function TextSection({ icon: Icon, title, text }) {
  return (
    <section className="surface p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
          <Icon size={18} />
        </span>
        <h3 className="font-black">{title}</h3>
      </div>
      <p className="mt-5 whitespace-pre-line text-sm leading-8 text-[#60777c]">
        {text || "لا توجد معلومات مسجلة."}
      </p>
    </section>
  );
}
