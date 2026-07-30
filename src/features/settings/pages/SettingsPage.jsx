import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
  Languages,
  Mail,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  getPrimaryRole,
  getRoleDefinition,
} from "../../../shared/config/roles";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  accountKeys,
  changeAccountPassword,
  deleteAccountAvatar,
  getAccountProfile,
  updateAccountAvatar,
  updateAccountProfile,
} from "../api/accountApi";
import { ProfileAvatar } from "../../../shared/components/ProfileAvatar";
import { LanguageSwitcher } from "../../../shared/components/LanguageSwitcher";

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
          className="form-input has-field-icon !pe-12"
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
  const [avatarMessage, setAvatarMessage] = useState("");
  const avatarInput = useRef(null);

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
        hasProfileImage: data.hasProfileImage,
        profileImageUpdatedAtUtc: data.profileImageUpdatedAtUtc,
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
  const syncAvatar = (data, message) => {
    queryClient.setQueryData(accountKeys.profile, data);
    updateUser({
      hasProfileImage: data.hasProfileImage,
      profileImageUpdatedAtUtc: data.profileImageUpdatedAtUtc,
    });
    setAvatarMessage(message);
  };
  const avatarMutation = useMutation({
    mutationFn: updateAccountAvatar,
    onSuccess: (data) => syncAvatar(data, "تم تحديث الصورة الشخصية بنجاح."),
    onError: (error) => setAvatarMessage(getApiErrorMessage(error)),
  });
  const deleteAvatar = useMutation({
    mutationFn: deleteAccountAvatar,
    onSuccess: (data) => syncAvatar(data, "تم حذف الصورة الشخصية."),
    onError: (error) => setAvatarMessage(getApiErrorMessage(error)),
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
            <section className="surface overflow-hidden">
              <div className="bg-[linear-gradient(120deg,#f5faf9,#edf6f4)] p-6 lg:p-7">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="relative w-fit">
                    <ProfileAvatar
                      user={profileQuery.data}
                      sizeClass="size-28"
                      className="rounded-[1.7rem] border-4 border-white shadow-[0_14px_35px_rgba(23,75,87,.15)]"
                      fallbackIcon
                    />
                    <button
                      type="button"
                      onClick={() => avatarInput.current?.click()}
                      className="absolute -bottom-2 -end-2 grid size-10 place-items-center rounded-xl border-4 border-white bg-[#216474] text-white shadow-lg transition hover:bg-[#174b57]"
                      aria-label="تغيير الصورة الشخصية"
                    >
                      <Camera size={17} />
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-[#216474]">
                      هويتك داخل المنصة
                    </p>
                    <h3 className="mt-1 text-xl font-black text-[#29464d]">
                      الصورة الشخصية
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-[#71858a]">
                      اختر صورة واضحة بصيغة JPG أو PNG أو WebP، وبحجم لا يتجاوز
                      5 ميغابايت.
                    </p>
                    <input
                      ref={avatarInput}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        setAvatarMessage("");
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024)
                          return setAvatarMessage(
                            "حجم الصورة يجب ألا يتجاوز 5 ميغابايت.",
                          );
                        avatarMutation.mutate(file);
                      }}
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={avatarMutation.isPending}
                        onClick={() => avatarInput.current?.click()}
                        className="btn-primary"
                      >
                        <ImagePlus size={17} />
                        {avatarMutation.isPending
                          ? "جاري رفع الصورة..."
                          : profileQuery.data.hasProfileImage
                            ? "تغيير الصورة"
                            : "رفع صورة"}
                      </button>
                      {profileQuery.data.hasProfileImage && (
                        <button
                          type="button"
                          disabled={deleteAvatar.isPending}
                          onClick={() => deleteAvatar.mutate()}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-white px-4 py-2.5 text-sm font-black text-rose-600 transition hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                          {deleteAvatar.isPending
                            ? "جاري الحذف..."
                            : "حذف الصورة"}
                        </button>
                      )}
                    </div>
                    {avatarMessage && (
                      <p className="mt-3 text-xs font-bold text-[#216474]">
                        {avatarMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

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

          <aside className="space-y-6">
            <section className="surface h-fit p-6">
              <ProfileAvatar
                user={profileQuery.data}
                sizeClass="size-16"
                className="bg-[#173f49] text-xl text-white"
                fallbackIcon
              />
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
            </section>

            <section className="surface p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-violet-50 text-violet-700">
                  <Languages size={20} />
                </span>
                <div>
                  <h3 className="font-black">لغة المنصة</h3>
                  <p className="mt-1 text-xs text-[#829499]">
                    غيّر لغة العرض واتجاه الواجهة.
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-[#174b57]/8 bg-[#f7faf9] p-3">
                <LanguageSwitcher />
              </div>
            </section>

            <section className="rounded-[1.4rem] border border-[#216474]/10 bg-[#173f49] p-6 text-white shadow-[0_16px_40px_rgba(23,63,73,.12)]">
              <ShieldCheck size={22} className="text-[#f5cb72]" />
              <h3 className="mt-4 font-black">نصائح أمان الحساب</h3>
              <ul className="mt-3 space-y-2 text-xs leading-6 text-white/60">
                <li>• استخدم كلمة مرور مختلفة عن حساباتك الأخرى.</li>
                <li>• لا تشارك بيانات الدخول أو رموز الاستلام.</li>
                <li>• حدّث رقم الهاتف عند تغييره.</li>
              </ul>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
