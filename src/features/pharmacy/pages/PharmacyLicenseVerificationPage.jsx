import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Download,
  FileCheck2,
  FileImage,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  downloadLicenseDocument,
  getLicenseVerification,
  getMyPharmacy,
  pharmacyKeys,
  submitLicenseVerification,
} from "../api/pharmacyApi";
import { PharmacyPageHeader } from "../components/PharmacyPageHeader";

const statusInfo = {
  Pending: {
    label: "بانتظار الفحص",
    tone: "bg-amber-50 text-amber-800",
    icon: LoaderCircle,
  },
  Processing: {
    label: "جاري فحص المستند",
    tone: "bg-cyan-50 text-cyan-800",
    icon: LoaderCircle,
  },
  Matched: {
    label: "اجتاز الفحص الآلي",
    tone: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  NeedsReview: {
    label: "بحاجة إلى مراجعة الإدارة",
    tone: "bg-violet-50 text-violet-700",
    icon: AlertTriangle,
  },
  Failed: {
    label: "تعذر فحص المستند",
    tone: "bg-rose-50 text-rose-700",
    icon: AlertTriangle,
  },
  Rejected: {
    label: "مرفوض من الإدارة",
    tone: "bg-rose-50 text-rose-700",
    icon: AlertTriangle,
  },
  ManuallyApproved: {
    label: "تم الاعتماد بعد مراجعة الإدارة",
    tone: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
  ManuallyRejected: {
    label: "مرفوض بعد مراجعة الإدارة",
    tone: "bg-rose-50 text-rose-700",
    icon: AlertTriangle,
  },
};

const formatBytes = (bytes) =>
  `${(Number(bytes || 0) / 1024 / 1024).toFixed(2)} MB`;
const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("ar", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

export function PharmacyLicenseVerificationPage() {
  const client = useQueryClient();
  const [file, setFile] = useState(null);
  const [notice, setNotice] = useState(null);
  const verification = useQuery({
    queryKey: ["pharmacy", "license-verification"],
    queryFn: getLicenseVerification,
    retry: false,
    refetchInterval: (query) =>
      ["Pending", "Processing"].includes(query.state.data?.status)
        ? 4000
        : false,
  });
  const profile = useQuery({
    queryKey: pharmacyKeys.profile,
    queryFn: getMyPharmacy,
  });
  const missing =
    verification.isError && verification.error?.response?.status === 404;
  const upload = useMutation({
    mutationFn: submitLicenseVerification,
    onSuccess: async () => {
      setFile(null);
      setNotice({
        ok: true,
        text: "تم رفع الترخيص وإرساله للفحص. ستتحدث الحالة تلقائيًا.",
      });
      await Promise.all([
        client.invalidateQueries({
          queryKey: ["pharmacy", "license-verification"],
        }),
        client.invalidateQueries({ queryKey: pharmacyKeys.profile }),
        client.invalidateQueries({ queryKey: pharmacyKeys.dashboard }),
      ]);
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  const openDocument = async () => {
    try {
      const blob = await downloadLicenseDocument(
        verification.data.verificationId,
      );
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setNotice({ ok: false, text: getApiErrorMessage(error) });
    }
  };
  const chooseFile = (selected) => {
    setNotice(null);
    if (!selected) return setFile(null);
    if (!["image/png", "image/jpeg"].includes(selected.type)) {
      setFile(null);
      return setNotice({
        ok: false,
        text: "يُسمح فقط بصورة PNG أو JPEG واضحة للترخيص.",
      });
    }
    if (selected.size > 8 * 1024 * 1024) {
      setFile(null);
      return setNotice({
        ok: false,
        text: "يجب ألا يتجاوز حجم صورة الترخيص 8 ميغابايت.",
      });
    }
    setFile(selected);
  };
  const data = verification.data;
  const meta = statusInfo[data?.status] || statusInfo.Pending;
  const StatusIcon = meta.icon;
  return (
    <div>
      <PharmacyPageHeader
        eyebrow="اعتماد المنشأة"
        title="الترخيص والتحقق"
        description="ارفع ترخيص الصيدلية بصورة واضحة لمطابقة البيانات، ثم تراجع الإدارة الملف قبل الاعتماد النهائي."
      />
      {notice && (
        <div
          className={`mb-5 rounded-2xl border p-4 text-sm font-bold ${notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
        >
          {notice.text}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <section className="surface p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
              <Upload size={21} />
            </span>
            <div>
              <h3 className="font-black">رفع ترخيص الصيدلية</h3>
              <p className="mt-1 text-xs text-[#829499]">
                PNG أو JPEG، بحد أقصى 8 MB
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-dashed border-[#216474]/30 bg-[#f7fbfa] p-6 text-center">
            <FileImage className="mx-auto text-[#216474]" size={36} />
            <p className="mt-3 text-sm font-black">
              صورة كاملة وواضحة ومن دون قص الحواف
            </p>
            <p className="mt-1 text-xs leading-6 text-[#829499]">
              إعادة الرفع تلغي المستند النشط السابق وتعيد الحساب إلى انتظار
              الاعتماد.
            </p>
            <label className="btn-secondary mt-4 cursor-pointer justify-center">
              <FileImage size={17} /> اختيار صورة
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(event) => chooseFile(event.target.files?.[0])}
              />
            </label>
          </div>
          {file && (
            <div className="mt-4 rounded-xl bg-[#eef7f6] p-4 text-sm">
              <strong className="block truncate">{file.name}</strong>
              <span className="mt-1 block text-xs text-[#71858a]">
                {formatBytes(file.size)}
              </span>
            </div>
          )}
          <button
            className="btn-primary mt-4 w-full justify-center"
            disabled={!file || upload.isPending}
            onClick={() => upload.mutate(file)}
          >
            <Upload size={17} />
            {upload.isPending
              ? "جاري رفع المستند..."
              : data
                ? "رفع نسخة جديدة"
                : "إرسال الترخيص للتحقق"}
          </button>
          <div className="mt-5 rounded-xl bg-amber-50 p-4 text-xs font-bold leading-6 text-amber-800">
            المستند خاص، ولا يظهر للمستخدمين. يمكن للصيدلية والإدارة المخوّلة
            فقط الوصول إليه.
          </div>
        </section>
        <section className="surface p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-black">حالة الاعتماد</h3>
              <p className="mt-1 text-xs text-[#829499]">
                رقم الترخيص:{" "}
                <span dir="ltr">{profile.data?.licenseNumber || "—"}</span>
              </p>
            </div>
            {profile.data?.isApproved ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                <BadgeCheck size={16} />
                معتمدة من الإدارة
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
                غير معتمدة بعد
              </span>
            )}
          </div>
          {verification.isLoading ? (
            <div className="grid min-h-64 place-items-center">
              <LoaderCircle className="animate-spin text-[#216474]" />
            </div>
          ) : missing ? (
            <div className="mt-6 rounded-2xl bg-[#f7faf9] p-8 text-center">
              <FileCheck2 className="mx-auto text-[#829499]" size={38} />
              <h4 className="mt-4 font-black">لم يُرفع ترخيص بعد</h4>
              <p className="mt-2 text-sm text-[#829499]">
                اختر صورة الترخيص من النموذج وأرسلها لبدء التحقق.
              </p>
            </div>
          ) : verification.isError ? (
            <div className="mt-6 rounded-2xl bg-rose-50 p-5 text-sm font-bold text-rose-700">
              {getApiErrorMessage(verification.error)}
            </div>
          ) : (
            <div className="mt-6">
              <div
                className={`flex items-center gap-3 rounded-2xl p-5 ${meta.tone}`}
              >
                <StatusIcon
                  className={data.status === "Processing" ? "animate-spin" : ""}
                />
                <div>
                  <strong className="block">{meta.label}</strong>
                  <span className="mt-1 block text-xs opacity-75">
                    أُرسل في {formatDate(data.submittedAtUtc)}
                  </span>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Detail label="اسم الملف" value={data.originalFileName} />
                <Detail
                  label="حجم الملف"
                  value={formatBytes(data.fileSizeBytes)}
                />
                <Detail label="الاسم المسجل" value={data.registeredName} />
                <Detail label="الاسم المستخرج" value={data.extractedName} />
                <Detail
                  label="رقم السجل المستخرج"
                  value={data.registryNumber}
                />
                <Detail
                  label="درجة المطابقة"
                  value={
                    data.matchScore == null
                      ? "—"
                      : `${Math.round(data.matchScore)}%`
                  }
                />
              </div>
              {(data.rejectionReason || data.failureReason) && (
                <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-700">
                  {data.rejectionReason || data.failureReason}
                </div>
              )}
              <button
                className="btn-secondary mt-5 w-full justify-center"
                onClick={openDocument}
              >
                <Download size={17} />
                عرض المستند المرفوع
              </button>
            </div>
          )}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#174b57]/8 p-4">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#216474]" size={20} />
            <p className="text-xs font-bold leading-6 text-[#526a70]">
              نجاح القراءة والمطابقة الآلية لا يعني الاعتماد النهائي. تظهر
              الصيدلية وتستقبل العمليات المعتمدة بعد قرار الإدارة.
            </p>
          </div>
          {!profile.data?.isApproved && data?.status === "Matched" && (
            <button
              className="btn-quiet mt-3 w-full justify-center"
              onClick={() => verification.refetch()}
            >
              <RefreshCw size={16} />
              تحديث حالة المراجعة
            </button>
          )}
        </section>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f7faf9] p-4">
      <span className="text-[11px] text-[#829499]">{label}</span>
      <strong className="mt-1 block truncate text-sm">{value || "—"}</strong>
    </div>
  );
}
