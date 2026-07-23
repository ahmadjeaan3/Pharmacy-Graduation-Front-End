import { ArrowLeft, Clock3, Hash, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, getRequestStatus } from "../utils/userFormatters";

export function RequestCard({ request }) {
  const status = getRequestStatus(request.status, request.statusDisplayText);
  return (
    <article className="rounded-[1.35rem] border border-[#174b57]/8 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
            <PackageSearch size={20} />
          </span>
          <div>
            <h3 className="font-extrabold text-[#29464d]">
              {request.medicineName}
            </h3>
            <p className="mt-1 text-sm text-[#71858a]">
              {request.pharmacyName}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-bold ${status.tone}`}
        >
          {status.label}
        </span>
      </div>
      <div className="mt-5 grid gap-2 text-xs text-[#71858a] sm:grid-cols-3">
        <span className="flex items-center gap-1.5">
          <Hash size={14} />
          {request.requestCode}
        </span>
        <span>الكمية: {request.requestedQuantity.toLocaleString("ar-SY")}</span>
        <span className="flex items-center gap-1.5">
          <Clock3 size={14} />
          {formatDate(request.createdAtUtc, true)}
        </span>
      </div>
      <Link
        to={`/app/requests/${request.requestId}`}
        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#216474]"
      >
        متابعة الطلب <ArrowLeft size={15} />
      </Link>
    </article>
  );
}
