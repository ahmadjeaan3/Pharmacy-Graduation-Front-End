import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  ChevronDown,
  Clock3,
  History,
  Headphones,
  LockKeyhole,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
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
import {
  formatDate,
  formatDistance,
  searchTypeLabels,
} from "../utils/userFormatters";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { Brand } from "../../../shared/components/Brand";

const HISTORY_HERO_BACKGROUND =
  "/assets/app/home/hero_search.png";

const FOOTER_SOCIAL_ICONS = {
  whatsapp: "/assets/app/social/whatsapp.png",
  facebook: "/assets/app/social/facebook.png",
  email: "/assets/app/social/email.png",
  instagram: "/assets/app/social/instagram.png",
};

function ConfirmDelete({ item, pending, onCancel, onConfirm }) {
  const clearAll = item === "all";

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-[#071f25]/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <section
        dir="rtl"
        className="w-full max-w-md rounded-[18px] border border-[#174B57]/10 bg-white p-6 shadow-[0_24px_70px_rgba(7,31,37,.24)]"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-12 place-items-center rounded-[14px] bg-rose-50 text-rose-600">
            <Trash2 size={21} strokeWidth={1.8} />
          </span>

          <button
            type="button"
            className="grid size-10 place-items-center rounded-[10px] border border-[#DCE6E8] bg-white text-[#60777C] transition hover:bg-[#F4F8F8]"
            onClick={onCancel}
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="mt-5 text-[19px] font-bold text-[#29464D]">
          {clearAll ? "مسح سجل البحث؟" : "حذف عملية البحث؟"}
        </h3>

        <p className="mt-2 text-[13px] leading-7 text-[#7D8F93]">
          {clearAll
            ? "سيتم حذف جميع عمليات البحث المحفوظة في حسابك، ولا يمكن التراجع عن ذلك."
            : `سيتم حذف «${item.query || "عملية البحث"}» من السجل.`}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="inline-flex min-h-[42px] items-center justify-center rounded-[9px] border border-[#D8E3E5] bg-white px-4 text-[13px] font-semibold text-[#60777C] transition hover:bg-[#F4F8F8]"
            onClick={onCancel}
            disabled={pending}
          >
            إلغاء
          </button>

          <button
            type="button"
            className="inline-flex min-h-[42px] items-center gap-2 rounded-[9px] bg-rose-600 px-4 text-[13px] font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={pending}
          >
            <Trash2 size={15} />
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
  const [visibleCount, setVisibleCount] = useState(5);

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
      queryClient.invalidateQueries({
        queryKey: ["user", "search-history"],
      });
      setDeleteTarget(null);
    },
  });

  const historyItems = query.data ?? [];

  const visibleItems = useMemo(
    () => historyItems.slice(0, visibleCount),
    [historyItems, visibleCount],
  );

  const hasMore = visibleCount < historyItems.length;

  return (
    <div
      dir="rtl"
      className="m-0 w-full bg-[#F7F9FA] p-0 text-[#333333]"
    >
      {/* =========================
          HERO
      ========================== */}
      <section
        className="relative isolate -mt-6 overflow-hidden bg-[#0D7586] text-white sm:-mt-7 lg:-mt-8"
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <img
          src={HISTORY_HERO_BACKGROUND}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 -z-20 h-full w-full select-none object-cover object-center opacity-80"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,60,73,.20),rgba(3,110,126,.58),rgba(0,63,76,.42))]"
        />

        <div className="mx-auto flex min-h-[310px] w-full max-w-[1440px] flex-col items-center justify-center px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-[13px] bg-white/10 text-white backdrop-blur-sm">
            <History size={24} strokeWidth={1.8} />
          </span>

          <h1 className="mt-4 text-[30px] font-bold leading-tight sm:text-[34px]">
            سجل البحث
          </h1>

          <p className="mt-3 max-w-[560px] text-[13px] leading-7 text-white/75">
            ارجع إلى عمليات البحث السابقة وأعد الوصول إلى الأدوية التي بحثت عنها بسرعة.
          </p>

          <Link
            to="/app/search"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-[9px] border border-white/20 bg-white/10 px-5 text-[13px] font-semibold text-white transition hover:bg-white/20"
          >
            <Search size={16} />
            بحث جديد عن دواء
          </Link>
        </div>
      </section>

      {/* =========================
          CONTENT
      ========================== */}
      <section className="mx-auto w-full max-w-[1440px] px-5 pb-0 pt-12 sm:px-7 lg:px-10 lg:pb-0 lg:pt-16">
        {query.isPending ? (
          <UserLoadingState label="جاري تحميل سجل البحث..." />
        ) : query.isError ? (
          <UserErrorState
            message={getApiErrorMessage(query.error)}
            onRetry={query.refetch}
          />
        ) : historyItems.length ? (
          <>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div className="text-right">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-[2px] w-8 rounded-full bg-[#216474]" />
                  <span className="text-[11px] font-bold text-[#216474]">
                    عملياتك السابقة
                  </span>
                </div>

                <h2 className="text-[23px] font-bold text-[#29464D]">
                  نتائج البحث السابقة
                </h2>

                <p className="mt-1.5 text-[12px] text-[#8A9A9E]">
                  يمكنك إعادة البحث أو حذف أي عملية من السجل.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTarget("all")}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-[9px] border border-rose-100 bg-white px-4 text-[12px] font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 size={14} />
                مسح السجل بالكامل
              </button>
            </div>

            <div className="space-y-3">
              {visibleItems.map((item) => {
                const title =
                  item.query ||
                  searchTypeLabels[item.searchType] ||
                  "بحث سابق";

                const typeLabel =
                  searchTypeLabels[item.searchType] || "نشاط بحث";

                return (
                  <article
                    key={item.id}
                    className="
                      group grid min-h-[88px]
                      grid-cols-[minmax(0,1fr)_auto]
                      items-center gap-4
                      rounded-[10px]
                      border border-[#E2E8EA]
                      bg-white
                      px-5 py-4
                      shadow-[0_4px_16px_rgba(23,75,87,.025)]
                      transition
                      hover:border-[#216474]/20
                      hover:shadow-[0_8px_22px_rgba(23,75,87,.05)]
                      md:grid-cols-[minmax(0,1fr)_220px_120px]
                    "
                  >
                    {/* Right: query */}
                    <div className="min-w-0 text-right">
                      <div className="flex items-center gap-3">
                        <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-[#EEF6F6] text-[#216474]">
                          <Search size={18} strokeWidth={1.8} />
                        </span>

                        <div className="min-w-0">
                          <h3 className="truncate text-[14px] font-bold text-[#29464D]">
                            {title}
                          </h3>

                          <p className="mt-1 text-[11px] text-[#8A9A9E]">
                            {typeLabel}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Middle: meta */}
                    <div className="hidden text-right md:block">
                      <div className="flex items-center gap-2 text-[11px] text-[#768A8F]">
                        <Clock3 size={13} className="text-[#216474]" />
                        <span>{formatDate(item.searchedAtUtc, true)}</span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10.5px] text-[#8A9A9E]">
                        <span>
                          {item.resultCount.toLocaleString("ar-SY")} نتيجة
                        </span>

                        {item.radiusInMeters ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} />
                            ضمن {formatDistance(item.radiusInMeters)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Left: actions */}
                    <div className="flex items-center justify-end gap-2">
                      {item.query && item.searchType === "MedicineSearch" ? (
                        <Link
                          to={`/app/search?q=${encodeURIComponent(item.query)}`}
                          className="grid size-9 place-items-center rounded-[9px] border border-[#DCE5E7] bg-white text-[#216474] transition hover:bg-[#EEF6F6]"
                          aria-label={`إعادة البحث عن ${item.query}`}
                          title="إعادة البحث"
                        >
                          <RotateCcw size={15} strokeWidth={1.8} />
                        </Link>
                      ) : null}

                      <button
                        type="button"
                        className="grid size-9 place-items-center rounded-[9px] border border-rose-100 bg-white text-rose-500 transition hover:bg-rose-50"
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`حذف ${item.query || "عملية البحث"}`}
                        title="حذف"
                      >
                        <Trash2 size={15} strokeWidth={1.8} />
                      </button>
                    </div>

                    {/* Mobile meta */}
                    <div className="col-span-2 flex flex-wrap gap-3 border-t border-[#EEF2F3] pt-3 text-[10.5px] text-[#8A9A9E] md:hidden">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={12} />
                        {formatDate(item.searchedAtUtc, true)}
                      </span>

                      <span>
                        {item.resultCount.toLocaleString("ar-SY")} نتيجة
                      </span>

                      {item.radiusInMeters ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} />
                          ضمن {formatDistance(item.radiusInMeters)}
                        </span>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>

            {hasMore ? (
              <div className="mt-7 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((current) =>
                      Math.min(current + 5, historyItems.length),
                    )
                  }
                  className="inline-flex min-h-[42px] min-w-[190px] items-center justify-center gap-2 rounded-[8px] border border-[#216474] bg-white px-5 text-[12px] font-semibold text-[#216474] transition hover:bg-[#EEF6F6]"
                >
                  عرض المزيد
                  <ChevronDown size={15} />
                </button>
              </div>
            ) : null}
          </>
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

        {remove.isError ? (
          <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {getApiErrorMessage(remove.error)}
          </p>
        ) : null}
      </section>

   
     

      {deleteTarget ? (
        <ConfirmDelete
          item={deleteTarget}
          pending={remove.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => remove.mutate(deleteTarget)}
        />
      ) : null}
    </div>
  );
}

function DashboardFooterFeature({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center justify-start gap-3">
      <span
        className="
          grid size-10 shrink-0
          place-items-center
          rounded-[8px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={22} strokeWidth={1.8} />
      </span>

      <div className="flex flex-col items-start gap-2">
        <strong
          className="
            text-[16px]
            font-medium
            leading-none
            text-[#666666]
          "
        >
          {title}
        </strong>

        <p className="text-[12px] leading-[20px] text-[#A5A5A5]">
          {description}
        </p>
      </div>
    </div>
  );
}