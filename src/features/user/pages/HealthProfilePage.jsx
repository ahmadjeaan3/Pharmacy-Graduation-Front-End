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
      {/* =====================================================
          HERO
      ====================================================== */}
      <section
        className="
          relative isolate
          -mt-6 overflow-hidden
          bg-[#0D7586]
          text-white
          sm:-mt-7
          lg:-mt-8
        "
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <img
          src={HEALTH_HERO_BACKGROUND}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="
            absolute inset-0 -z-20
            h-full w-full
            select-none object-cover object-center
            opacity-80
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute inset-0 -z-10
            bg-[linear-gradient(90deg,rgba(0,60,73,.18),rgba(3,110,126,.58),rgba(0,63,76,.44))]
          "
        />

        <div
          className="
            mx-auto grid min-h-[240px]
            w-full max-w-[1200px]
            items-center gap-7
            px-5 py-8
            sm:px-7
            lg:grid-cols-[1fr_auto]
            lg:px-8
          "
        >
          <div className="flex min-w-0 items-center gap-4 text-right">
            <span
              className="
                grid size-12 shrink-0
                place-items-center
                rounded-[10px]
                border border-white/15
                bg-white/10
                backdrop-blur-sm
              "
            >
              <HeartPulse size={23} strokeWidth={1.8} />
            </span>

            <div className="min-w-0">
              <span className="text-[11px] font-medium text-white/75">
                معلوماتك الصحية
              </span>

              <h1 className="mt-1.5 text-[27px] font-bold leading-tight sm:text-[30px]">
                الملف الصحي
              </h1>

              <p className="mt-2 max-w-[680px] text-[12px] leading-6 text-white/75">
                نظّم بياناتك الصحية المهمة في مكان واحد لتسهيل الوصول إليها
                أثناء استخدام خدمات دوائي.
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto lg:min-w-[620px]">
            <Link
              to="/app/search"
              className="
                inline-flex h-[72px] w-full
                flex-col items-center justify-center gap-2
                rounded-[9px]
                border border-white/20
                bg-white/10
                px-3
                text-[12px] font-medium text-white
                backdrop-blur-sm
                transition hover:bg-white/20
              "
            >
              <Pill size={17} />
              <span>البحث عن دواء</span>
            </Link>

            <Link
              to="/app/prescriptions"
              className="
                inline-flex h-[72px] w-full
                flex-col items-center justify-center gap-2
                rounded-[9px]
                border border-white/20
                bg-white/10
                px-3
                text-[12px] font-medium text-white
                backdrop-blur-sm
                transition hover:bg-white/20
              "
            >
              <ClipboardCheck size={17} />
              <span>الوصفة الذكية</span>
            </Link>

            <button
              type="button"
              onClick={() => setTab("profile")}
              className={`
                inline-flex h-[72px] w-full
                flex-col items-center justify-center gap-2
                rounded-[9px]
                border px-3
                text-[12px] font-medium
                backdrop-blur-sm
                transition
                ${
                  tab === "profile"
                    ? "border-white/30 bg-white/20 text-white shadow-[0_8px_20px_rgba(0,0,0,.08)]"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }
              `}
            >
              <UserRound size={17} />
              <span>تعديل الملف الصحي</span>
            </button>

            <button
              type="button"
              onClick={() => setTab("card")}
              className={`
                inline-flex h-[72px] w-full
                flex-col items-center justify-center gap-2
                rounded-[9px]
                border px-3
                text-[12px] font-medium
                backdrop-blur-sm
                transition
                ${
                  tab === "card"
                    ? "border-white/30 bg-white/20 text-white shadow-[0_8px_20px_rgba(0,0,0,.08)]"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }
              `}
            >
              <ContactRound size={17} />
              <span>البطاقة الصحية</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <main
        className="
          mx-auto w-full max-w-[1200px]
          px-4 pb-12 pt-10
          sm:px-6
          lg:px-8
          xl:px-0
        "
      >
        {tab === "profile" ? (
          <div className="mb-6 text-right">
            <h2 className="text-[24px] font-medium text-[#333333]">
              إدارة الملف الصحي
            </h2>

            <p className="mt-2 max-w-[650px] text-[12px] leading-6 text-[#A5A5A5]">
              حدّث معلوماتك الصحية الأساسية ومعلومات السلامة وجهة اتصال الطوارئ.
            </p>
          </div>
        ) : null}

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
        <div className="rounded-[10px] border border-[rgba(102,102,102,.14)] bg-white p-6">
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
        <div className="rounded-[10px] border border-[rgba(102,102,102,.14)] bg-white p-6">
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
        className="scroll-mt-24 rounded-[10px] border border-[rgba(102,102,102,.14)] bg-white p-5 sm:p-6"
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
      <div className="mt-5 flex flex-col gap-3 rounded-[14px] border border-[#DDE8EA] bg-white p-3 shadow-[0_8px_22px_rgba(33,100,116,.07)] sm:flex-row sm:items-center sm:justify-between">
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
            className="
              inline-flex h-11 flex-1 items-center justify-center gap-2
              rounded-[8px]
              border border-[#216474]
              bg-white
              px-5
              text-[12px] font-medium text-[#216474]
              transition
              hover:bg-[#F4FAFA]
              disabled:cursor-not-allowed disabled:opacity-45
              sm:flex-none
            "
          >
            <RotateCcw size={16} />
            استعادة
          </button>
          <button
            type="submit"
            disabled={!isDirty || mutation.isPending}
            className="
              inline-flex h-11 flex-1 items-center justify-center gap-2
              rounded-[8px]
              border border-[#216474]
              bg-[#216474]
              px-6
              text-[12px] font-medium text-white
              shadow-[0_8px_18px_rgba(33,100,116,.12)]
              transition
              hover:bg-[#174B57]
              disabled:cursor-not-allowed disabled:opacity-50
              sm:flex-none
            "
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
      <div className="rounded-[10px] border border-[rgba(102,102,102,.14)] bg-white p-5 sm:p-6">
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

      <div className="rounded-[10px] border border-[rgba(102,102,102,.14)] bg-white p-5">
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
  const allergies = Array.isArray(card.allergies) ? card.allergies : [];
  const chronicConditions = Array.isArray(card.chronicConditions)
    ? card.chronicConditions
    : [];
  const currentMedications = Array.isArray(card.currentMedications)
    ? card.currentMedications
    : [];

  return (
    <div className="mx-auto w-full max-w-[1040px]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="text-right">
          <span className="text-[11px] font-medium text-[#216474]">
            بطاقتك الصحية
          </span>
          <h2 className="mt-1 text-[22px] font-semibold text-[#333333]">
            تقرير المعلومات الصحية
          </h2>
          <p className="mt-1.5 text-[12px] leading-6 text-[#A5A5A5]">
            عرض منظم لأهم المعلومات الصحية المسجلة في حسابك.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="
            no-print inline-flex h-10 items-center justify-center gap-2
            rounded-[7px] bg-[#216474] px-4
            text-[12px] font-medium text-white
            transition hover:bg-[#174B57]
          "
        >
          <Printer size={15} />
          طباعة التقرير الصحي
        </button>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }

          html,
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body * {
            visibility: hidden !important;
          }

          #health-report,
          #health-report * {
            visibility: visible !important;
          }

          #health-report {
            position: absolute !important;
            top: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 auto !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          #health-report .health-report-letterhead {
            display: flex !important;
            flex-direction: row !important;
            direction: rtl !important;
            align-items: flex-start !important;
            justify-content: space-between !important;
            padding: 0 5mm 3.5mm !important;
            margin: 0 !important;
            border-bottom: 1.5px solid #0D7586 !important;
          }

          #health-report .health-report-letterhead img {
            order: 0 !important;
            width: auto !important;
            height: 12mm !important;
            max-width: 30mm !important;
            object-fit: contain !important;
            background: transparent !important;
            box-shadow: none !important;
          }

          #health-report .health-report-letterhead > div {
            order: 1 !important;
            text-align: left !important;
          }

          #health-report .health-report-dark {
            margin: 4mm 7mm 0 !important;
            padding: 4.5mm !important;
            min-height: 31mm !important;
            border-radius: 3mm !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          #health-report .health-report-body {
            padding: 4mm 7mm 0 !important;
          }

          #health-report .health-report-body > div,
          #health-report article {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          #health-report h2,
          #health-report h3,
          #health-report h4,
          #health-report p,
          #health-report span,
          #health-report strong,
          #health-report li {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #health-report .health-report-body {
            font-size: 92% !important;
          }

          /* في الطباعة نخفي أيقونة عنوان القسم فقط.
             أيقونات البطاقة الداكنة وكروت البيانات والمعلومات الطبية تبقى ظاهرة. */
          #health-report .report-heading-icon {
            display: none !important;
          }

          #health-report .report-heading {
            gap: 0 !important;
            padding-right: 0 !important;
            margin-right: 0 !important;
          }

          #health-report .report-heading > div {
            margin: 0 !important;
            padding: 0 !important;
            text-align: right !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <section
        id="health-report"
        className="
          health-report overflow-hidden
          rounded-[10px]
          border border-[#DDE7E9]
          bg-white
          shadow-[0_16px_42px_rgba(33,100,116,.07)]
        "
      >
        {/* رأس التقرير للطباعة - نفس تصميم الصورة */}
        <div
          dir="rtl"
          className="
            health-report-letterhead
            flex items-start justify-between
            gap-6 border-b-2 border-[#0D7586]
            px-8 py-6
          "
        >
          <img
            src={DAWAAI_MARK}
            alt="دوائي"
            draggable={false}
            className="
              order-1 h-[52px] w-auto shrink-0
              object-contain
              bg-transparent
              p-0
            "
          />

          <div className="order-2 text-left">
            <strong className="block text-[18px] font-bold text-[#0D5D6B]">
              تقرير المعلومات الصحية
            </strong>
            <span className="mt-1 block text-[11px] text-[#8A9A9E]">
              نسخة مخصصة للطباعة
            </span>
          </div>
        </div>

        {/* البطاقة الصحية الداكنة */}
        <div
          className="
            health-report-dark
            relative isolate
            mx-8 mt-6 overflow-hidden
            rounded-[9px]
            sm:mx-10
            bg-[#0D7586]
            px-6 py-5
            text-white
          "
        >
          <img
            src={HEALTH_HERO_BACKGROUND}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="
              absolute inset-0 -z-20
              h-full w-full
              object-cover object-center
              opacity-55
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute inset-0 -z-10
              bg-[linear-gradient(90deg,rgba(0,58,70,.28),rgba(3,110,126,.65),rgba(0,63,76,.46))]
            "
          />

          <div className="flex items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="
                  grid size-12 shrink-0 place-items-center
                  rounded-[8px]
                  border border-white/15
                  bg-white/10
                "
              >
                <UserRound size={23} strokeWidth={1.7} />
              </span>

              <div className="min-w-0 text-right">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-white/70">
                    البطاقة الصحية الرقمية
                  </span>

                  <span
                    className="
                      inline-flex items-center gap-1
                      rounded-full
                      bg-[#EAF8EF]
                      px-2.5 py-1
                      text-[9.5px] font-medium
                      text-[#2A8B57]
                    "
                  >
                    <ShieldCheck size={11} />
                    بيانات صحية
                  </span>
                </div>

                <h3 className="mt-2 text-[24px] font-bold leading-none">
                  {card.fullName}
                </h3>

                <p className="mt-2 text-[10.5px] text-white/70">
                  ملخص موحّد للمعلومات الصحية المهمة
                </p>
              </div>
            </div>

            <div
              className="
                flex min-w-[128px] items-center gap-3
                rounded-[8px]
                border border-white/15
                bg-white/10
                px-4 py-3
              "
            >
              <span className="grid size-8 place-items-center rounded-[7px] bg-white/10">
                <Droplets size={17} />
              </span>

              <div className="text-right">
                <span className="block text-[9.5px] text-white/65">
                  فصيلة الدم
                </span>
                <strong dir="ltr" className="mt-1 block text-[17px] font-semibold">
                  {card.bloodType || "—"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="health-report-body px-8 pb-7 pt-5 sm:px-10">
          {/* البيانات الأساسية */}
          <ReportHeading
            icon={UserRound}
            title="البيانات الأساسية"
            subtitle="المعلومات التعريفية المرتبطة بحسابك"
          />

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <ReportInfoCard
              icon={Droplets}
              label="فصيلة الدم"
              value={card.bloodType || "غير محددة"}
              ltr
            />
            <ReportInfoCard
              icon={Phone}
              label="رقم الهاتف"
              value={card.phoneNumber || "غير مضاف"}
              ltr
            />
            <ReportInfoCard
              icon={CalendarDays}
              label="تاريخ الميلاد"
              value={formatDate(card.dateOfBirth)}
            />
          </div>

          <div className="my-6 h-px bg-[#E7EEF0]" />

          {/* الملخص الطبي */}
          <ReportHeading
            icon={HeartPulse}
            title="الملخص الطبي"
            subtitle="المعلومات التي يجب الانتباه إليها"
          />

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <ReportMedicalCard
              title="الحساسيات"
              values={allergies}
              empty="لا توجد حساسيات مسجلة"
              variant="danger"
            />

            <ReportMedicalCard
              title="الحالات المزمنة"
              values={chronicConditions}
              empty="لا توجد حالات مزمنة مسجلة"
              variant="warning"
            />

            <ReportMedicalCard
              title="الأدوية الحالية"
              values={currentMedications}
              empty="لا توجد أدوية حالية مسجلة"
              variant="primary"
            />
          </div>

          {/* الطوارئ */}
          <div className="mt-6">
            <ReportHeading
              icon={Phone}
              title="جهة اتصال للطوارئ"
              subtitle="للتواصل السريع عند الحاجة"
            />

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ReportEmergencyCard
                icon={UserRound}
                label="الاسم"
                value={card.emergencyContactName || "غير مضاف"}
              />

              <ReportEmergencyCard
                icon={Phone}
                label="الهاتف"
                value={card.emergencyContactPhoneNumber || "غير مضاف"}
                ltr
              />
            </div>

            {card.emergencyNotes ? (
              <div
                className="
                  mt-3 flex items-start gap-3
                  rounded-[8px]
                  border border-[#E2EAEC]
                  bg-[#FBFCFC]
                  px-4 py-3
                "
              >
                <ClipboardCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-[#216474]"
                />

                <div className="text-right">
                  <span className="block text-[10px] text-[#A5A5A5]">
                    ملاحظات مهمة
                  </span>
                  <p className="mt-1 text-[11.5px] leading-5 text-[#60777C]">
                    {card.emergencyNotes}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* أسفل التقرير */}
          <div
            className="
              mt-6 flex flex-col gap-4
              border-t border-[#E7EEF0]
              pt-4
              sm:flex-row sm:items-center sm:justify-between
            "
          >
            <div className="flex flex-wrap items-center gap-6 text-[10.5px] text-[#8A9A9E]">
              <span>
                آخر تحديث: {formatDate(card.lastUpdatedAtUtc, true)}
              </span>
              <span className="print-only">
                تاريخ إصدار التقرير: {new Date().toLocaleDateString("ar")}
              </span>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="
                no-print inline-flex h-9 items-center justify-center gap-2
                rounded-[7px]
                bg-[#0D7586]
                px-4
                text-[11px] font-medium text-white
                transition hover:bg-[#0A6574]
              "
            >
              <Printer size={14} />
              طباعة التقرير الصحي
            </button>
          </div>

          <p className="print-only mt-3 text-[9.5px] leading-5 text-[#8A9A9E]">
            هذا التقرير يعكس المعلومات التي أدخلها المستخدم في منصة دوائي، ولا
            يُعد تشخيصًا أو وصفة طبية.
          </p>
        </div>
      </section>
    </div>
  );
}

function ReportHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="report-heading flex items-center gap-3 text-right">
      <span
        className="
          report-heading-icon
          grid size-9 shrink-0 place-items-center
          rounded-[7px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={16} strokeWidth={1.8} />
      </span>

      <div>
        <h3 className="text-[14px] font-semibold text-[#0D5D6B]">
          {title}
        </h3>
        <p className="mt-0.5 text-[10px] text-[#A5A5A5]">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function ReportInfoCard({
  icon: Icon,
  label,
  value,
  ltr = false,
}) {
  return (
    <div
      className="
        flex min-h-[72px] items-center gap-3
        rounded-[8px]
        border border-[#E2EAEC]
        bg-[#FBFCFC]
        px-4 py-3
      "
    >
      <span
        className="
          grid size-8 shrink-0 place-items-center
          rounded-[7px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={15} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 text-right">
        <span className="block text-[9.5px] text-[#A5A5A5]">
          {label}
        </span>
        <strong
          dir={ltr ? "ltr" : undefined}
          className="mt-1 block truncate text-[12px] font-semibold text-[#333333]"
        >
          {value || "غير محدد"}
        </strong>
      </div>
    </div>
  );
}

function ReportMedicalCard({
  title,
  values,
  empty,
  variant = "primary",
}) {
  const safeValues = Array.isArray(values) ? values : [];

  const variants = {
    danger: {
      box: "border-[#F2DADA] bg-[#FFF7F7]",
      title: "text-[#D95454]",
      iconBg: "bg-[#E85B5B]",
      Icon: AlertTriangle,
    },
    warning: {
      box: "border-[#F4E4C7] bg-[#FFF9EF]",
      title: "text-[#D79A24]",
      iconBg: "bg-[#F2BE55]",
      Icon: HeartPulse,
    },
    primary: {
      box: "border-[#D8E9EA] bg-[#F4FAFA]",
      title: "text-[#0D7586]",
      iconBg: "bg-[#1698A5]",
      Icon: Pill,
    },
  };

  const style = variants[variant] || variants.primary;
  const Icon = style.Icon;

  return (
    <article
      className={`
        min-h-[132px]
        rounded-[8px]
        border p-4
        ${style.box}
      `}
    >
      <div className="flex items-center gap-2">
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-full text-white ${style.iconBg}`}
        >
          <Icon size={15} strokeWidth={1.8} />
        </span>

        <h4 className={`text-[12px] font-semibold ${style.title}`}>
          {title}
        </h4>
      </div>

      {safeValues.length ? (
        <ul className="mt-3 space-y-1.5 pr-1">
          {safeValues.map((value) => (
            <li
              key={value}
              className="
                flex items-start gap-2
                text-[10.5px] leading-5
                text-[#333333]
              "
            >
              <span className="mt-2 size-1 shrink-0 rounded-full bg-[#60777C]" />
              <span>{value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[10.5px] leading-5 text-[#A5A5A5]">
          {empty}
        </p>
      )}
    </article>
  );
}

function ReportEmergencyCard({
  icon: Icon,
  label,
  value,
  ltr = false,
}) {
  return (
    <div
      className="
        flex items-center gap-3
        rounded-[8px]
        border border-[#E2EAEC]
        bg-[#FBFCFC]
        px-4 py-3
      "
    >
      <span
        className="
          grid size-8 shrink-0 place-items-center
          rounded-[7px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={15} />
      </span>

      <div className="min-w-0 text-right">
        <span className="block text-[9.5px] text-[#A5A5A5]">
          {label}
        </span>
        <strong
          dir={ltr ? "ltr" : undefined}
          className="mt-1 block text-[12px] font-semibold text-[#333333]"
        >
          {value}
        </strong>
      </div>
    </div>
  );
}