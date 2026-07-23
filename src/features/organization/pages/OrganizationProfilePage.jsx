import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Download,
  FileCheck2,
  FileUp,
  LoaderCircle,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  downloadVerificationDocument,
  getMyOrganization,
  getOrganizationVerification,
  organizationKeys,
  updateOrganizationProfile,
  uploadVerificationDocument,
} from "../api/organizationApi";
import { OrganizationPageHeader } from "../components/OrganizationPageHeader";
import {
  documentTypeLabel,
  documentTypes,
  formatFileSize,
  formatOrgDate,
  verificationMeta,
} from "../utils/organizationFormatters";
import {
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";

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
  const client = useQueryClient();
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
  // Keep the editable snapshot synchronized with the latest saved organization profile.
  useEffect(() => {
    if (profile.data)
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
      client.invalidateQueries({ queryKey: organizationKeys.profile }),
      client.invalidateQueries({ queryKey: organizationKeys.dashboard }),
      client.invalidateQueries({ queryKey: organizationKeys.verification }),
    ]);
  const save = useMutation({
    mutationFn: updateOrganizationProfile,
    onSuccess: async () => {
      setNotice({ ok: true, text: "تم حفظ بيانات المنظمة بنجاح." });
      await refresh();
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  const upload = useMutation({
    mutationFn: uploadVerificationDocument,
    onSuccess: async () => {
      setNotice({ ok: true, text: "تم رفع المستند وإرساله للمراجعة بنجاح." });
      setFile(null);
      await refresh();
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  const change = (key) => (event) =>
    setForm((old) => ({ ...old, [key]: event.target.value }));
  const submitDocument = (event) => {
    event.preventDefault();
    setNotice(null);
    if (!file)
      return setNotice({ ok: false, text: "اختر المستند الذي تريد رفعه." });
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "png", "jpg", "jpeg"].includes(extension))
      return setNotice({
        ok: false,
        text: "الصيغ المقبولة هي PDF وPNG وJPG فقط.",
      });
    if (file.size > 10 * 1024 * 1024)
      return setNotice({
        ok: false,
        text: "يجب ألا يتجاوز حجم المستند 10 ميغابايت.",
      });
    upload.mutate({ documentType, file });
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
      setNotice({ ok: false, text: getApiErrorMessage(error) });
    } finally {
      setDownloadingId(null);
    }
  };
  if (profile.isLoading || verification.isLoading)
    return <UserLoadingState label="جاري تحميل ملف المنظمة..." />;
  if (profile.isError || verification.isError)
    return (
      <UserErrorState
        message={getApiErrorMessage(profile.error || verification.error)}
        onRetry={() => {
          profile.refetch();
          verification.refetch();
        }}
      />
    );
  const verificationData = verification.data;
  const status =
    verificationMeta[verificationData.verificationStatus] ||
    verificationMeta.PendingDocuments;
  return (
    <div className="space-y-6">
      <OrganizationPageHeader
        eyebrow="هوية المنظمة"
        title="الملف والتحقق"
        description="حدّث بيانات المنظمة وارفع المستندات المطلوبة ليتمكن فريق الإدارة من مراجعتها واعتماد الحساب."
        icon={Building2}
      />
      {notice && (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold ${notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
        >
          {notice.text}
        </div>
      )}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setNotice(null);
            save.mutate(form);
          }}
          className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-6"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-violet-50 text-violet-700">
              <Building2 size={21} />
            </span>
            <div>
              <h3 className="font-black text-[#29464d]">بيانات المنظمة</h3>
              <p className="mt-1 text-xs text-[#829499]">
                تظهر هذه البيانات للمستفيدين والمتبرعين
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="اسم المنظمة">
              <input
                className="form-input"
                required
                maxLength={200}
                value={form.organizationName}
                onChange={change("organizationName")}
              />
            </Field>
            <Field label="رقم التسجيل">
              <input
                className="form-input"
                required
                maxLength={100}
                value={form.registrationNumber}
                onChange={change("registrationNumber")}
              />
            </Field>
            <Field label="رقم الهاتف">
              <input
                className="form-input"
                required
                maxLength={30}
                dir="ltr"
                value={form.phoneNumber}
                onChange={change("phoneNumber")}
              />
            </Field>
            <Field label="المدينة">
              <input
                className="form-input"
                required
                maxLength={100}
                value={form.city}
                onChange={change("city")}
              />
            </Field>
            <Field label="المنطقة أو الحي">
              <input
                className="form-input"
                required
                maxLength={100}
                value={form.area}
                onChange={change("area")}
              />
            </Field>
            <Field label="العنوان">
              <input
                className="form-input"
                required
                maxLength={300}
                value={form.address}
                onChange={change("address")}
              />
            </Field>
            <label className="md:col-span-2">
              <span className="form-label">نبذة عن المنظمة</span>
              <textarea
                className="form-textarea min-h-28"
                maxLength={2000}
                value={form.description}
                onChange={change("description")}
              />
            </label>
          </div>
          <button className="btn-primary mt-6" disabled={save.isPending}>
            <Save size={17} />
            {save.isPending ? "جاري الحفظ..." : "حفظ بيانات المنظمة"}
          </button>
        </form>
        <div className="space-y-5">
          <section className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#f2effa] text-violet-700">
                <ShieldCheck size={23} />
              </span>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-black ${status.tone}`}
              >
                {status.label}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-black text-[#29464d]">
              حالة التحقق
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#71858a]">
              {verificationData.verificationNotes ||
                (verificationData.isApproved
                  ? "تم اعتماد المنظمة ويمكنها إدارة الحملات والطلبات."
                  : "ارفع المستندات الرسمية الواضحة ليتم إرسال الملف إلى المراجعة.")}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Info
                icon={FileCheck2}
                label="المستندات"
                value={verificationData.documents.length.toLocaleString(
                  "ar-SY",
                )}
              />
              <Info
                icon={MapPin}
                label="تاريخ الإرسال"
                value={formatOrgDate(
                  verificationData.verificationSubmittedAtUtc,
                )}
              />
            </div>
          </section>
          <form
            onSubmit={submitDocument}
            className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-6"
          >
            <h3 className="font-black text-[#29464d]">رفع مستند تحقق</h3>
            <p className="mt-1 text-xs leading-6 text-[#829499]">
              PDF أو صورة واضحة، بحد أقصى 10 ميغابايت. رفع مستند جديد من النوع
              نفسه يستبدل السابق.
            </p>
            <div className="mt-5 space-y-4">
              <label>
                <span className="form-label">نوع المستند</span>
                <select
                  className="form-input"
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                >
                  {documentTypes.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block cursor-pointer rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 p-5 text-center">
                <FileUp className="mx-auto text-violet-600" />
                <strong className="mt-2 block text-sm text-[#29464d]">
                  {file ? file.name : "اختر ملفًا من جهازك"}
                </strong>
                <small className="mt-1 block text-[#829499]">
                  PDF، PNG، JPG، JPEG
                </small>
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </label>
              <button
                className="btn-secondary w-full justify-center"
                disabled={upload.isPending || !file}
              >
                {upload.isPending ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <FileUp size={17} />
                )}
                {upload.isPending ? "جاري الرفع..." : "رفع وإرسال للمراجعة"}
              </button>
            </div>
          </form>
        </div>
      </section>
      <section className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-6">
        <div>
          <h3 className="text-lg font-black text-[#29464d]">
            المستندات المرفوعة
          </h3>
          <p className="mt-1 text-xs text-[#829499]">
            النسخة الفعالة من كل مستند في ملف المنظمة
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {verificationData.documents.length ? (
            verificationData.documents.map((document) => (
              <article
                key={document.documentId}
                className="flex items-center gap-4 rounded-2xl border border-[#174b57]/8 bg-[#fafbfb] p-4"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-violet-700 shadow-sm">
                  <FileCheck2 size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-black text-[#29464d]">
                    {documentTypeLabel(document.documentType)}
                  </h4>
                  <p className="mt-1 truncate text-xs text-[#829499]">
                    {document.originalFileName} •{" "}
                    {formatFileSize(document.fileSizeBytes)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => download(document)}
                  disabled={downloadingId === document.documentId}
                  className="icon-button grid"
                  aria-label={`تنزيل ${document.originalFileName}`}
                >
                  {downloadingId === document.documentId ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Download size={17} />
                  )}
                </button>
              </article>
            ))
          ) : (
            <p className="col-span-full rounded-2xl border border-dashed border-[#174b57]/15 py-10 text-center text-sm text-[#829499]">
              لم تُرفع مستندات تحقق بعد.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label>
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}
function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-[#f8fbfa] p-3">
      <Icon size={16} className="text-violet-700" />
      <span className="mt-2 block text-[10px] text-[#829499]">{label}</span>
      <strong className="mt-1 block truncate text-xs text-[#29464d]">
        {value}
      </strong>
    </div>
  );
}
