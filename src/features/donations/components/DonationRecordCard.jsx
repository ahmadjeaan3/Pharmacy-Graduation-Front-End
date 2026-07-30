import {
  Building2,
  CalendarDays,
  Gift,
  HandHeart,
  Package,
  Pill,
  ShieldCheck,
} from "lucide-react";
import { formatDonationDate, getStatusMeta } from "../utils/donationFormatters";

export function DonationRecordCard({ record, type }) {
  const offer = type === "offer";
  const status = getStatusMeta(record.status, type);
  const response = offer ? record.reviewNote : record.responseNote;
  return (
    <article className="rounded-[1.35rem] border border-[#174b57]/8 bg-white p-5 transition hover:border-[#216474]/20 hover:shadow-[0_15px_35px_rgba(23,75,87,.06)]">
      <div className="flex items-start justify-between gap-4">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-2xl ${offer ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
        >
          {offer ? <Gift size={20} /> : <HandHeart size={20} />}
        </span>
        <span
          className={`rounded-full px-3 py-1.5 text-[11px] font-black ${status.tone}`}
        >
          {status.label}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <Pill size={16} className="text-[#216474]" />
          <h4 className="font-black text-[#29464d]">{record.medicineName}</h4>
        </div>
        {record.scientificName && (
          <p className="mt-1 truncate text-xs text-[#829499]">
            {record.scientificName}
          </p>
        )}
      </div>
      <div className="mt-4 space-y-2 rounded-2xl bg-[#f8fbfa] p-4 text-xs">
        {offer && (
          <>
            <Info
              icon={ShieldCheck}
              label="صيدلية التحقق"
              value={record.reviewingPharmacyName || "بانتظار تحديد الصيدلية"}
            />
            <Info
              icon={ShieldCheck}
              label="حالة تحقق الصيدلية"
              value={pharmacyStatusLabel(record.pharmacyReviewStatus)}
            />
          </>
        )}
        <Info
          icon={Building2}
          label="الجهة"
          value={record.targetOrganizationName || "غير محددة"}
        />
        <Info
          icon={Package}
          label="العبوات"
          value={(offer
            ? record.packageCount
            : record.requestedPackageCount
          )?.toLocaleString("ar-SY")}
        />
        <Info
          icon={CalendarDays}
          label={offer ? "تاريخ الصلاحية" : "مطلوب قبل"}
          value={formatDonationDate(
            offer ? record.expiryDateUtc : record.neededBeforeUtc,
          )}
        />
        {record.campaignTitle && (
          <Info icon={Gift} label="الحملة" value={record.campaignTitle} />
        )}
      </div>
      {record.notes && (
        <p className="mt-4 text-xs leading-6 text-[#71858a]">{record.notes}</p>
      )}
      {response && (
        <div className="mt-4 rounded-xl border border-[#216474]/10 bg-[#eaf4f3] p-3">
          <p className="text-[10px] font-black text-[#216474]">رد المنظمة</p>
          <p className="mt-1 text-xs leading-6 text-[#536d73]">{response}</p>
        </div>
      )}
      {offer && record.pharmacyReviewNote && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[10px] font-black text-amber-700">
            ملاحظة الصيدلية
          </p>
          <p className="mt-1 text-xs leading-6 text-amber-900">
            {record.pharmacyReviewNote}
          </p>
        </div>
      )}
      <p className="mt-4 border-t border-[#174b57]/7 pt-3 text-[11px] text-[#9aabad]">
        أُرسل في {formatDonationDate(record.createdAtUtc)}
      </p>
    </article>
  );
}

function pharmacyStatusLabel(status) {
  return (
    {
      PendingPharmacyReview: "بانتظار تحقق الصيدلية",
      PharmacyApproved: "وافقت الصيدلية — بانتظار التسليم",
      PharmacyRejected: "رفضت الصيدلية",
      ReceivedByPharmacy: "استلمت الصيدلية ووثّقت الدواء",
    }[status] || "بانتظار تحقق الصيدلية"
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="shrink-0 text-[#6f888d]" />
      <span className="text-[#829499]">{label}</span>
      <strong className="ms-auto max-w-[60%] truncate text-[#29464d]">
        {value}
      </strong>
    </div>
  );
}
