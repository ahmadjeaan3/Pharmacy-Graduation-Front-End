import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMedicineRequests, userKeys } from "../api/userApi";
import { RequestCard } from "../components/RequestCard";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { PageHeader as UserPageHeader } from "../../../shared/components/PageHeader";
import { getApiErrorMessage } from "../../../shared/api/errors";

const filters = [
  { value: "", label: "جميع الطلبات" },
  { value: "Pending", label: "قيد المراجعة" },
  { value: "Available", label: "متوفر" },
  { value: "Unavailable", label: "غير متوفر" },
  { value: "Cancelled", label: "الملغاة" },
];

export function MedicineRequestsPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: userKeys.medicineRequests({ status }),
    queryFn: () => getMedicineRequests({ status, take: 100 }),
  });
  const requests = useMemo(
    () =>
      (query.data ?? []).filter((item) =>
        `${item.medicineName} ${item.pharmacyName} ${item.requestCode}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      ),
    [query.data, search],
  );
  return (
    <div className="space-y-6">
      <UserPageHeader
        eyebrow="متابعة واضحة"
        title="طلبات الأدوية"
        description="تابع ردود الصيدليات وحالة كل طلب، وارجع إلى تفاصيله في أي وقت."
        icon={ClipboardList}
        action={
          <Link
            to="/app/search"
            className="inline-flex items-center gap-2 rounded-xl bg-[#f5cb72] px-4 py-3 text-sm font-black text-[#173d46]"
          >
            <Plus size={17} />
            طلب جديد
          </Link>
        }
      />
      <section className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((item) => (
              <button
                type="button"
                key={item.value}
                onClick={() => setStatus(item.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${status === item.value ? "bg-[#174b57] text-white" : "bg-[#f3f7f6] text-[#60777c] hover:bg-[#eaf4f3]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="field-control w-full lg:w-80">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="form-input has-field-icon"
              placeholder="بحث بالدواء أو الصيدلية أو الرقم"
            />
            <span className="field-icon-shell">
              <Search size={18} />
            </span>
          </div>
        </div>
      </section>
      {query.isPending ? (
        <UserLoadingState label="جاري تحميل طلباتك..." />
      ) : query.isError ? (
        <UserErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : requests.length ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {requests.map((request) => (
            <RequestCard key={request.requestId} request={request} />
          ))}
        </section>
      ) : (
        <UserEmptyState
          title={
            search ? "لا توجد نتائج مطابقة" : "لا توجد طلبات في هذه القائمة"
          }
          description={
            search
              ? "جرّب البحث باسم مختلف."
              : "يمكنك البحث عن دواء وإرسال طلب إلى الصيدلية المناسبة."
          }
          action={
            <Link to="/app/search" className="btn-primary mx-auto mt-5">
              ابحث عن دواء
            </Link>
          }
        />
      )}
    </div>
  );
}
