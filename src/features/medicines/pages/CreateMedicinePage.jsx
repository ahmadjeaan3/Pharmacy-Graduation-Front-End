
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Banknote,
  Beaker,
  Building2,
  FileText,
  Package,
  Pill,
  Save,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { createMedicine, medicineKeys } from "../api/medicinesApi";
import { MedicinePageHeader } from "../components/MedicinePageHeader";

const initial = {
  name: "",
  scientificName: "",
  purchasePrice: "",
  sellingPrice: "",
  quantityInStock: 0,
  manufacturer: "",
  dosageForm: "",
  packageSize: "",
  capacity: "",
  composition: "",
  description: "",
  requiresPrescription: false,
};

const optional = (value) => value.trim() || null;

export function CreateMedicinePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: createMedicine,

    onSuccess: async (medicine) => {
      await queryClient.invalidateQueries({
        queryKey: medicineKeys.root,
      });

      navigate(`/app/medicines/${medicine.id}`, {
        replace: true,
        state: { created: true },
      });
    },

    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const change = (key) => (event) =>
    setForm((old) => ({
      ...old,
      [key]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));

  const submit = (event) => {
    event.preventDefault();
    setError("");

    mutation.mutate({
      name: form.name.trim(),
      scientificName: optional(form.scientificName),
      purchasePrice: Number(form.purchasePrice || 0),
      sellingPrice: Number(form.sellingPrice || 0),
      quantityInStock: Number(form.quantityInStock || 0),
      manufacturer: optional(form.manufacturer),
      dosageForm: optional(form.dosageForm),
      packageSize: optional(form.packageSize),
      capacity: optional(form.capacity),
      composition: optional(form.composition),
      description: optional(form.description),
      requiresPrescription: form.requiresPrescription,
    });
  };

  return (
    <div className="w-full min-w-0">
      {/* العودة إلى دليل الأدوية */}
      <Link
        to="/app/medicines"
        className="btn-quiet mb-4 inline-flex max-w-full items-center gap-2 sm:mb-5"
      >
        <ArrowRight size={17} className="shrink-0" />
        <span className="truncate">العودة إلى دليل الأدوية</span>
      </Link>

      {/* عنوان الصفحة */}
      <MedicinePageHeader
        title="إضافة دواء جديد"
        description="سجّل المعلومات المرجعية بدقة؛ سيصبح الدواء متاحًا للصيدليات عند إضافة أصناف مخزونها."
      />

      {/* رسالة الخطأ */}
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-3.5 text-sm font-bold leading-6 text-rose-700 sm:mb-5 sm:p-4">
          {error}
        </div>
      )}

      <form
        onSubmit={submit}
        className="w-full min-w-0 space-y-4 sm:space-y-6"
      >
        {/* هوية الدواء */}
        <FormSection
          icon={Pill}
          title="هوية الدواء"
          description="الأسماء والمعلومات التي تميز الدواء داخل الدليل"
        >
          <div className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2">
            <Field label="الاسم التجاري" required>
              <input
                className="form-input w-full min-w-0"
                value={form.name}
                onChange={change("name")}
                maxLength={500}
                required
                placeholder="مثال: باراسيتامول"
              />
            </Field>

            <Field label="الاسم العلمي">
              <input
                className="form-input w-full min-w-0"
                value={form.scientificName}
                onChange={change("scientificName")}
                maxLength={2000}
                placeholder="المادة أو الاسم العلمي"
              />
            </Field>

            <Field label="الشركة المصنعة">
              <input
                className="form-input w-full min-w-0"
                value={form.manufacturer}
                onChange={change("manufacturer")}
                maxLength={200}
              />
            </Field>

            <Field label="الشكل الدوائي">
              <input
                className="form-input w-full min-w-0"
                value={form.dosageForm}
                onChange={change("dosageForm")}
                maxLength={100}
                placeholder="أقراص، شراب، حقن..."
              />
            </Field>

            <Field label="حجم العبوة">
              <input
                className="form-input w-full min-w-0"
                value={form.packageSize}
                onChange={change("packageSize")}
                maxLength={100}
                placeholder="مثال: 20 قرصًا"
              />
            </Field>

            <Field label="السعة أو التركيز">
              <input
                className="form-input w-full min-w-0"
                value={form.capacity}
                onChange={change("capacity")}
                maxLength={100}
                placeholder="مثال: 500 mg"
              />
            </Field>
          </div>
        </FormSection>

        {/* البيانات المرجعية */}
        <FormSection
          icon={Banknote}
          title="البيانات المرجعية"
          description="قيم الدليل العامة وليست مخزون صيدلية بعينها"
        >
          <div className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-3">
            <Field label="سعر الشراء المرجعي">
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-input w-full min-w-0"
                value={form.purchasePrice}
                onChange={change("purchasePrice")}
                required
              />
            </Field>

            <Field label="سعر البيع المرجعي">
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-input w-full min-w-0"
                value={form.sellingPrice}
                onChange={change("sellingPrice")}
                required
              />
            </Field>

            <Field label="الكمية المرجعية">
              <input
                type="number"
                min="0"
                className="form-input w-full min-w-0"
                value={form.quantityInStock}
                onChange={change("quantityInStock")}
                required
              />
            </Field>
          </div>

          {/* وصفة طبية */}
          <label className="mt-4 flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5 sm:mt-5 sm:gap-4 sm:p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-amber-700 sm:size-10">
                <ShieldCheck size={18} className="sm:size-[19px]" />
              </span>

              <div className="min-w-0">
                <p className="text-sm font-black text-amber-900">
                  يتطلب وصفة طبية
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-800/60">
                  فعّل الخيار وفق التصنيف الصحيح للدواء
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              className="size-5 shrink-0 accent-amber-600"
              checked={form.requiresPrescription}
              onChange={change("requiresPrescription")}
            />
          </label>
        </FormSection>

        {/* المكونات والوصف */}
        <FormSection
          icon={FileText}
          title="المكونات والوصف"
          description="معلومات إضافية تساعد على التعرف الصحيح على الدواء"
        >
          <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-2">
            <label className="min-w-0">
              <span className="form-label">التركيب</span>

              <textarea
                className="form-textarea min-h-32 w-full min-w-0"
                value={form.composition}
                onChange={change("composition")}
                maxLength={2000}
                placeholder="المكونات أو المواد الفعالة"
              />
            </label>

            <label className="min-w-0">
              <span className="form-label">الوصف</span>

              <textarea
                className="form-textarea min-h-32 w-full min-w-0"
                value={form.description}
                onChange={change("description")}
                maxLength={1000}
                placeholder="وصف مختصر ودقيق للدواء"
              />
            </label>
          </div>
        </FormSection>

        {/* أزرار الحفظ */}
        <div className="sticky bottom-2 z-10 flex min-w-0 flex-col gap-3 rounded-2xl border border-[#174b57]/10 bg-white/95 p-3 shadow-xl backdrop-blur sm:bottom-4 sm:gap-4 sm:p-4 md:flex-row md:items-center md:justify-between">
          <p className="order-2 text-center text-xs leading-5 text-[#71858a] sm:order-1 md:max-w-[520px] md:text-right">
            راجع البيانات قبل الحفظ؛ لا تتوفر عملية تعديل للدواء ضمن العقد
            الحالي.
          </p>

          <div className="order-1 grid w-full grid-cols-2 gap-2 sm:order-2 sm:w-auto sm:flex">
            <Link
              to="/app/medicines"
              className="btn-secondary min-w-0 justify-center whitespace-nowrap"
            >
              إلغاء
            </Link>

            <button
              disabled={mutation.isPending || !form.name.trim()}
              className="btn-primary min-w-0 justify-center whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} className="shrink-0" />

              <span className="truncate">
                {mutation.isPending ? "جاري الإضافة..." : "حفظ الدواء"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| قسم النموذج
|--------------------------------------------------------------------------
*/
function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="surface w-full min-w-0 overflow-hidden">
      <div className="flex min-w-0 items-start gap-3 border-b border-[#174b57]/8 bg-[#f8fbfa] p-3.5 sm:items-center sm:p-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#216474] shadow-sm sm:size-10">
          <Icon size={18} className="sm:size-[19px]" />
        </span>

        <div className="min-w-0">
          <h3 className="truncate font-black">{title}</h3>

          <p className="mt-1 text-xs leading-5 text-[#829499]">
            {description}
          </p>
        </div>
      </div>

      <div className="min-w-0 p-3.5 sm:p-5 lg:p-6">
        {children}
      </div>
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| الحقل
|--------------------------------------------------------------------------
*/
function Field({ label, required, children }) {
  return (
    <label className="block w-full min-w-0">
      <span className="form-label">
        {label}

        {required && <span className="text-rose-500">*</span>}
      </span>

      {children}
    </label>
  );
}

