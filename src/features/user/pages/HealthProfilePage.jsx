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
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import { DAWAAI_MARK } from "../../../shared/components/Brand";
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

const HEALTH_HERO_BACKGROUND = "/assets/app/home/hero_search.png";

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

  if (profileQuery.isPending || medicalQuery.isPending) {
    return <UserLoadingState label="جاري تحميل ملفك الصحي..." />;
  }

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
    <div dir="rtl" className="m-0 w-full bg-[#F7F9FA] p-0 text-[#333333]">
      {/* =========================
          HERO
      ========================== */}
      <section
        className="relative isolate -mt-6 overflow-hidden border-b border-[#DDE8EA] bg-white sm:-mt-7 lg:-mt-8"
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(139,208,203,.18),transparent_28rem),radial-gradient(circle_at_85%_0%,rgba(33,100,116,.10),transparent_24rem)]"
        />

        <div className="mx-auto grid min-h-[250px] w-full max-w-[1240px] items-center gap-8 px-5 py-10 sm:px-7 lg:grid-cols-[1fr_auto] lg:px-8">
          <div className="flex min-w-0 items-center gap-4 text-right">
            <span className="grid size-14 shrink-0 place-items-center rounded-[14px] border border-[#CFE0E3] bg-[#EEF7F7] text-[#216474] shadow-[0_8px_20px_rgba(33,100,116,.06)]">
              <HeartPulse size={26} strokeWidth={1.8} />
            </span>

            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#216474]">
                معلوماتك الصحية
              </span>

              <h1 className="mt-1.5 text-[30px] font-bold leading-tight text-[#29464D] sm:text-[34px]">
                الملف الصحي
              </h1>

              <p className="mt-3 max-w-[650px] text-[13px] leading-7 text-[#71858A]">
                نظّم بياناتك الصحية المهمة في مكان واحد لتسهيل الوصول إليها
                أثناء استخدام خدمات دوائي.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link
              to="/app/search"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#216474] px-4 text-[12px] font-semibold text-white shadow-[0_8px_18px_rgba(33,100,116,.15)] transition hover:-translate-y-0.5 hover:bg-[#1B5967]"
            >
              <Pill size={15} />
              البحث عن دواء
            </Link>

            <Link
              to="/app/prescriptions"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] border border-[#CFE0E3] bg-white px-4 text-[12px] font-semibold text-[#216474] transition hover:bg-[#EEF7F7]"
            >
              <ClipboardCheck size={15} />
              الوصفة الذكية
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
          CONTENT
      ========================== */}
      <main className="mx-auto w-full max-w-[1240px] px-5 pb-12 pt-10 sm:px-7 lg:px-8 lg:pt-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-right">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-[2px] w-8 rounded-full bg-[#216474]" />
              <span className="text-[11px] font-bold text-[#216474]">
                بياناتك الشخصية
              </span>
            </div>

            <h2 className="text-[24px] font-bold text-[#29464D]">
              إدارة الملف الصحي
            </h2>

            <p className="mt-1.5 max-w-[620px] text-[12px] leading-6 text-[#8A9A9E]">
              حدّث معلوماتك الصحية أو استعرض البطاقة الصحية المخصصة لك.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-7 inline-flex w-full rounded-[12px] border border-[#DDE7E9] bg-white p-1.5 shadow-[0_4px_14px_rgba(23,75,87,.025)] sm:w-auto">
          <button
            type="button"
            onClick={() => setTab("profile")}
            className={`inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-[9px] px-5 text-[12px] font-semibold transition sm:flex-none ${
              tab === "profile"
                ? "bg-[#216474] text-white shadow-[0_6px_14px_rgba(33,100,116,.12)]"
                : "text-[#60777C] hover:bg-[#EEF7F7] hover:text-[#216474]"
            }`}
          >
            <UserRound size={16} />
            تعديل الملف الصحي
          </button>

          <button
            type="button"
            onClick={() => setTab("card")}
            className={`inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-[9px] px-5 text-[12px] font-semibold transition sm:flex-none ${
              tab === "card"
                ? "bg-[#216474] text-white shadow-[0_6px_14px_rgba(33,100,116,.12)]"
                : "text-[#60777C] hover:bg-[#EEF7F7] hover:text-[#216474]"
            }`}
          >
            <ContactRound size={16} />
            البطاقة الصحية
          </button>
        </div>

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
      </main>
    </div>
  );
}

