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
      await queryClient.invalidateQueries({ queryKey: medicineKeys.root });
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
    <div>
      <Link to="/app/medicines" className="btn-quiet mb-5">
        <ArrowRight size={17} />
        العودة إلى دليل الأدوية
      </Link>
      <MedicinePageHeader
        title="إضافة دواء جديد"
        description="سجّل المعلومات المرجعية بدقة؛ سيصبح الدواء متاحًا للصيدليات عند إضافة أصناف مخزونها."
      />
      {error && (
        <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}
      <form onSubmit={submit} className="space-y-6">
        <FormSection
          icon={Pill}
          title="هوية الدواء"
          description="الأسماء والمعلومات التي تميز الدواء داخل الدليل"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="الاسم التجاري" required icon={Pill}>
              <input
                className="form-input"
                value={form.name}
                onChange={change("name")}
                maxLength={500}
                required
                placeholder="مثال: باراسيتامول"
              />
            </Field>
            <Field label="الاسم العلمي" icon={Beaker}>
              <input
                className="form-input"
                value={form.scientificName}
                onChange={change("scientificName")}
                maxLength={2000}
                placeholder="المادة أو الاسم العلمي"
              />
            </Field>
            <Field label="الشركة المصنعة" icon={Building2}>
              <input
                className="form-input"
                value={form.manufacturer}
                onChange={change("manufacturer")}
                maxLength={200}
              />
            </Field>
            <Field label="الشكل الدوائي" icon={Tag}>
              <input
                className="form-input"
                value={form.dosageForm}
                onChange={change("dosageForm")}
                maxLength={100}
                placeholder="أقراص، شراب، حقن..."
              />
            </Field>
            <Field label="حجم العبوة" icon={Package}>
              <input
                className="form-input"
                value={form.packageSize}
                onChange={change("packageSize")}
                maxLength={100}
                placeholder="مثال: 20 قرصًا"
              />
            </Field>
            <Field label="السعة أو التركيز" icon={Beaker}>
              <input
                className="form-input"
                value={form.capacity}
                onChange={change("capacity")}
                maxLength={100}
                placeholder="مثال: 500 mg"
              />
            </Field>
          </div>
        </FormSection>
        <FormSection
          icon={Banknote}
          title="البيانات المرجعية"
          description="قيم الدليل العامة وليست مخزون صيدلية بعينها"
        >
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="سعر الشراء المرجعي">
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-input"
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
                className="form-input"
                value={form.sellingPrice}
                onChange={change("sellingPrice")}
                required
              />
            </Field>
            <Field label="الكمية المرجعية">
              <input
                type="number"
                min="0"
                className="form-input"
                value={form.quantityInStock}
                onChange={change("quantityInStock")}
                required
              />
            </Field>
          </div>
          <label className="mt-5 flex cursor-pointer items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
            <div className="flex gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white text-amber-700">
                <ShieldCheck size={19} />
              </span>
              <div>
                <p className="text-sm font-black text-amber-900">
                  يتطلب وصفة طبية
                </p>
                <p className="mt-1 text-xs text-amber-800/60">
                  فعّل الخيار وفق التصنيف الصحيح للدواء
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className="size-5 accent-amber-600"
              checked={form.requiresPrescription}
              onChange={change("requiresPrescription")}
            />
          </label>
        </FormSection>
        <FormSection
          icon={FileText}
          title="المكونات والوصف"
          description="معلومات إضافية تساعد على التعرف الصحيح على الدواء"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <label>
              <span className="form-label">التركيب</span>
              <textarea
                className="form-textarea min-h-32"
                value={form.composition}
                onChange={change("composition")}
                maxLength={2000}
                placeholder="المكونات أو المواد الفعالة"
              />
            </label>
            <label>
              <span className="form-label">الوصف</span>
              <textarea
                className="form-textarea min-h-32"
                value={form.description}
                onChange={change("description")}
                maxLength={1000}
                placeholder="وصف مختصر ودقيق للدواء"
              />
            </label>
          </div>
        </FormSection>
        <div className="sticky bottom-4 flex flex-col justify-between gap-3 rounded-2xl border border-[#174b57]/10 bg-white/92 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center">
          <p className="text-xs text-[#71858a]">
            راجع البيانات قبل الحفظ؛ لا تتوفر عملية تعديل للدواء ضمن العقد
            الحالي.
          </p>
          <div className="flex gap-2">
            <Link to="/app/medicines" className="btn-secondary">
              إلغاء
            </Link>
            <button
              disabled={mutation.isPending || !form.name.trim()}
              className="btn-primary"
            >
              <Save size={17} />
              {mutation.isPending ? "جاري الإضافة..." : "حفظ الدواء"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="surface overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[#174b57]/8 bg-[#f8fbfa] p-5">
        <span className="grid size-10 place-items-center rounded-xl bg-white text-[#216474] shadow-sm">
          <Icon size={19} />
        </span>
        <div>
          <h3 className="font-black">{title}</h3>
          <p className="mt-1 text-xs text-[#829499]">{description}</p>
        </div>
      </div>
      <div className="p-5 lg:p-6">{children}</div>
    </section>
  );
}
function Field({ label, required, children }) {
  return (
    <label>
      <span className="form-label">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}
