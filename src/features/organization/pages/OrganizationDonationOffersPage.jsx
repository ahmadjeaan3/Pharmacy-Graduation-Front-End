import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Building2,
  Check,
  Gift,
  Package,
  Phone,
  Pill,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import {
  getStatusMeta,
  offerStatuses,
} from "../../donations/utils/donationFormatters";
import {
  getOrganizationCampaigns,
  getOrganizationDonationOffers,
  organizationKeys,
  reviewOrganizationDonationOffer,
} from "../api/organizationApi";
import { OrganizationPageHeader } from "../components/OrganizationPageHeader";
import { formatOrgDate } from "../utils/organizationFormatters";

export function OrganizationDonationOffersPage() {
  const client = useQueryClient();
  const [status, setStatus] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [notice, setNotice] = useState(null);
  const params = { status, campaignId, take: 100 };
  const query = useQuery({
    queryKey: organizationKeys.offers(params),
    queryFn: () => getOrganizationDonationOffers(params),
  });
  const campaigns = useQuery({
    queryKey: organizationKeys.campaigns({ take: 100 }),
    queryFn: () => getOrganizationCampaigns({ take: 100 }),
  });
  const review = useMutation({
    mutationFn: ({ offerId, payload }) =>
      reviewOrganizationDonationOffer(offerId, payload),
    onSuccess: async () => {
      setNotice({ ok: true, text: "تم تحديث عرض التبرع وإشعار المتبرع." });
      await Promise.all([
        client.invalidateQueries({ queryKey: ["organization", "offers"] }),
        client.invalidateQueries({ queryKey: organizationKeys.dashboard }),
      ]);
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });
  return (
    <div className="space-y-6">
      <OrganizationPageHeader
        eyebrow="التبرعات الواردة"
        title="عروض التبرع الدوائي"
        description="راجع بيانات الدواء وحالة العبوات، ثم وافق على العرض أو ارفضه أو أكد استلامه مع إرسال رد واضح للمتبرع."
        icon={Gift}
      />
      <section className="rounded-[1.45rem] border border-[#216474]/12 bg-white p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
            <ShieldCheck size={21} />
          </span>
          <div>
            <h2 className="font-black text-[#29464d]">
              كيف تصل التبرعات إلى الجمعية؟
            </h2>
            <p className="mt-1 text-sm leading-7 text-[#71858a]">
              تظهر هنا فقط الأدوية التي استلمتها صيدلية معتمدة وتحققت من سلامة
              العبوة وتاريخ الصلاحية. بعدها تقرر الجمعية القبول والتوزيع. لا
              يوجد تبرع مباشر بين مستخدمين.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-center text-xs font-black sm:grid-cols-4">
          {[
            "1. تسجيل المستخدم",
            "2. تحقق الصيدلية",
            "3. مراجعة الجمعية",
            "4. الاستلام والتوزيع",
          ].map((step) => (
            <span
              key={step}
              className="rounded-xl bg-[#f4f8f7] px-3 py-3 text-[#36565d]"
            >
              {step}
            </span>
          ))}
        </div>
      </section>
      {notice && (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold ${notice.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
        >
          {notice.text}
        </div>
      )}
      <section className="flex flex-col gap-3 rounded-[1.35rem] border border-[#174b57]/8 bg-white p-4 sm:flex-row">
        <label className="flex-1">
          <span className="form-label">حالة العرض</span>
          <select
            className="form-input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {offerStatuses.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1">
          <span className="form-label">الحملة</span>
          <select
            className="form-input"
            value={campaignId}
            onChange={(event) => setCampaignId(event.target.value)}
          >
            <option value="">جميع الحملات</option>
            {(campaigns.data || []).map((campaign) => (
              <option key={campaign.campaignId} value={campaign.campaignId}>
                {campaign.title}
              </option>
            ))}
          </select>
        </label>
      </section>
      {query.isLoading ? (
        <UserLoadingState label="جاري تحميل عروض التبرع..." />
      ) : query.isError ? (
        <UserErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !query.data?.length ? (
        <UserEmptyState
          title="لا توجد عروض مطابقة"
          description="ستظهر هنا عروض التبرع الموجهة إلى المنظمة أو حملاتها."
        />
      ) : (
        <section
          className={`grid gap-4 xl:grid-cols-2 ${query.isFetching ? "opacity-60" : ""}`}
        >
          {query.data.map((offer) => (
            <OfferCard
              key={offer.offerId}
              offer={offer}
              pending={review.isPending}
              onReview={(payload) => {
                setNotice(null);
                review.mutate({ offerId: offer.offerId, payload });
              }}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function OfferCard({ offer, pending, onReview }) {
  const [nextStatus, setNextStatus] = useState(
    offer.status === "Approved" ? "Received" : "Approved",
  );
  const [note, setNote] = useState(offer.reviewNote || "");
  const status = getStatusMeta(offer.status, "offer");
  const actionable = !["Cancelled", "Rejected", "Received"].includes(
    offer.status,
  );
  return (
    <article className="rounded-[1.45rem] border border-[#174b57]/8 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Gift size={20} />
        </span>
        <span
          className={`rounded-full px-3 py-1.5 text-[11px] font-black ${status.tone}`}
        >
          {status.label}
        </span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-[#29464d]">
            {offer.medicineName}
          </h3>
          <p className="mt-1 text-xs text-[#829499]">
            {offer.scientificName || "الاسم العلمي غير محدد"}
          </p>
        </div>
        <div className="rounded-xl bg-[#f8fbfa] px-4 py-2 text-center">
          <strong className="block text-lg text-[#29464d]">
            {offer.packageCount.toLocaleString("ar-SY")}
          </strong>
          <small className="text-[#829499]">عبوة</small>
        </div>
      </div>
      <div className="mt-4 grid gap-2 rounded-2xl bg-[#fafbfb] p-4 text-xs sm:grid-cols-2">
        <Info icon={UserRound} label="المتبرع" value={offer.donorFullName} />
        <Info
          icon={Phone}
          label="الهاتف"
          value={offer.donorPhoneNumber || "غير مسجل"}
        />
        <Info
          icon={CalendarDays}
          label="الصلاحية"
          value={formatOrgDate(offer.expiryDateUtc)}
        />
        <Info
          icon={Package}
          label="حالة العبوات"
          value={offer.isSealed ? "مغلقة بحالتها الأصلية" : "غير محددة كمغلقة"}
        />
        <Info
          icon={Building2}
          label="صيدلية التحقق"
          value={offer.reviewingPharmacyName || "غير محددة"}
        />
        <Info
          icon={ShieldCheck}
          label="توثيق الصيدلية"
          value={
            offer.pharmacyReviewStatus === "ReceivedByPharmacy"
              ? "تم الاستلام والتحقق"
              : "بانتظار التحقق"
          }
        />
        {offer.campaignTitle && (
          <Info icon={Pill} label="الحملة" value={offer.campaignTitle} />
        )}
      </div>
      {offer.notes && (
        <p className="mt-4 rounded-xl border border-[#174b57]/7 p-3 text-xs leading-6 text-[#71858a]">
          {offer.notes}
        </p>
      )}
      {offer.pharmacyReviewNote && (
        <div className="mt-4 rounded-xl border border-[#216474]/10 bg-[#eaf4f3] p-3">
          <p className="text-[10px] font-black text-[#216474]">
            ملاحظة صيدلية التحقق
          </p>
          <p className="mt-1 text-xs leading-6 text-[#536d73]">
            {offer.pharmacyReviewNote}
          </p>
        </div>
      )}
      {actionable ? (
        <div className="mt-5 border-t border-[#174b57]/8 pt-4">
          <div className="grid gap-3 sm:grid-cols-[170px_1fr]">
            <select
              className="form-input"
              value={nextStatus}
              onChange={(event) => setNextStatus(event.target.value)}
            >
              <option value="Approved">قبول العرض</option>
              <option value="Received">تأكيد الاستلام</option>
              <option value="Rejected">رفض العرض</option>
            </select>
            <input
              className="form-input"
              maxLength={1000}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="ملاحظة للمتبرع (اختيارية)"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              onReview({ status: nextStatus, reviewNote: note.trim() || null })
            }
            disabled={pending}
            className="btn-primary mt-3"
          >
            <Save size={16} />
            {pending ? "جاري الحفظ..." : "حفظ القرار"}
          </button>
        </div>
      ) : (
        offer.reviewNote && (
          <div className="mt-4 rounded-xl bg-[#f2effa] p-3">
            <p className="text-[10px] font-black text-violet-700">
              الرد المرسل
            </p>
            <p className="mt-1 text-xs leading-6 text-[#665d7f]">
              {offer.reviewNote}
            </p>
          </div>
        )
      )}
      <p className="mt-4 flex items-center gap-1 border-t border-[#174b57]/7 pt-3 text-[11px] text-[#9aabad]">
        <Check size={13} />
        وصل في {formatOrgDate(offer.createdAtUtc)}
      </p>
    </article>
  );
}
function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon size={14} className="shrink-0 text-[#829499]" />
      <span className="text-[#829499]">{label}</span>
      <strong className="ms-auto max-w-[55%] truncate text-[#29464d]">
        {value}
      </strong>
    </div>
  );
}
