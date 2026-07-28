import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  FileBadge2,
  HeartHandshake,
  KeyRound,
  LocateFixed,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { Brand } from "../../../shared/components/Brand";
import { LanguageSwitcher } from "../../../shared/components/LanguageSwitcher";
import {
  registerOrganization,
  registerPharmacy,
  registerUser,
} from "../../auth/api/authApi";
import { useAuth } from "../../auth/hooks/useAuth";
import { registrationDefinitions as accountTypes } from "../../../shared/config/roles";

const initialForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  pharmacyName: "",
  licenseNumber: "",
  organizationName: "",
  registrationNumber: "",
  city: "",
  area: "",
  address: "",
  description: "",
  hasDeliveryService: false,
  latitude: null,
  longitude: null,
};

export function RegisterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = accountTypes[searchParams.get("type")]
    ? searchParams.get("type")
    : null;
  return type ? (
    <RegistrationForm
      key={type}
      type={type}
      onChangeType={() => setSearchParams({})}
    />
  ) : (
    <AccountTypeSelection
      onSelect={(nextType) => setSearchParams({ type: nextType })}
    />
  );
}

function AccountTypeSelection({ onSelect }) {
  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <RegisterHeader />
      <main className="relative isolate overflow-hidden px-5 py-16 lg:px-8 lg:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_10%,rgba(99,183,184,.18),transparent_25%),radial-gradient(circle_at_15%_85%,rgba(245,203,114,.14),transparent_24%)]" />
        <div className="mx-auto max-w-[1160px]">
          <div className="text-center">
            <span className="eyebrow justify-center">
              <BadgeCheck size={17} /> إنشاء حساب جديد
            </span>
            <h1 className="section-title mt-4">اختر نوع الحساب</h1>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#687c81]">
              يحدد نوع الحساب البيانات المطلوبة والصلاحيات المتاحة داخل المنصة.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {Object.entries(accountTypes).map(
              ([type, { role, title, subtitle, text, icon: Icon, tone }]) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => onSelect(type)}
                  className="group relative flex flex-col rounded-[1.8rem] border border-[#174b57]/10 bg-white p-7 text-start transition duration-300 hover:-translate-y-2 hover:border-[#216474]/30 hover:shadow-[0_25px_60px_rgba(23,75,87,.11)]"
                >
                  <span
                    className={`grid size-14 place-items-center rounded-2xl ${tone}`}
                  >
                    <Icon size={27} />
                  </span>
                  <p className="mt-7 text-xs font-bold text-[#749096]">
                    {subtitle}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#15373f]">
                    {title}
                  </h2>
                  <p className="mt-3 min-h-20 flex-1 leading-7 text-[#687c81]">
                    {text}
                  </p>
                  <span className="mt-7 flex w-full items-center justify-between rounded-2xl bg-[#f1f6f5] px-4 py-3.5 font-bold text-[#174b57] transition group-hover:bg-[#dfeeed]">
                    اختيار الحساب{" "}
                    <ArrowLeft
                      size={18}
                      className="transition group-hover:-translate-x-1"
                    />
                  </span>
                </button>
              ),
            )}
          </div>
          <SecurityNote />
        </div>
      </main>
    </div>
  );
}

