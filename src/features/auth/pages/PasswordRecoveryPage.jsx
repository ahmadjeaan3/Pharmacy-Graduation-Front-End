import { useMutation } from "@tanstack/react-query";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { forgotPassword, resetPassword } from "../api/authApi";

export function PasswordRecoveryPage() {
  const [step, setStep] = useState("request");
  const [form, setForm] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [developmentToken, setDevelopmentToken] = useState("");

  const requestMutation = useMutation({
    mutationFn: () => forgotPassword(form.email.trim()),
    onSuccess: (data) => {
      setDevelopmentToken(data?.developmentToken || "");
      setForm((current) => ({
        ...current,
        token: data?.developmentToken || current.token,
      }));
      setStep("reset");
    },
  });
  const resetMutation = useMutation({
    mutationFn: () => resetPassword(form),
    onSuccess: () => setStep("done"),
  });

  const change = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <main
      dir="rtl"
      className="grid min-h-screen place-items-center bg-[#F5F8F7] px-4 py-10"
    >
      <section className="w-full max-w-lg rounded-3xl border border-[#DCE8EA] bg-white p-6 shadow-[0_24px_70px_rgba(23,75,87,.12)] sm:p-9">
        <span className="grid size-14 place-items-center rounded-2xl bg-[#EAF4F3] text-[#174B57]">
          <KeyRound size={27} />
        </span>
        <h1 className="mt-5 text-2xl font-black text-[#174B57]">
          استعادة كلمة المرور
        </h1>
        <p className="mt-2 text-sm leading-7 text-[#71858A]">
          {step === "request" && "أدخل بريد حسابك لنرسل رمز إعادة التعيين."}
          {step === "reset" && "أدخل الرمز ثم اختر كلمة مرور قوية وجديدة."}
          {step === "done" &&
            "تم تحديث كلمة المرور بنجاح، ويمكنك تسجيل الدخول الآن."}
        </p>

        {step === "done" ? (
          <Link to="/login" className="btn-primary mt-7 w-full justify-center">
            العودة إلى تسجيل الدخول <ArrowRight size={17} />
          </Link>
        ) : (
          <form
            className="mt-7 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (step === "request") requestMutation.mutate();
              else resetMutation.mutate();
            }}
          >
            <RecoveryField label="البريد الإلكتروني" icon={Mail}>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={change("email")}
                disabled={step === "reset"}
                className="w-full bg-transparent outline-none disabled:opacity-70"
              />
            </RecoveryField>
            {step === "reset" && (
              <>
                <RecoveryField label="رمز إعادة التعيين" icon={KeyRound}>
                  <input
                    required
                    value={form.token}
                    onChange={change("token")}
                    className="w-full bg-transparent outline-none"
                  />
                </RecoveryField>
                {developmentToken && (
                  <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                    رمز بيئة التطوير تم تعبئته تلقائيًا. في الإنتاج يصل الرمز
                    عبر خدمة البريد.
                  </p>
                )}
                <RecoveryField label="كلمة المرور الجديدة" icon={KeyRound}>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={form.newPassword}
                    onChange={change("newPassword")}
                    className="w-full bg-transparent outline-none"
                  />
                </RecoveryField>
                <RecoveryField label="تأكيد كلمة المرور" icon={KeyRound}>
                  <input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={form.confirmNewPassword}
                    onChange={change("confirmNewPassword")}
                    className="w-full bg-transparent outline-none"
                  />
                </RecoveryField>
              </>
            )}
            {(requestMutation.isError || resetMutation.isError) && (
              <p
                role="alert"
                className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm font-bold text-rose-700"
              >
                {getApiErrorMessage(
                  requestMutation.error || resetMutation.error,
                )}
              </p>
            )}
            <button
              disabled={requestMutation.isPending || resetMutation.isPending}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {step === "request" ? "إرسال الرمز" : "حفظ كلمة المرور الجديدة"}
            </button>
          </form>
        )}
        {step !== "done" && (
          <Link
            to="/login"
            className="mt-5 block text-center text-sm font-bold text-[#216474]"
          >
            العودة إلى تسجيل الدخول
          </Link>
        )}
      </section>
    </main>
  );
}

function RecoveryField({ label, icon: Icon, children }) {
  return (
    <label className="block text-xs font-bold text-[#216474]">
      <span>{label}</span>
      <span className="mt-2 flex h-12 items-center gap-3 rounded-xl border border-[#BFD2D6] bg-[#F8FBFB] px-4 text-[#174B57] focus-within:border-[#216474]">
        <Icon size={17} />
        {children}
      </span>
    </label>
  );
}
