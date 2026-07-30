import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  Gift,
  PackageCheck,
  Phone,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { apiClient } from "../../../shared/api/client";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../../shared/components/AsyncStates";
import { PharmacyPageHeader } from "../components/PharmacyPageHeader";

const pharmacyDonationKeys = {
  offers: ["pharmacy", "donations", "offers"],
};

const getOffers = async () =>
  (await apiClient.get("/pharmacy/donations/offers", { params: { take: 100 } }))
    .data;

const reviewOffer = async ({ offerId, status, reviewNote }) =>
  (
    await apiClient.put(`/pharmacy/donations/offers/${offerId}/review`, {
      status,
      reviewNote: reviewNote || null,
    })
  ).data;

const statusMeta = {
  PendingPharmacyReview: {
    label: "بانتظار الفحص",
    tone: "bg-amber-50 text-amber-700",
  },
  PharmacyApproved: {
    label: "مقبول — بانتظار التسليم",
    tone: "bg-sky-50 text-sky-700",
  },
  PharmacyRejected: {
    label: "مرفوض من الصيدلية",
    tone: "bg-rose-50 text-rose-700",
  },
  ReceivedByPharmacy: {
    label: "مستلم وموثّق",
    tone: "bg-emerald-50 text-emerald-700",
  },
};

export function PharmacyDonationReviewsPage() {
  const client = useQueryClient();
  const [notice, setNotice] = useState(null);
  const query = useQuery({
    queryKey: pharmacyDonationKeys.offers,
    queryFn: getOffers,
  });
  const mutation = useMutation({
    mutationFn: reviewOffer,
    onSuccess: async () => {
      setNotice({
        ok: true,
        text: "تم حفظ قرار الصيدلية وإرسال الإشعارات اللازمة.",
      });
      await client.invalidateQueries({ queryKey: pharmacyDonationKeys.offers });
    },
    onError: (error) =>
      setNotice({ ok: false, text: getApiErrorMessage(error) }),
  });

  return (
    <div className="space-y-6">
      <PharmacyPageHeader
        eyebrow="شبكة تبرع آمنة"
        title="التحقق من التبرعات الدوائية"
        description="استلم الدواء من المتبرع، افحص سلامة العبوة والصلاحية، ثم وثّق الاستلام ليظهر العرض للجمعية المستفيدة."
        actions={null}
      />
      <section className="grid gap-3 sm:grid-cols-3">
        <Step
          icon={Gift}
          number="1"
          title="تواصل واستلام"
          text="تتواصل الصيدلية مع المتبرع وتستلم الدواء فقط داخل مسار موثق."
        />
        <Step
          icon={ShieldCheck}
          number="2"
          title="فحص مهني"
          text="تأكد من الإغلاق، الصلاحية، التخزين وسلامة العبوة."
        />
        <Step
          icon={PackageCheck}
          number="3"
          title="تحويل للجمعية"
          text="بعد توثيق الاستلام يظهر العرض للجمعية لتقرر القبول والتوزيع."
        />
      </section>
      {notice && (
        <div
          className={`rounded-2xl border p-4 text-sm font-bold ${
            notice.ok
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-rose-100 bg-rose-50 text-rose-700"
          }`}
        >
          {notice.text}
        </div>
      )}
      {query.isLoading ? (
        <LoadingState label="جاري تحميل عروض التبرع..." />
      ) : query.isError ? (
        <ErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !query.data?.length ? (
        <EmptyState
          title="لا توجد عروض بانتظار الصيدلية"
          description="عندما يختار مستخدم صيدليتك للتحقق من تبرعه سيظهر العرض هنا."
        />
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {query.data.map((offer) => (
            <OfferCard
              key={offer.offerId}
              offer={offer}
              pending={mutation.isPending}
              onReview={(status, reviewNote) => {
                setNotice(null);
                mutation.mutate({ offerId: offer.offerId, status, reviewNote });
              }}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function Step({ icon: Icon, number, title, text }) {
  return (
    <article className="rounded-2xl border border-[#174b57]/8 bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
          <Icon size={19} />
        </span>
        <span className="text-xs font-black text-[#216474]">
          الخطوة {number}
        </span>
      </div>
      <h3 className="mt-3 font-black text-[#29464d]">{title}</h3>
      <p className="mt-1 text-xs leading-6 text-[#71858a]">{text}</p>
    </article>
  );
}

function OfferCard({ offer, pending, onReview }) {
  const [note, setNote] = useState(offer.pharmacyReviewNote || "");
  const meta =
    statusMeta[offer.pharmacyReviewStatus] || statusMeta.PendingPharmacyReview;
  const waiting = offer.pharmacyReviewStatus === "PendingPharmacyReview";
  const accepted = offer.pharmacyReviewStatus === "PharmacyApproved";

  return (
    <article className="rounded-[1.45rem] border border-[#174b57]/8 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-[#216474]">
            {offer.targetOrganizationName}
          </p>
          <h2 className="mt-1 text-lg font-black text-[#29464d]">
            {offer.medicineName}
          </h2>
          <p className="mt-1 text-xs text-[#829499]">
            {offer.scientificName || "الاسم العلمي غير محدد"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-[11px] font-black ${meta.tone}`}
        >
          {meta.label}
        </span>
      </div>
      <div className="mt-4 grid gap-2 rounded-2xl bg-[#f8fbfa] p-4 text-xs sm:grid-cols-2">
        <Detail
          icon={Gift}
          label="المتبرع"
          value={offer.donorFullName || "مستخدم المنصة"}
        />
        <Detail
          icon={Phone}
          label="الهاتف"
          value={offer.donorPhoneNumber || "غير مسجل"}
        />
        <Detail
          icon={PackageCheck}
          label="عدد العبوات"
          value={offer.packageCount}
        />
        <Detail
          icon={Clock3}
          label="الصلاحية"
          value={
            offer.expiryDateUtc
              ? new Date(offer.expiryDateUtc).toLocaleDateString("ar-SY")
              : "غير محددة"
          }
        />
      </div>
      {offer.notes && (
        <p className="mt-3 rounded-xl border border-[#174b57]/8 p-3 text-xs leading-6 text-[#71858a]">
          {offer.notes}
        </p>
      )}
      {(waiting || accepted) && (
        <div className="mt-4 border-t border-[#174b57]/8 pt-4">
          <label>
            <span className="form-label">ملاحظة التحقق أو سبب الرفض</span>
            <textarea
              className="form-textarea min-h-20"
              value={note}
              maxLength={1000}
              onChange={(event) => setNote(event.target.value)}
              placeholder="دوّن نتيجة فحص العبوة والصلاحية وحالة التخزين"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {waiting && (
              <>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={pending}
                  onClick={() => onReview("PharmacyApproved", note.trim())}
                >
                  <CheckCircle2 size={16} />
                  قبول مبدئي وتحديد التسليم
                </button>
                <button
                  type="button"
                  className="btn-secondary text-rose-700"
                  disabled={pending}
                  onClick={() => onReview("PharmacyRejected", note.trim())}
                >
                  <XCircle size={16} />
                  رفض بعد الفحص
                </button>
              </>
            )}
            {accepted && (
              <button
                type="button"
                className="btn-primary"
                disabled={pending}
                onClick={() => onReview("ReceivedByPharmacy", note.trim())}
              >
                <PackageCheck size={16} />
                تأكيد الاستلام والتوثيق
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-[#6f888d]" />
      <span className="text-[#829499]">{label}</span>
      <strong className="ms-auto text-[#29464d]">{value}</strong>
    </div>
  );
}