function RegistrationForm({ type, onChangeType }) {
  const account = accountTypes[type];
  const isBusiness = type !== "user";
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [locationState, setLocationState] = useState({
    status: "idle",
    message: "",
  });
  const [clientError, setClientError] = useState("");
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const mutation = useMutation({
    mutationFn: () => submitRegistration(type, form),
    onSuccess: (response) => {
      signIn(response, false);
      navigate("/app", { replace: true });
    },
  });

  const update = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));
  const submit = (event) => {
    event.preventDefault();
    setClientError("");
    if (step === 1) {
      const passwordError = validatePassword(
        form.password,
        form.confirmPassword,
      );
      if (passwordError) {
        setClientError(passwordError);
        return;
      }
      if (isBusiness) {
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    mutation.mutate();
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState({
        status: "error",
        message: "خدمة تحديد الموقع غير مدعومة في هذا المتصفح.",
      });
      return;
    }
    setLocationState({ status: "loading", message: "جاري تحديد الموقع..." });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));
        setLocationState({
          status: "success",
          message: "تمت إضافة إحداثيات موقع الصيدلية.",
        });
      },
      () =>
        setLocationState({
          status: "error",
          message:
            "تعذر الوصول إلى الموقع. يمكنك متابعة التسجيل من دون إحداثيات.",
        }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const Icon = account.icon;
  const totalSteps = isBusiness ? 2 : 1;
  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <RegisterHeader />
      <main className="mx-auto grid max-w-[1280px] gap-8 px-5 py-8 lg:grid-cols-[340px_1fr] lg:px-8 lg:py-12">
        <aside className="relative hidden min-h-[650px] overflow-hidden rounded-[2rem] bg-[#123f49] p-7 text-white shadow-[0_25px_65px_rgba(23,75,87,.16)] lg:flex lg:flex-col">
          <div className="noise absolute inset-0 opacity-50" />
          <div className="relative">
            <button
              type="button"
              onClick={onChangeType}
              className="flex items-center gap-2 text-sm font-bold text-white/65 transition hover:text-white"
            >
              <ArrowRight size={17} /> تغيير نوع الحساب
            </button>
            <span
              className={`mt-10 grid size-14 place-items-center rounded-2xl ${account.tone}`}
            >
              <Icon size={27} />
            </span>
            <p className="mt-6 text-sm font-semibold text-[#8bd0cb]">
              {account.subtitle}
            </p>
            <h1 className="mt-1 text-3xl font-black">تسجيل {account.title}</h1>
            <p className="mt-4 leading-7 text-white/60">{account.text}</p>
          </div>
          <div className="relative mt-10 space-y-4">
            {Array.from({ length: totalSteps }, (_, index) => index + 1).map(
              (item) => (
                <div
                  key={item}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 ${step === item ? "border-white/20 bg-white/10" : "border-transparent text-white/45"}`}
                >
                  <span
                    className={`grid size-8 place-items-center rounded-full text-sm font-black ${step >= item ? "bg-[#f5cb72] text-[#173d46]" : "bg-white/10"}`}
                  >
                    {step > item ? <Check size={16} strokeWidth={3} /> : item}
                  </span>
                  <span className="font-semibold">
                    {item === 1 ? "بيانات الحساب" : `بيانات ${account.title}`}
                  </span>
                </div>
              ),
            )}
          </div>
          <div className="relative mt-auto rounded-2xl border border-white/10 bg-white/[.06] p-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheck size={18} className="text-[#f5cb72]" /> خصوصيتك تهمنا
            </div>
            <p className="mt-2 text-xs leading-6 text-white/45">
              نحافظ على بيانات حسابك ونستخدمها فقط لتقديم الخدمات المناسبة لك.
            </p>
          </div>
        </aside>

        <section className="rounded-[2rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_18px_55px_rgba(23,75,87,.065)] sm:p-8 lg:p-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={onChangeType}
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#216474] lg:hidden"
              >
                <ArrowRight size={16} /> تغيير نوع الحساب
              </button>
              <p className="text-sm font-bold text-[#216474]">
                الخطوة {step} من {totalSteps}
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#17363e]">
                {step === 1 ? "بيانات الحساب" : `بيانات ${account.title}`}
              </h2>
              <p className="mt-2 text-[#71858a]">
                {step === 1
                  ? "أدخل بيانات الدخول الأساسية كما ستظهر في حسابك."
                  : type === "pharmacy"
                    ? "أدخل البيانات الرسمية وعنوان الصيدلية."
                    : "أدخل البيانات الرسمية وعنوان المنظمة."}
              </p>
            </div>
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-2xl ${account.tone}`}
            >
              <Icon size={23} />
            </span>
          </div>
          <div className="mb-8 flex gap-2">
            {Array.from({ length: totalSteps }, (_, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full ${step >= index + 1 ? "bg-[#216474]" : "bg-[#e4ecec]"}`}
              />
            ))}
          </div>
          <form onSubmit={submit} className="space-y-5">
            {step === 1 ? (
              <AccountFields
                form={form}
                update={update}
                type={type}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            ) : (
              <BusinessFields
                type={type}
                form={form}
                update={update}
                requestLocation={requestLocation}
                locationState={locationState}
              />
            )}
            {(clientError || mutation.isError) && (
              <div
                role="alert"
                className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
              >
                {clientError || getApiErrorMessage(mutation.error)}
              </div>
            )}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setClientError("");
                  }}
                  className="btn-secondary justify-center"
                >
                  <ArrowRight size={17} /> السابق
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn-primary justify-center px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.isPending
                  ? "جاري إنشاء الحساب..."
                  : step < totalSteps
                    ? "متابعة"
                    : "إنشاء الحساب"}
                <ArrowLeft size={18} />
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

function AccountFields({ form, update, type, showPassword, setShowPassword }) {
  const passwordChecks = [
    ["8 أحرف على الأقل", form.password.length >= 8],
    ["حرف إنكليزي كبير", /[A-Z]/.test(form.password)],
    ["حرف إنكليزي صغير", /[a-z]/.test(form.password)],
    [
      "رقم ورمز خاص",
      /\d/.test(form.password) && /[^a-zA-Z0-9]/.test(form.password),
    ],
  ];
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="الاسم الكامل">
          <input
            className="form-input has-field-icon"
            required
            maxLength={150}
            autoComplete="name"
            value={form.fullName}
            onChange={update("fullName")}
            placeholder="الاسم كما سيظهر في الحساب"
          />
          <span className="field-icon-shell">
            <UserRound size={18} />
          </span>
        </FormField>
        <FormField label={`رقم الهاتف${type === "user" ? " (اختياري)" : ""}`}>
          <input
            className="form-input has-field-icon"
            required={type !== "user"}
            maxLength={30}
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            value={form.phoneNumber}
            onChange={update("phoneNumber")}
            placeholder="+963 ..."
          />
          <span className="field-icon-shell">
            <Phone size={18} />
          </span>
        </FormField>
      </div>
      <FormField label="البريد الإلكتروني">
        <input
          className="form-input has-field-icon"
          required
          type="email"
          autoComplete="email"
          dir="ltr"
          value={form.email}
          onChange={update("email")}
          placeholder="name@example.com"
        />
        <span className="field-icon-shell">
          <Mail size={18} />
        </span>
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="كلمة المرور">
          <input
            className="form-input has-field-icon has-field-action"
            required
            minLength={8}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            dir="ltr"
            value={form.password}
            onChange={update("password")}
            placeholder="••••••••"
          />
          <span className="field-icon-shell">
            <KeyRound size={18} />
          </span>
          <PasswordToggle show={showPassword} setShow={setShowPassword} />
        </FormField>
        <FormField label="تأكيد كلمة المرور">
          <input
            className="form-input has-field-icon has-field-action"
            required
            minLength={8}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            dir="ltr"
            value={form.confirmPassword}
            onChange={update("confirmPassword")}
            placeholder="••••••••"
          />
          <span className="field-icon-shell">
            <LockKeyhole size={18} />
          </span>
          <PasswordToggle show={showPassword} setShow={setShowPassword} />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f7faf9] p-4 sm:grid-cols-4">
        {passwordChecks.map(([label, valid]) => (
          <span
            key={label}
            className={`flex items-center gap-2 text-xs font-semibold ${valid ? "text-emerald-600" : "text-slate-400"}`}
          >
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full ${valid ? "bg-emerald-50" : "bg-white"}`}
            >
              <Check size={12} strokeWidth={3} />
            </span>
            {label}
          </span>
        ))}
      </div>
    </>
  );
}

