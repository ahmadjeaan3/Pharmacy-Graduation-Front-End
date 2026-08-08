import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Bike,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Hash,
  MapPin,
  PackageSearch,
  Phone,
  XCircle,
  Navigation,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  cancelMedicineRequest,
  getMedicineRequest,
  userKeys,
} from "../api/userApi";
import {
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { formatDate, getRequestStatus } from "../utils/userFormatters";
import { getApiErrorMessage } from "../../../shared/api/errors";

export function MedicineRequestDetailsPage() {
  const { t, i18n } = useTranslation();
  const { requestId } = useParams();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: userKeys.medicineRequest(requestId),
    queryFn: () => getMedicineRequest(requestId),
  });
  const cancelMutation = useMutation({
    mutationFn: () => cancelMedicineRequest(requestId),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.medicineRequest(requestId), data);
      queryClient.invalidateQueries({
        queryKey: ["user", "medicine-requests"],
      });
      queryClient.invalidateQueries({ queryKey: ["user", "dashboard"] });
    },
  });
  if (query.isPending)
    return <UserLoadingState label={t("جاري تحميل تفاصيل الطلب...")} />;
  if (query.isError)
    return (
      <UserErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  const request = query.data;
  const status = getRequestStatus(request.status, request.statusDisplayText, t);
  const normalizedStatus = request.status === "Available" ? "ReadyForPickup" : request.status;
  const journeyStep = ["Collected", "Completed"].includes(normalizedStatus)
    ? 4
    : normalizedStatus === "ReadyForPickup"
      ? 3
      : ["Reserved", "Pending"].includes(normalizedStatus)
        ? 2
        : 1;
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/app/requests"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#60777c]"
      >
        <ArrowRight size={16} className="rtl:rotate-0 ltr:rotate-180" />
        {t("العودة إلى الطلبات")}
      </Link>
      <section className="relative isolate overflow-hidden rounded-[1.8rem] bg-[#174b57] p-6 text-white lg:p-8">
        <div className="noise absolute inset-0 -z-10" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#8bd0cb]">
              <Hash size={15} />
              {request.requestCode}
            </p>
            <h2 className="mt-3 text-3xl font-black">{request.medicineName}</h2>
            <p className="mt-2 text-white/60">{t("حجز من {{pharmacy}}", { pharmacy: request.pharmacyName })}</p>
          </div>
          <span
            className={`rounded-full border px-4 py-2 text-sm font-bold ${status.tone}`}
          >
            {status.label}
          </span>
        </div>
      </section>
      <section className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-extrabold text-[#29464d]">{t("رحلة الحصول على الدواء")}</h3>
            <p className="mt-1 text-sm text-[#71858a]">{t("من نتيجة البحث حتى تأكيد الاستلام من الصيدلية")}</p>
          </div>
          <span className="text-xs font-bold text-[#216474]">{t("الخطوة {{step}} من 4", { step: journeyStep })}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [SearchCheck, "تم العثور على الدواء", "ظهر ضمن مخزون الصيدلية"],
            [ShieldCheck, "تم حجز الكمية", "الحجز مرتبط برقم الطلب"],
            [Navigation, "جاهز للتوجه", "افتح الاتجاهات إلى الصيدلية"],
            [CheckCircle2, "تأكيد الاستلام", "تكتمل الرحلة عند التسليم"],
          ].map(([Icon, title, description], index) => {
            const done = index + 1 <= journeyStep;
            return (
              <div key={title} className={`rounded-2xl border p-4 ${done ? "border-[#8bd0cb] bg-[#f2faf8]" : "border-slate-100 bg-slate-50/70"}`}>
                <span className={`grid size-9 place-items-center rounded-xl ${done ? "bg-[#174b57] text-white" : "bg-white text-slate-400"}`}><Icon size={17} /></span>
                <strong className="mt-3 block text-sm text-[#29464d]">{t(title)}</strong>
                <p className="mt-1 text-xs leading-5 text-[#71858a]">{t(description)}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-5">
          <div className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-6">
            <h3 className="font-extrabold text-[#29464d]">تفاصيل الطلب</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Detail
                icon={PackageSearch}
                label="الدواء"
                value={request.medicineName}
              />
              <Detail
                icon={Hash}
                label={t("الكمية")}
                value={request.requestedQuantity.toLocaleString(i18n.language)}
              />
              <Detail
                icon={CalendarDays}
                label="تاريخ الطلب"
                value={formatDate(request.createdAtUtc, true)}
              />
              <Detail
                icon={Clock3}
                label="آخر تحديث"
                value={formatDate(
                  request.statusUpdatedAtUtc || request.createdAtUtc,
                  true,
                )}
              />
            </div>
            {request.note && <Note title="ملاحظتك" text={request.note} />}
            {request.pharmacyResponseNote && (
              <Note
                title="رد الصيدلية"
                text={request.pharmacyResponseNote}
                tone="emerald"
              />
            )}
            {request.suggestedAlternative && (
              <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <strong className="text-sm text-amber-800">
                  بديل مقترح من الصيدلية
                </strong>
                <p className="mt-2 font-extrabold text-[#29464d]">
                  {request.suggestedAlternative.medicineName}
                </p>
              </div>
            )}
          </div>
          <div className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-6">
            <h3 className="font-extrabold text-[#29464d]">{t("حالة الطلب")}</h3>
            <div className="mt-5 flex items-start gap-3">
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full ${request.isFinalStatus ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
              >
                {request.isFinalStatus ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Clock3 size={20} />
                )}
              </span>
              <div>
                <strong className="text-[#29464d]">{status.label}</strong>
                <p className="mt-1 text-sm leading-6 text-[#71858a]">
                  {journeyStep >= 3
                    ? t("الدواء محجوز وجاهز. خذ رقم الطلب وتوجه إلى الصيدلية.")
                    : t("تم تسجيل الحجز وتنتظر تجهيز الصيدلية للكمية.")}
                </p>
              </div>
            </div>
            {request.canCancel && (
              <>
                <button
                  type="button"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-rose-100 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                >
                  <XCircle size={17} />
                  {cancelMutation.isPending ? t("جاري الإلغاء...") : t("إلغاء الحجز")}
                </button>
                {cancelMutation.isError && (
                  <p className="mt-3 text-sm font-semibold text-rose-600">
                    {getApiErrorMessage(cancelMutation.error)}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <aside className="space-y-5">
          <div className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-6">
            <h3 className="font-extrabold text-[#29464d]">بيانات الصيدلية</h3>
            <h4 className="mt-4 text-lg font-black text-[#17363e]">
              {request.pharmacyName}
            </h4>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-[#71858a]">
              <MapPin size={16} className="mt-1 shrink-0 text-[#216474]" />
              {request.pharmacyAddress}، {request.pharmacyArea}،{" "}
              {request.pharmacyCity}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {request.pharmacyPhoneNumber && (
                <a
                  href={`tel:${request.pharmacyPhoneNumber}`}
                  className="btn-secondary"
                >
                  <Phone size={16} />
                  اتصال
                </a>
              )}
              {request.pharmacyGoogleMapsUrl && journeyStep >= 3 && (
                <a
                  href={request.pharmacyGoogleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                >
                  <ExternalLink size={16} />
                  {t("ابدأ التوجه للصيدلية")}
                </a>
              )}
              <Link
                to={`/app/pharmacies/${request.pharmacyId}`}
                className="btn-secondary"
              >
                عرض الصيدلية
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#60777c]">
              <Bike size={15} />
              {request.pharmacyStatusText}
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-[1.4rem] border border-emerald-100 bg-emerald-50 p-5 text-emerald-800">
            <ShieldCheck size={20} className="shrink-0" />
            <p className="text-sm leading-6">{t("ظهور الدواء في صفحة الصيدلية يعني أنه متوفر، وعند إنشاء الطلب تُربط الكمية برقم الحجز حتى الاستلام أو الإلغاء.")}</p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eaf4f3] text-[#216474]">
        <Icon size={16} />
      </span>
      <div>
        <span className="block text-xs text-[#8a9a9e]">{label}</span>
        <strong className="mt-1 block text-sm text-[#29464d]">{value}</strong>
      </div>
    </div>
  );
}
function Note({ title, text, tone }) {
  return (
    <div
      className={`mt-5 rounded-2xl p-4 ${tone === "emerald" ? "bg-emerald-50" : "bg-[#f8fbfa]"}`}
    >
      <strong className="block text-sm text-[#29464d]">{title}</strong>
      <p className="mt-2 text-sm leading-6 text-[#60777c]">{text}</p>
    </div>
  );
}
