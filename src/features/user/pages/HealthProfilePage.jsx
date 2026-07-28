import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ContactRound,
  Droplets,
  HeartPulse,
  Pill,
  Phone,
  Plus,
  Printer,
  RotateCcw,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  getHealthCard,
  getMedicalProfile,
  getUserProfile,
  updateMedicalProfile,
  userKeys,
} from "../api/userApi";
import {
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { PageHeader as UserPageHeader } from "../../../shared/components/PageHeader";
import { formatDate } from "../utils/userFormatters";
import { getApiErrorMessage } from "../../../shared/api/errors";

const emptyForm = {
  dateOfBirth: "",
  bloodType: "",
  allergies: [],
  chronicConditions: [],
  currentMedications: [],
  emergencyContactName: "",
  emergencyContactPhoneNumber: "",
  emergencyNotes: "",
};
const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function HealthProfilePage() {
  const [tab, setTab] = useState("profile");
  const profileQuery = useQuery({
    queryKey: userKeys.profile,
    queryFn: getUserProfile,
  });
  const medicalQuery = useQuery({
    queryKey: userKeys.medicalProfile,
    queryFn: getMedicalProfile,
  });
  const cardQuery = useQuery({
    queryKey: userKeys.healthCard,
    queryFn: getHealthCard,
    enabled: tab === "card",
  });
  if (profileQuery.isPending || medicalQuery.isPending)
    return <UserLoadingState label="جاري تحميل ملفك الصحي..." />;
  if (profileQuery.isError || medicalQuery.isError) {
    const failed = profileQuery.error || medicalQuery.error;
    return (
      <UserErrorState
        message={getApiErrorMessage(failed)}
        onRetry={() => {
          profileQuery.refetch();
          medicalQuery.refetch();
        }}
      />
    );
  }
  return (
    <div className="space-y-6">
      <UserPageHeader
        eyebrow="معلوماتك المهمة"
        title="الملف الصحي"
        description="احتفظ بالمعلومات التي قد تساعدك في طلب الدواء والتواصل عند الحاجة."
        icon={HeartPulse}
      />
      <section className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${tab === "profile" ? "bg-[#174b57] text-white shadow" : "text-[#60777c] hover:bg-[#f3f7f6]"}`}
          >
            <UserRound size={17} className="me-2 inline" />
            تعديل الملف الصحي
          </button>
          <button
            type="button"
            onClick={() => setTab("card")}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${tab === "card" ? "bg-[#174b57] text-white shadow" : "text-[#60777c] hover:bg-[#f3f7f6]"}`}
          >
            <ContactRound size={17} className="me-2 inline" />
            البطاقة الصحية
          </button>
        </div>
      </section>
      {tab === "profile" ? (
        <MedicalProfileForm
          profile={profileQuery.data}
          medical={medicalQuery.data}
        />
      ) : cardQuery.isPending ? (
        <UserLoadingState label="جاري تجهيز بطاقتك الصحية..." />
      ) : cardQuery.isError ? (
        <UserErrorState
          message={getApiErrorMessage(cardQuery.error)}
          onRetry={cardQuery.refetch}
        />
      ) : (
        <HealthCard card={cardQuery.data} />
      )}
    </div>
  );
}

