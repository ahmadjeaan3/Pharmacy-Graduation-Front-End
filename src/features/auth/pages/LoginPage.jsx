import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  getLanguageDirection,
  normalizeLanguage,
} from "../../../shared/i18n/i18n";
import { login } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";

const LOGIN_BACKGROUND_IMAGE =
  "/assets/app/auth/login.png";

const LOGIN_LOGO =
  "/assets/app/brand/logo.png";

export function LoginPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage ||
      i18n.language ||
      "ar",
  );

  const isArabic =
    currentLanguage === "ar";

  const direction =
    getLanguageDirection(
      currentLanguage,
    );

  const textAlignClass = isArabic
    ? "text-right"
    : "text-left";

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const mutation = useMutation({
    mutationFn: () =>
      login({
        email: form.email.trim(),
        password: form.password,
      }),

    onSuccess: (response) => {
      signIn(
        response,
        form.remember,
      );

      navigate(
        location.state?.from ||
          "/app",
        {
          replace: true,
        },
      );
    },
  });

  const features = [
    t("دخول آمن"),
    t("خصوصية محفوظة"),
    t("خدمات مخصصة"),
  ];

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="min-h-screen bg-[#F4F8F8]"
    >
      <LoginHeader
        currentLanguage={
          currentLanguage
        }
        direction={direction}
        isArabic={isArabic}
        t={t}
      />

      <main
        className={`min-h-[calc(100vh-72px)] lg:grid lg:grid-cols-2 ${
          isArabic ? "" : ""
        }`}
      >
        {/* Login form */}
        <section
          className={`relative flex min-h-[calc(100vh-72px)] items-center justify-center bg-[#F7FAFA] px-5 py-12 sm:px-10 lg:px-16 xl:px-24 ${
            isArabic
              ? "lg:order-2"
              : "lg:order-1"
          }`}
        >
          <div className="w-full max-w-[510px]">
            {/* Heading */}
            <div
              dir={direction}
              className={`mb-9 ${textAlignClass}`}
            >
              <p className="text-[12px] font-semibold text-[#216474]">
                {t("تسجيل الدخول")}
              </p>

              <h1 className="mt-3 text-[34px] font-bold leading-tight text-[#174B57] sm:text-[40px]">
                {t("أهلاً بعودتك")}
              </h1>

              <p className="mt-3 text-[13px] leading-7 text-[#A0ADB0]">
                {t(
                  "أدخل بيانات حسابك للوصول إلى لوحة التحكم.",
                )}
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate();
              }}
              className="space-y-5"
            >
              {/* Email */}
              <Field
                label={t(
                  "البريد الإلكتروني",
                )}
                direction={direction}
                textAlignClass={
                  textAlignClass
                }
              >
                <div className="relative">
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          email:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="name@example.com"
                    dir="ltr"
                    className="h-[54px] w-full rounded-md border border-[#7FA5AB] bg-white px-12 text-left text-[13px] text-[#333333] outline-none transition placeholder:text-[#A5A5A5] hover:border-[#216474] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                  />

                  <Mail
                    size={18}
                    strokeWidth={1.8}
                    className={`absolute top-1/2 -translate-y-1/2 text-[#216474] ${
                      isArabic
                        ? "right-4"
                        : "left-4"
                    }`}
                  />
                </div>
              </Field>

              {/* Password */}
              <Field
                label={t(
                  "كلمة المرور",
                )}
                direction={direction}
                textAlignClass={
                  textAlignClass
                }
              >
                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    required
                    value={
                      form.password
                    }
                    onChange={(event) =>
                      setForm(
                        (current) => ({
                          ...current,
                          password:
                            event.target
                              .value,
                        }),
                      )
                    }
                    placeholder="••••••••"
                    dir="ltr"
                    className="h-[54px] w-full rounded-md border border-[#7FA5AB] bg-white px-12 text-left text-[13px] text-[#333333] outline-none transition placeholder:text-[#A5A5A5] hover:border-[#216474] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                  />

                  <LockKeyhole
                    size={18}
                    strokeWidth={1.8}
                    className={`absolute top-1/2 -translate-y-1/2 text-[#216474] ${
                      isArabic
                        ? "right-4"
                        : "left-4"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? t(
                            "إخفاء كلمة المرور",
                          )
                        : t(
                            "إظهار كلمة المرور",
                          )
                    }
                    title={
                      showPassword
                        ? t(
                            "إخفاء كلمة المرور",
                          )
                        : t(
                            "إظهار كلمة المرور",
                          )
                    }
                    className={`absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-md text-[#6E969E] transition hover:bg-[#EAF4F3] hover:text-[#216474] ${
                      isArabic
                        ? "left-3"
                        : "right-3"
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff
                        size={17}
                        strokeWidth={
                          1.8
                        }
                      />
                    ) : (
                      <Eye
                        size={17}
                        strokeWidth={
                          1.8
                        }
                      />
                    )}
                  </button>
                </div>
              </Field>

              {/* Remember me */}
              <label
                dir={direction}
                className={`flex cursor-pointer items-center gap-2.5 text-[12px] text-[#71858A] ${
                  isArabic
                    ? "justify-start"
                    : "justify-start"
                }`}
              >
                <input
                  type="checkbox"
                  checked={
                    form.remember
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        remember:
                          event.target
                            .checked,
                      }),
                    )
                  }
                  className="size-4 shrink-0 rounded border-[#9DB5B9] accent-[#216474]"
                />

                <span>
                  {t(
                    "تذكرني على هذا الجهاز",
                  )}
                </span>
              </label>

              {/* Error */}
              {mutation.isError && (
                <div
                  role="alert"
                  dir={direction}
                  className={`rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700 ${textAlignClass}`}
                >
                  {getApiErrorMessage(
                    mutation.error,
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  mutation.isPending
                }
                dir="ltr"
                className={`mt-3 flex h-[54px] w-full items-center justify-center gap-2 rounded-md bg-[#174B57] text-[15px] font-semibold text-white transition hover:bg-[#123F49] disabled:cursor-not-allowed disabled:opacity-60 ${
                  isArabic
                    ? "flex-row-reverse"
                    : "flex-row"
                }`}
              >
                <span dir={direction}>
                  {mutation.isPending
                    ? t(
                        "جاري التحقق...",
                      )
                    : t(
                        "تسجيل الدخول",
                      )}
                </span>

                {isArabic ? (
                  <ArrowLeft
                    size={18}
                    strokeWidth={1.8}
                  />
                ) : (
                  <ArrowRight
                    size={18}
                    strokeWidth={1.8}
                  />
                )}
              </button>
            </form>

            {/* Register */}
            <div
              dir={direction}
              className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[12px]"
            >
              <span className="text-[#A0ADB0]">
                {t(
                  "لا تمتلك حسابًا مسبقًا؟",
                )}
              </span>

              <Link
                to="/register"
                className="font-semibold text-[#216474] underline underline-offset-4 transition hover:text-[#174B57]"
              >
                {t("إنشاء حساب")}
              </Link>
            </div>
          </div>
        </section>

        {/* Visual side */}
        <section
          className={`relative hidden min-h-[calc(100vh-72px)] overflow-hidden bg-[#0D5360] lg:block ${
            isArabic
              ? "lg:order-1"
              : "lg:order-2"
          }`}
        >
          <img
            src={
              LOGIN_BACKGROUND_IMAGE
            }
            alt={t(
              "خدمات الصيدلية الرقمية",
            )}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,79,91,.82)_0%,rgba(9,65,76,.84)_44%,rgba(6,46,55,.92)_100%)]" />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,.10),transparent_35%)]"
          />

          <div
            dir={direction}
            className={`relative z-10 flex h-full flex-col justify-center px-12 py-16 text-white xl:px-20 ${textAlignClass}`}
          >
            <div className="max-w-[620px]">
              <span className="mb-7 grid size-14 place-items-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur-sm">
                <ShieldCheck
                  size={27}
                  strokeWidth={1.7}
                />
              </span>

              <h2 className="text-[27px] font-bold leading-[1.6] xl:text-[32px]">
                {t(
                  "مرحبًا بعودتك إلى",
                )}{" "}
                <span
                  dir="ltr"
                  className="inline-flex"
                >
                  <span className="text-white">
                    MEDICAL
                  </span>

                  <span className="text-[#F0BC42]">
                    LIFE
                  </span>
                </span>
              </h2>

              <p className="mt-5 max-w-[560px] text-[14px] leading-8 text-white/70">
                {t(
                  "ملفك وخدماتك الصحية في مساحة واحدة بتجربة واضحة ومناسبة لنوع حسابك.",
                )}
              </p>

              <div
                dir="ltr"
                className={`mt-7 flex flex-wrap gap-3 ${
                  isArabic
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {features.map(
                  (item) => (
                    <span
                      key={item}
                      className={`flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-[11px] font-medium text-white/85 backdrop-blur-sm ${
                        isArabic
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <Check
                        size={13}
                        strokeWidth={2}
                        className="text-[#F0BC42]"
                      />

                      <span
                        dir={
                          direction
                        }
                      >
                        {item}
                      </span>
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LoginHeader({
  currentLanguage,
  direction,
  isArabic,
  t,
}) {
  return (
    <header
      dir="ltr"
      className="relative z-20 min-h-[72px] border-b border-[rgba(102,102,102,.16)] bg-white"
    >
      <div
        className={`mx-auto flex min-h-[72px] w-full max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8 xl:px-0 ${
          isArabic
            ? "flex-row-reverse"
            : "flex-row"
        }`}
      >
        {/* Logo and home */}
        <div
          dir={
            isArabic ? "rtl" : "ltr"
          }
          className="flex min-w-0 items-center gap-4 sm:gap-[34px]"
        >
          <Link
            to="/"
            aria-label={t(
              "العودة إلى الصفحة الرئيسية",
            )}
            className="flex h-[58px] w-[64px] shrink-0 items-center justify-center"
          >
            <img
              src={LOGIN_LOGO}
              alt="Medical Life"
              draggable={false}
              className="h-[54px] w-[54px] select-none object-contain"
            />
          </Link>

          <span
            aria-hidden="true"
            className="hidden h-10 w-px shrink-0 bg-[#666666] sm:block"
          />

          <Link
            to="/"
            dir={direction}
            className="hidden whitespace-nowrap text-base font-normal text-[#666666] transition hover:text-[#216474] sm:block sm:text-lg"
          >
            {t("الرئيسية")}
          </Link>
        </div>

        {/* Header links */}
        <nav
          dir={direction}
          aria-label={t(
            "روابط الصفحة",
          )}
          className={`flex items-center gap-4 text-sm sm:gap-5 sm:text-base ${
            isArabic
              ? "flex-row-reverse"
              : "flex-row"
          }`}
        >
          <Link
            to="/privacy"
            className="whitespace-nowrap text-[#666666] transition hover:text-[#216474]"
          >
            {t(
              "سياسة الخصوصية",
            )}
          </Link>

          <Link
            to="/support"
            className="whitespace-nowrap text-[#666666] transition hover:text-[#216474]"
          >
            {t(
              "الدعم والمساعدة",
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Field({
  label,
  children,
  direction,
  textAlignClass,
}) {
  return (
    <label
      dir={direction}
      className="block"
    >
      <span
        className={`mb-2 block text-[11px] font-semibold text-[#216474] ${textAlignClass}`}
      >
        {label}
      </span>

      {children}
    </label>
  );
}