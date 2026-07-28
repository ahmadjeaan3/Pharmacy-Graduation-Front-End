import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  HeartPulse,
  MapPin,
  PackageSearch,
  Search,
  ShieldCheck,
  ToggleLeft,
  X,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  adminKeys,
  getAdminAccount,
  updateAdminAccountStatus,
} from "../api/adminApi";

const roleLabels = { User: "مستخدم", Pharmacy: "صيدلية", Organization: "منظمة", Admin: "إدارة" };

const parseList = (value) => {
  if (!value) return "غير مضاف";
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join("، ") || "غير مضاف" : value;
  } catch {
    return value;
  }
};

export function AdminAccountDetailsPage() {
  const { userId } = useParams();
  const client = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const account = useQuery({
    queryKey: adminKeys.account(userId),
    queryFn: () => getAdminAccount(userId),
  });
  const status = useMutation({
    mutationFn: (isActive) => updateAdminAccountStatus(userId, isActive),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: adminKeys.account(userId) });
      client.invalidateQueries({ queryKey: ["admin", "accounts"] });
      setConfirmOpen(false);
      setFeedback("تم تحديث حالة الحساب بنجاح.");
    },
    onError: () => setFeedback("تعذر تحديث حالة الحساب. حاول مرة أخرى."),
  });
  if (account.isPending)
    return <div className="rounded-2xl bg-white p-10 text-center">جاري تحميل الحساب...</div>;
  if (account.isError)
    return <div className="rounded-2xl bg-rose-50 p-8 text-rose-700">تعذر تحميل الحساب.</div>;
  const item = account.data;
  const isAccountActive = item.isActive === true;
  const isUser = item.role === "User";

  return (
    <div className="space-y-7">
      <Link to="/app/accounts" className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm font-bold text-[#216474] shadow-sm transition hover:-translate-x-1">
        <ArrowRight size={17} /> العودة إلى جميع الحسابات
      </Link>
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(125deg,#123f49,#216474)] p-6 text-white shadow-[0_25px_70px_rgba(23,75,87,.22)] md:p-8">
        <div className="absolute -left-20 -top-24 size-72 rounded-full border-[38px] border-white/[.045]" />
        <div className="absolute -bottom-36 right-[42%] size-72 rounded-full bg-[#8bd0cb]/10 blur-3xl" />
        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-stretch">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
            <span className="grid size-20 shrink-0 place-items-center rounded-[1.4rem] border border-white/10 bg-white/10 text-[#f5cb72] shadow-xl backdrop-blur">
              {item.role === "User" ? (
                <UserRound size={34} />
              ) : (
                <Building2 size={34} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/8 bg-white/[.07] px-3 py-1 text-xs font-bold text-[#9ed7d2]">
                  {roleLabels[item.role]}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    item.isActive
                      ? "bg-emerald-400/15 text-emerald-200"
                      : "bg-rose-400/15 text-rose-200"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      item.isActive ? "bg-emerald-300" : "bg-rose-300"
                    }`}
                  />
                  {item.isActive ? "حساب فعال" : "حساب موقوف"}
                </span>
              </div>
              <h2 className="mt-3 truncate text-3xl font-black sm:text-4xl">
                {item.profileName || item.fullName}
              </h2>
              <p className="mt-2 truncate text-sm text-white/60">
                {item.fullName} <span className="mx-1 text-white/25">•</span>{" "}
                <span dir="ltr">{item.email}</span>
              </p>
              <p className="mt-3 flex items-center gap-2 text-xs text-white/40">
                <CalendarDays size={14} />
                انضم في{" "}
                {new Date(item.createdAtUtc).toLocaleDateString("ar-SY")}
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[1.35rem] border border-white/10 bg-white/[.07] p-4 backdrop-blur-sm">
            <div>
              <p className="text-[10px] font-black tracking-wide text-white/40">
                إدارة حالة الحساب
              </p>
              <strong className="mt-2 flex items-center gap-2 text-sm">
                <ShieldCheck
                  size={16}
                  className={
                    item.isActive ? "text-emerald-300" : "text-rose-300"
                  }
                />
                {item.isActive ? "الحساب متاح للخدمات" : "الوصول إلى المنصة موقوف"}
              </strong>
              <p className="mt-2 text-[11px] leading-5 text-white/40">
                {item.isActive
                  ? "يمكن لصاحب الحساب تسجيل الدخول واستخدام خدمات دوره."
                  : "لن يتمكن صاحب الحساب من تسجيل الدخول حتى إعادة تفعيله."}
              </p>
            </div>
            <button
              disabled={status.isPending}
              onClick={() => {
                setFeedback("");
                setConfirmOpen(true);
              }}
              className={`group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-black shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 ${
                item.isActive
                  ? "border-rose-200/30 bg-white/[.09] text-rose-100 shadow-black/5 hover:border-rose-200/50 hover:bg-rose-300/10"
                  : "border-[#8bd0cb]/25 bg-white/[.09] text-[#bce7e3] shadow-black/5 hover:border-[#8bd0cb]/45 hover:bg-[#8bd0cb]/10"
              }`}
            >
              <ToggleLeft
                size={19}
                className={`transition group-hover:scale-110 ${
                  item.isActive ? "" : "rotate-180"
                }`}
              />
              {item.isActive ? "إيقاف الحساب" : "تفعيل الحساب"}
            </button>
          </div>
        </div>
      </section>

      {feedback && (
        <div className={`rounded-2xl border px-5 py-4 text-sm font-bold ${feedback.startsWith("تم") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
          {feedback}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-[1.45rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_10px_30px_rgba(23,75,87,.04)]">
          <div className="flex items-center gap-3">
            <span className={`grid size-11 place-items-center rounded-xl ${item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              <ShieldCheck size={21} />
            </span>
            <div>
              <h3 className="font-black text-[#29464d]">حالة الوصول إلى المنصة</h3>
              <p className="mt-1 text-xs leading-5 text-[#71858a]">
                {item.isActive
                  ? "الحساب يستطيع تسجيل الدخول واستخدام الخدمات المتاحة لدوره."
                  : "تم منع الحساب من تسجيل الدخول واستخدام خدمات المنصة."}
              </p>
            </div>
          </div>
        </div>
        <div
          data-account-status={isAccountActive ? "active" : "inactive"}
          className={`flex items-center justify-between rounded-[1.45rem] border p-5 shadow-[0_10px_30px_rgba(23,75,87,.04)] ${
            isAccountActive
              ? "border-emerald-200 bg-emerald-50/45"
              : "border-rose-200 bg-rose-50/45"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500">الحالة الحالية</span>
            <strong
              className={`mt-1 block text-lg font-black ${
                isAccountActive ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {isAccountActive ? "نشط ومتاح" : "موقوف"}
            </strong>
          </div>
          <span
            className={`relative flex size-3.5 rounded-full ring-4 ${
              isAccountActive
                ? "bg-emerald-500 ring-emerald-100"
                : "bg-rose-500 ring-rose-100"
            }`}
          >
            {isAccountActive && (
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-25" />
            )}
          </span>
        </div>
      </section>

      <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <Stat icon={Activity} label="طلبات الأدوية" value={item.medicineRequestsCount} tone="cyan" />
        <Stat icon={Bell} label="الإشعارات" value={item.notificationsCount} tone="violet" />
        {item.role === "Pharmacy" && <Stat icon={PackageSearch} label="عناصر المخزون" value={item.inventoryItemsCount} tone="amber" />}
        {item.role === "Organization" && <Stat icon={Building2} label="الحملات" value={item.campaignsCount} tone="amber" />}
        {isUser && <Stat icon={Search} label="عمليات البحث" value={item.searchHistoryCount} tone="green" />}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card icon={UserRound} title="بيانات الحساب" subtitle="معلومات الهوية والتواصل">
          <Info label="الاسم الكامل" value={item.fullName} />
          <Info label="البريد الإلكتروني" value={item.email} />
          <Info label="رقم الهاتف" value={item.phoneNumber} />
          <Info label="نوع الحساب" value={roleLabels[item.role]} />
          <Info label="الحالة" value={item.isActive ? "فعال" : "موقوف"} />
        </Card>
        <Card icon={MapPin} title="بيانات الملف والموقع" subtitle="تفاصيل الجهة والاعتماد">
          <Info label="اسم الجهة" value={item.profileName} />
          <Info label="المدينة" value={item.city} />
          <Info label="المنطقة" value={item.area} />
          <Info label="العنوان" value={item.address} />
          <Info label="رقم الترخيص/التسجيل" value={item.licenseOrRegistrationNumber} />
          <Info label="حالة الاعتماد" value={item.isApproved == null ? null : item.isApproved ? "معتمد" : "غير معتمد"} />
          <Info label="الوصف" value={item.description} />
        </Card>
      </section>

      {isUser && (
        <Card icon={HeartPulse} title="الملف الصحي" subtitle="المعلومات الطبية المسجلة">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="زمرة الدم" value={item.bloodType} />
            <Info label="الحساسيات" value={parseList(item.allergies)} />
            <Info label="الأمراض المزمنة" value={parseList(item.chronicConditions)} />
            <Info label="الأدوية الحالية" value={parseList(item.currentMedications)} />
            <Info label="جهة اتصال الطوارئ" value={item.emergencyContactName} />
            <Info label="هاتف الطوارئ" value={item.emergencyContactPhoneNumber} />
          </div>
        </Card>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#071f25]/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-status-title"
            className="w-full max-w-md overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_100px_rgba(7,31,37,.35)]"
          >
            <div className="relative bg-[linear-gradient(135deg,#123f49,#216474)] px-6 py-7 text-white">
              <button
                onClick={() => setConfirmOpen(false)}
                className="absolute left-4 top-4 grid size-9 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
              <span
                className={`grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[.08] ${
                  item.isActive ? "text-rose-200" : "text-[#9ed7d2]"
                }`}
              >
                <ShieldCheck size={24} />
              </span>
              <h3 id="account-status-title" className="mt-4 text-2xl font-black">
                {item.isActive ? "تأكيد إيقاف الحساب" : "تأكيد تفعيل الحساب"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                {item.profileName || item.fullName}
              </p>
            </div>
            <div className="p-6">
              <p className="leading-7 text-[#5f7479]">
                {item.isActive
                  ? "لن يتمكن صاحب الحساب من تسجيل الدخول أو استخدام خدمات المنصة حتى تعيد تفعيله."
                  : "سيتمكن صاحب الحساب مجددًا من تسجيل الدخول واستخدام الخدمات المتاحة لنوع حسابه."}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  disabled={status.isPending}
                  className="rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => status.mutate(!item.isActive)}
                  disabled={status.isPending}
                  className={`rounded-xl border px-4 py-3 font-black transition disabled:opacity-60 ${
                    item.isActive
                      ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {status.isPending
                    ? "جاري الحفظ..."
                    : item.isActive
                      ? "نعم، أوقف الحساب"
                      : "نعم، فعّل الحساب"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ icon: Icon, title, subtitle, children }) {
  return (
    <section className="overflow-hidden rounded-[1.55rem] border border-[#174b57]/8 bg-white shadow-[0_12px_35px_rgba(23,75,87,.045)]">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-[#fbfdfc] px-6 py-5">
        <span className="grid size-11 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
          <Icon size={20} />
        </span>
        <div>
          <h3 className="font-black text-[#29464d]">{title}</h3>
          <p className="mt-0.5 text-xs text-[#8a9a9e]">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-0 divide-y divide-slate-100 px-6">{children}</div>
    </section>
  );
}
function Info({ label, value }) {
  return <div className="flex items-start justify-between gap-5 py-3.5"><span className="shrink-0 text-xs font-semibold text-[#8a9a9e]">{label}</span><strong className="text-end text-sm text-[#29464d]">{value || "غير مضاف"}</strong></div>;
}
function Stat({ icon: Icon, label, value, tone }) {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
  };
  return <div className="rounded-[1.35rem] border border-[#174b57]/8 bg-white p-4 shadow-[0_10px_30px_rgba(23,75,87,.04)] sm:p-5"><span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={18} /></span><strong className="mt-4 block text-2xl font-black text-[#17363e]">{Number(value || 0).toLocaleString("ar-SY")}</strong><span className="mt-1 block text-xs font-semibold text-[#71858a]">{label}</span></div>;
}
