import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  getPrimaryRole,
  getRoleDefinition,
} from "../../../shared/config/roles";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  accountKeys,
  changeAccountPassword,
  getAccountProfile,
  updateAccountProfile,
} from "../api/accountApi";

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

function Field({ label, icon: Icon, children }) {
  return (
    <label>
      <span className="form-label">{label}</span>
      <div className="field-control">
        <span className="field-icon-shell">
          <Icon size={17} />
        </span>
        {children}
      </div>
    </label>
  );
}

function PasswordField({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);
  return (
    <label>
      <span className="form-label">{label}</span>
      <div className="field-control">
        <span className="field-icon-shell">
          <KeyRound size={17} />
        </span>
        <input
          className="form-input has-field-icon !pl-12"
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          required
        />
        <button
          type="button"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#829499] transition hover:text-[#216474]"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
  );
}

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({
    queryKey: accountKeys.profile,
    queryFn: getAccountProfile,
  });
  const [profileDraft, setProfileDraft] = useState(null);
  const [password, setPassword] = useState(emptyPassword);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const profile = profileDraft ?? {
    fullName: profileQuery.data?.fullName || "",
    phoneNumber: profileQuery.data?.phoneNumber || "",
  };
  const setProfile = (updater) =>
    setProfileDraft((current) => updater(current ?? profile));

  const updateProfile = useMutation({
    mutationFn: updateAccountProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(accountKeys.profile, data);
      setProfileDraft({
        fullName: data.fullName || "",
        phoneNumber: data.phoneNumber || "",
      });
      updateUser({
        fullName: data.fullName,
        email: data.email,
        roles: data.roles,
      });
      setProfileMessage("تم حفظ بيانات الحساب بنجاح.");
    },
    onError: () => setProfileMessage(""),
  });
  const updatePassword = useMutation({
    mutationFn: changeAccountPassword,
    onSuccess: () => {
      setPassword(emptyPassword);
      setPasswordMessage("تم تغيير كلمة المرور بنجاح.");
    },
    onError: () => setPasswordMessage(""),
  });

  const role = getRoleDefinition(
    getPrimaryRole(profileQuery.data?.roles || user.roles),
  );
  const submitPassword = (event) => {
    event.preventDefault();
    setPasswordMessage("");
    if (password.newPassword.length < 8)
      return setPasswordMessage("يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف.");
    if (
      !/[a-z]/.test(password.newPassword) ||
      !/[A-Z]/.test(password.newPassword) ||
      !/\d/.test(password.newPassword) ||
      !/[^A-Za-z0-9]/.test(password.newPassword)
    )
      return setPasswordMessage(
        "استخدم حرفًا إنكليزيًا كبيرًا وصغيرًا ورقمًا ورمزًا خاصًا على الأقل.",
      );
    if (password.newPassword !== password.confirmNewPassword)
      return setPasswordMessage("تأكيد كلمة المرور غير مطابق.");
    updatePassword.mutate(password);
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.7rem] bg-[linear-gradient(135deg,#123f49,#216474)] p-6 text-white shadow-[0_20px_55px_rgba(18,63,73,.18)] lg:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-14 place-items-center rounded-2xl bg-white/12">
            <Settings size={26} />
          </span>
          <div>
            <p className="text-xs font-bold text-[#9ed7d2]">
              حسابك في مكان واحد
            </p>
            <h2 className="mt-1 text-2xl font-black">إعدادات الحساب</h2>
            <p className="mt-2 text-sm text-white/60">
              حدّث بيانات التواصل وكلمة المرور المرتبطة بحسابك.
            </p>
          </div>
        </div>
      </section>

      {profileQuery.isLoading ? (
        <section className="surface animate-pulse p-8 text-sm font-bold text-[#71858a]">
          جاري تحميل بيانات الحساب...
        </section>
      ) : profileQuery.isError ? (
        <section className="surface border-rose-100 p-6 text-sm font-bold text-rose-700">
          {getApiErrorMessage(profileQuery.error)}
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
          <div className="space-y-6">
            <form
              className="surface p-6 lg:p-7"
              onSubmit={(event) => {
                event.preventDefault();
                setProfileMessage("");
                updateProfile.mutate({
                  fullName: profile.fullName.trim(),
                  phoneNumber: profile.phoneNumber.trim() || null,
                });
              }}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
                  <UserRound size={21} />
                </span>
                <div>
                  <h3 className="font-black">البيانات الشخصية</h3>
                  <p className="mt-1 text-xs text-[#829499]">
                    تظهر هذه البيانات في أقسام حسابك.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label="الاسم الكامل" icon={UserRound}>
                  <input
                    className="form-input has-field-icon"
                    value={profile.fullName}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        fullName: event.target.value,
                      }))
                    }
                    maxLength={150}
                    required
                  />
                </Field>
                <Field label="رقم الهاتف" icon={Phone}>
                  <input
                    className="form-input has-field-icon"
                    value={profile.phoneNumber}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,
                        phoneNumber: event.target.value,
                      }))
                    }
                    inputMode="tel"
                    maxLength={30}
                    placeholder="اختياري"
                  />
                </Field>
                <Field label="البريد الإلكتروني" icon={Mail}>
                  <input
                    className="form-input has-field-icon bg-slate-50 text-[#71858a]"
                    value={profileQuery.data.email}
                    readOnly
                  />
                </Field>
              </div>
              {profileMessage && (
                <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  <CheckCircle2 size={17} />
                  {profileMessage}
                </p>
              )}
              {updateProfile.isError && (
                <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {getApiErrorMessage(updateProfile.error)}
                </p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  className="btn-primary"
                  disabled={updateProfile.isPending}
                >
                  <Save size={17} />
                  {updateProfile.isPending ? "جاري الحفظ..." : "حفظ البيانات"}
                </button>
              </div>
            </form>

            <form className="surface p-6 lg:p-7" onSubmit={submitPassword}>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <ShieldCheck size={21} />
                </span>
                <div>
                  <h3 className="font-black">تغيير كلمة المرور</h3>
                  <p className="mt-1 text-xs text-[#829499]">
                    8 أحرف على الأقل تتضمن حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا
                    خاصًا.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <PasswordField
                  label="كلمة المرور الحالية"
                  value={password.currentPassword}
                  onChange={(event) =>
                    setPassword((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                />
                <PasswordField
                  label="كلمة المرور الجديدة"
                  value={password.newPassword}
                  onChange={(event) =>
                    setPassword((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                />
                <PasswordField
                  label="تأكيد كلمة المرور الجديدة"
                  value={password.confirmNewPassword}
                  onChange={(event) =>
                    setPassword((current) => ({
                      ...current,
                      confirmNewPassword: event.target.value,
                    }))
                  }
                />
              </div>
              {passwordMessage && (
                <p
                  className={`mt-5 rounded-xl px-4 py-3 text-sm font-bold ${passwordMessage.startsWith("تم") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
                >
                  {passwordMessage}
                </p>
              )}
              {updatePassword.isError && (
                <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                  {getApiErrorMessage(updatePassword.error)}
                </p>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  className="btn-primary"
                  disabled={updatePassword.isPending}
                >
                  <KeyRound size={17} />
                  {updatePassword.isPending
                    ? "جاري التغيير..."
                    : "تغيير كلمة المرور"}
                </button>
              </div>
            </form>
          </div>

          <aside className="surface h-fit p-6">
            <span className="grid size-14 place-items-center rounded-2xl bg-[#173f49] text-xl font-black text-white">
              {profileQuery.data.fullName?.trim()?.[0] || "ح"}
            </span>
            <h3 className="mt-4 text-xl font-black">
              {profileQuery.data.fullName}
            </h3>
            <p className="mt-1 text-sm text-[#71858a]">
              {profileQuery.data.email}
            </p>
            <div className="mt-6 space-y-3 border-t border-[#174b57]/8 pt-5">
              <div className="flex items-center justify-between rounded-xl bg-[#f7faf9] p-3">
                <span className="text-xs text-[#71858a]">نوع الحساب</span>
                <strong className="text-sm">{role.label}</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#f7faf9] p-3">
                <span className="flex items-center gap-1.5 text-xs text-[#71858a]">
                  <CalendarDays size={14} />
                  تاريخ الانضمام
                </span>
                <strong className="text-xs">
                  {new Intl.DateTimeFormat("ar-SY", {
                    dateStyle: "medium",
                  }).format(new Date(profileQuery.data.createdAtUtc))}
                </strong>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                <span className="text-xs text-emerald-700">حالة الحساب</span>
                <strong className="text-xs text-emerald-700">
                  {profileQuery.data.isActive ? "نشط" : "غير نشط"}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
