import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  Download,
  FileCheck2,
  FileText,
  FileUp,
  LoaderCircle,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import {
  downloadVerificationDocument,
  getMyOrganization,
  getOrganizationVerification,
  organizationKeys,
  updateOrganizationProfile,
  uploadVerificationDocument,
} from "../api/organizationApi";
import {
  documentTypeLabel,
  documentTypes,
  formatFileSize,
  formatOrgDate,
  verificationMeta,
} from "../utils/organizationFormatters";

const PROFILE_HERO_IMAGE =
  "/assets/app/organization/organization-dashboard-hero.png";

const initialForm = {
  organizationName: "",
  registrationNumber: "",
  phoneNumber: "",
  city: "",
  area: "",
  address: "",
  description: "",
};

export function OrganizationProfilePage() {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState(null);
  const [documentType, setDocumentType] = useState("RegistrationCertificate");
  const [file, setFile] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const profile = useQuery({
    queryKey: organizationKeys.profile,
    queryFn: getMyOrganization,
  });

  const verification = useQuery({
    queryKey: organizationKeys.verification,
    queryFn: getOrganizationVerification,
  });

  useEffect(() => {
    if (!profile.data) return;

    setForm({
      organizationName: profile.data.organizationName || "",
      registrationNumber: profile.data.registrationNumber || "",
      phoneNumber: profile.data.phoneNumber || "",
      city: profile.data.city || "",
      area: profile.data.area || "",
      address: profile.data.address || "",
      description: profile.data.description || "",
    });
  }, [profile.data]);

  const refresh = async () =>
    Promise.all([
      client.invalidateQueries({
        queryKey: organizationKeys.profile,
      }),
      client.invalidateQueries({
        queryKey: organizationKeys.dashboard,
      }),
      client.invalidateQueries({
        queryKey: organizationKeys.verification,
      }),
    ]);

  const save = useMutation({
    mutationFn: updateOrganizationProfile,

    onSuccess: async () => {
      setNotice({
        ok: true,
        text: t("تم حفظ بيانات المنظمة بنجاح."),
      });

      await refresh();
    },

    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const upload = useMutation({
    mutationFn: uploadVerificationDocument,

    onSuccess: async () => {
      setNotice({
        ok: true,
        text: t("تم رفع المستند وإرساله للمراجعة بنجاح."),
      });

      setFile(null);
      await refresh();
    },

    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const change = (key) => (event) =>
    setForm((old) => ({
      ...old,
      [key]: event.target.value,
    }));

  const submitDocument = (event) => {
    event.preventDefault();
    setNotice(null);

    if (!file) {
      setNotice({
        ok: false,
        text: t("اختر المستند الذي تريد رفعه."),
      });
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "png", "jpg", "jpeg"].includes(extension)) {
      setNotice({
        ok: false,
        text: t("الصيغ المقبولة هي PDF وPNG وJPG فقط."),
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setNotice({
        ok: false,
        text: t("يجب ألا يتجاوز حجم المستند 10 ميغابايت."),
      });
      return;
    }

    upload.mutate({
      documentType,
      file,
    });
  };

  const download = async (document) => {
    try {
      setDownloadingId(document.documentId);

      const response = await downloadVerificationDocument(document.documentId);

      const url = URL.createObjectURL(response.data);

      const anchor = window.document.createElement("a");

      anchor.href = url;
      anchor.download = document.originalFileName;
      anchor.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (profile.isLoading || verification.isLoading) {
    return <UserLoadingState label={t("جاري تحميل ملف المنظمة...")} />;
  }

  if (profile.isError || verification.isError) {
    return (
      <UserErrorState
        message={getApiErrorMessage(profile.error || verification.error)}
        onRetry={() => {
          profile.refetch();
          verification.refetch();
        }}
      />
    );
  }

  const verificationData = verification.data;

  const status =
    verificationMeta[verificationData.verificationStatus] ||
    verificationMeta.PendingDocuments;

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="min-h-[calc(100vh-164px)] space-y-5 bg-[#F4F8F8]"
    >
      {/* Hero */}
      <section className="relative h-[198px] overflow-hidden rounded-xl bg-[#0D5360] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${PROFILE_HERO_IMAGE}")`,
          }}
        />

        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            isArabic
              ? "bg-[linear-gradient(270deg,rgba(8,78,89,.96)_0%,rgba(8,78,89,.78)_48%,rgba(8,78,89,.22)_100%)]"
              : "bg-[linear-gradient(90deg,rgba(8,78,89,.96)_0%,rgba(8,78,89,.78)_48%,rgba(8,78,89,.22)_100%)]"
          }`}
        />

        <div className="relative z-10 flex h-full items-center px-8">
          <div
            className={`flex min-w-0 flex-col items-start ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-sm">
                <FileText size={21} strokeWidth={1.8} />
              </span>

              <h1 className="text-[28px] font-bold leading-none text-white">
                {t("الملف والتحقق")}
              </h1>
            </div>

            <p className="mt-4 max-w-[700px] text-sm leading-7 text-white/75">
              {t(
                "حدّث بيانات المنظمة وارفع المستندات الرسمية المطلوبة ليتمكن فريق الإدارة من مراجعتها واعتماد الحساب.",
              )}
            </p>
          </div>
        </div>
      </section>
      {/* Notice */}
      {notice && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-bold ${
            notice.ok
              ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#216474]"
              : "border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Main content */}
      <section className="grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
        {/* Organization data */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setNotice(null);
            save.mutate(form);
          }}
          className="rounded-xl border border-[#DCE8EA] bg-white p-6 shadow-[0_8px_30px_rgba(23,75,87,.04)]"
        >
          <div className="flex items-center gap-3 border-b border-[#E7EFF0] pb-5">
            <span className="grid size-10 place-items-center rounded-xl bg-[#E6F3F6] text-[#216474]">
              <Building2 size={19} />
            </span>

            <div className={isArabic ? "text-right" : "text-left"}>
              <h2 className="font-bold text-[#29464D]">
                {t("بيانات المنظمة")}
              </h2>

              <p className="mt-1 text-xs text-[#93A4A8]">
                {t("تظهر هذه البيانات للمستفيدين والمتبرعين")}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label={t("اسم المنظمة")}>
              <input
                required
                maxLength={200}
                value={form.organizationName}
                onChange={change("organizationName")}
                dir={direction}
                className={`h-11 w-full rounded-lg border border-[#D8E5E7] bg-white px-4 text-sm text-[#36565D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              />
            </Field>

            <Field label={t("رقم التسجيل")}>
              <input
                required
                maxLength={100}
                value={form.registrationNumber}
                onChange={change("registrationNumber")}
                dir={direction}
                className={`h-11 w-full rounded-lg border border-[#D8E5E7] bg-white px-4 text-sm text-[#36565D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              />
            </Field>

            <Field label={t("رقم الهاتف")}>
              <input
                required
                maxLength={30}
                dir="ltr"
                value={form.phoneNumber}
                onChange={change("phoneNumber")}
                className="h-11 w-full rounded-lg border border-[#D8E5E7] bg-white px-4 text-left text-sm text-[#36565D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
              />
            </Field>

            <Field label={t("المدينة")}>
              <input
                required
                maxLength={100}
                value={form.city}
                onChange={change("city")}
                dir={direction}
                className={`h-11 w-full rounded-lg border border-[#D8E5E7] bg-white px-4 text-sm text-[#36565D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              />
            </Field>

            <Field label={t("المنطقة أو الحي")}>
              <input
                required
                maxLength={100}
                value={form.area}
                onChange={change("area")}
                dir={direction}
                className={`h-11 w-full rounded-lg border border-[#D8E5E7] bg-white px-4 text-sm text-[#36565D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              />
            </Field>

            <Field label={t("العنوان")}>
              <input
                required
                maxLength={300}
                value={form.address}
                onChange={change("address")}
                dir={direction}
                className={`h-11 w-full rounded-lg border border-[#D8E5E7] bg-white px-4 text-sm text-[#36565D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              />
            </Field>

            <label className="md:col-span-2">
              <span className="mb-2 block text-xs font-bold text-[#3F646C]">
                {t("نبذة عن المنظمة")}
              </span>

              <textarea
                maxLength={2000}
                value={form.description}
                onChange={change("description")}
                dir={direction}
                placeholder={t("اكتب نبذة مختصرة عن المنظمة ونشاطها...")}
                className={`min-h-[118px] w-full resize-y rounded-lg border border-[#D8E5E7] bg-white px-4 py-3 text-sm leading-7 text-[#36565D] outline-none transition placeholder:text-[#B6C2C4] hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={save.isPending}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#174B57] px-5 text-sm font-bold text-white transition hover:bg-[#123F49] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={16} />

            {save.isPending ? t("جاري الحفظ...") : t("حفظ بيانات المنظمة")}
          </button>
        </form>
        {/* Verification side */}
        <div className="space-y-5">
          <section className="rounded-xl border border-[#DCE8EA] bg-white p-5 shadow-[0_8px_30px_rgba(23,75,87,.04)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#E6F3F6] text-[#216474]">
                  <ShieldCheck size={19} />
                </span>

                <div className={isArabic ? "text-right" : "text-left"}>
                  <h2 className="font-bold text-[#29464D]">
                    {t("حالة التحقق")}
                  </h2>

                  <p className="mt-1 text-xs text-[#93A4A8]">
                    {t("آخر حالة لملف المنظمة")}
                  </p>
                </div>
              </div>

              <VerificationBadge
                status={verificationData.verificationStatus}
                label={t(status.label)}
              />
            </div>

            <p
              className={`mt-4 text-sm leading-7 text-[#71858A] ${
                isArabic ? "text-right" : "text-left"
              }`}
            >
              {verificationData.verificationNotes ||
                (verificationData.isApproved
                  ? t("تم اعتماد المنظمة ويمكنها إدارة الحملات والطلبات.")
                  : t(
                      "ارفع المستندات الرسمية الواضحة ليتم إرسال الملف إلى المراجعة.",
                    ))}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <InfoCard
                icon={FileCheck2}
                label={t("المستندات")}
                value={verificationData.documents.length.toLocaleString(
                  currentLanguage === "ar"
                    ? "ar-SY"
                    : currentLanguage === "tr"
                      ? "tr-TR"
                      : "en-US",
                )}
                direction={direction}
              />

              <InfoCard
                icon={CalendarDays}
                label={t("تاريخ الإرسال")}
                value={t(
                  formatOrgDate(
                    verificationData.verificationSubmittedAtUtc,
                    currentLanguage,
                  ),
                )}
                direction={direction}
              />
            </div>
          </section>

          <form
            onSubmit={submitDocument}
            className="rounded-xl border border-[#DCE8EA] bg-white p-5 shadow-[0_8px_30px_rgba(23,75,87,.04)]"
          >
            <div className={isArabic ? "text-right" : "text-left"}>
              <h2 className="font-bold text-[#29464D]">
                {t("رفع مستند تحقق")}
              </h2>

              <p className="mt-1 text-xs leading-6 text-[#93A4A8]">
                {t(
                  "PDF أو صورة واضحة، بحد أقصى 10 ميغابايت. رفع مستند جديد من النوع نفسه يستبدل السابق.",
                )}
              </p>
            </div>

            <div className="mt-5 space-y-6">
              <label>
                <span className="mb-2 block text-xs font-bold text-[#3F646C]">
                  {t("نوع المستند")}
                </span>

                <div dir={direction} className="relative">
                  <select
                    value={documentType}
                    onChange={(event) => setDocumentType(event.target.value)}
                    className="h-11 w-full appearance-none rounded-lg border border-[#D8E5E7] bg-[#F8FBFB] pe-10 ps-3 text-sm font-medium text-[#47666D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:bg-white"
                  >
                    {documentTypes.map((item) => (
                      <option key={item.value} value={item.value}>
                        {t(item.label)}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[#6D888E]"
                  />
                </div>
              </label>

              <label className="mt-2 block cursor-pointer rounded-xl border border-dashed border-[#BFD9DE] bg-[#F5FAFA] p-5 text-center transition hover:border-[#216474]/50 hover:bg-[#EAF4F3]">
                <FileUp className="mx-auto text-[#216474]" />

                <strong className="mt-2 block truncate text-sm text-[#36565D]">
                  {file ? file.name : t("اختر ملفًا من جهازك")}
                </strong>

                <small className="mt-1 block text-[#93A4A8]">
                  {t("PDF، PNG، JPG، JPEG")}
                </small>

                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </label>

              <button
                type="submit"
                disabled={upload.isPending || !file}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#CFE0E3] bg-white text-sm font-bold text-[#216474] transition hover:bg-[#EAF4F3] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {upload.isPending ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <FileUp size={16} />
                )}

                {upload.isPending
                  ? t("جاري الرفع...")
                  : t("رفع وإرسال للمراجعة")}
              </button>
            </div>
          </form>
        </div>
      </section>
      {/* Documents */}
      <section className="rounded-xl border border-[#DCE8EA] bg-white p-6 shadow-[0_8px_30px_rgba(23,75,87,.04)]">
        <div className={isArabic ? "text-right" : "text-left"}>
          <h2 className="text-lg font-bold text-[#29464D]">
            {t("المستندات المرفوعة")}
          </h2>

          <p className="mt-1 text-xs text-[#93A4A8]">
            {t("النسخة الفعالة من كل مستند في ملف المنظمة")}
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {verificationData.documents.length ? (
            verificationData.documents.map((document) => (
              <article
                key={document.documentId}
                dir={direction}
                className="flex items-center gap-4 rounded-xl border border-[#E1EAEC] bg-[#FAFCFC] p-4"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#E6F3F6] text-[#216474]">
                  <FileCheck2 size={18} />
                </span>

                <div
                  className={`min-w-0 flex-1 ${
                    isArabic ? "text-right" : "text-left"
                  }`}
                >
                  <h3 className="truncate text-sm font-bold text-[#36565D]">
                    {t(documentTypeLabel(document.documentType))}
                  </h3>

                  <p className="mt-1 truncate text-xs text-[#93A4A8]">
                    {document.originalFileName}
                    {" • "}
                    {formatFileSize(document.fileSizeBytes)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => download(document)}
                  disabled={downloadingId === document.documentId}
                  className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#D5E3E5] bg-white text-[#216474] transition hover:bg-[#EAF4F3] disabled:opacity-50"
                  aria-label={t("تنزيل {{fileName}}", {
                    fileName: document.originalFileName,
                  })}
                  title={t("تنزيل")}
                >
                  {downloadingId === document.documentId ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                </button>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-[#CFE0E3] bg-[#FAFCFC] py-10 text-center">
              <FileCheck2 size={28} className="mx-auto text-[#8FA8AD]" />

              <p className="mt-3 text-sm text-[#829499]">
                {t("لم تُرفع مستندات تحقق بعد.")}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-bold text-[#3F646C]">
        {label}
      </span>

      {children}
    </label>
  );
}

function VerificationBadge({ status, label }) {
  const styles = {
    Approved: "border-[#C9E0E5] bg-[#EAF4F3] text-[#216474]",

    Verified: "border-[#C9E0E5] bg-[#EAF4F3] text-[#216474]",

    UnderReview: "border-[#D4E3E6] bg-[#F0F6F7] text-[#52727A]",

    PendingDocuments: "border-[#E8DDBE] bg-[#FFF8E8] text-[#A87818]",

    Rejected: "border-[#F1D4D7] bg-[#FFF1F2] text-[#C34A57]",
  };

  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
        styles[status] || "border-[#D4E3E6] bg-[#F0F6F7] text-[#52727A]"
      }`}
    >
      {label}
    </span>
  );
}

function InfoCard({ icon: Icon, label, value, direction = "rtl" }) {
  return (
    <div
      dir={direction}
      className="rounded-xl border border-[#E1EAEC] bg-[#F8FBFB] p-3"
    >
      <Icon size={16} className="text-[#216474]" />

      <span className="mt-2 block text-[10px] text-[#93A4A8]">{label}</span>

      <strong className="mt-1 block truncate text-xs text-[#36565D]">
        {value || "—"}
      </strong>
    </div>
  );
}
