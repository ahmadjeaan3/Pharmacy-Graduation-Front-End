import { useMutation } from "@tanstack/react-query";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FileBadge2,
  HeartHandshake,
  KeyRound,
  LocateFixed,
  LockKeyhole,
  Mail,
  MapPin,
  PackageOpen,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useTranslation,
} from "react-i18next";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getApiErrorMessage,
} from "../../../shared/api/errors";

import {
  normalizeLanguage,
  getLanguageDirection,
} from "../../../shared/i18n/i18n";

import {
  getRegistrationDefinitions,
} from "../../../shared/config/roles";

import {
  registerOrganization,
  registerPharmacy,
  registerUser,
  registerWarehouse,
} from "../../auth/api/authApi";

import {
  useAuth,
} from "../../auth/hooks/useAuth";

/*
|--------------------------------------------------------------------------
| صور كروت الحسابات
|--------------------------------------------------------------------------
*/
const ACCOUNT_CARD_IMAGES = {
  pharmacy:
    "/assets/app/home/icons/pharmacy.png",
};

/*
|--------------------------------------------------------------------------
| صورة التسجيل
|--------------------------------------------------------------------------
*/
const REGISTRATION_IMAGE =
  "/assets/app/home/icons/Asclepius.png";

/*
|--------------------------------------------------------------------------
| القيم الابتدائية للفورم
|--------------------------------------------------------------------------
*/
const initialForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",

  pharmacyName: "",
  warehouseName: "",
  organizationName: "",

  licenseNumber: "",
  registrationNumber: "",

  city: "",
  area: "",
  address: "",
  description: "",

  hasDeliveryService: false,
  supportsUrgentOrders: false,
  acceptsDeferredPayment: false,
  works24Hours: false,

  latitude: null,
  longitude: null,

  minimumOrderAmount: 0,
  deliveryFee: 0,
  deliveryRadiusKm: 0,
};

