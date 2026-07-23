import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { getPharmacyRequests, pharmacyKeys } from "../api/pharmacyApi";
import { PharmacyPageHeader } from "../components/PharmacyPageHeader";
import {
  PharmacyEmptyState,
  PharmacyErrorState,
  PharmacyLoadingState,
} from "../components/PharmacyStates";
import {
  formatDate,
  formatNumber,
  requestMeta,
} from "../utils/pharmacyFormatters";

export function PharmacyRequestsPage() {
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "",
    take: 50,
  });
  const [queryFilters, setQueryFilters] = useState(filters);
  useEffect(() => {
    const timer = setTimeout(() => setQueryFilters(filters), 350);
    return () => clearTimeout(timer);
  }, [filters]);
  const query = useQuery({
    queryKey: pharmacyKeys.requests(queryFilters),
    queryFn: () => getPharmacyRequests(queryFilters),
  });
  return (
    <div>
      <PharmacyPageHeader
        eyebrow="طلبات المرضى"
        title="طلبات الأدوية"
        description="راجع الطلبات الواردة، تحقق من المخزون، ثم أرسل للمريض إجابة دقيقة أو اقترح بديلاً متاحًا."
      />
      <section className="surface mb-5 grid gap-3 p-4 md:grid-cols-[1fr_230px]">
        <div className="field-control">
          <span className="field-icon-shell">
            <Search size={17} />
          </span>
          <input
            className="form-input has-field-icon"
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((f) => ({ ...f, searchTerm: e.target.value }))
            }
            placeholder="اسم الدواء أو المريض أو رقم الهاتف"
          />
        </div>
        <select
          className="form-input"
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
        >
          <option value="">كل الطلبات</option>
          <option value="Pending">بانتظار الرد</option>
          <option value="Available">متوفر</option>
          <option value="Unavailable">غير متوفر</option>
          <option value="Cancelled">ملغي</option>
        </select>
      </section>
      {query.isLoading ? (
        <PharmacyLoadingState label="جاري تحميل الطلبات..." />
      ) : query.isError ? (
        <PharmacyErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : !query.data?.length ? (
        <PharmacyEmptyState
          title="لا توجد طلبات مطابقة"
          description="ستظهر طلبات المرضى الجديدة هنا فور وصولها إلى الصيدلية."
        />
      ) : (
        <div className="space-y-3">
          {query.data.map((request) => {
            const meta = requestMeta(request.status);
            return (
              <Link
                to={`/app/pharmacy/requests/${request.requestId}`}
                key={request.requestId}
                className="surface group grid gap-4 p-5 transition hover:-translate-y-0.5 hover:border-[#216474]/25 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div className="flex min-w-0 gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
                    <ClipboardList size={21} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-black">
                        {request.medicineName}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-black ${meta.className}`}
                      >
                        {meta.label}
                      </span>
                      <span
                        className="text-xs font-bold text-[#829499]"
                        dir="ltr"
                      >
                        #{request.requestCode}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#71858a]">
                      <span className="flex items-center gap-1.5">
                        <UserRound size={14} />
                        {request.userFullName}
                      </span>
                      {request.userPhoneNumber && (
                        <span className="flex items-center gap-1.5" dir="ltr">
                          <Phone size={14} />
                          {request.userPhoneNumber}
                        </span>
                      )}
                      <span>
                        الكمية: {formatNumber(request.requestedQuantity)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarClock size={14} />
                        {formatDate(request.createdAtUtc, true)}
                      </span>
                    </div>
                    {request.note && (
                      <p className="mt-3 line-clamp-1 text-xs text-[#829499]">
                        ملاحظة: {request.note}
                      </p>
                    )}
                  </div>
                </div>
                <span className="btn-quiet justify-self-end">
                  فتح الطلب{" "}
                  <ArrowLeft
                    size={16}
                    className="transition group-hover:-translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