function BusinessFields({
  type,
  form,
  update,
  requestLocation,
  locationState,
}) {
  const isPharmacy = type === "pharmacy";
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label={isPharmacy ? "اسم الصيدلية" : "اسم المنظمة"}>
          <input
            className="form-input has-field-icon"
            required
            maxLength={200}
            value={isPharmacy ? form.pharmacyName : form.organizationName}
            onChange={update(isPharmacy ? "pharmacyName" : "organizationName")}
            placeholder={
              isPharmacy ? "الاسم الرسمي للصيدلية" : "الاسم الرسمي للمنظمة"
            }
          />
          <span className="field-icon-shell">
            {isPharmacy ? (
              <Building2 size={18} />
            ) : (
              <HeartHandshake size={18} />
            )}
          </span>
        </FormField>
        <FormField label={isPharmacy ? "رقم الترخيص" : "رقم التسجيل"}>
          <input
            className="form-input has-field-icon"
            required
            maxLength={100}
            value={isPharmacy ? form.licenseNumber : form.registrationNumber}
            onChange={update(
              isPharmacy ? "licenseNumber" : "registrationNumber",
            )}
            placeholder={
              isPharmacy ? "رقم ترخيص الصيدلية" : "رقم تسجيل المنظمة"
            }
          />
          <span className="field-icon-shell">
            <FileBadge2 size={18} />
          </span>
        </FormField>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="المدينة">
          <input
            className="form-input has-field-icon"
            required
            maxLength={100}
            autoComplete="address-level2"
            value={form.city}
            onChange={update("city")}
            placeholder="المدينة"
          />
          <span className="field-icon-shell">
            <MapPin size={18} />
          </span>
        </FormField>
        <FormField label="المنطقة">
          <input
            className="form-input has-field-icon"
            required
            maxLength={100}
            autoComplete="address-level3"
            value={form.area}
            onChange={update("area")}
            placeholder="المنطقة أو الحي"
          />
          <span className="field-icon-shell">
            <MapPin size={18} />
          </span>
        </FormField>
      </div>
      <FormField label="العنوان التفصيلي">
        <input
          className="form-input has-field-icon"
          required
          maxLength={300}
          autoComplete="street-address"
          value={form.address}
          onChange={update("address")}
          placeholder="الشارع، البناء وأقرب نقطة دالة"
        />
        <span className="field-icon-shell">
          <MapPin size={18} />
        </span>
      </FormField>
      <FormField label="وصف مختصر (اختياري)">
        <textarea
          className="form-textarea"
          maxLength={2000}
          rows={4}
          value={form.description}
          onChange={update("description")}
          placeholder={
            isPharmacy
              ? "معلومات إضافية عن الصيدلية وخدماتها"
              : "معلومات إضافية عن المنظمة ونشاطها"
          }
        />
      </FormField>
      {isPharmacy && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#174b57]/10 bg-[#f8fbfa] p-4">
            <input
              type="checkbox"
              className="size-4 accent-[#216474]"
              checked={form.hasDeliveryService}
              onChange={update("hasDeliveryService")}
            />
            <span>
              <strong className="block text-sm text-[#29464d]">
                خدمة توصيل تابعة للصيدلية
              </strong>
              <small className="text-[#71858a]">
                حدد الخيار إذا كانت الصيدلية توفرها
              </small>
            </span>
          </label>
          <div className="rounded-2xl border border-[#174b57]/10 bg-[#f8fbfa] p-4">
            <button
              type="button"
              onClick={requestLocation}
              disabled={locationState.status === "loading"}
              className="flex items-center gap-2 text-sm font-bold text-[#216474] disabled:opacity-50"
            >
              <LocateFixed size={18} />
              {locationState.status === "loading"
                ? "جاري تحديد الموقع..."
                : "إضافة إحداثيات الموقع"}
            </button>
            {locationState.message && (
              <p
                className={`mt-2 text-xs leading-5 ${locationState.status === "error" ? "text-rose-600" : "text-emerald-600"}`}
              >
                {locationState.message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function RegisterHeader() {
  return (
    <header className="border-b border-[#174b57]/8 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
        <Brand />
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <Link to="/login" className="btn-quiet">
            لدي حساب
          </Link>
        </div>
      </div>
    </header>
  );
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      <span className="field-control">{children}</span>
    </label>
  );
}

function PasswordToggle({ show, setShow }) {
  return (
    <button
      type="button"
      onClick={() => setShow((value) => !value)}
      className="field-action"
      aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
    >
      {show ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

function SecurityNote() {
  return (
    <div className="mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-2xl border border-[#174b57]/10 bg-white/75 p-4 text-sm leading-6 text-[#62777c] backdrop-blur">
      <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#216474]" />
      <p>
        <strong className="text-[#29464d]">بيانات الحساب محمية.</strong> تخضع
        الصيدليات والمنظمات للمراجعة والاعتماد داخل المنصة.
      </p>
    </div>
  );
}

function validatePassword(password, confirmation) {
  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^a-zA-Z0-9]/.test(password)
  )
    return "كلمة المرور لا تحقق جميع متطلبات الأمان الموضحة.";
  if (password !== confirmation) return "كلمة المرور وتأكيدها غير متطابقين.";
  return "";
}

function submitRegistration(type, form) {
  const common = {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    password: form.password,
    confirmPassword: form.confirmPassword,
    phoneNumber: form.phoneNumber.trim() || null,
  };
  if (type === "user") return registerUser(common);
  const address = {
    city: form.city.trim(),
    area: form.area.trim(),
    address: form.address.trim(),
    description: form.description.trim() || null,
  };
  if (type === "pharmacy")
    return registerPharmacy({
      ...common,
      ...address,
      phoneNumber: form.phoneNumber.trim(),
      pharmacyName: form.pharmacyName.trim(),
      licenseNumber: form.licenseNumber.trim(),
      hasDeliveryService: form.hasDeliveryService,
      latitude: form.latitude,
      longitude: form.longitude,
    });
  return registerOrganization({
    ...common,
    ...address,
    phoneNumber: form.phoneNumber.trim(),
    organizationName: form.organizationName.trim(),
    registrationNumber: form.registrationNumber.trim(),
  });
}