/*
|--------------------------------------------------------------------------
| صفحة التسجيل الرئيسية
|--------------------------------------------------------------------------
*/
export function RegisterPage() {
  const {
    t,
    i18n,
  } = useTranslation();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  /*
  |--------------------------------------------------------------------------
  | قراءة اللغة المختارة في الصفحة الرئيسية
  |--------------------------------------------------------------------------
  */
  const currentLanguage =
    normalizeLanguage(
      i18n.resolvedLanguage ||
        i18n.language ||
        "ar",
    );

  /*
  |--------------------------------------------------------------------------
  | اتجاه الصفحة
  |--------------------------------------------------------------------------
  */
  const isArabic =
    currentLanguage === "ar";

  const textDirection =
    getLanguageDirection(
      currentLanguage,
    );

  const textAlignClass =
    isArabic
      ? "text-right"
      : "text-left";

  const itemsAlignClass =
    isArabic
      ? "items-end"
      : "items-start";

  /*
  |--------------------------------------------------------------------------
  | جلب تعريفات الحسابات حسب اللغة المختارة
  |--------------------------------------------------------------------------
  */
  const accountTypes =
    useMemo(
      () =>
        getRegistrationDefinitions(
          currentLanguage,
        ),
      [currentLanguage],
    );

  const requestedType =
    searchParams.get("type");

  const type =
    requestedType &&
    accountTypes[
      requestedType
    ]
      ? requestedType
      : null;

  /*
  |--------------------------------------------------------------------------
  | خصائص اللغة التي سترسل لجميع أجزاء الصفحة
  |--------------------------------------------------------------------------
  */
  const language = {
    t,
    currentLanguage,
    isArabic,
    textDirection,
    textAlignClass,
    itemsAlignClass,
  };

  /*
  |--------------------------------------------------------------------------
  | اختيار نوع الحساب
  |--------------------------------------------------------------------------
  */
  const selectAccountType = (
    nextType,
  ) => {
    setSearchParams({
      type: nextType,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | الرجوع إلى اختيار نوع الحساب
  |--------------------------------------------------------------------------
  */
  const changeAccountType =
    () => {
      setSearchParams({});
    };

  return type ? (
    <RegistrationForm
      key={type}
      type={type}
      accountTypes={
        accountTypes
      }
      language={language}
      onChangeType={
        changeAccountType
      }
    />
  ) : (
    <AccountTypeSelection
      accountTypes={
        accountTypes
      }
      language={language}
      onSelect={
        selectAccountType
      }
    />
  );
}

/*
|--------------------------------------------------------------------------
| صفحة اختيار نوع الحساب
|--------------------------------------------------------------------------
*/
function AccountTypeSelection({
  accountTypes,
  language,
  onSelect,
}) {
  const {
    t,
    currentLanguage,
    isArabic,
    textDirection,
    textAlignClass,
    itemsAlignClass,
  } = language;




















  /*
  |--------------------------------------------------------------------------
  | ترتيب الحسابات
  |--------------------------------------------------------------------------
  */
  const orderedAccountTypes = [
    "user",
    "pharmacy",
    "organization",
    "warehouse",
  ]
    .map(
      (accountType) => [
        accountType,
        accountTypes[
          accountType
        ],
      ],
    )
    .filter(
      ([, account]) =>
        Boolean(account),
    );

  return (
    <div
      dir={textDirection}
      lang={currentLanguage}
      className="relative min-h-screen overflow-hidden bg-[#f8fafc]"
    >
      <RegisterHeader
        language={language}
      />

      {/* خلفية التوهج الأولى */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-[-130px] h-[500px] w-[450px] rounded-full bg-[rgba(21,142,171,0.18)] blur-[150px] ${
          isArabic
            ? "-right-[180px]"
            : "-left-[180px]"
        }`}
      />

      {/* خلفية التوهج الثانية */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute top-[400px] h-[420px] w-[375px] rounded-full bg-[rgba(254,226,82,0.20)] blur-[150px] ${
          isArabic
            ? "-left-[130px]"
            : "-right-[130px]"
        }`}
      />

      <main className="relative z-10 px-5 pb-16 pt-10 sm:px-8 lg:pt-11">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center">
          {/* شارة إنشاء حساب */}
          <div
            dir="ltr"
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-5 py-2 text-[#216474] shadow-[0_5px_20px_rgba(33,100,116,0.04)] ${
              isArabic
                ? "flex-row-reverse"
                : "flex-row"
            }`}
          >
            <span
              aria-hidden="true"
              className="grid size-5 shrink-0 place-items-center rounded-full border border-[#216474]"
            >
              <span className="relative block size-2.5">
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#216474]" />

                <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#216474]" />
              </span>
            </span>

            <span
              dir={textDirection}
              className="text-base font-normal"
            >
              {t(
                "إنشاء حساب جديد",
              )}
            </span>
          </div>

          {/* عنوان الصفحة */}
          <div
            dir={textDirection}
            className="mt-8 flex w-full flex-col items-center"
          >
            <div
              dir="ltr"
              className="flex w-full max-w-[526px] items-center justify-center gap-8 sm:gap-[58px]"
            >
              <span className="h-[3px] min-w-0 flex-1 rounded-full bg-gradient-to-r from-white to-[#eeb73a]" />

              <h1
                dir={textDirection}
                className="shrink-0 text-center text-[27px] font-medium leading-none text-[#333333] sm:text-[32px]"
              >
                {t(
                  "اختر نوع الحساب",
                )}
              </h1>

              <span className="h-[3px] min-w-0 flex-1 rounded-full bg-gradient-to-l from-white to-[#eeb73a]" />
            </div>

            <p
              dir={textDirection}
              className="mt-5 max-w-[650px] text-center text-sm leading-7 text-[#a5a5a5] sm:text-base"
            >
              {t(
                "يحدد نوع الحساب البيانات المطلوبة والصلاحيات المتاحة داخل المنصة",
              )}
            </p>
          </div>

          {/* كروت أنواع الحسابات */}
          <div
            dir={textDirection}
            className="mt-11 grid w-full grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4"
          >
            {orderedAccountTypes.map(
              (
                [
                  accountType,
                  account,
                ],
                index,
              ) => {
                const {
                  role,
                  title,
                  text,
                } = account;

                const iconStyle =
                  accountType ===
                  "user"
                    ? "bg-gradient-to-b from-[rgba(33,100,116,.10)] via-[rgba(33,100,116,.04)] to-transparent text-[#216474]"
                    : accountType ===
                        "pharmacy"
                      ? "bg-gradient-to-b from-[rgba(249,209,45,.15)] to-[rgba(251,244,177,0)] text-[#f59e0b]"
                      : accountType ===
                          "warehouse"
                        ? "bg-gradient-to-b from-[rgba(91,141,239,.16)] to-[rgba(219,231,255,0)] text-[#4f73bd]"
                        : "bg-gradient-to-b from-[rgba(255,234,204,.66)] to-[rgba(255,243,226,0)] text-[#8a5b16]";

                const cardNumber =
                  String(
                    index + 1,
                  ).padStart(
                    2,
                    "0",
                  );

                return (
                  <article
                    key={role}
                    dir={
                      textDirection
                    }
                    className="group relative flex min-h-[286px] flex-col rounded-2xl border border-[rgba(102,102,102,.16)] bg-white px-7 pb-8 pt-7 opacity-90 transition-all duration-300 hover:-translate-y-1 hover:border-[#216474]/25 hover:opacity-100 hover:shadow-[0_16px_38px_rgba(33,100,116,.10)]"
                  >
                    {/* الرقم والأيقونة */}
                    <div
                      dir="ltr"
                      className="flex w-full items-start justify-between"
                    >
                      {/* الرقم ثابت على اليسار */}
                      <span className="shrink-0 bg-gradient-to-b from-[#e6f3f6] to-[rgba(230,243,246,.12)] bg-clip-text text-[38px] font-bold leading-none text-transparent">
                        {
                          cardNumber
                        }
                      </span>

                      {/* الأيقونة ثابتة على اليمين */}
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-lg ${iconStyle}`}
                      >
                        <AccountCardIcon
                          account={
                            account
                          }
                          accountType={
                            accountType
                          }
                          translatedTitle={
                            title
                          }
                          size={24}
                          strokeWidth={
                            1.8
                          }
                        />
                      </span>
                    </div>

                    {/* محتوى الكارد */}
                    <div
                      className={`flex flex-1 flex-col ${itemsAlignClass}`}
                    >
                      <div
                        dir={
                          textDirection
                        }
                        className={`mt-4 w-full ${textAlignClass}`}
                      >
                        <h2 className="text-xl font-medium tracking-[0.04em] text-[#333333]">
                          {title}
                        </h2>

                        <p className="mt-4 min-h-[70px] text-sm leading-[1.65] tracking-[0.01em] text-[#666666]">
                          {text}
                        </p>
                      </div>
                    </div>

                    {/* زر اختيار الحساب */}
                    <button
                      type="button"
                      onClick={() =>
                        onSelect(
                          accountType,
                        )
                      }
                      dir="ltr"
                      className={`mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-[rgba(102,102,102,.16)] bg-white text-xl font-medium text-[#a5a5a5] transition-all duration-300 group-hover:border-[#216474] group-hover:bg-[#216474] group-hover:text-white group-hover:shadow-[0_8px_18px_rgba(33,100,116,.18)] hover:!bg-[#194f5b] ${
                        isArabic
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <span
                        dir={
                          textDirection
                        }
                      >
                        {t(
                          "اختر الحساب",
                        )}
                      </span>

                      {isArabic ? (
                        <ChevronLeft
                          size={21}
                          strokeWidth={
                            1.7
                          }
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronRight
                          size={21}
                          strokeWidth={
                            1.7
                          }
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </article>
                );
              },
            )}
          </div>

          {/* تسجيل الدخول */}
          <div
            dir={textDirection}
            className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span className="text-[#a5a5a5]">
              {t(
                "لدي حساب بالفعل",
              )}
            </span>

            <Link
              to="/login"
              className="font-normal text-[#216474] underline underline-offset-2 transition hover:text-[#174b57]"
            >
              {t(
                "العودة لتسجيل الدخول",
              )}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
/*
|--------------------------------------------------------------------------
| نموذج التسجيل
|--------------------------------------------------------------------------
*/
function RegistrationForm({
  type,
  accountTypes,
  language,
  onChangeType,
}) {
  const {
    t,
    currentLanguage,
    isArabic,
    textDirection,
    textAlignClass,
    itemsAlignClass,
  } = language;

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

  const totalSteps = isBusiness ? 2 : 1;

  const mutation = useMutation({
    mutationFn: () => submitRegistration(type, form),

    onSuccess: (response) => {
      signIn(response, false);

      navigate("/app", {
        replace: true,
      });
    },
  });

  const update = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    setClientError("");

    if (step === 1) {
      const passwordError = validatePassword(
        form.password,
        form.confirmPassword,
        t,
      );

      if (passwordError) {
        setClientError(passwordError);
        return;
      }

      if (isBusiness) {
        setStep(2);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }
    }

    mutation.mutate();
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState({
        status: "error",
        message: t(
          "خدمة تحديد الموقع غير مدعومة في هذا المتصفح.",
        ),
      });

      return;
    }

    setLocationState({
      status: "loading",
      message: t("جاري تحديد الموقع..."),
    });

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          latitude: coords.latitude,
          longitude: coords.longitude,
        }));

        const owner =
          type === "warehouse"
            ? t("المستودع")
            : t("الصيدلية");

        setLocationState({
          status: "success",
          message: t(
            "تمت إضافة إحداثيات موقع {{owner}}.",
            {
              owner,
            },
          ),
        });
      },
      () => {
        setLocationState({
          status: "error",
          message: t(
            "تعذر الوصول إلى الموقع. يمكنك متابعة التسجيل من دون إحداثيات.",
          ),
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  const stepTitle =
    step === 1
      ? t("بيانات الحساب")
      : t("بيانات {{account}}", {
          account: account.title,
        });

  const stepDescription =
    step === 1
      ? t(
          "أدخل بيانات الدخول الأساسية كما ستظهر في حسابك.",
        )
      : type === "pharmacy"
        ? t(
            "أدخل البيانات الرسمية وعنوان الصيدلية.",
          )
        : type === "warehouse"
          ? t(
              "أدخل بيانات الترخيص والتوصيل الخاصة بالمستودع.",
            )
          : t(
              "أدخل البيانات الرسمية وعنوان المنظمة.",
            );

  return (
    <div
      dir={textDirection}
      lang={currentLanguage}
      className="min-h-screen bg-[#f7faf9]"
    >
      <RegisterHeader language={language} />

      <main
        dir={textDirection}
        className="mx-auto grid max-w-[1280px] gap-8 px-5 py-8 lg:grid-cols-[340px_1fr] lg:px-8 lg:py-12"
      >
        {/* Sidebar */}
        <aside
          dir={textDirection}
          className={`relative hidden min-h-[650px] overflow-hidden rounded-[2rem] bg-[#123f49] p-7 text-white shadow-[0_25px_65px_rgba(23,75,87,.16)] lg:flex lg:flex-col ${textAlignClass}`}
        >
          <div className="noise absolute inset-0 opacity-50" />

          <div className="relative">
            {/* Change account type */}
            <button
              type="button"
              onClick={onChangeType}
              dir="ltr"
              className={`flex items-center gap-2 text-sm font-bold text-white/65 transition hover:text-white ${
                isArabic ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {isArabic ? (
                <ArrowRight size={17} />
              ) : (
                <ArrowLeft size={17} />
              )}

              <span dir={textDirection}>
                {t("تغيير نوع الحساب")}
              </span>
            </button>

            {/* Account icon: right in Arabic, left in other languages */}
            <div
              dir="ltr"
              className={`mt-10 flex w-full ${
                isArabic ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`grid size-14 shrink-0 place-items-center rounded-2xl ${account.tone}`}
              >
                {type === "warehouse" ? (
                  <PackageOpen size={27} />
                ) : (
                  <RegistrationPageImage
                    src={REGISTRATION_IMAGE}
                    alt={t("صورة تسجيل {{account}}", {
                      account: account.title,
                    })}
                    size={27}
                  />
                )}
              </span>
            </div>

            <p
              className={`mt-6 text-sm font-semibold text-[#8bd0cb] ${textAlignClass}`}
            >
              {account.subtitle}
            </p>

            <h1
              className={`mt-1 text-2xl font-black ${textAlignClass}`}
            >
              {account.title}
            </h1>

            <p
              className={`mt-4 leading-7 text-white/60 ${textAlignClass}`}
            >
              {account.text}
            </p>
          </div>

          {/* Steps */}
          <div className="relative mt-10 space-y-4">
            {Array.from(
              {
                length: totalSteps,
              },
              (_, index) => index + 1,
            ).map((item) => {
              const itemTitle =
                item === 1
                  ? t("بيانات الحساب")
                  : t("بيانات {{account}}", {
                      account: account.title,
                    });

              return (
                <div
                  key={item}
                  dir="ltr"
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 ${
                    isArabic
                      ? "flex-row-reverse"
                      : "flex-row"
                  } ${
                    step === item
                      ? "border-white/20 bg-white/10"
                      : "border-transparent text-white/45"
                  }`}
                >
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-black ${
                      step >= item
                        ? "bg-[#f5cb72] text-[#173d46]"
                        : "bg-white/10"
                    }`}
                  >
                    {step > item ? (
                      <Check size={16} strokeWidth={3} />
                    ) : (
                      item
                    )}
                  </span>

                  <span
                    dir={textDirection}
                    className={`min-w-0 flex-1 font-semibold ${textAlignClass}`}
                  >
                    {itemTitle}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Privacy note */}
          <div
            dir={textDirection}
            className="relative mt-auto rounded-2xl border border-white/10 bg-white/[.06] p-4"
          >
            <div
              dir="ltr"
              className={`flex items-center gap-2 text-sm font-bold ${
                isArabic ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <ShieldCheck
                size={18}
                className="shrink-0 text-[#f5cb72]"
              />

              <span dir={textDirection}>
                {t("خصوصيتك تهمنا")}
              </span>
            </div>

            <p
              className={`mt-2 text-xs leading-6 text-white/45 ${textAlignClass}`}
            >
              {t(
                "نحافظ على بيانات حسابك ونستخدمها فقط لتقديم الخدمات المناسبة لك.",
              )}
            </p>
          </div>
        </aside>

        {/* Form */}
        <section
          dir={textDirection}
          className={`rounded-[2rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_18px_55px_rgba(23,75,87,.065)] sm:p-8 lg:p-10 ${textAlignClass}`}
        >
          {/* Form heading */}
          <div
            dir="ltr"
            className={`mb-8 flex items-start justify-between gap-4 ${
              isArabic ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              dir={textDirection}
              className={`min-w-0 flex-1 ${textAlignClass}`}
            >
              {/* Mobile change account type */}
              <button
                type="button"
                onClick={onChangeType}
                dir="ltr"
                className={`mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#216474] lg:hidden ${
                  isArabic
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                {isArabic ? (
                  <ArrowRight size={16} />
                ) : (
                  <ArrowLeft size={16} />
                )}

                <span dir={textDirection}>
                  {t("تغيير نوع الحساب")}
                </span>
              </button>

              <p className="text-sm font-bold text-[#216474]">
                {t("الخطوة {{step}} من {{total}}", {
                  step,
                  total: totalSteps,
                })}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#17363e]">
                {stepTitle}
              </h2>

              <p className="mt-2 leading-7 text-[#71858a]">
                {stepDescription}
              </p>
            </div>

            {/* Form account icon */}
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-2xl ${account.tone}`}
            >
              {type === "warehouse" ? (
                <PackageOpen size={23} />
              ) : (
                <RegistrationPageImage
                  src={REGISTRATION_IMAGE}
                  alt={t("صورة تسجيل {{account}}", {
                    account: account.title,
                  })}
                  size={23}
                />
              )}
            </span>
          </div>

          <div className="my-7 h-px w-full bg-[#e8efef]" />

          <form
            dir={textDirection}
            onSubmit={submit}
            className={`flex w-full flex-col gap-6 ${textAlignClass}`}
          >
            {step === 1 ? (
              <AccountFields
                form={form}
                update={update}
                type={type}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                language={language}
              />
            ) : (
              <BusinessFields
                type={type}
                form={form}
                update={update}
                requestLocation={requestLocation}
                locationState={locationState}
                language={language}
              />
            )}

            {(clientError || mutation.isError) && (
              <div
                role="alert"
                dir={textDirection}
                className={`rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ${textAlignClass}`}
              >
                {clientError ||
                  getApiErrorMessage(mutation.error)}
              </div>
            )}

            {/* Form actions */}
            <div
              dir="ltr"
              className={`flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:justify-between ${
                isArabic
                  ? "sm:flex-row-reverse"
                  : "sm:flex-row"
              }`}
            >
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setClientError("");
                  }}
                  dir="ltr"
                  className={`btn-secondary justify-center gap-2 ${
                    isArabic
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  {isArabic ? (
                    <ArrowRight size={17} />
                  ) : (
                    <ArrowLeft size={17} />
                  )}

                  <span dir={textDirection}>
                    {t("السابق")}
                  </span>
                </button>
              ) : (
                <span />
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                dir="ltr"
                className={`btn-primary justify-center gap-2 px-6 py-3 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isArabic
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                <span dir={textDirection}>
                  {mutation.isPending
                    ? t("جاري إنشاء الحساب...")
                    : step < totalSteps
                      ? t("متابعة")
                      : t("إنشاء الحساب")}
                </span>

                {isArabic ? (
                  <ArrowLeft size={18} />
                ) : (
                  <ArrowRight size={18} />
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
/*
|--------------------------------------------------------------------------
| حقول بيانات الحساب
|--------------------------------------------------------------------------
*/
function AccountFields({
  form,
  update,
  type,
  showPassword,
  setShowPassword,
  language,
}) {
  const {
    t,
    isArabic,
    textDirection,
    textAlignClass,
  } = language;

  const passwordChecks = [
    [
      t("8 أحرف على الأقل"),
      form.password.length >= 8,
    ],
    [
      t("حرف إنكليزي كبير"),
      /[A-Z]/.test(form.password),
    ],
    [
      t("حرف إنكليزي صغير"),
      /[a-z]/.test(form.password),
    ],
    [
      t("رقم ورمز خاص"),
      /\d/.test(form.password) &&
        /[^a-zA-Z0-9]/.test(form.password),
    ],
  ];

  return (
    <div className="flex w-full flex-col gap-5">
      {/* الاسم ورقم الهاتف */}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label={t("الاسم الكامل")}
          language={language}
        >
          <input
            className={getIconInputClass(isArabic)}
            required
            maxLength={150}
            autoComplete="name"
            dir={textDirection}
            value={form.fullName}
            onChange={update("fullName")}
            placeholder={t(
              "الاسم كما سيظهر في الحساب",
            )}
          />

          <span
            className={getFieldIconClass(isArabic)}
          >
            <UserRound size={18} />
          </span>
        </FormField>

        <FormField
          label={
            type === "user"
              ? t("رقم الهاتف (اختياري)")
              : t("رقم الهاتف")
          }
          language={language}
        >
          <input
            className={getIconInputClass(isArabic)}
            required={type !== "user"}
            maxLength={30}
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            value={form.phoneNumber}
            onChange={update("phoneNumber")}
            placeholder="+963 ..."
          />

          <span
            className={getFieldIconClass(isArabic)}
          >
            <Phone size={18} />
          </span>
        </FormField>
      </div>

      {/* البريد الإلكتروني */}
      <FormField
        label={t("البريد الإلكتروني")}
        language={language}
      >
        <input
          className={getIconInputClass(isArabic)}
          required
          type="email"
          autoComplete="email"
          dir="ltr"
          value={form.email}
          onChange={update("email")}
          placeholder="name@example.com"
        />

        <span
          className={getFieldIconClass(isArabic)}
        >
          <Mail size={18} />
        </span>
      </FormField>

      {/* كلمة المرور والتأكيد */}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label={t("كلمة المرور")}
          language={language}
        >
          <input
            className={getPasswordInputClass(isArabic)}
            required
            minLength={8}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            dir="ltr"
            value={form.password}
            onChange={update("password")}
            placeholder="••••••••"
          />

          <span
            className={getFieldIconClass(isArabic)}
          >
            <KeyRound size={18} />
          </span>

          <PasswordToggle
            show={showPassword}
            setShow={setShowPassword}
            language={language}
          />
        </FormField>

        <FormField
          label={t("تأكيد كلمة المرور")}
          language={language}
        >
          <input
            className={getPasswordInputClass(isArabic)}
            required
            minLength={8}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            dir="ltr"
            value={form.confirmPassword}
            onChange={update("confirmPassword")}
            placeholder="••••••••"
          />

          <span
            className={getFieldIconClass(isArabic)}
          >
            <LockKeyhole size={18} />
          </span>

          <PasswordToggle
            show={showPassword}
            setShow={setShowPassword}
            language={language}
          />
        </FormField>
      </div>

      {/* شروط كلمة المرور */}
      <div
        dir={textDirection}
        className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f7faf9] p-4 sm:grid-cols-4"
      >
        {passwordChecks.map(([label, valid]) => (
          <span
            key={label}
            dir="ltr"
            className={`flex items-center gap-2 text-xs font-semibold ${
              isArabic
                ? "flex-row-reverse"
                : "flex-row"
            } ${
              valid
                ? "text-emerald-600"
                : "text-slate-400"
            }`}
          >
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full ${
                valid
                  ? "bg-emerald-50"
                  : "bg-white"
              }`}
            >
              <Check
                size={12}
                strokeWidth={3}
              />
            </span>

            <span
              dir={textDirection}
              className={textAlignClass}
            >
              {label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| غلاف الحقل وعنوانه
|--------------------------------------------------------------------------
*/
function FormField({
  label,
  children,
  language,
}) {
  const {
    textDirection,
    textAlignClass,
  } = language;

  return (
    <label
      dir={textDirection}
      className="block w-full"
    >
      <span
        className={`mb-2 block text-sm font-semibold leading-5 text-[#29464d] ${textAlignClass}`}
      >
        {label}
      </span>

      <span className="relative block w-full">
        {children}
      </span>
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| إظهار وإخفاء كلمة المرور
|--------------------------------------------------------------------------
*/
function PasswordToggle({
  show,
  setShow,
  language,
}) {
  const {
    t,
    isArabic,
  } = language;

  return (
    <button
      type="button"
      onClick={() =>
        setShow((value) => !value)
      }
      className={`absolute top-1/2 z-20 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-[#7f98a0] transition hover:bg-slate-50 hover:text-[#216474] ${
        isArabic
          ? "left-2"
          : "right-2"
      }`}
      aria-label={
        show
          ? t("إخفاء كلمة المرور")
          : t("إظهار كلمة المرور")
      }
    >
      {show ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| كلاس حقل يحتوي أيقونة
|--------------------------------------------------------------------------
| العربية: الأيقونة على اليمين.
| الإنجليزية والتركية: الأيقونة على اليسار.
|--------------------------------------------------------------------------
*/
function getIconInputClass(isArabic) {
  return [
    "block",
    "h-12",
    "w-full",
    "rounded-xl",
    "border",
    "border-slate-200",
    "bg-white",
    "text-[15px]",
    "leading-none",
    "text-[#29464d]",
    "outline-none",
    "transition",
    "placeholder:text-slate-400",
    "focus:border-[#216474]",
    "focus:ring-2",
    "focus:ring-[#216474]/10",
    isArabic
      ? "pr-11 pl-4 text-right"
      : "pl-11 pr-4 text-left",
  ].join(" ");
}

/*
|--------------------------------------------------------------------------
| كلاس حقل كلمة المرور
|--------------------------------------------------------------------------
| توجد أيقونة في البداية وزر إظهار/إخفاء في النهاية.
|--------------------------------------------------------------------------
*/
function getPasswordInputClass(isArabic) {
  return [
    "block",
    "h-12",
    "w-full",
    "rounded-xl",
    "border",
    "border-slate-200",
    "bg-white",
    "text-[15px]",
    "leading-none",
    "text-[#29464d]",
    "outline-none",
    "transition",
    "placeholder:text-slate-400",
    "focus:border-[#216474]",
    "focus:ring-2",
    "focus:ring-[#216474]/10",
    isArabic
      ? "pr-11 pl-11 text-right"
      : "pl-11 pr-11 text-left",
  ].join(" ");
}

/*
|--------------------------------------------------------------------------
| موقع أيقونة الحقل
|--------------------------------------------------------------------------
*/
function getFieldIconClass(isArabic) {
  return [
    "pointer-events-none",
    "absolute",
    "top-1/2",
    "z-10",
    "grid",
    "size-5",
    "-translate-y-1/2",
    "place-items-center",
    "text-[#7f98a0]",
    isArabic
      ? "right-3.5"
      : "left-3.5",
  ].join(" ");
}
/*
|--------------------------------------------------------------------------
| حقول بيانات المنشأة
|--------------------------------------------------------------------------
*/
function BusinessFields({
  type,
  form,
  update,
  requestLocation,
  locationState,
  language,
}) {
  const {
    t,
    isArabic,
    textDirection,
    textAlignClass,
  } = language;

  const isPharmacy =
    type === "pharmacy";

  const isWarehouse =
    type === "warehouse";

  const businessTitle = isPharmacy
    ? t("الصيدلية")
    : isWarehouse
      ? t("المستودع")
      : t("المنظمة");

  const businessName = isPharmacy
    ? form.pharmacyName
    : isWarehouse
      ? form.warehouseName
      : form.organizationName;

  const businessNameField = isPharmacy
    ? "pharmacyName"
    : isWarehouse
      ? "warehouseName"
      : "organizationName";

  const businessNameLabel = isPharmacy
    ? t("اسم الصيدلية")
    : isWarehouse
      ? t("اسم المستودع")
      : t("اسم المنظمة");

  const businessNamePlaceholder =
    isPharmacy
      ? t("الاسم الرسمي للصيدلية")
      : isWarehouse
        ? t(
            "الاسم التجاري المرخص للمستودع",
          )
        : t("الاسم الرسمي للمنظمة");

  const licenseLabel =
    isPharmacy || isWarehouse
      ? t("رقم الترخيص")
      : t("رقم التسجيل");

  const licenseValue =
    isPharmacy || isWarehouse
      ? form.licenseNumber
      : form.registrationNumber;

  const licenseField =
    isPharmacy || isWarehouse
      ? "licenseNumber"
      : "registrationNumber";

  const licensePlaceholder =
    isPharmacy
      ? t("رقم ترخيص الصيدلية")
      : isWarehouse
        ? t("رقم ترخيص المستودع")
        : t("رقم تسجيل المنظمة");

  const descriptionPlaceholder =
    isPharmacy
      ? t(
          "معلومات إضافية عن الصيدلية وخدماتها",
        )
      : isWarehouse
        ? t(
            "معلومات إضافية عن المستودع وتغطيته وخدماته",
          )
        : t(
            "معلومات إضافية عن المنظمة ونشاطها",
          );

  return (
    <div className="flex w-full flex-col gap-5">
      {/* اسم المنشأة والترخيص */}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label={businessNameLabel}
          language={language}
        >
          <input
            className={getIconInputClass(
              isArabic,
            )}
            required
            maxLength={200}
            dir={textDirection}
            value={businessName}
            onChange={update(
              businessNameField,
            )}
            placeholder={
              businessNamePlaceholder
            }
          />

          <span
            className={getFieldIconClass(
              isArabic,
            )}
          >
            {isWarehouse ? (
              <PackageOpen size={18} />
            ) : isPharmacy ? (
              <Building2 size={18} />
            ) : (
              <HeartHandshake size={18} />
            )}
          </span>
        </FormField>

        <FormField
          label={licenseLabel}
          language={language}
        >
          <input
            className={getIconInputClass(
              isArabic,
            )}
            required
            maxLength={100}
            dir={textDirection}
            value={licenseValue}
            onChange={update(
              licenseField,
            )}
            placeholder={
              licensePlaceholder
            }
          />

          <span
            className={getFieldIconClass(
              isArabic,
            )}
          >
            <FileBadge2 size={18} />
          </span>
        </FormField>
      </div>

      {/* المدينة والمنطقة */}
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label={t("المدينة")}
          language={language}
        >
          <input
            className={getIconInputClass(
              isArabic,
            )}
            required
            maxLength={100}
            autoComplete="address-level2"
            dir={textDirection}
            value={form.city}
            onChange={update("city")}
            placeholder={t("المدينة")}
          />

          <span
            className={getFieldIconClass(
              isArabic,
            )}
          >
            <MapPin size={18} />
          </span>
        </FormField>

        <FormField
          label={t("المنطقة")}
          language={language}
        >
          <input
            className={getIconInputClass(
              isArabic,
            )}
            required
            maxLength={100}
            autoComplete="address-level3"
            dir={textDirection}
            value={form.area}
            onChange={update("area")}
            placeholder={t(
              "المنطقة أو الحي",
            )}
          />

          <span
            className={getFieldIconClass(
              isArabic,
            )}
          >
            <MapPin size={18} />
          </span>
        </FormField>
      </div>

      {/* العنوان */}
      <FormField
        label={t("العنوان التفصيلي")}
        language={language}
      >
        <input
          className={getIconInputClass(
            isArabic,
          )}
          required
          maxLength={300}
          autoComplete="street-address"
          dir={textDirection}
          value={form.address}
          onChange={update("address")}
          placeholder={t(
            "الشارع، البناء وأقرب نقطة دالة",
          )}
        />

        <span
          className={getFieldIconClass(
            isArabic,
          )}
        >
          <MapPin size={18} />
        </span>
      </FormField>

      {/* الوصف */}
      <FormField
        label={t(
          "وصف مختصر (اختياري)",
        )}
        language={language}
      >
        <textarea
          dir={textDirection}
          className={`form-textarea w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[#29464d] outline-none transition placeholder:text-slate-400 focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${textAlignClass}`}
          maxLength={2000}
          rows={4}
          value={form.description}
          onChange={update("description")}
          placeholder={
            descriptionPlaceholder
          }
        />
      </FormField>

      {/* التوصيل والموقع */}
      {(isPharmacy ||
        isWarehouse) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label
            dir="ltr"
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border border-[#174b57]/10 bg-[#f8fbfa] p-4 ${
              isArabic
                ? "flex-row-reverse"
                : "flex-row"
            }`}
          >
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-[#216474]"
              checked={
                form.hasDeliveryService
              }
              onChange={update(
                "hasDeliveryService",
              )}
            />

            <span
              dir={textDirection}
              className={`min-w-0 flex-1 ${textAlignClass}`}
            >
              <strong className="block text-sm text-[#29464d]">
                {isWarehouse
                  ? t(
                      "يوفر المستودع خدمة التوصيل",
                    )
                  : t(
                      "خدمة توصيل تابعة للصيدلية",
                    )}
              </strong>

              <small className="mt-1 block text-[#71858a]">
                {t(
                  "حدد الخيار عند توفر خدمة التوصيل",
                )}
              </small>
            </span>
          </label>

          <div
            dir={textDirection}
            className={`rounded-2xl border border-[#174b57]/10 bg-[#f8fbfa] p-4 ${textAlignClass}`}
          >
            <button
              type="button"
              onClick={requestLocation}
              disabled={
                locationState.status ===
                "loading"
              }
              dir="ltr"
              className={`flex items-center gap-2 text-sm font-bold text-[#216474] disabled:opacity-50 ${
                isArabic
                  ? "flex-row-reverse"
                  : "flex-row"
              }`}
            >
              <LocateFixed
                size={18}
                className="shrink-0"
              />

              <span dir={textDirection}>
                {locationState.status ===
                "loading"
                  ? t(
                      "جاري تحديد الموقع...",
                    )
                  : t(
                      "إضافة إحداثيات {{owner}}",
                      {
                        owner:
                          businessTitle,
                      },
                    )}
              </span>
            </button>

            {locationState.message && (
              <p
                className={`mt-2 text-xs leading-5 ${
                  locationState.status ===
                  "error"
                    ? "text-rose-600"
                    : "text-emerald-600"
                } ${textAlignClass}`}
              >
                {
                  locationState.message
                }
              </p>
            )}
          </div>
        </div>
      )}

      {/* إعدادات المستودع */}
      {isWarehouse && (
        <>
          <div
            dir={textDirection}
            className="rounded-2xl border border-[#216474]/10 bg-[#f8fbfa] p-5"
          >
            {/* عنوان الإعدادات */}
            <div
              dir="ltr"
              className={`mb-5 flex items-center gap-3 ${
                isArabic
                  ? "flex-row-reverse"
                  : "flex-row"
              }`}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e8f1ff] text-[#4f73bd]">
                <PackageOpen size={21} />
              </span>

              <div
                dir={textDirection}
                className={`min-w-0 flex-1 ${textAlignClass}`}
              >
                <h3 className="font-bold text-[#29464d]">
                  {t(
                    "إعدادات طلبات المستودع",
                  )}
                </h3>

                <p className="mt-1 text-xs text-[#71858a]">
                  {t(
                    "حدد قيمة الطلب والتوصيل ونطاق التغطية",
                  )}
                </p>
              </div>
            </div>

            {/* الحقول الرقمية */}
            <div className="grid gap-5 sm:grid-cols-3">
              <FormField
                label={t(
                  "الحد الأدنى للطلب",
                )}
                language={language}
              >
                <input
                  className={getPlainInputClass(
                    isArabic,
                  )}
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  inputMode="decimal"
                  dir="ltr"
                  value={
                    form.minimumOrderAmount
                  }
                  onChange={update(
                    "minimumOrderAmount",
                  )}
                  placeholder="0"
                />
              </FormField>

              <FormField
                label={t("أجور التوصيل")}
                language={language}
              >
                <input
                  className={getPlainInputClass(
                    isArabic,
                  )}
                  required
                  min="0"
                  step="0.01"
                  type="number"
                  inputMode="decimal"
                  dir="ltr"
                  value={form.deliveryFee}
                  onChange={update(
                    "deliveryFee",
                  )}
                  placeholder="0"
                />
              </FormField>

              <FormField
                label={t(
                  "نطاق التوصيل (كم)",
                )}
                language={language}
              >
                <input
                  className={getPlainInputClass(
                    isArabic,
                  )}
                  required
                  min="0"
                  step="1"
                  type="number"
                  inputMode="numeric"
                  dir="ltr"
                  value={
                    form.deliveryRadiusKm
                  }
                  onChange={update(
                    "deliveryRadiusKm",
                  )}
                  placeholder="0"
                />
              </FormField>
            </div>
          </div>

          {/* خيارات المستودع */}
          <div
            dir={textDirection}
            className="grid gap-3 sm:grid-cols-3"
          >
            <WarehouseOption
              label={t(
                "يعمل على مدار 24 ساعة",
              )}
              description={t(
                "استقبال الطلبات في جميع الأوقات",
              )}
              checked={
                form.works24Hours
              }
              onChange={update(
                "works24Hours",
              )}
              language={language}
            />

            <WarehouseOption
              label={t(
                "يدعم الطلبات المستعجلة",
              )}
              description={t(
                "معالجة الطلبات ذات الأولوية",
              )}
              checked={
                form.supportsUrgentOrders
              }
              onChange={update(
                "supportsUrgentOrders",
              )}
              language={language}
            />

            <WarehouseOption
              label={t(
                "يقبل الدفع الآجل",
              )}
              description={t(
                "إتاحة الدفع المؤجل للصيدليات",
              )}
              checked={
                form.acceptsDeferredPayment
              }
              onChange={update(
                "acceptsDeferredPayment",
              )}
              language={language}
            />
          </div>
        </>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| خيار من خيارات المستودع
|--------------------------------------------------------------------------
*/
function WarehouseOption({
  label,
  description,
  checked,
  onChange,
  language,
}) {
  const {
    isArabic,
    textDirection,
    textAlignClass,
  } = language;

  return (
    <label
      dir="ltr"
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border border-[#174b57]/10 bg-[#f8fbfa] p-4 transition hover:border-[#216474]/25 hover:bg-white ${
        isArabic
          ? "flex-row-reverse"
          : "flex-row"
      }`}
    >
      <input
        type="checkbox"
        className="mt-1 size-4 shrink-0 accent-[#216474]"
        checked={checked}
        onChange={onChange}
      />

      <span
        dir={textDirection}
        className={`min-w-0 flex-1 ${textAlignClass}`}
      >
        <strong className="block text-sm text-[#29464d]">
          {label}
        </strong>

        <small className="mt-1 block leading-5 text-[#71858a]">
          {description}
        </small>
      </span>
    </label>
  );
}

/*
|--------------------------------------------------------------------------
| حقل رقمي من دون أيقونة
|--------------------------------------------------------------------------
*/
function getPlainInputClass(
  isArabic,
) {
  return [
    "block",
    "h-12",
    "w-full",
    "rounded-xl",
    "border",
    "border-slate-200",
    "bg-white",
    "px-4",
    "py-3",
    "text-[#29464d]",
    "outline-none",
    "transition",
    "placeholder:text-slate-400",
    "focus:border-[#216474]",
    "focus:ring-2",
    "focus:ring-[#216474]/10",
    isArabic
      ? "text-right"
      : "text-left",
  ].join(" ");
}
/*
|--------------------------------------------------------------------------
| صورة صفحة التسجيل
|--------------------------------------------------------------------------
*/
function RegistrationPageImage({
  src,
  alt = "",
  size = 28,
  className = "",
}) {
  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-contain ${className}`}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}

/*
|--------------------------------------------------------------------------
| أيقونة كارد الحساب
|--------------------------------------------------------------------------
*/
function AccountCardIcon({
  account,
  accountType,
  translatedTitle = "",
  size = 24,
  strokeWidth = 1.8,
  className = "",
}) {
  const cardImage =
    ACCOUNT_CARD_IMAGES[accountType];

  if (cardImage) {
    return (
      <img
        src={cardImage}
        alt={
          translatedTitle ||
          account?.title ||
          ""
        }
        className={`object-contain ${className}`}
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }

  if (accountType === "warehouse") {
    return (
      <PackageOpen
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        aria-hidden="true"
      />
    );
  }

  return (
    <AccountTypeIcon
      account={account}
      translatedTitle={translatedTitle}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}

/*
|--------------------------------------------------------------------------
| أيقونة نوع الحساب
|--------------------------------------------------------------------------
*/
function AccountTypeIcon({
  account,
  translatedTitle = "",
  size = 24,
  strokeWidth = 1.8,
  className = "",
}) {
  if (account?.isImage) {
    return (
      <img
        src={account.icon}
        alt={
          translatedTitle ||
          account.title ||
          ""
        }
        className={`object-contain ${className}`}
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }

  const IconComponent =
    account?.icon;

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
}

/*
|--------------------------------------------------------------------------
| هيدر صفحة التسجيل
|--------------------------------------------------------------------------
| لا يحتوي مبدّل لغة، لأن اللغة تُختار من الصفحة الرئيسية
| وتستمر تلقائيًا في كامل الموقع.
|--------------------------------------------------------------------------
*/
function RegisterHeader({
  language,
}) {
  const {
    t,
    isArabic,
    textDirection,
  } = language;

  return (
    <header
      dir="ltr"
      className="relative z-20 min-h-[72px] border-b border-[rgba(102,102,102,.16)] bg-white"
    >
      <div
        className={`mx-auto flex min-h-[72px] w-full max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8 xl:px-0 ${
          isArabic ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* مجموعة اللوجو والرئيسية */}
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className="flex min-w-0 items-center gap-4 sm:gap-[34px]"
        >
          {isArabic ? (
            <>
              {/* العربي: يبقى كما هو */}
              <Link
                to="/"
                aria-label={t("العودة إلى الصفحة الرئيسية")}
                className="flex h-[58px] w-[64px] shrink-0 items-center justify-center"
              >
                <img
                  src="/assets/app/brand/logo.png"
                  alt="Medical Life"
                  className="h-[54px] w-[54px] object-contain"
                />
              </Link>

              <span
                aria-hidden="true"
                className="hidden h-10 w-px shrink-0 bg-[#666666] sm:block"
              />

              <Link
                to="/"
                dir={textDirection}
                className="hidden whitespace-nowrap text-base font-normal text-[#666666] transition hover:text-[#216474] sm:block sm:text-lg"
              >
                {t("الرئيسية")}
              </Link>
            </>
          ) : (
            <>
              {/* الإنكليزي والتركي */}
               <img
                  src="/assets/app/brand/logo.png"
                  alt="Medical Life"
                  className="h-[54px] w-[54px] object-contain"
                />
              

              <span
                aria-hidden="true"
                className="hidden h-10 w-px shrink-0 bg-[#666666] sm:block"
              />

              <Link
                to="/"
                aria-label={t("العودة إلى الصفحة الرئيسية")}
                className="flex h-[58px] w-[64px] shrink-0 items-center justify-center"
              >
               <Link
                to="/"
                dir={textDirection}
                className="hidden whitespace-nowrap text-base font-normal text-[#666666] transition hover:text-[#216474] sm:block sm:text-lg"
              >
                {t("الرئيسية")}
              </Link>
              </Link>
            </>
          )}
        </div>

        {/* روابط الجهة الثانية */}
        <nav
          dir={textDirection}
          className={`flex items-center gap-4 text-sm sm:gap-5 sm:text-base ${
            isArabic ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <Link
            to="/privacy"
            className="whitespace-nowrap text-[#666666] transition hover:text-[#216474]"
          >
            {t("سياسة الخصوصية")}
          </Link>

          <Link
            to="/support"
            className="whitespace-nowrap text-[#666666] transition hover:text-[#216474]"
          >
            {t("الدعم والمساعدة")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
/*
|--------------------------------------------------------------------------
| ملاحظة الأمان
|--------------------------------------------------------------------------
| هذا المكوّن غير مستخدم حاليًا، لكنه مترجم وجاهز للاستخدام.
|--------------------------------------------------------------------------
*/
function SecurityNote({
  language,
}) {
  const {
    t,
    isArabic,
    textDirection,
    textAlignClass,
  } = language;

  return (
    <div
      dir="ltr"
      className={`mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-2xl border border-[#174b57]/10 bg-white/75 p-4 text-sm leading-6 text-[#62777c] backdrop-blur ${
        isArabic
          ? "flex-row-reverse"
          : "flex-row"
      }`}
    >
      <ShieldCheck
        size={20}
        className="mt-0.5 shrink-0 text-[#216474]"
      />

      <p
        dir={textDirection}
        className={`min-w-0 flex-1 ${textAlignClass}`}
      >
        <strong className="text-[#29464d]">
          {t("بيانات الحساب محمية.")}
        </strong>{" "}

        {t(
          "تخضع الصيدليات والمنظمات والمستودعات للمراجعة والاعتماد داخل المنصة.",
        )}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| التحقق من كلمة المرور
|--------------------------------------------------------------------------
*/
function validatePassword(
  password,
  confirmation,
  t,
) {
  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password) ||
    !/[^a-zA-Z0-9]/.test(password)
  ) {
    return t(
      "كلمة المرور لا تحقق جميع متطلبات الأمان الموضحة.",
    );
  }

  if (password !== confirmation) {
    return t(
      "كلمة المرور وتأكيدها غير متطابقين.",
    );
  }

  return "";
}

/*
|--------------------------------------------------------------------------
| إرسال بيانات التسجيل إلى API
|--------------------------------------------------------------------------
*/
function submitRegistration(
  type,
  form,
) {
  const common = {
    fullName:
      form.fullName.trim(),

    email:
      form.email.trim(),

    password:
      form.password,

    confirmPassword:
      form.confirmPassword,

    phoneNumber:
      form.phoneNumber.trim() ||
      null,
  };

  if (type === "user") {
    return registerUser(common);
  }

  const address = {
    city:
      form.city.trim(),

    area:
      form.area.trim(),

    address:
      form.address.trim(),

    description:
      form.description.trim() ||
      null,
  };

  if (type === "pharmacy") {
    return registerPharmacy({
      ...common,
      ...address,

      phoneNumber:
        form.phoneNumber.trim(),

      pharmacyName:
        form.pharmacyName.trim(),

      licenseNumber:
        form.licenseNumber.trim(),

      hasDeliveryService:
        form.hasDeliveryService,

      latitude:
        form.latitude,

      longitude:
        form.longitude,
    });
  }

  if (type === "warehouse") {
    return registerWarehouse({
      ...common,
      ...address,

      phoneNumber:
        form.phoneNumber.trim(),

      warehouseName:
        form.warehouseName.trim(),

      licenseNumber:
        form.licenseNumber.trim(),

      hasDeliveryService:
        form.hasDeliveryService,

      works24Hours:
        form.works24Hours,

      supportsUrgentOrders:
        form.supportsUrgentOrders,

      acceptsDeferredPayment:
        form.acceptsDeferredPayment,

      latitude:
        form.latitude,

      longitude:
        form.longitude,

      minimumOrderAmount:
        Number(
          form.minimumOrderAmount,
        ),

      deliveryFee:
        Number(
          form.deliveryFee,
        ),

      deliveryRadiusKm:
        Number(
          form.deliveryRadiusKm,
        ),
    });
  }

  return registerOrganization({
    ...common,
    ...address,

    phoneNumber:
      form.phoneNumber.trim(),

    organizationName:
      form.organizationName.trim(),

    registrationNumber:
      form.registrationNumber.trim(),
  });
}