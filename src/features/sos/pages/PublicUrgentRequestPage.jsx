import { useMutation } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LocateFixed,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Brand } from "../../../shared/components/Brand";
import { LanguageSwitcher } from "../../../shared/components/LanguageSwitcher";
import { getLanguageDirection } from "../../../shared/i18n/i18n";
import { createGuestSosAlert, trackGuestSosAlert } from "../api/sosApi";
import { isValidPersonName, isValidSyrianPhoneNumber } from "../../../shared/utils/validation";

const STORAGE_KEY = "dawaai-guest-urgent-request";
const initialForm = {
  fullName: "",
  phoneNumber: "",
  medicineName: "",
  area: "",
  message: "",
  latitude: null,
  longitude: null,
  accuracyMeters: null,
  shareContactAndLocation: false,
  website: "",
};

const statusStyles = {
  New: ["تم استلام الطلب", "bg-amber-50 text-amber-800 border-amber-200"],
  InProgress: ["تتم متابعة الطلب", "bg-sky-50 text-sky-800 border-sky-200"],
  Resolved: ["تمت معالجة الطلب", "bg-emerald-50 text-emerald-800 border-emerald-200"],
  Cancelled: ["تم إلغاء الطلب", "bg-slate-100 text-slate-700 border-slate-200"],
};

function apiError(error, fallback) {
  return error?.response?.data?.error || error?.response?.data?.detail || fallback;
}

function readStoredTrackingToken() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
      ?.trackingToken || "";
  } catch {
    return "";
  }
}

function Field({ label, required, children }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#24464e]">
      <span>
        {label} {required ? <b className="text-[#cf183f]">*</b> : null}
      </span>
      {children}
    </label>
  );
}

