import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  ContactRound,
  Droplets,
  HeartPulse,
  Phone,
  Plus,
  Printer,
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
            <UserRound size={17} className="ml-2 inline" />
            تعديل الملف الصحي
          </button>
          <button
            type="button"
            onClick={() => setTab("card")}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${tab === "card" ? "bg-[#174b57] text-white shadow" : "text-[#60777c] hover:bg-[#f3f7f6]"}`}
          >
            <ContactRound size={17} className="ml-2 inline" />
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
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    ...medical,
    dateOfBirth: medical.dateOfBirth || "",
    emergencyContactName: medical.emergencyContactName || "",
    emergencyContactPhoneNumber: medical.emergencyContactPhoneNumber || "",
    emergencyNotes: medical.emergencyNotes || "",
  }));
  const mutation = useMutation({
    mutationFn: updateMedicalProfile,
    onSuccess: (data) => {
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
              onChange={(values) => setForm({ ...form, allergies: values })}
            />
            <TagsField
              label="الحالات المزمنة"
              placeholder="مثال: السكري"
              values={form.chronicConditions}
              limit={20}
              onChange={(values) =>
                setForm({ ...form, chronicConditions: values })
              }
            />
            <TagsField
              label="الأدوية المستخدمة حالياً"
              placeholder="اكتب اسم الدواء"
              values={form.currentMedications}
              limit={30}
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
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-end">
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
        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary justify-center px-7"
        >
          <Save size={17} />
          {mutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </form>
  );
}

function TagsField({ label, placeholder, values, limit, onChange }) {
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
    </div>
  );
}

function HealthCard({ card }) {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="overflow-hidden rounded-[2rem] border border-[#174b57]/10 bg-white shadow-[0_24px_70px_rgba(23,75,87,.12)]">
        <div className="relative isolate bg-[#174b57] p-6 text-white sm:p-8">
          <div className="noise absolute inset-0 -z-10" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#8bd0cb]">بطاقتي الصحية</p>
              <h2 className="mt-2 text-3xl font-black">{card.fullName}</h2>
              <p className="mt-2 text-sm text-white/55">
                معلومات صحية مختصرة ومهمة
              </p>
            </div>
            <span className="grid size-14 place-items-center rounded-2xl bg-[#f5cb72] text-[#173d46]">
              <ShieldCheck size={27} />
            </span>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
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
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            <CardList
              title="الحساسيات"
              values={card.allergies}
              empty="لا توجد حساسيات مسجلة"
            />
            <CardList
              title="الحالات المزمنة"
              values={card.chronicConditions}
              empty="لا توجد حالات مسجلة"
            />
            <CardList
              title="الأدوية الحالية"
              values={card.currentMedications}
              empty="لا توجد أدوية مسجلة"
            />
          </div>
          <div className="mt-7 rounded-2xl bg-[#f8fbfa] p-5">
            <h3 className="font-extrabold text-[#29464d]">جهة اتصال للطوارئ</h3>
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#60777c]">
              <span>{card.emergencyContactName || "غير مضافة"}</span>
              {card.emergencyContactPhoneNumber && (
                <a
                  href={`tel:${card.emergencyContactPhoneNumber}`}
                  className="font-bold text-[#216474]"
                  dir="ltr"
                >
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
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 text-xs text-[#8a9a9e] sm:flex-row sm:items-center sm:justify-between">
            <span>آخر تحديث: {formatDate(card.lastUpdatedAtUtc, true)}</span>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-secondary"
            >
              <Printer size={16} />
              طباعة البطاقة
            </button>
          </div>
        </div>
      </section>
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
function CardList({ title, values, empty }) {
  return (
    <div>
      <h3 className="font-extrabold text-[#29464d]">{title}</h3>
      {values.length ? (
        <ul className="mt-3 space-y-2">
          {values.map((value) => (
            <li
              key={value}
              className="rounded-xl bg-[#f8fbfa] px-3 py-2 text-sm text-[#60777c]"
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