function MedicalProfileForm({ profile, medical }) {
  const queryClient = useQueryClient();
  const createForm = (data) => ({
    ...emptyForm,
    ...data,
    allergies: Array.isArray(data?.allergies) ? data.allergies : [],
    chronicConditions: Array.isArray(data?.chronicConditions)
      ? data.chronicConditions
      : [],
    currentMedications: Array.isArray(data?.currentMedications)
      ? data.currentMedications
      : [],
    dateOfBirth: data.dateOfBirth || "",
    emergencyContactName: data.emergencyContactName || "",
    emergencyContactPhoneNumber: data.emergencyContactPhoneNumber || "",
    emergencyNotes: data.emergencyNotes || "",
  });
  const [form, setForm] = useState(() => createForm(medical));
  const [savedForm, setSavedForm] = useState(() => createForm(medical));
  const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);
  const validationError = useMemo(() => {
    const contactName = form.emergencyContactName.trim();
    const contactPhone = form.emergencyContactPhoneNumber.trim();
    if ((contactName && !contactPhone) || (!contactName && contactPhone))
      return "أدخل اسم جهة اتصال الطوارئ ورقم هاتفها معًا، أو اترك الحقلين فارغين.";
    if (contactPhone && !/^\+?[0-9\s()-]{7,30}$/.test(contactPhone))
      return "رقم هاتف الطوارئ غير صالح. استخدم أرقامًا ورمز الدولة عند الحاجة.";
    return "";
  }, [form.emergencyContactName, form.emergencyContactPhoneNumber]);
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
  const missingFields = useMemo(
    () =>
      [
        ["date-of-birth", "تاريخ الميلاد", !form.dateOfBirth],
        ["blood-type", "فصيلة الدم", !form.bloodType],
        ["allergies", "الحساسيات أو تأكيد عدم وجودها", !form.allergies.length],
        [
          "chronic-conditions",
          "الحالات المزمنة أو تأكيد عدم وجودها",
          !form.chronicConditions.length,
        ],
        [
          "current-medications",
          "الأدوية الحالية أو تأكيد عدم استخدامها",
          !form.currentMedications.length,
        ],
        [
          "emergency-contact",
          "جهة اتصال الطوارئ",
          !form.emergencyContactName || !form.emergencyContactPhoneNumber,
        ],
      ].filter(([, , missing]) => missing),
    [form],
  );
  useEffect(() => {
    const warnBeforeLeaving = (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isDirty]);
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
    if (validationError) return;
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
      <ProfileInsights
        form={form}
        completion={completion}
        missingFields={missingFields}
      />
      <section className="grid gap-5 xl:grid-cols-[minmax(300px,.78fr)_minmax(0,1.22fr)]">
        <div className="rounded-[14px] border border-[#E2E8EA] bg-white p-6 shadow-[0_5px_18px_rgba(23,75,87,.03)]">
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
          <label id="date-of-birth" className="mt-6 block scroll-mt-24">
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
          <label id="blood-type" className="mt-4 block scroll-mt-24">
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
        <div className="rounded-[14px] border border-[#E2E8EA] bg-white p-6 shadow-[0_5px_18px_rgba(23,75,87,.03)]">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
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
              id="allergies"
              label="الحساسيات"
              placeholder="مثال: حساسية البنسلين"
              values={form.allergies}
              limit={20}
              suggestions={["البنسلين", "الأسبرين", "السلفا", "اللاتكس"]}
              onChange={(values) => setForm({ ...form, allergies: values })}
            />
            <TagsField
              id="chronic-conditions"
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
              id="current-medications"
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
      <section
        id="emergency-contact"
        className="scroll-mt-24 rounded-[14px] border border-[#E2E8EA] bg-white p-5 shadow-[0_5px_18px_rgba(23,75,87,.03)] sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-[#60777C]">
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
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#f3f8f7] p-4 text-xs leading-6 text-[#60777c]">
          <ShieldCheck className="mt-0.5 shrink-0 text-[#216474]" size={18} />
          بياناتك الصحية خاصة بحسابك، وتُستخدم لتجهيز بطاقتك الصحية وتحسين
          التنبيهات والخدمات التي تطلبها داخل المنصة.
        </div>
      </section>
      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-[14px] border border-[#DDE8EA] bg-white/96 p-3 shadow-[0_12px_30px_rgba(33,100,116,.10)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="min-h-6">
          {isDirty && !mutation.isPending && (
            <p className="flex items-center gap-2 text-sm font-bold text-[#60777C]">
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
          {validationError && (
            <p className="flex items-start gap-2 text-sm font-semibold text-rose-600">
              <AlertTriangle className="mt-0.5 shrink-0" size={17} />
              {validationError}
            </p>
          )}
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            disabled={
              !isDirty || mutation.isPending || Boolean(validationError)
            }
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

function ProfileInsights({ form, completion, missingFields }) {
  const hasSafetyData =
    form.allergies.length > 0 ||
    form.chronicConditions.length > 0 ||
    form.currentMedications.length > 0;

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,.85fr)]">
      <div className="rounded-[16px] border border-[#DDE8EA] bg-white p-5 shadow-[0_8px_24px_rgba(33,100,116,.04)] sm:p-6">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 text-right">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-[9px] bg-[#EEF7F7] text-[#216474]">
                <ClipboardCheck size={17} />
              </span>

              <span className="text-[12px] font-bold text-[#216474]">
                جاهزية الملف الصحي
              </span>
            </div>

            <h3 className="mt-4 text-[20px] font-bold text-[#29464D]">
              ملفك مكتمل بنسبة <b dir="ltr">{completion}%</b>
            </h3>

            <p className="mt-2 max-w-xl text-[12px] leading-6 text-[#71858A]">
              كل معلومة تضيفها تساعد على جعل بياناتك الصحية أوضح عند الحاجة.
            </p>
          </div>

          <div
            dir="ltr"
            className="grid size-16 shrink-0 place-items-center rounded-full border-[6px] border-[#CFE4E7] bg-[#F7FBFB] text-sm font-bold text-[#216474]"
          >
            {completion}%
          </div>
        </div>

        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-[#EEF2F3]"
          role="progressbar"
          aria-label="نسبة اكتمال الملف الصحي"
          aria-valuenow={completion}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="h-full rounded-full bg-[#216474] transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>

        {missingFields.length > 0 && (
          <div className="mt-5 border-t border-[#EEF2F3] pt-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold text-[#60777C]">
              <Sparkles size={14} className="text-[#216474]" />
              أكمل المعلومات التالية لملف أوضح:
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {missingFields.slice(0, 4).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(id)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                  className="rounded-full border border-[#DCE8EA] bg-[#F8FBFB] px-3 py-1.5 text-[11px] font-semibold text-[#60777C] transition hover:border-[#216474]/25 hover:bg-[#EEF7F7] hover:text-[#216474]"
                >
                  + {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[16px] border border-[#DDE8EA] bg-[#F8FBFB] p-5 shadow-[0_8px_24px_rgba(33,100,116,.03)]">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-[10px] bg-white text-[#216474] shadow-[0_4px_12px_rgba(33,100,116,.05)]">
            {hasSafetyData ? (
              <Activity size={21} />
            ) : (
              <AlertTriangle size={21} />
            )}
          </span>

          <div className="text-right">
            <h3 className="font-bold text-[#29464D]">ملخص السلامة</h3>
            <p className="text-[11px] text-[#71858A]">
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
            <div
              key={label}
              className="rounded-[10px] border border-[#E5EDEF] bg-white px-2 py-3"
            >
              <strong className="block text-xl font-bold text-[#216474]">
                {count}
              </strong>
              <span className="text-[10px] text-[#8A9A9E]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TagsField({
  id,
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
    <div id={id} className="scroll-mt-24">
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
                className="rounded-full border border-[#DDE8EA] bg-white px-2.5 py-1 text-[11px] font-bold text-[#60777c] transition hover:border-[#216474]/30 hover:bg-[#eaf4f3] hover:text-[#216474]"
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
        className="health-report overflow-hidden rounded-[18px] border border-[#DDE8EA] bg-white shadow-[0_24px_70px_rgba(23,75,87,.12)]"
      >
        <div className="print-only health-report-letterhead">
          <div className="health-report-brand">
            <span className="health-report-logo">
              <img src={DAWAAI_MARK} alt="" draggable={false} />
            </span>
            <span>
              <strong>دوائي</strong>
              <small>DAWAAI</small>
            </span>
          </div>
          <div className="health-report-document-title">
            <strong>تقرير المعلومات الصحية</strong>
            <span>نسخة مخصصة للطباعة</span>
          </div>
        </div>
        <div className="relative isolate border-b border-[#DDE8EA] bg-[#F8FBFB] p-6 text-[#29464D] sm:p-8">
          <div className="noise absolute inset-0 -z-10" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#216474]">
                البطاقة الصحية الرقمية
              </p>
              <h2 className="mt-2 text-3xl font-black">{card.fullName}</h2>
              <p className="mt-2 text-sm text-[#71858A]">
                ملخص موحّد للمعلومات الصحية المهمة
              </p>
            </div>
            <span className="grid size-14 place-items-center rounded-[14px] border border-white/15 bg-white/10 text-white">
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
                value={formatDate(card.dateOfBirth)}
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

          <div className="health-report-section mt-7 rounded-2xl border border-[#DCE8EA] bg-[#FAFCFC] p-5">
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
            هذا التقرير يعكس المعلومات التي أدخلها المستخدم في منصة دوائي، ولا
            يُعد تشخيصًا أو وصفة طبية.
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
  const safeValues = Array.isArray(values) ? values : [];
  const tones = {
    danger: "border-rose-100 bg-rose-50/60",
    warning: "border-amber-100 bg-amber-50/60",
    primary: "border-[#174b57]/8 bg-[#f8fbfa]",
  };
  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <h3 className="font-extrabold text-[#29464d]">{title}</h3>
      {safeValues.length ? (
        <ul className="mt-3 space-y-2">
          {safeValues.map((value) => (
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