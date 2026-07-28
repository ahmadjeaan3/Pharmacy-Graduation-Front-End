import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { Brand } from "../../../shared/components/Brand";
import { LanguageSwitcher } from "../../../shared/components/LanguageSwitcher";
import { login } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const mutation = useMutation({
    mutationFn: () =>
      login({ email: form.email.trim(), password: form.password }),
    onSuccess: (response) => {
      signIn(response, form.remember);
      navigate(location.state?.from || "/app", { replace: true });
    },
  });

  return (
    <div className="relative min-h-screen bg-[#f7faf9] lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <div className="absolute end-5 top-5 z-20">
        <LanguageSwitcher />
      </div>
      <section className="relative hidden min-h-screen overflow-hidden bg-[#123f49] lg:block">
        <img
          src="/assets/app/auth/login-bg.png"
          alt="خدمات الصيدلية الرقمية"
          className="absolute inset-0 h-full w-full object-cover opacity-75 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b313a] via-[#123f49]/45 to-[#123f49]/15" />
        <div className="noise relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Brand light />
          <div className="max-w-xl pb-6 text-white">
            <span className="mb-6 grid size-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-[#f5cb72] backdrop-blur">
              <ShieldCheck size={28} />
            </span>
            <h1 className="text-4xl font-black leading-[1.35] xl:text-5xl">
              مرحباً بعودتك إلى
              <br />
              حياة دوائية
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-white/68">
              ملفك وخدماتك الصحية في مساحة واحدة بتجربة واضحة ومناسبة لنوع
              حسابك.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["دخول آمن", "خصوصية محفوظة", "خدمات مخصصة لك"].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-xs font-semibold"
                >
                  <Check size={14} className="text-[#f5cb72]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[460px]">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <Brand />
            <Link to="/" className="btn-quiet">
              الرئيسية
            </Link>
          </div>
          <div className="mb-9">
            <p className="eyebrow">تسجيل الدخول</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.035em] text-[#102d34] sm:text-[2.7rem]">
              أهلاً بعودتك
            </h2>
            <p className="mt-3 leading-7 text-[#718287]">
              أدخل بيانات حسابك للوصول إلى لوحة التحكم.
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
            className="space-y-5"
          >
            <Field label="البريد الإلكتروني">
              <input
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="name@example.com"
                className="form-input has-field-icon"
                dir="ltr"
              />
              <span className="field-icon-shell">
                <Mail size={18} />
              </span>
            </Field>
            <Field label="كلمة المرور">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                placeholder="••••••••"
                className="form-input has-field-icon has-field-action"
                dir="ltr"
              />
              <span className="field-icon-shell">
                <LockKeyhole size={18} />
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="field-action"
                aria-label={
                  showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#62777c]">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(event) =>
                  setForm({ ...form, remember: event.target.checked })
                }
                className="size-4 rounded accent-[#216474]"
              />
              تذكرني على هذا الجهاز
            </label>
            {mutation.isError && (
              <div
                role="alert"
                className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
              >
                {getApiErrorMessage(mutation.error)}
              </div>
            )}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary mt-2 w-full justify-center py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutation.isPending ? "جاري التحقق..." : "تسجيل الدخول"}
              <ArrowLeft size={19} />
            </button>
          </form>
          <div className="my-7 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>مستخدم جديد؟</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <Link to="/register" className="btn-secondary w-full justify-center">
            اختيار نوع الحساب
          </Link>
          <p className="mt-7 text-center text-xs leading-6 text-slate-400">
            بتسجيل الدخول أنت توافق على شروط الاستخدام وسياسة الخصوصية.
          </p>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      <span className="field-control">{children}</span>
    </label>
  );
}
