import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  Clock3,
  MapPin,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  clearSearchHistory,
  deleteSearchHistoryItem,
  getSearchHistory,
  userKeys,
} from "../api/userApi";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { PageHeader as UserPageHeader } from "../../../shared/components/PageHeader";
import {
  formatDate,
  formatDistance,
  searchTypeLabels,
} from "../utils/userFormatters";
import { getApiErrorMessage } from "../../../shared/api/errors";

function ConfirmDelete({ item, pending, onCancel, onConfirm }) {
  const clearAll = item === "all";
  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <section className="w-full max-w-md rounded-[1.6rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <Trash2 size={22} />
          </span>
          <button
            className="icon-button grid"
            onClick={onCancel}
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>
        <h3 className="mt-5 text-xl font-black">
          {clearAll ? "مسح سجل البحث؟" : "حذف عملية البحث؟"}
        </h3>
        <p className="mt-2 text-sm leading-7 text-[#71858a]">
          {clearAll
            ? "سيتم حذف جميع عمليات البحث المحفوظة في حسابك، ولا يمكن التراجع عن ذلك."
            : `سيتم حذف «${item.query || "عملية البحث"}» من السجل.`}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="btn-secondary"
            onClick={onCancel}
            disabled={pending}
          >
            إلغاء
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={pending}
          >
            <Trash2 size={16} />
            {pending ? "جاري الحذف..." : "تأكيد الحذف"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function SearchHistoryPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const query = useQuery({
    queryKey: userKeys.searchHistory(50),
    queryFn: () => getSearchHistory(50),
  });
  const remove = useMutation({
    mutationFn: (target) =>
      target === "all"
        ? clearSearchHistory()
        : deleteSearchHistoryItem(target.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "search-history"] });
      setDeleteTarget(null);
    },
  });

  return (
    <div className="space-y-6">
      <UserPageHeader
        eyebrow="ارجع إلى ما يهمك"
        title="سجل البحث"
        description="راجع عمليات البحث السابقة وعد إلى البحث عن الدواء بسرعة."
        icon={CalendarClock}
      />
      {query.isPending ? (
        <UserLoadingState label="جاري تحميل سجل البحث..." />
      ) : query.isError ? (
        <UserErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={query.refetch}
        />
      ) : query.data.length ? (
        <section className="relative rounded-[1.5rem] border border-[#174b57]/8 bg-white p-5 lg:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-black">عمليات البحث المحفوظة</h3>
              <p className="mt-1 text-xs text-[#829499]">
                {query.data.length.toLocaleString("ar-SY")} عملية ظاهرة
              </p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-rose-100 px-3.5 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
              onClick={() => setDeleteTarget("all")}
            >
              <Trash2 size={15} />
              مسح السجل بالكامل
            </button>
          </div>
          <div className="absolute bottom-8 right-[2.15rem] top-28 w-px bg-slate-100" />
          <div className="relative space-y-3">
            {query.data.map((item) => (
              <article
                key={item.id}
                className="flex items-start gap-4 rounded-[1.2rem] bg-[#f8fbfa] p-4"
              >
                <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#216474] shadow-sm">
                  <Search size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#216474]">
                        {searchTypeLabels[item.searchType] || "نشاط بحث"}
                      </span>
                      <h3 className="mt-1 font-extrabold text-[#29464d]">
                        {item.query ||
                          searchTypeLabels[item.searchType] ||
                          "بحث سابق"}
                      </h3>
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-[#8a9a9e]">
                      <Clock3 size={13} />
                      {formatDate(item.searchedAtUtc, true)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-[#71858a]">
                    <span>
                      {item.resultCount.toLocaleString("ar-SY")} نتيجة
                    </span>
                    {item.radiusInMeters && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        ضمن {formatDistance(item.radiusInMeters)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {item.query && item.searchType === "MedicineSearch" && (
                    <Link
                      to={`/app/search?q=${encodeURIComponent(item.query)}`}
                      className="icon-button grid"
                      aria-label={`إعادة البحث عن ${item.query}`}
                    >
                      <RotateCcw size={16} />
                    </Link>
                  )}
                  <button
                    className="icon-button grid text-rose-600"
                    onClick={() => setDeleteTarget(item)}
                    aria-label={`حذف ${item.query || "عملية البحث"}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <UserEmptyState
          title="سجل البحث فارغ"
          description="عندما تبحث عن دواء أو صيدلية ستجد نشاطك السابق هنا."
          action={
            <Link to="/app/search" className="btn-primary mx-auto mt-5">
              ابدأ البحث
            </Link>
          }
        />
      )}
      {remove.isError && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {getApiErrorMessage(remove.error)}
        </p>
      )}
      {deleteTarget && (
        <ConfirmDelete
          item={deleteTarget}
          pending={remove.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => remove.mutate(deleteTarget)}
        />
      )}
    </div>
  );
}