export function PublicUrgentRequestPage() {
  const { t, i18n } = useTranslation();
  const direction = getLanguageDirection(i18n.resolvedLanguage || "ar");
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(initialForm);
  const [locationState, setLocationState] = useState("idle");
  const [result, setResult] = useState(null);
  const [trackingToken, setTrackingToken] = useState(readStoredTrackingToken);
  const [trackedRequest, setTrackedRequest] = useState(null);
  const [copied, setCopied] = useState(false);
  const [clientError, setClientError] = useState("");

  const createMutation = useMutation({
    mutationFn: createGuestSosAlert,
    onSuccess: (data) => {
      setResult(data);
      setTrackingToken(data.trackingToken);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });
  const trackMutation = useMutation({
    mutationFn: trackGuestSosAlert,
    onSuccess: setTrackedRequest,
  });

  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState("unsupported");
      return;
    }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: coords.accuracy,
        }));
        setLocationState("ready");
      },
      () => setLocationState("denied"),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  const submit = (event) => {
    event.preventDefault();
    setClientError("");
    if (!isValidPersonName(form.fullName)) {
      setClientError(t("أدخل اسماً صحيحاً من دون أرقام أو رموز غير مناسبة."));
      return;
    }
    if (!isValidSyrianPhoneNumber(form.phoneNumber)) {
      setClientError(t("رقم الهاتف غير صالح. استخدم رقماً سورياً مثل 09xxxxxxxx أو +9639xxxxxxxx."));
      return;
    }
    createMutation.mutate(form);
  };

  const statusCard = trackedRequest || (result && {
    publicReferenceCode: result.referenceCode,
    status: result.status,
    medicineName: form.medicineName,
    guestArea: form.area,
  });
  const [statusLabel, statusClass] = statusStyles[statusCard?.status] || statusStyles.New;

  return (
    <main dir={direction} className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dff2f2_0,transparent_33%),#f5f8f8] text-[#173f49]">
      <header className="border-b border-[#d8e4e5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[82px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" aria-label={t("العودة إلى الرئيسية")}><Brand /></Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/login" className="hidden rounded-xl border border-[#bfd2d5] px-4 py-2 text-sm font-bold hover:bg-[#eef6f6] sm:inline-flex">
              {t("لديك حساب؟ تسجيل الدخول")}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e9f5f5] px-4 py-2 text-sm font-bold text-[#176071]">
            <Clock3 className="h-4 w-4" /> {t("لا يحتاج إلى تسجيل أو إنشاء حساب")}
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-[#123f49] sm:text-4xl">
            {t("اطلب دواءً عاجلاً من الصيدليات القريبة")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#657b80] sm:text-base">
            {t("اكتب بيانات الطلب، وسنرسله للصيدليات المعتمدة. عند توفر الدواء ستتواصل معك إحدى الصيدليات مباشرة.")}
          </p>
        </div>

        <div className="mx-auto mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <p><b>{t("تنبيه مهم:")}</b> {t("هذه الخدمة للبحث العاجل عن دواء وليست للإسعاف. عند وجود خطر صحي مباشر اتصل بالإسعاف فوراً.")}</p>
        </div>

        <div className="mx-auto mt-6 flex max-w-md rounded-xl border border-[#d4e1e3] bg-white p-1 shadow-sm">
          {[["create", "إرسال طلب جديد"], ["track", "متابعة طلب سابق"]].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setMode(value)} className={`flex-1 rounded-lg px-4 py-3 text-sm font-bold transition ${mode === value ? "bg-[#175766] text-white shadow-sm" : "text-[#587178] hover:bg-[#eef6f6]"}`}>
              {t(label)}
            </button>
          ))}
        </div>

        {mode === "track" || statusCard ? (
          <section className="mx-auto mt-6 max-w-3xl rounded-2xl border border-[#d8e5e6] bg-white p-5 shadow-[0_14px_45px_rgba(23,75,87,.08)] sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e8f5f5] text-[#176478]"><Search className="h-5 w-5" /></div>
              <div><h2 className="text-xl font-black">{t("متابعة الطلب")}</h2><p className="text-sm text-[#72878c]">{t("أدخل رمز المتابعة السري الذي حصلت عليه بعد الإرسال")}</p></div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input value={trackingToken} onChange={(event) => setTrackingToken(event.target.value.trim())} className="min-w-0 flex-1 rounded-xl border border-[#cbdadd] px-4 py-3 outline-none focus:border-[#217083] focus:ring-4 focus:ring-[#217083]/10" placeholder={t("رمز المتابعة")} dir="ltr" />
              <button type="button" disabled={!trackingToken || trackMutation.isPending} onClick={() => trackMutation.mutate(trackingToken)} className="rounded-xl bg-[#175766] px-6 py-3 font-bold text-white disabled:opacity-50">
                {trackMutation.isPending ? t("جاري التحقق...") : t("عرض الحالة")}
              </button>
            </div>
            {trackMutation.isError ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{apiError(trackMutation.error, t("تعذر العثور على الطلب"))}</p> : null}
            {statusCard ? (
              <div className="mt-5 grid gap-4 rounded-2xl border border-[#dbe7e8] bg-[#f8fbfb] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-xs font-bold text-[#829499]">{t("رقم الطلب")}</p>
                  <p className="mt-1 font-black" dir="ltr">{statusCard.publicReferenceCode}</p>
                  <p className="mt-3 font-bold">{statusCard.medicineName}</p>
                  <p className="mt-1 text-sm text-[#6c8186]">{statusCard.guestArea}</p>
                  {statusCard.handledByName ? <p className="mt-2 text-sm">{t("الجهة المتابعة")}: {statusCard.handledByName}</p> : null}
                  {statusCard.resolutionNote ? <p className="mt-2 text-sm">{statusCard.resolutionNote}</p> : null}
                  {result ? (
                    <div className="mt-4 rounded-xl border border-[#cfe0e2] bg-white p-3">
                      <p className="text-xs font-bold text-[#6d8388]">{t("احتفظ برمز المتابعة السري")}</p>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <code dir="ltr" className="min-w-0 flex-1 break-all rounded-lg bg-[#edf5f5] px-3 py-2 text-xs">{trackingToken}</code>
                        <button type="button" onClick={async () => { await navigator.clipboard?.writeText(trackingToken); setCopied(true); }} className="rounded-lg border border-[#b9cfd2] px-3 py-2 text-xs font-black text-[#175766]">
                          {copied ? t("تم النسخ") : t("نسخ الرمز")}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-[#6d8388]">{result.recipientCount > 0 ? t("تم إرسال الطلب إلى {{count}} صيدلية معتمدة.", { count: result.recipientCount }) : t("تم تسجيل الطلب لدى الجهة المشرفة وسيتم توجيهه عند توفر صيدلية مناسبة.")}</p>
                    </div>
                  ) : null}
                </div>
                <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-black ${statusClass}`}><CheckCircle2 className="h-4 w-4" />{t(statusLabel)}</span>
              </div>
            ) : null}
          </section>
        ) : null}

        {mode === "create" && !result ? (
          <form onSubmit={submit} className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl border border-[#d8e5e6] bg-white shadow-[0_14px_45px_rgba(23,75,87,.08)]">
            <div className="grid grid-cols-3 border-b border-[#e0e9ea] bg-[#f7fafa] text-center text-xs font-bold text-[#698086] sm:text-sm">
              {[["1", "بيانات الدواء"], ["2", "التواصل والموقع"], ["3", "إرسال ومتابعة"]].map(([number, label]) => (
                <div key={number} className="flex items-center justify-center gap-2 border-e border-[#e0e9ea] px-2 py-4 last:border-0">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#dcecee] text-[#175766]">{number}</span>
                  <span className="hidden sm:inline">{t(label)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-8 p-5 sm:p-8">
              <section>
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f4f5] font-black text-[#176071]">1</span>
                  <div><h2 className="font-black text-[#183f49]">{t("ما الدواء الذي تحتاجه؟")}</h2><p className="text-xs text-[#788d92]">{t("اكتب الاسم والعيار إن كنت تعرفه")}</p></div>
                </div>
                <div className="grid gap-5 sm:grid-cols-[1fr_1.2fr]">
                  <Field label={t("اسم الدواء أو المادة الفعالة")} required><input required minLength={2} maxLength={200} value={form.medicineName} onChange={update("medicineName")} className="rounded-xl border border-[#cbdadd] px-4 py-3 outline-none focus:border-[#217083] focus:ring-4 focus:ring-[#217083]/10" placeholder={t("مثال: سيتامول 500")} /></Field>
                  <Field label={t("تفاصيل إضافية (اختياري)")}><input maxLength={500} value={form.message} onChange={update("message")} className="rounded-xl border border-[#cbdadd] px-4 py-3 outline-none focus:border-[#217083] focus:ring-4 focus:ring-[#217083]/10" placeholder={t("العيار أو الشكل الدوائي أو عدد العلب")} /></Field>
                </div>
              </section>

              <section className="border-t border-[#e4ecee] pt-7">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f4f5] font-black text-[#176071]">2</span>
                  <div><h2 className="font-black text-[#183f49]">{t("كيف تتواصل الصيدلية معك؟")}</h2><p className="text-xs text-[#788d92]">{t("بياناتك لا تظهر للعامة")}</p></div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t("الاسم")} required><input required minLength={2} maxLength={120} value={form.fullName} onChange={update("fullName")} className="rounded-xl border border-[#cbdadd] px-4 py-3 outline-none focus:border-[#217083] focus:ring-4 focus:ring-[#217083]/10" placeholder={t("اكتب اسمك")} /></Field>
                  <Field label={t("رقم الهاتف")} required><input required inputMode="tel" pattern="(?:09[0-9]{8}|0[1-8][0-9]{7,8}|\+9639[0-9]{8}|\+963[1-8][0-9]{7,8}|009639[0-9]{8}|00963[1-8][0-9]{7,8})" minLength={9} maxLength={20} value={form.phoneNumber} onChange={update("phoneNumber")} className="rounded-xl border border-[#cbdadd] px-4 py-3 outline-none focus:border-[#217083] focus:ring-4 focus:ring-[#217083]/10" placeholder="09xxxxxxxx" dir="ltr" /></Field>
                  <Field label={t("المدينة والمنطقة")} required><input required minLength={2} maxLength={200} value={form.area} onChange={update("area")} className="rounded-xl border border-[#cbdadd] px-4 py-3 outline-none focus:border-[#217083] focus:ring-4 focus:ring-[#217083]/10" placeholder={t("مثال: دمشق، المزة")} /></Field>
                  <button type="button" onClick={requestLocation} disabled={locationState === "loading"} className={`flex min-h-[72px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start transition ${locationState === "ready" ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-[#cbdadd] bg-[#f7fbfb] hover:border-[#70a8b2]"}`}>
                    <span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white"><LocateFixed className="h-5 w-5" /></span><span><b className="block text-sm">{locationState === "ready" ? t("تم تحديد الموقع") : t("استخدام موقعي الحالي")}</b><small>{t("اختياري لتحديد أقرب الصيدليات")}</small></span></span>
                    {locationState === "loading" ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#217083] border-t-transparent" /> : <MapPin className="h-5 w-5 shrink-0" />}
                  </button>
                </div>
                {locationState === "denied" || locationState === "unsupported" ? <p className="mt-2 text-xs font-bold text-amber-700">{t("تعذر تحديد الموقع. سيُعتمد اسم المنطقة المكتوب لإرسال الطلب.")}</p> : null}
              </section>

              <section className="border-t border-[#e4ecee] pt-7">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8f4f5] font-black text-[#176071]">3</span>
                  <div><h2 className="font-black text-[#183f49]">{t("راجع وأرسل الطلب")}</h2><p className="text-xs text-[#788d92]">{t("ستحصل بعد الإرسال على رمز لمتابعة الحالة")}</p></div>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#d7e3e5] bg-[#fafcfc] p-4 text-sm leading-6">
                  <input required type="checkbox" checked={form.shareContactAndLocation} onChange={(event) => setForm((current) => ({ ...current, shareContactAndLocation: event.target.checked }))} className="mt-1 h-5 w-5 shrink-0 accent-[#175766]" />
                  <span>{t("أوافق على مشاركة بيانات التواصل والمنطقة مع الصيدليات المعتمدة لمعالجة هذا الطلب فقط.")}</span>
                </label>
                <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={update("website")} className="absolute -left-[9999px]" />
                {clientError || createMutation.isError ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{clientError || apiError(createMutation.error, t("تعذر إرسال الطلب. حاول مجدداً."))}</p> : null}
                <button disabled={createMutation.isPending} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#cf183f] px-5 py-4 text-base font-black text-white shadow-[0_10px_22px_rgba(207,24,63,.18)] transition hover:bg-[#b91337] disabled:opacity-60 sm:text-lg">
                  {createMutation.isPending ? t("جاري إرسال الطلب...") : t("إرسال الطلب إلى الصيدليات")}
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-[#70858a]"><ShieldCheck className="h-4 w-4 text-[#237082]" />{t("بياناتك محمية ولا تُستخدم إلا لمتابعة هذا الطلب")}</p>
              </section>
            </div>
          </form>
        ) : null}
      </section>
    </main>
  );
}
