import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  FileCheck2,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  UserRound,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  adminKeys,
  getPendingPharmacies,
  getPharmacyLicenseDocument,
  getPharmacyLicenseVerification,
  updatePharmacyApproval,
} from "../api/adminApi";
import { formatDate, getVerificationStatus } from "../utils/adminFormatters";

const ADMIN_HERO_IMAGE = "/assets/app/home/background_hero_admin.png";

export function AdminPharmacyReviewPage() {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [decision, setDecision] = useState(null);
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const pending = useQuery({
    queryKey: adminKeys.pendingPharmacies,
    queryFn: getPendingPharmacies,
  });
  const license = useQuery({
    queryKey: ["admin", "pharmacies", pharmacyId, "license-verification"],
    queryFn: () => getPharmacyLicenseVerification(pharmacyId),
    retry: false,
  });
  const pharmacy = pending.data?.find((item) => item.pharmacyId === pharmacyId);
  const review = useMutation({
    mutationFn: () =>
      updatePharmacyApproval(
        pharmacyId,
        decision === "approve",
        reason.trim() || null,
        isManualReview,
      ),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: adminKeys.root });
      navigate("/app/approvals?tab=pharmacies", { replace: true });
    },
    onError: (error) => setNotice(getApiErrorMessage(error)),
  });
  const openDocument = async () => {
    try {
      const response = await getPharmacyLicenseDocument(
        pharmacyId,
        license.data.verificationId,
      );
      const url = URL.createObjectURL(response.data);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setNotice(getApiErrorMessage(error));
    }
  };
  if (pending.isPending)
    return (
      <div className="surface p-10 text-center">جاري تحميل ملف الصيدلية...</div>
    );
  if (pending.isError || !pharmacy)
    return (
      <div className="rounded-2xl bg-rose-50 p-8 text-rose-700">
        تعذر العثور على طلب اعتماد الصيدلية.
      </div>
    );
  const licenseStatus = getVerificationStatus(
    pharmacy.licenseVerificationStatus,
  );
  const isManualReview = Boolean(license.data);
  const canDecide = Boolean(license.data);
  return (
    <div className="space-y-5 sm:space-y-6">
      <Link to="/app/approvals?tab=pharmacies" className="btn-quiet">
        <ArrowRight size={17} />
        العودة إلى طلبات الاعتماد
      </Link>
      <section className="relative isolate min-h-[230px] overflow-hidden rounded-[16px] bg-[#10505A] p-5 text-white shadow-[0_22px_55px_rgba(23,75,87,.14)] sm:min-h-[250px] sm:p-7 lg:min-h-[271px] lg:p-9">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-[position:38%_center] bg-no-repeat"
          style={{ backgroundImage: `url("${ADMIN_HERO_IMAGE}")` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(270deg,#10505A_0%,rgba(16,80,90,.88)_36%,rgba(33,100,116,.42)_70%,rgba(33,100,116,.08)_100%)]"
        />

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-2xl bg-white/10">
              <Building2 size={30} />
            </span>
            <div>
              <p className="text-xs font-bold text-white/50">
                مراجعة واعتماد صيدلية
              </p>
              <h2 className="mt-2 text-3xl font-black">
                {pharmacy.pharmacyName}
              </h2>
              <p className="mt-2 text-sm text-white/55">
                ترخيص: <span dir="ltr">{pharmacy.licenseNumber}</span>
              </p>
            </div>
          </div>
          <span
            className={`w-fit rounded-full px-4 py-2 text-xs font-black ${licenseStatus.className}`}
          >
            {licenseStatus.label}
          </span>
        </div>
      </section>
      {notice && (
        <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">
          {notice}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
        <div className="space-y-5 sm:space-y-6">
          <Card title="بيانات الصيدلية" icon={Building2}>
            <Info
              icon={Building2}
              label="اسم الصيدلية"
              value={pharmacy.pharmacyName}
            />
            <Info
              icon={UserRound}
              label="صاحب الحساب"
              value={pharmacy.ownerFullName}
            />
            <Info
              icon={Mail}
              label="البريد الإلكتروني"
              value={pharmacy.ownerEmail}
              ltr
            />
            <Info
              icon={Phone}
              label="رقم الهاتف"
              value={pharmacy.phoneNumber}
              ltr
            />
            <Info
              icon={MapPin}
              label="العنوان"
              value={`${pharmacy.city}، ${pharmacy.area} — ${pharmacy.address}`}
            />
            <Info
              icon={CalendarDays}
              label="تاريخ التسجيل"
              value={formatDate(pharmacy.createdAtUtc)}
            />
          </Card>
          <Card title="مستند الترخيص والفحص" icon={FileCheck2}>
            {license.isPending ? (
              <p className="text-sm text-[#71858a]">
                جاري تحميل مستند التحقق...
              </p>
            ) : license.isError ? (
              <div className="rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
                لم ترفع الصيدلية مستند ترخيص صالحًا بعد.
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="حالة الفحص"
                    value={getVerificationStatus(license.data.status).label}
                  />
                  <Field
                    label="اسم الملف"
                    value={license.data.originalFileName}
                  />
                  <Field
                    label="الاسم المسجل"
                    value={license.data.registeredName}
                  />
                  <Field
                    label="الاسم المستخرج"
                    value={license.data.extractedName}
                  />
                  <Field
                    label="رقم السجل المستخرج"
                    value={license.data.registryNumber}
                  />
                  <Field
                    label="درجة المطابقة"
                    value={
                      license.data.matchScore == null
                        ? "—"
                        : `${Math.round(license.data.matchScore)}%`
                    }
                  />
                </div>
                {(license.data.rejectionReason ||
                  license.data.failureReason) && (
                  <p className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-bold text-rose-700">
                    {license.data.rejectionReason || license.data.failureReason}
                  </p>
                )}
                {license.data.manualReviewNote && (
                  <p className="mt-4 rounded-xl bg-sky-50 p-4 text-sm font-bold text-sky-800">
                    <span className="mb-1 block text-xs text-sky-600">
                      ملاحظة المراجعة اليدوية
                    </span>
                    {license.data.manualReviewNote}
                  </p>
                )}
                <button
                  className="btn-secondary mt-4 w-full justify-center"
                  onClick={openDocument}
                >
                  <Download size={17} />
                  عرض صورة الترخيص
                </button>
              </>
            )}
          </Card>
        </div>
        <aside className="surface h-fit p-6 xl:sticky xl:top-28">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
              <BadgeCheck size={21} />
            </span>
            <div>
              <h3 className="font-black">قرار الإدارة</h3>
              <p className="mt-1 text-xs text-[#829499]">
                اتخذ القرار بعد مراجعة البيانات والمستند
              </p>
            </div>
          </div>
          {canDecide && (
            <div className="mt-5 flex gap-3 rounded-xl bg-sky-50 p-4 text-xs font-bold leading-6 text-sky-800">
              <ShieldAlert className="shrink-0" size={19} />
              <span>
                <strong className="block text-sm">
                  المراجعة اليدوية متاحة
                </strong>
                هذا القرار مستقل عن نتيجة الذكاء. راجع صورة الترخيص والبيانات
                الرسمية بنفسك ثم وثّق سبب الاعتماد أو الرفض.
              </span>
            </div>
          )}
          {!canDecide && (
            <div className="mt-5 flex gap-3 rounded-xl bg-amber-50 p-4 text-xs font-bold leading-6 text-amber-800">
              <ShieldAlert className="shrink-0" size={19} />
              يجب أن ترفع الصيدلية صورة الترخيص قبل اتخاذ قرار إداري يدوي.
            </div>
          )}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!canDecide}
              onClick={() => {
                setDecision("approve");
                setReason("");
              }}
              className={`rounded-2xl border p-4 font-black disabled:opacity-40 ${decision === "approve" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-slate-200"}`}
            >
              <CheckCircle2 className="mx-auto mb-2" />
              {isManualReview ? "اعتماد يدوي" : "اعتماد"}
            </button>
            <button
              type="button"
              disabled={!canDecide}
              onClick={() => {
                setDecision("reject");
                setReason("");
              }}
              className={`rounded-2xl border p-4 font-black disabled:opacity-40 ${decision === "reject" ? "border-rose-300 bg-rose-50 text-rose-700" : "border-slate-200"}`}
            >
              <XCircle className="mx-auto mb-2" />
              {isManualReview ? "رفض يدوي" : "رفض"}
            </button>
          </div>
          {decision && (
            <label className="mt-5 block">
              <span className="form-label">
                {decision === "approve" ? "سبب الاعتماد اليدوي" : "سبب الرفض"}
              </span>
              <textarea
                className="form-textarea min-h-28"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={500}
                placeholder={
                  decision === "approve"
                    ? "دوّن ما تحقق منه الإداري في المستند (10 أحرف على الأقل)"
                    : "اكتب سببًا واضحًا ليتمكن الصيدلي من تصحيح الملف"
                }
              />
            </label>
          )}
          <button
            className={`mt-5 w-full justify-center ${decision === "reject" ? "btn-secondary text-rose-700" : "btn-primary"}`}
            disabled={
              !decision || review.isPending || reason.trim().length < 10
            }
            onClick={() => review.mutate()}
          >
            {review.isPending
              ? "جاري حفظ القرار..."
              : decision === "approve"
                ? isManualReview
                  ? "تأكيد الاعتماد اليدوي"
                  : "تأكيد اعتماد الصيدلية"
                : decision === "reject"
                  ? isManualReview
                    ? "تأكيد الرفض اليدوي"
                    : "تأكيد الرفض وإرسال السبب"
                  : "اختر القرار أولًا"}
          </button>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <section className="surface p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
          <Icon size={19} />
        </span>
        <h3 className="font-black">{title}</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}
function Info({ icon: Icon, label, value, ltr }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#f7faf9] p-4">
      <Icon size={17} className="shrink-0 text-[#216474]" />
      <div className="min-w-0">
        <span className="text-[11px] text-[#829499]">{label}</span>
        <strong
          className="mt-1 block truncate text-sm"
          dir={ltr ? "ltr" : undefined}
        >
          {value || "—"}
        </strong>
      </div>
    </div>
  );
}
function Field({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f7faf9] p-4">
      <span className="text-[11px] text-[#829499]">{label}</span>
      <strong className="mt-1 block truncate text-sm">{value || "—"}</strong>
    </div>
  );
}
