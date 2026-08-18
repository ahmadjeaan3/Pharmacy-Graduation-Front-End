import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  ImagePlus,
  KeyRound,
  Mail,
  Phone,
  Save,
  Settings,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { ProfileAvatar } from "../../../shared/components/ProfileAvatar";
import {
  getPrimaryRole,
  getRoleDefinition,
} from "../../../shared/config/roles";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  accountKeys,
  changeAccountPassword,
  deleteAccountAvatar,
  getAccountProfile,
  updateAccountAvatar,
  updateAccountProfile,
} from "../api/accountApi";

const USER_HERO_IMAGE = "/assets/app/home/hero_search.png";

const PHARMACY_HERO_IMAGE = "/assets/app/pharmacy.png";

const emptyPassword = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const inputClassName =
  "h-11 w-full rounded-lg border border-[rgba(102,102,102,.16)] bg-white px-4 text-[14px] text-[#333333] outline-none transition placeholder:text-[12px] placeholder:font-normal placeholder:text-[#A5A5A5] hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10";

function FormField({ label, icon: Icon, children, className = "" }) {
  return (
    <label className={className}>
      <span className="mb-2 flex items-center gap-2 text-[12px] font-medium text-[#216474]">
        {Icon ? <Icon size={15} strokeWidth={1.8} /> : null}

        {label}
      </span>

      {children}
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  t,
  isArabic,
  direction,
  autoComplete = "new-password",
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      <span className="mb-2 flex items-center gap-2 text-[12px] font-medium text-[#216474]">
        <KeyRound size={15} strokeWidth={1.8} />

        {label}
      </span>

      <div dir={direction} className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          placeholder={t("أدخل كلمة المرور")}
          className={`h-11 w-full rounded-lg border border-[rgba(102,102,102,.16)] bg-white py-0 text-[14px] text-[#333333] outline-none transition placeholder:text-[12px] placeholder:font-normal placeholder:text-[#A5A5A5] hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
            isArabic ? "pl-11 pr-4 text-right" : "pr-11 pl-4 text-left"
          }`}
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? t("إخفاء كلمة المرور") : t("إظهار كلمة المرور")}
          title={visible ? t("إخفاء كلمة المرور") : t("إظهار كلمة المرور")}
          className={`absolute top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-md bg-white text-[#6E969E] transition hover:bg-[#EAF4F3] hover:text-[#216474] ${
            isArabic ? "left-2.5" : "right-2.5"
          }`}
        >
          {visible ? (
            <EyeOff size={18} strokeWidth={1.8} />
          ) : (
            <Eye size={18} strokeWidth={1.8} />
          )}
        </button>
      </div>
    </label>
  );
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();

  const isArabic = currentLanguage === "ar";

  const direction = isArabic ? "rtl" : "ltr";

  const { user, updateUser } = useAuth();

  const userRoles = user?.roles || [];

  const isPharmacyAccount = userRoles.some(
    (roleName) => String(roleName).toLowerCase() === "pharmacy",
  );

  const settingsHeroImage = isPharmacyAccount
    ? PHARMACY_HERO_IMAGE
    : USER_HERO_IMAGE;

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

      setProfileMessage(t("تم حفظ بيانات الحساب بنجاح."));
    },

    onError: () => setProfileMessage(""),
  });

  const updatePassword = useMutation({
    mutationFn: changeAccountPassword,

    onSuccess: () => {
      setPassword(emptyPassword);

      setPasswordMessage(t("تم تغيير كلمة المرور بنجاح."));
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
    onSuccess: (data) => syncAvatar(data, t("تم تحديث الصورة الشخصية بنجاح.")),
    onError: (error) => setAvatarMessage(getApiErrorMessage(error)),
  });

  const deleteAvatar = useMutation({
    mutationFn: deleteAccountAvatar,
    onSuccess: (data) => syncAvatar(data, t("تم حذف الصورة الشخصية.")),
    onError: (error) => setAvatarMessage(getApiErrorMessage(error)),
  });

  const role = getRoleDefinition(
    getPrimaryRole(profileQuery.data?.roles || user?.roles || []),
  );

  const submitPassword = (event) => {
    event.preventDefault();
    setPasswordMessage("");

    if (password.newPassword.length < 8) {
      setPasswordMessage(t("يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف."));

      return;
    }

    if (
      !/[a-z]/.test(password.newPassword) ||
      !/[A-Z]/.test(password.newPassword) ||
      !/\d/.test(password.newPassword) ||
      !/[^A-Za-z0-9]/.test(password.newPassword)
    ) {
      setPasswordMessage(
        t(
          "استخدم حرفًا إنكليزيًا كبيرًا وصغيرًا ورقمًا ورمزًا خاصًا على الأقل.",
        ),
      );

      return;
    }

    if (password.newPassword !== password.confirmNewPassword) {
      setPasswordMessage(t("تأكيد كلمة المرور غير مطابق."));

      return;
    }

    updatePassword.mutate(password);
  };

  const passwordSucceeded =
    passwordMessage === t("تم تغيير كلمة المرور بنجاح.");

  if (profileQuery.isLoading) {
    return (
      <section className="grid min-h-[320px] place-items-center rounded-xl border border-[#DCE8EA] bg-white px-6 text-[14px] font-semibold text-[#71858A]">
        {t("جاري تحميل بيانات الحساب...")}
      </section>
    );
  }

  if (profileQuery.isError) {
    return (
      <section className="rounded-xl border border-rose-100 bg-white p-6 text-[14px] font-semibold text-rose-700">
        {getApiErrorMessage(profileQuery.error)}
      </section>
    );
  }

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="m-0 min-h-screen w-full bg-[#F7F9FA] p-0 text-[#333333]"
    >
      {/* Hero */}
      <section
        className="
          relative isolate
          -mt-6 overflow-hidden
          bg-[#0D7586]
          text-white
          sm:-mt-7
          lg:-mt-8
        "
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <img
          src={settingsHeroImage}
          alt=""
          aria-hidden="true"
          className={`
            absolute inset-0 -z-20
            h-full w-full
            select-none
            object-cover object-center
            opacity-80
            ${
              isPharmacyAccount
                ? isArabic
                  ? "scale-x-[-1]"
                  : "scale-x-100"
                : isArabic
                  ? "scale-x-100"
                  : "scale-x-[-1]"
            }
          `}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background: isArabic
              ? "linear-gradient(270deg,rgba(0,63,76,.48) 0%,rgba(3,110,126,.60) 48%,rgba(0,60,73,.18) 100%)"
              : "linear-gradient(90deg,rgba(0,63,76,.48) 0%,rgba(3,110,126,.60) 48%,rgba(0,60,73,.18) 100%)",
          }}
        />

        <div
          className="
            relative z-10
            mx-auto flex min-h-[220px]
            w-full max-w-[1240px]
            items-center
            px-5 py-9
            sm:px-7
            lg:px-8
          "
        >
          <div
            className={`flex items-center gap-4 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/[.10] text-[#E6F3F6] backdrop-blur-sm">
              <Settings size={25} strokeWidth={1.8} />
            </span>

            <div className={`min-w-0 ${isArabic ? "text-right" : "text-left"}`}>
              <h1 className="text-[28px] font-bold leading-tight text-white">
                {t("إعدادات الحساب")}
              </h1>

              <p className="mt-3 max-w-[620px] text-[14px] leading-7 text-[#D6D6D6]">
                {t("حدّث بيانات التواصل وكلمة المرور المرتبطة بحسابك.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="mx-auto w-full max-w-[1240px] px-5 pb-12 pt-8 sm:px-7 lg:px-8">
        <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)]">
          <div className="space-y-5">
            <section className="rounded-xl border border-[rgba(102,102,102,.16)] bg-white p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative w-fit shrink-0">
                  <ProfileAvatar
                    user={profileQuery.data}
                    sizeClass="size-24"
                    className="rounded-2xl border-4 border-white shadow-[0_12px_30px_rgba(23,75,87,.14)]"
                    fallbackIcon
                  />
                  <button
                    type="button"
                    onClick={() => avatarInput.current?.click()}
                    className="absolute -bottom-2 -end-2 grid size-9 place-items-center rounded-xl border-4 border-white bg-[#216474] text-white shadow-md"
                    aria-label={t("تغيير الصورة الشخصية")}
                  >
                    <Camera size={15} />
                  </button>
                </div>
                <div
                  className={`min-w-0 flex-1 ${isArabic ? "text-right" : "text-left"}`}
                >
                  <h2 className="text-[18px] font-semibold text-[#333333]">
                    {t("الصورة الشخصية")}
                  </h2>
                  <p className="mt-1 text-[13px] leading-6 text-[#A5A5A5]">
                    {t("JPG أو PNG أو WebP، بحجم لا يتجاوز 5 ميغابايت.")}
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
                      if (file.size > 5 * 1024 * 1024) {
                        setAvatarMessage(
                          t("حجم الصورة يجب ألا يتجاوز 5 ميغابايت."),
                        );
                        return;
                      }
                      avatarMutation.mutate(file);
                    }}
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={avatarMutation.isPending}
                      onClick={() => avatarInput.current?.click()}
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#174B57] px-4 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      <ImagePlus size={16} />
                      {avatarMutation.isPending
                        ? t("جاري رفع الصورة...")
                        : t("رفع أو تغيير الصورة")}
                    </button>
                    {profileQuery.data.hasProfileImage && (
                      <button
                        type="button"
                        disabled={deleteAvatar.isPending}
                        onClick={() => deleteAvatar.mutate()}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-rose-200 px-4 text-sm font-semibold text-rose-700 disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        {deleteAvatar.isPending
                          ? t("جاري الحذف...")
                          : t("حذف الصورة")}
                      </button>
                    )}
                  </div>
                  {avatarMessage && (
                    <p className="mt-3 text-sm font-semibold text-[#216474]">
                      {avatarMessage}
                    </p>
                  )}
                </div>
              </div>
            </section>
            {/* Personal information */}
            <form
              onSubmit={(event) => {
                event.preventDefault();

                setProfileMessage("");

                updateProfile.mutate({
                  fullName: profile.fullName.trim(),

                  phoneNumber: profile.phoneNumber.trim() || null,
                });
              }}
              className="rounded-xl border border-[rgba(102,102,102,.16)] bg-white p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={isArabic ? "text-right" : "text-left"}>
                  <h2 className="text-[18px] font-semibold text-[#333333]">
                    {t("البيانات الشخصية")}
                  </h2>

                  <p className="mt-1 text-[13px] leading-6 text-[#A5A5A5]">
                    {t("عدّل معلومات الحساب الأساسية وبيانات التواصل.")}
                  </p>
                </div>

                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#EAF4F3] text-[#216474]">
                  <UserRound size={20} strokeWidth={1.8} />
                </span>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <FormField label={t("الاسم الكامل")} icon={UserRound}>
                  <input
                    dir={direction}
                    value={profile.fullName}
                    onChange={(event) =>
                      setProfile((current) => ({
                        ...current,

                        fullName: event.target.value,
                      }))
                    }
                    maxLength={150}
                    required
                    placeholder={t("أدخل الاسم الكامل")}
                    className={`${inputClassName} ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  />
                </FormField>

                <FormField label={t("رقم الهاتف")} icon={Phone}>
                  <div
                    dir="ltr"
                    className="flex h-11 overflow-hidden rounded-lg border border-[rgba(102,102,102,.16)] bg-white transition hover:border-[#AFC9CD] focus-within:border-[#216474] focus-within:ring-2 focus-within:ring-[#216474]/10"
                  >
                    <span className="flex w-[76px] shrink-0 items-center justify-center border-r border-[rgba(102,102,102,.16)] text-[13px] font-medium text-[#666666]">
                      +963
                    </span>

                    <input
                      value={profile.phoneNumber}
                      onChange={(event) =>
                        setProfile((current) => ({
                          ...current,

                          phoneNumber: event.target.value,
                        }))
                      }
                      inputMode="tel"
                      maxLength={30}
                      placeholder={t("أدخل رقم الهاتف")}
                      className={`min-w-0 flex-1 border-0 bg-transparent px-4 text-[14px] text-[#333333] outline-none placeholder:text-[12px] placeholder:font-normal placeholder:text-[#A5A5A5] ${
                        isArabic ? "text-right" : "text-left"
                      }`}
                    />
                  </div>
                </FormField>

                <FormField
                  label={t("البريد الإلكتروني")}
                  icon={Mail}
                  className="md:col-span-2"
                >
                  <input
                    dir="ltr"
                    value={profileQuery.data.email || ""}
                    readOnly
                    placeholder={t("أدخل البريد الإلكتروني")}
                    className="h-11 w-full rounded-lg border border-[rgba(102,102,102,.16)] bg-[#FAFCFC] px-4 text-left text-[14px] text-[#829499] outline-none placeholder:text-[12px] placeholder:font-normal placeholder:text-[#A5A5A5]"
                  />
                </FormField>
              </div>

              {profileMessage && (
                <p className="mt-5 flex items-center gap-2 rounded-lg border border-[#CFE4E7] bg-[#EAF4F3] px-4 py-3 text-[14px] font-semibold text-[#216474]">
                  <CheckCircle2 size={17} />

                  {profileMessage}
                </p>
              )}

              {updateProfile.isError && (
                <p className="mt-5 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-[14px] font-semibold text-rose-700">
                  {getApiErrorMessage(updateProfile.error)}
                </p>
              )}

              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#174B57] px-5 text-[14px] font-semibold text-white transition hover:bg-[#123F49] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />

                {updateProfile.isPending
                  ? t("جاري الحفظ...")
                  : t("حفظ البيانات")}
              </button>
            </form>

            {/* Change password */}
            <form
              onSubmit={submitPassword}
              className="rounded-xl border border-[rgba(102,102,102,.16)] bg-white p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={isArabic ? "text-right" : "text-left"}>
                  <h2 className="text-[18px] font-semibold text-[#333333]">
                    {t("تغيير كلمة المرور")}
                  </h2>

                  <p className="mt-1 text-[13px] leading-6 text-[#A5A5A5]">
                    {t(
                      "8 أحرف على الأقل تتضمن حرفًا كبيرًا وصغيرًا ورقمًا ورمزًا خاصًا.",
                    )}
                  </p>
                </div>

                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#FFF7DF] text-[#DFAE0D]">
                  <KeyRound size={20} strokeWidth={1.8} />
                </span>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <PasswordField
                  label={t("كلمة المرور الحالية")}
                  value={password.currentPassword}
                  onChange={(event) =>
                    setPassword((current) => ({
                      ...current,

                      currentPassword: event.target.value,
                    }))
                  }
                  t={t}
                  isArabic={isArabic}
                  direction={direction}
                  autoComplete="current-password"
                />

                <PasswordField
                  label={t("كلمة المرور الجديدة")}
                  value={password.newPassword}
                  onChange={(event) =>
                    setPassword((current) => ({
                      ...current,

                      newPassword: event.target.value,
                    }))
                  }
                  t={t}
                  isArabic={isArabic}
                  direction={direction}
                />

                <PasswordField
                  label={t("تأكيد كلمة المرور")}
                  value={password.confirmNewPassword}
                  onChange={(event) =>
                    setPassword((current) => ({
                      ...current,

                      confirmNewPassword: event.target.value,
                    }))
                  }
                  t={t}
                  isArabic={isArabic}
                  direction={direction}
                />
              </div>

              {passwordMessage && (
                <p
                  className={`mt-5 rounded-lg border px-4 py-3 text-[14px] font-semibold ${
                    passwordSucceeded
                      ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#216474]"
                      : "border-[#E8DDBE] bg-[#FFF8E8] text-[#A87818]"
                  }`}
                >
                  {passwordMessage}
                </p>
              )}

              {updatePassword.isError && (
                <p className="mt-5 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-[14px] font-semibold text-rose-700">
                  {getApiErrorMessage(updatePassword.error)}
                </p>
              )}

              <button
                type="submit"
                disabled={updatePassword.isPending}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#174B57] px-5 text-[14px] font-semibold text-white transition hover:bg-[#123F49] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <KeyRound size={16} />

                {updatePassword.isPending
                  ? t("جاري التغيير...")
                  : t("تغيير كلمة المرور")}
              </button>
            </form>
          </div>

          {/* Account card */}
          <aside className="space-y-5">
            <section className="rounded-xl border border-[rgba(102,102,102,.16)] bg-white p-6">
              <div
                className={`flex items-center gap-4 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                <div className="grid size-16 shrink-0 place-items-center rounded-full bg-[#EAF4F3] text-[#216474]">
                  <UserRound size={30} strokeWidth={1.8} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[18px] font-semibold text-[#333333]">
                    {profileQuery.data.fullName}
                  </h2>

                  <p
                    dir="ltr"
                    className={`mt-1 truncate text-[13px] text-[#666666] ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {profileQuery.data.email}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <AccountRow
                  icon={Mail}
                  label={t("البريد الإلكتروني")}
                  value={profileQuery.data.email}
                  direction={direction}
                />

                <AccountRow
                  icon={Phone}
                  label={t("رقم الهاتف")}
                  value={profileQuery.data.phoneNumber || t("غير محدد")}
                  direction={direction}
                />

                <AccountRow
                  icon={Heart}
                  label={t("الدور")}
                  value={t(role?.label || "غير محدد")}
                  direction={direction}
                />

                <AccountRow
                  icon={CalendarDays}
                  label={t("تاريخ إنشاء الحساب")}
                  value={
                    profileQuery.data.createdAtUtc
                      ? new Intl.DateTimeFormat(
                          currentLanguage === "ar"
                            ? "ar-SY"
                            : currentLanguage === "tr"
                              ? "tr-TR"
                              : "en-US",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        ).format(new Date(profileQuery.data.createdAtUtc))
                      : t("غير محدد")
                  }
                  direction={direction}
                />
              </div>
            </section>

            <section className="rounded-xl border border-[#DCE8EA] bg-[#F8FBFB] p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-[#216474]"
                  size={20}
                />

                <div className={isArabic ? "text-right" : "text-left"}>
                  <h3 className="text-[15px] font-semibold text-[#333333]">
                    {t("حماية الحساب")}
                  </h3>

                  <p className="mt-2 text-[13px] leading-6 text-[#666666]">
                    {t(
                      "احرص على استخدام كلمة مرور قوية وعدم مشاركتها مع أي شخص. ننصح بتغييرها بشكل دوري.",
                    )}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}

function AccountRow({ icon: Icon, label, value, direction = "rtl" }) {
  return (
    <div
      dir={direction}
      className="flex items-center gap-3 rounded-lg border border-[#E6EEF0] bg-[#FAFCFC] px-4 py-3"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#EAF4F3] text-[#216474]">
        <Icon size={17} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-[#8EA0A4]">{label}</p>

        <p className="mt-1 truncate text-[14px] font-medium text-[#333333]">
          {value}
        </p>
      </div>
    </div>
  );
}
