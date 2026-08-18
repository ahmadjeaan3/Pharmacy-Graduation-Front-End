import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Mail,
  Phone,
  Save,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  adminKeys,
  getOrganizationVerification,
  getOrganizationVerificationDocument,
  reviewOrganizationVerification,
} from "../api/adminApi";
import {
  DashboardEmptyState as AdminEmptyState,
  DashboardErrorState as AdminErrorState,
  DashboardLoadingState as AdminLoadingState,
} from "../../../shared/components/AsyncStates";
import {
  formatDate,
  formatDocumentType,
  formatFileSize,
  getVerificationStatus,
} from "../utils/adminFormatters";

const reviewOptions = [
  { value: "Approved", label: "اعتماد ملف التحقق" },
  { value: "NeedsUpdate", label: "طلب تحديث المستندات" },
  { value: "Rejected", label: "رفض ملف التحقق" },
];

const ADMIN_HERO_IMAGE = "/assets/app/home/background_hero_admin.png";

export function AdminOrganizationReviewPage() {
  const { organizationId } = useParams();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: adminKeys.organizationVerification(organizationId),
    queryFn: () => getOrganizationVerification(organizationId),
    enabled: Boolean(organizationId),
  });
  const [review, setReview] = useState({
    verificationStatus: "Approved",
    verificationNotes: "",
  });
  const [notice, setNotice] = useState("");
  const [documentState, setDocumentState] = useState({ id: null, error: "" });
  const mutation = useMutation({
    mutationFn: () =>
      reviewOrganizationVerification(organizationId, {
        verificationStatus: review.verificationStatus,
        verificationNotes: review.verificationNotes.trim(),
      }),
    onSuccess: async (data) => {
      queryClient.setQueryData(
        adminKeys.organizationVerification(organizationId),
        data,
      );
      setNotice("تم حفظ قرار مراجعة المنظمة وإرسال الإشعار.");
      await queryClient.invalidateQueries({ queryKey: adminKeys.root });
    },
  });

  const downloadDocument = async (document) => {
    setDocumentState({ id: document.documentId, error: "" });
    try {
      const response = await getOrganizationVerificationDocument(
        organizationId,
        document.documentId,
      );
      const url = URL.createObjectURL(response.data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.originalFileName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDocumentState({ id: null, error: "" });
    } catch (error) {
      setDocumentState({ id: null, error: getApiErrorMessage(error) });
    }
  };

  if (query.isPending) return <AdminLoadingState cards={3} />;
  if (query.isError)
    return (
      <AdminErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  const organization = query.data;
  const status = getVerificationStatus(organization.verificationStatus);
  const hasDocuments = organization.documents.length > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/app/approvals?tab=organizations"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#216474]"
        >
          <ArrowRight size={17} /> العودة إلى المنظمات
        </Link>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${status.className}`}
        >
          {status.label}
        </span>
      </div>
      <section className="relative isolate min-h-[230px] overflow-hidden rounded-[16px] bg-[#10505A] p-5 text-white shadow-[0_22px_55px_rgba(23,75,87,.14)] sm:min-h-[250px] sm:p-7 lg:min-h-[271px] lg:p-9">
        <div className="noise absolute inset-0 -z-10" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-white/10 text-[#f5cb72]">
              <Building2 size={27} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#8bd0cb]">
                مراجعة ملف المنظمة
              </p>
              <h2 className="mt-1 text-3xl font-black">
                {organization.organizationName}
              </h2>
              <p className="mt-2 text-sm text-white/50">
                رقم التسجيل: {organization.registrationNumber}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.07] px-4 py-3">
            <span className="text-xs text-white/45">حالة الاعتماد</span>
            <strong className="mt-1 flex items-center gap-2">
              <CheckCircle2
                size={17}
                className={
                  organization.isApproved
                    ? "text-emerald-300"
                    : "text-amber-300"
                }
              />
              {organization.isApproved ? "معتمدة" : "غير معتمدة"}
            </strong>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailCard
          icon={UserRound}
          label="صاحب الحساب"
          value={organization.ownerFullName}
        />
        <DetailCard
          icon={Mail}
          label="البريد الإلكتروني"
          value={organization.ownerEmail}
          ltr
        />
        <DetailCard
          icon={Phone}
          label="رقم الهاتف"
          value={organization.phoneNumber || "غير مسجل"}
          ltr
        />
        <DetailCard
          icon={CalendarDays}
          label="تاريخ إرسال التحقق"
          value={formatDate(organization.verificationSubmittedAtUtc, true)}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-[#17363e]">مستندات التحقق</h3>
              <p className="mt-1 text-sm text-slate-400">
                {organization.documents.length.toLocaleString("ar-SY")} مستندات
                مرفوعة
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
              <FileCheck2 size={20} />
            </span>
          </div>
          {documentState.error && (
            <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {documentState.error}
            </p>
          )}
          {hasDocuments ? (
            <div className="mt-6 space-y-3">
              {organization.documents.map((document) => (
                <article
                  key={document.documentId}
                  className="flex flex-col gap-4 rounded-2xl border border-[#174b57]/8 bg-[#f8fbfa] p-4 sm:flex-row sm:items-center"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#216474] shadow-sm">
                    <FileText size={21} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-bold text-[#29464d]">
                      {formatDocumentType(document.documentType)}
                    </h4>
                    <p
                      className="mt-1 truncate text-xs text-slate-400"
                      dir="ltr"
                    >
                      {document.originalFileName}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatFileSize(document.fileSizeBytes)} •{" "}
                      {formatDate(document.uploadedAtUtc)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadDocument(document)}
                    disabled={documentState.id === document.documentId}
                    className="btn-secondary shrink-0 justify-center disabled:opacity-50"
                  >
                    <Download size={16} />
                    {documentState.id === document.documentId
                      ? "جاري التنزيل..."
                      : "تنزيل"}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <AdminEmptyState
                title="لا توجد مستندات تحقق"
                description="لم ترفع المنظمة مستندات نشطة للمراجعة."
              />
            </div>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setNotice("");
            mutation.mutate();
          }}
          className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-6"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <ShieldAlert size={20} />
            </span>
            <div>
              <h3 className="font-extrabold text-[#17363e]">قرار المراجعة</h3>
              <p className="text-xs text-slate-400">
                قرار يدوي مستقل عن الذكاء وسيُرسل إلى المنظمة
              </p>
            </div>
          </div>
          <label className="mt-6 block">
            <span className="form-label">حالة ملف التحقق</span>
            <select
              value={review.verificationStatus}
              onChange={(event) =>
                setReview({ ...review, verificationStatus: event.target.value })
              }
              className="form-input"
            >
              {reviewOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-5 block">
            <span className="form-label">ملاحظة التحقق اليدوي (إلزامية)</span>
            <textarea
              value={review.verificationNotes}
              onChange={(event) =>
                setReview({ ...review, verificationNotes: event.target.value })
              }
              maxLength={2000}
              rows={6}
              className="form-textarea"
              placeholder="دوّن المستندات التي راجعتها وسبب القرار (10 أحرف على الأقل)"
            />
            <span
              className="mt-1 block text-left text-xs text-slate-400"
              dir="ltr"
            >
              {review.verificationNotes.length} / 2000
            </span>
          </label>
          {organization.verificationNotes && (
            <div className="mt-4 rounded-xl bg-[#f8fbfa] p-4 text-sm leading-6 text-[#65797e]">
              <strong className="block text-[#29464d]">
                ملاحظات المراجعة الحالية
              </strong>
              {organization.verificationNotes}
            </div>
          )}
          {notice && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
            >
              {notice}
            </p>
          )}
          {mutation.isError && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
            >
              {getApiErrorMessage(mutation.error)}
            </p>
          )}
          <button
            type="submit"
            disabled={
              !hasDocuments ||
              mutation.isPending ||
              review.verificationNotes.trim().length < 10
            }
            className="btn-primary mt-6 w-full justify-center py-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={17} />
            {mutation.isPending ? "جاري حفظ القرار..." : "حفظ قرار المراجعة"}
          </button>
          {!hasDocuments && (
            <p className="mt-3 text-center text-xs text-amber-700">
              لا يمكن مراجعة الملف قبل رفع مستند تحقق واحد على الأقل.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

function DetailCard({ icon: Icon, label, value, ltr = false }) {
  return (
    <article className="rounded-[1.3rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_10px_28px_rgba(23,75,87,.04)]">
      <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
        <Icon size={19} />
      </span>
      <p className="mt-4 text-xs font-semibold text-slate-400">{label}</p>
      <p
        className="mt-1 truncate font-bold text-[#29464d]"
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </p>
    </article>
  );
}
