import { FilePlus2, PackagePlus, Pill, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const initialForm = {
  name: "",
  arabicName: "",
  barcode: "",
  scientificName: "",
  arabicScientificName: "",
  manufacturer: "",
  dosageForm: "",
  packageSize: "",
  capacity: "",
  composition: "",
  description: "",
  requiresPrescription: false,
  quantity: 1,
  unitPrice: 0,
  isPriceVisibleToUsers: true,
  isAvailable: true,
  expiryDateUtc: "",
  lowStockThreshold: 5,
};

export function ManualInventoryDialog({ pending, onClose, onSave }) {
  const { t, i18n } = useTranslation();
  const language = String(i18n.resolvedLanguage || i18n.language || "ar").split("-")[0];
  const [form, setForm] = useState(initialForm);
  const change = (key) => (event) =>
    setForm((current) => ({
      ...current,
      [key]: event.target.type === "checkbox" ? event.target.checked : event.target.value,
    }));

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div dir={language === "ar" ? "rtl" : "ltr"} className="max-h-[94vh] w-full max-w-5xl overflow-auto rounded-[1.75rem] bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#174b57]/8 bg-white/95 p-5 backdrop-blur sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]"><FilePlus2 size={22} /></span>
            <div>
              <h2 className="text-xl font-black text-[#17363e]">{t("إضافة دواء يدويًا")}</h2>
              <p className="mt-1 text-xs leading-5 text-[#71858a]">{t("استخدمها عندما لا تجد الدواء في الدليل المركزي.")}</p>
            </div>
          </div>
          <button className="icon-button grid" onClick={onClose} aria-label={t("إغلاق")}><X size={19} /></button>
        </header>

        <form
          className="space-y-6 p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            const nullable = (value) => value.trim() || null;
            onSave({
              name: form.name.trim(),
              arabicName: nullable(form.arabicName),
              barcode: nullable(form.barcode),
              scientificName: nullable(form.scientificName),
              arabicScientificName: nullable(form.arabicScientificName),
              manufacturer: nullable(form.manufacturer),
              dosageForm: nullable(form.dosageForm),
              packageSize: nullable(form.packageSize),
              capacity: nullable(form.capacity),
              composition: nullable(form.composition),
              description: nullable(form.description),
              requiresPrescription: form.requiresPrescription,
              quantity: Number(form.quantity),
              unitPrice: Number(form.unitPrice),
              isPriceVisibleToUsers: form.isPriceVisibleToUsers,
              isAvailable: form.isAvailable,
              expiryDateUtc: form.expiryDateUtc ? new Date(`${form.expiryDateUtc}T00:00:00Z`).toISOString() : null,
              lowStockThreshold: Number(form.lowStockThreshold),
            });
          }}
        >
          <FormSection icon={Pill} title={t("هوية الدواء")} description={t("أدخل الاسم الأساسي ثم أضف العربية لتسهيل البحث للمستخدم.")}>
            <Field label={t("الاسم التجاري بالإنجليزية")} required value={form.name} onChange={change("name")} maxLength={500} dir="ltr" />
            <Field label={t("الاسم التجاري بالعربية")} value={form.arabicName} onChange={change("arabicName")} maxLength={500} />
            <Field label={t("الاسم العلمي بالإنجليزية")} value={form.scientificName} onChange={change("scientificName")} maxLength={2000} dir="ltr" />
            <Field label={t("الاسم العلمي بالعربية")} value={form.arabicScientificName} onChange={change("arabicScientificName")} maxLength={2000} />
            <Field label={t("الباركود")} value={form.barcode} onChange={change("barcode")} maxLength={64} pattern="[0-9A-Za-z-]+" dir="ltr" />
            <Field label={t("الشركة المصنعة")} value={form.manufacturer} onChange={change("manufacturer")} maxLength={200} />
          </FormSection>

          <FormSection icon={PackagePlus} title={t("الشكل والتعبئة")} description={t("بيانات تساعد على تمييز العبوة الصحيحة داخل المخزون.")}>
            <Field label={t("الشكل الدوائي")} value={form.dosageForm} onChange={change("dosageForm")} maxLength={100} placeholder={t("أقراص، شراب، حقن...")} />
            <Field label={t("حجم العبوة")} value={form.packageSize} onChange={change("packageSize")} maxLength={100} />
            <Field label={t("السعة أو التركيز")} value={form.capacity} onChange={change("capacity")} maxLength={100} />
            <Toggle label={t("يتطلب وصفة طبية")} checked={form.requiresPrescription} onChange={change("requiresPrescription")} />
          </FormSection>

          <FormSection icon={PackagePlus} title={t("بيانات المخزون")} description={t("حدد الكمية وسعر هذا الدواء داخل صيدليتك.")}>
            <Field type="number" min="0" label={t("الكمية")} required value={form.quantity} onChange={change("quantity")} />
            <Field type="number" min="0" step="0.01" label={t("سعر البيع")} required value={form.unitPrice} onChange={change("unitPrice")} />
            <Field type="number" min="0" max="100000" label={t("حد تنبيه انخفاض المخزون")} required value={form.lowStockThreshold} onChange={change("lowStockThreshold")} />
            <Field type="date" label={t("تاريخ الانتهاء")} value={form.expiryDateUtc} onChange={change("expiryDateUtc")} />
            <Toggle label={t("متاح للطلبات")} checked={form.isAvailable} onChange={change("isAvailable")} />
            <Toggle label={t("إظهار السعر للمستخدمين")} checked={form.isPriceVisibleToUsers} onChange={change("isPriceVisibleToUsers")} />
          </FormSection>

          <div className="grid gap-4 md:grid-cols-2">
            <label><span className="form-label">{t("التركيب")}</span><textarea className="form-input min-h-28 resize-y" maxLength={2000} value={form.composition} onChange={change("composition")} /></label>
            <label><span className="form-label">{t("الوصف")}</span><textarea className="form-input min-h-28 resize-y" maxLength={1000} value={form.description} onChange={change("description")} /></label>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[#174b57]/8 pt-5 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={pending}>{t("إلغاء")}</button>
            <button className="btn-primary" disabled={pending || !form.name.trim()}><PackagePlus size={17} />{pending ? t("جاري الحفظ...") : t("إضافة إلى المخزون")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-[1.35rem] border border-[#e1ebed] bg-[#fafcfc] p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-white text-[#216474] shadow-sm"><Icon size={18} /></span>
        <div><h3 className="text-sm font-black text-[#29464d]">{title}</h3><p className="mt-0.5 text-xs text-[#829499]">{description}</p></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function Field({ label, type = "text", ...props }) {
  return <label><span className="form-label">{label}{props.required ? " *" : ""}</span><input type={type} className="form-input" {...props} /></label>;
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex min-h-[50px] items-center justify-between gap-3 rounded-xl border border-[#dce8ea] bg-white px-4 py-3">
      <span className="text-sm font-bold text-[#29464d]">{label}</span>
      <input type="checkbox" className="size-5 accent-[#216474]" checked={checked} onChange={onChange} />
    </label>
  );
}