function MedicalProfileForm({ profile, medical }) {
  const queryClient = useQueryClient();
  const createForm = (data) => ({
    ...emptyForm,
    ...data,
    dateOfBirth: data.dateOfBirth || "",
    emergencyContactName: data.emergencyContactName || "",
    emergencyContactPhoneNumber: data.emergencyContactPhoneNumber || "",
    emergencyNotes: data.emergencyNotes || "",
  });
  const [form, setForm] = useState(() => createForm(medical));
  const [savedForm, setSavedForm] = useState(() => createForm(medical));
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  const completedFields = [
    form.dateOfBirth,
    form.bloodType,
    form.allergies.length,
    form.chronicConditions.length,
    form.currentMedications.length,
    form.emergencyContactName,
    form.emergencyContactPhoneNumber,
  ].filter(Boolean).length;
  const completion = Math.round((completedFields / 7) * 100);
  const mutation = useMutation({
    mutationFn: updateMedicalProfile,
    onSuccess: (data) => {
      const nextForm = createForm(data);
      setForm(nextForm);
      setSavedForm(nextForm);
      queryClient.setQueryData(userKeys.medicalProfile, data);
      queryClient.invalidateQueries({ queryKey: userKeys.healthCard });
      queryClient.invalidateQueries({ queryKey: userKeys.profile });
    },
  });
  const submit = (event) => {
    event.preventDefault();
    mutation.mutate({
      ...form,
      dateOfBirth: form.dateOfBirth || null,
      bloodType: form.bloodType || null,
      emergencyContactName: form.emergencyContactName.trim() || null,
      emergencyContactPhoneNumber:
        form.emergencyContactPhoneNumber.trim() || null,
      emergencyNotes: form.emergencyNotes.trim() || null,
    });
  };
  return (
    <form onSubmit={submit} className="space-y-5">
      <ProfileInsights form={form} completion={completion} />
      <section className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
              <UserRound size={20} />
            </span>
            <div>
              <h3 className="font-extrabold text-[#29464d]">
                البيانات الأساسية
              </h3>
              <p className="text-xs text-[#71858a]">
                مرتبطة بحساب {profile.fullName}
              </p>
            </div>
          </div>
          <label className="mt-6 block">
            <span className="form-label">تاريخ الميلاد</span>
            <input
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={form.dateOfBirth}
              onChange={(event) =>
                setForm({ ...form, dateOfBirth: event.target.value })
              }
              className="form-input"
            />
          </label>
          <label className="mt-4 block">
            <span className="form-label">فصيلة الدم</span>
            <select
              value={form.bloodType || ""}
              onChange={(event) =>
                setForm({ ...form, bloodType: event.target.value })
              }
              className="form-input"
            >
              <option value="">غير محددة</option>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-5 rounded-2xl bg-[#f8fbfa] p-4 text-sm">
            <span className="block text-xs text-[#8a9a9e]">
              البريد الإلكتروني
            </span>
            <strong className="mt-1 block truncate text-[#29464d]" dir="ltr">
              {profile.email}
            </strong>
            <span className="mt-3 block text-xs text-[#8a9a9e]">
              رقم الهاتف
            </span>
            <strong className="mt-1 block text-[#29464d]" dir="ltr">
              {profile.phoneNumber || "غير مضاف"}
            </strong>
          </div>
        </div>
        <div className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600">
              <HeartPulse size={20} />
            </span>
            <div>
              <h3 className="font-extrabold text-[#29464d]">
                المعلومات الصحية
              </h3>
              <p className="text-xs text-[#71858a]">
                أضف المعلومات المعروفة لديك فقط
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-5">
            <TagsField
              label="الحساسيات"
              placeholder="مثال: حساسية البنسلين"
              values={form.allergies}
              limit={20}
              suggestions={["البنسلين", "الأسبرين", "السلفا", "اللاتكس"]}
              onChange={(values) => setForm({ ...form, allergies: values })}
            />
            <TagsField
              label="الحالات المزمنة"
              placeholder="مثال: السكري"
              values={form.chronicConditions}
              limit={20}
              suggestions={["السكري", "ارتفاع الضغط", "الربو", "أمراض القلب"]}
              onChange={(values) =>
                setForm({ ...form, chronicConditions: values })
              }
            />
            <TagsField
              label="الأدوية المستخدمة حالياً"
              placeholder="اكتب اسم الدواء"
              values={form.currentMedications}
              limit={30}
              suggestions={["Metformin", "Aspirin", "Amlodipine"]}
              onChange={(values) =>
                setForm({ ...form, currentMedications: values })
              }
            />
          </div>
        </div>
      </section>
      <section className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-700">
            <Phone size={20} />
          </span>
          <div>
            <h3 className="font-extrabold text-[#29464d]">جهة اتصال للطوارئ</h3>
            <p className="text-xs text-[#71858a]">
              شخص يمكن التواصل معه عند الحاجة
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label>
            <span className="form-label">الاسم</span>
            <input
              maxLength={150}
              value={form.emergencyContactName}
              onChange={(event) =>
                setForm({ ...form, emergencyContactName: event.target.value })
              }
              className="form-input"
              placeholder="اسم جهة الاتصال"
            />
          </label>
          <label>
            <span className="form-label">رقم الهاتف</span>
            <input
              maxLength={30}
              inputMode="tel"
              dir="ltr"
              value={form.emergencyContactPhoneNumber}
              onChange={(event) =>
                setForm({
                  ...form,
                  emergencyContactPhoneNumber: event.target.value,
                })
              }
              className="form-input"
              placeholder="+963 ..."
            />
          </label>
        </div>
        <label className="mt-5 block">
          <span className="form-label">ملاحظات مهمة (اختياري)</span>
          <textarea
            rows={4}
            maxLength={1000}
            value={form.emergencyNotes}
            onChange={(event) =>
              setForm({ ...form, emergencyNotes: event.target.value })
            }
            className="form-textarea"
            placeholder="أي معلومات مهمة تريد إظهارها في البطاقة الصحية"
          />
        </label>
      </section>
      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border border-[#174b57]/10 bg-white/95 p-3 shadow-[0_16px_45px_rgba(23,75,87,.14)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-6">
          {isDirty && !mutation.isPending && (
            <p className="flex items-center gap-2 text-sm font-bold text-amber-700">
              <AlertTriangle size={17} />
              لديك تغييرات غير محفوظة
            </p>
          )}
          {mutation.isSuccess && (
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-600">
              <CheckCircle2 size={17} />
              تم حفظ ملفك الصحي
            </p>
          )}
          {mutation.isError && (
            <p className="text-sm font-semibold text-rose-600">
              {getApiErrorMessage(mutation.error)}
            </p>
          )}
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            disabled={!isDirty || mutation.isPending}
            onClick={() => setForm(savedForm)}
            className="btn-secondary flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-45 sm:flex-none"
          >
            <RotateCcw size={16} />
            استعادة
          </button>
          <button
            type="submit"
            disabled={!isDirty || mutation.isPending}
            className="btn-primary flex-1 justify-center px-7 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            <Save size={17} />
            {mutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ProfileInsights({ form, completion }) {
  const hasSafetyData =
    form.allergies.length > 0 ||
    form.chronicConditions.length > 0 ||
    form.currentMedications.length > 0;
  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <div className="overflow-hidden rounded-[1.5rem] bg-[#174b57] p-6 text-white shadow-[0_18px_45px_rgba(23,75,87,.16)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#8bd0cb]">
              <ClipboardCheck size={18} />
              جاهزية الملف الصحي
            </p>
            <h3 className="mt-2 text-2xl font-black">
              ملفك مكتمل بنسبة {completion}%
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
              كل معلومة تضيفها تساعد على إبراز التحذيرات المهمة وتسهّل التصرف
              عند الحاجة.
            </p>
          </div>
          <span className="grid size-16 shrink-0 place-items-center rounded-full border-[6px] border-[#f5cb72] text-sm font-black text-[#f5cb72]">
            {completion}%
          </span>
        </div>
        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-label="نسبة اكتمال الملف الصحي"
          aria-valuenow={completion}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="h-full rounded-full bg-[#f5cb72] transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>
      <div
        className={`rounded-[1.5rem] border p-5 ${
          hasSafetyData
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`grid size-11 place-items-center rounded-xl bg-white ${
              hasSafetyData ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {hasSafetyData ? (
              <Activity size={21} />
            ) : (
              <AlertTriangle size={21} />
            )}
          </span>
          <div>
            <h3 className="font-extrabold text-[#29464d]">ملخص السلامة</h3>
            <p className="text-xs text-[#60777c]">
              {hasSafetyData
                ? "لديك معلومات صحية مسجلة"
                : "لم تسجل معلومات صحية بعد"}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            ["حساسية", form.allergies.length],
            ["حالة مزمنة", form.chronicConditions.length],
            ["دواء حالي", form.currentMedications.length],
          ].map(([label, count]) => (
            <div key={label} className="rounded-xl bg-white/75 px-2 py-3">
              <strong className="block text-xl text-[#174b57]">{count}</strong>
              <span className="text-[11px] text-[#71858a]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TagsField({
  label,
  placeholder,
  values,
  limit,
  suggestions = [],
  onChange,
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const value = input.trim();
    if (
      !value ||
      values.length >= limit ||
      values.some((item) => item.toLowerCase() === value.toLowerCase())
    )
      return;
    onChange([...values, value]);
    setInput("");
  };
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="form-label">{label}</span>
        <span className="text-[11px] text-slate-400">
          {values.length}/{limit}
        </span>
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          maxLength={150}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          className="form-input"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={add}
          className="icon-button grid shrink-0"
          aria-label={`إضافة إلى ${label}`}
        >
          <Plus size={18} />
        </button>
      </div>
      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-2 rounded-full bg-[#eaf4f3] px-3 py-1.5 text-xs font-bold text-[#36555c]"
            >
              {value}
              <button
                type="button"
                onClick={() =>
                  onChange(values.filter((item) => item !== value))
                }
                aria-label={`حذف ${value}`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      {suggestions.some(
        (suggestion) =>
          !values.some(
            (value) => value.toLowerCase() === suggestion.toLowerCase(),
          ),
      ) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Pill size={12} />
            اقتراحات:
          </span>
          {suggestions
            .filter(
              (suggestion) =>
                !values.some(
                  (value) => value.toLowerCase() === suggestion.toLowerCase(),
                ),
            )
            .map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  values.length < limit && onChange([...values, suggestion])
                }
                className="rounded-full border border-[#174b57]/10 bg-white px-2.5 py-1 text-[11px] font-bold text-[#60777c] transition hover:border-[#216474]/30 hover:bg-[#eaf4f3] hover:text-[#216474]"
              >
                + {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function HealthCard({ card }) {
  return (
    <div className="mx-auto max-w-4xl">
      <section
        id="health-report"
        className="health-report overflow-hidden rounded-[2rem] border border-[#174b57]/10 bg-white shadow-[0_24px_70px_rgba(23,75,87,.12)]"
      >
        <div className="print-only health-report-letterhead">
          <div className="health-report-brand">
            <span className="health-report-logo">
              <HeartPulse size={28} strokeWidth={2.2} />
            </span>
            <span>
              <strong>حياة دوائية</strong>
              <small>MEDICAL LIFE</small>
            </span>
          </div>
          <div className="health-report-document-title">
            <strong>تقرير المعلومات الصحية</strong>
            <span>نسخة مخصصة للطباعة</span>
          </div>
        </div>
        <div className="relative isolate bg-[#174b57] p-6 text-white sm:p-8">
          <div className="noise absolute inset-0 -z-10" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#8bd0cb]">
                البطاقة الصحية الرقمية
              </p>
              <h2 className="mt-2 text-3xl font-black">{card.fullName}</h2>
              <p className="mt-2 text-sm text-white/55">
                ملخص موحّد للمعلومات الصحية المهمة
              </p>
            </div>
            <span className="grid size-14 place-items-center rounded-2xl bg-[#f5cb72] text-[#173d46]">
              <ShieldCheck size={27} />
            </span>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="health-report-section">
            <ReportSectionTitle
              icon={UserRound}
              title="البيانات الأساسية"
              subtitle="بيانات تعريفية مرتبطة بالحساب"
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <CardInfo
                icon={Droplets}
                label="فصيلة الدم"
                value={card.bloodType || "غير محددة"}
                accent
              />
              <CardInfo
                icon={CalendarDays}
                label="تاريخ الميلاد"
                value={card.dateOfBirth || "غير محدد"}
              />
              <CardInfo
                icon={Phone}
                label="رقم الهاتف"
                value={card.phoneNumber || "غير مضاف"}
              />
            </div>
          </div>

          <div className="health-report-section mt-7">
            <ReportSectionTitle
              icon={Activity}
              title="الملخص الطبي"
              subtitle="المعلومات التي يجب الانتباه إليها"
            />
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              <CardList
                title="الحساسيات"
                values={card.allergies}
                empty="لا توجد حساسيات مسجلة"
                tone="danger"
              />
              <CardList
                title="الحالات المزمنة"
                values={card.chronicConditions}
                empty="لا توجد حالات مسجلة"
                tone="warning"
              />
              <CardList
                title="الأدوية الحالية"
                values={card.currentMedications}
                empty="لا توجد أدوية مسجلة"
                tone="primary"
              />
            </div>
          </div>

          <div className="health-report-section mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <ReportSectionTitle
              icon={Phone}
              title="جهة اتصال للطوارئ"
              subtitle="للتواصل السريع عند الحاجة"
            />
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#60777c]">
              <span>
                <b className="text-[#29464d]">الاسم: </b>
                {card.emergencyContactName || "غير مضاف"}
              </span>
              {card.emergencyContactPhoneNumber && (
                <a
                  href={`tel:${card.emergencyContactPhoneNumber}`}
                  className="font-bold text-[#216474]"
                  dir="ltr"
                >
                  <b className="text-[#29464d]">الهاتف: </b>
                  {card.emergencyContactPhoneNumber}
                </a>
              )}
            </div>
            {card.emergencyNotes && (
              <p className="mt-3 border-t border-slate-200 pt-3 text-sm leading-6 text-[#60777c]">
                {card.emergencyNotes}
              </p>
            )}
          </div>

          <div className="health-report-footer mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 text-xs text-[#8a9a9e] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <span>آخر تحديث: {formatDate(card.lastUpdatedAtUtc, true)}</span>
              <span className="print-only">
                تاريخ إصدار التقرير: {new Date().toLocaleDateString("ar")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print btn-secondary"
            >
              <Printer size={16} />
              طباعة التقرير الصحي
            </button>
          </div>
          <p className="print-only health-report-disclaimer">
            هذا التقرير يعكس المعلومات التي أدخلها المستخدم في منصة حياة دوائية،
            ولا يُعد تشخيصًا أو وصفة طبية.
          </p>
        </div>
      </section>
    </div>
  );
}

function ReportSectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
        <Icon size={19} />
      </span>
      <div>
        <h3 className="font-extrabold text-[#29464d]">{title}</h3>
        <p className="text-xs text-[#71858a]">{subtitle}</p>
      </div>
    </div>
  );
}

function CardInfo({ icon: Icon, label, value, accent }) {
  return (
    <div
      className={`rounded-2xl p-4 ${accent ? "bg-rose-50" : "bg-[#f8fbfa]"}`}
    >
      <Icon size={19} className={accent ? "text-rose-600" : "text-[#216474]"} />
      <span className="mt-3 block text-xs text-[#8a9a9e]">{label}</span>
      <strong className="mt-1 block text-[#29464d]">{value}</strong>
    </div>
  );
}
function CardList({ title, values, empty, tone = "primary" }) {
  const tones = {
    danger: "border-rose-100 bg-rose-50/60",
    warning: "border-amber-100 bg-amber-50/60",
    primary: "border-[#174b57]/8 bg-[#f8fbfa]",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <h3 className="font-extrabold text-[#29464d]">{title}</h3>
      {values.length ? (
        <ul className="mt-3 space-y-2">
          {values.map((value) => (
            <li
              key={value}
              className="rounded-xl bg-white/80 px-3 py-2 text-sm text-[#60777c]"
            >
              {value}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-400">{empty}</p>
      )}
    </div>
  );
}
