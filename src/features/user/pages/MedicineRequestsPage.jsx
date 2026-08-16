import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileClock,
  Headphones,
  Info,
  LockKeyhole,
  Pill,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getMedicineRequests, userKeys } from "../api/userApi";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { Brand } from "../../../shared/components/Brand";

const REQUESTS_HERO_BACKGROUND = "/assets/app/home/hero_search.png";


const REQUESTS_NOTICE_IMAGE = "/assets/app/home/pharmacy.png";

const FOOTER_SOCIAL_ICONS = {
  whatsapp: "/assets/app/social/whatsapp.png",
  facebook: "/assets/app/social/facebook.png",
  email: "/assets/app/social/email.png",
  instagram: "/assets/app/social/instagram.png",
};

const filters = [
  { value: "", label: "جميع الطلبات" },
  { value: "Pending", label: "قيد المراجعة" },
  { value: "Available", label: "متوفر" },
  { value: "Unavailable", label: "غير متوفر" },
  { value: "Cancelled", label: "الملغاة" },
];

function normalizeSearch(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getStatusCount(items, status) {
  if (!status) return items.length;
  return items.filter((item) => item.status === status).length;
}


function getRequestStatusMeta(status) {
  const value = String(status || "").toLowerCase();

  if (value === "available") {
    return {
      label: "متوفر",
      className: "border-[#C9EBD8] bg-[#E9F8EF] text-[#2A8B57]",
    };
  }

  if (value === "pending") {
    return {
      label: "قيد المراجعة",
      className: "border-[#D6E8ED] bg-[#EDF6F8] text-[#216474]",
    };
  }

  if (value === "unavailable") {
    return {
      label: "غير متوفر",
      className: "border-[#FFD1D1] bg-[#FFF0F0] text-[#D64C4C]",
    };
  }

  if (value === "cancelled") {
    return {
      label: "ملغي",
      className: "border-[#E4E8EA] bg-[#F4F6F7] text-[#71858A]",
    };
  }

  return {
    label: status || "غير محدد",
    className: "border-[#DCE5E7] bg-[#F7FAFA] text-[#60777C]",
  };
}

function formatRequestDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-SY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatRequestTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-SY", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function MedicineRequestsPage() {
  const { t } = useTranslation();

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest");

  // القائمة الأساسية حسب الفلتر المحدد.
  const query = useQuery({
    queryKey: userKeys.medicineRequests({ status }),
    queryFn: () => getMedicineRequests({ status, take: 100 }),
  });

  // نسخة كاملة من الطلبات لاستخدامها فقط في إحصائيات الهيرو.
  const overviewQuery = useQuery({
    queryKey: userKeys.medicineRequests({ status: "", overview: true }),
    queryFn: () => getMedicineRequests({ take: 100 }),
    staleTime: 30_000,
  });

  const allRequests = overviewQuery.data ?? [];

  const pendingCount = useMemo(
    () => getStatusCount(allRequests, "Pending"),
    [allRequests],
  );

  const activeCount = useMemo(
    () =>
      allRequests.filter((item) =>
        ["Pending", "Available"].includes(item.status),
      ).length,
    [allRequests],
  );

  const requests = useMemo(() => {
    const term = normalizeSearch(search);

    const filtered = (query.data ?? []).filter((item) => {
      if (!term) return true;

      return normalizeSearch(
        `${item.medicineName ?? ""} ${item.arabicMedicineName ?? ""} ${
          item.medicineDisplayName ?? ""
        } ${item.pharmacyName ?? ""} ${item.requestCode ?? ""}`,
      ).includes(term);
    });

    return [...filtered].sort((a, b) => {
      const aDate = new Date(a.createdAtUtc ?? 0).getTime();
      const bDate = new Date(b.createdAtUtc ?? 0).getTime();

      return sortOrder === "Oldest" ? aDate - bDate : bDate - aDate;
    });
  }, [query.data, search, sortOrder]);

  return (
    <div
      dir="rtl"
      className="m-0 min-h-screen w-full bg-[#F7F9FA] p-0 text-[#333333]"
    >
      {/* =====================================================
          HERO
      ====================================================== */}
      <section
        className="
          relative isolate
          -mt-6 overflow-hidden
          bg-[#0D7586]
          text-white
          sm:-mt-7
          lg:-mt-8
        "
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <img
          src={REQUESTS_HERO_BACKGROUND}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="
            absolute inset-0 -z-20
            h-full w-full
            select-none
            object-cover object-center
            opacity-80
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute inset-0 -z-10
            bg-[linear-gradient(90deg,rgba(0,60,73,.18),rgba(3,110,126,.58),rgba(0,63,76,.44))]
          "
        />

        <div
          className="
            mx-auto grid min-h-[200px]
            w-full max-w-[1200px]
            items-center gap-6
            px-5 py-7
            sm:px-7
            lg:grid-cols-[1fr_auto]
            lg:px-8
          "
        >
          {/* العنوان */}
          <div className="flex min-w-0 items-center gap-4 text-right">
            <span
              className="
                grid size-12 shrink-0
                place-items-center
                rounded-[10px]
                border border-white/15
                bg-white/10
                text-white
                backdrop-blur-sm
              "
            >
              <ClipboardList size={23} strokeWidth={1.8} />
            </span>

            <div className="min-w-0">
              <h1 className="text-[27px] font-bold leading-tight sm:text-[30px]">
                {t("طلباتي")}
              </h1>

              <p className="mt-2 max-w-[560px] text-[11.5px] leading-6 text-white/75">
                {t("تابع حالة طلباتك وتفاصيلها، وتعرّف على آخر تحديث لكل طلب.")}
              </p>
            </div>
          </div>

          {/* الإحصائيات */}
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-[369px]">
            <div
              className="
                flex min-h-[72px] items-center gap-3
                rounded-[9px]
                border border-white/12
                bg-white/12
                px-4 py-3
                backdrop-blur-sm
              "
            >
              <span className="grid size-11 place-items-center rounded-[8px] bg-white/12">
                <FileClock size={18} strokeWidth={1.8} />
              </span>

              <div className="text-right">
                <span className="block text-[9.5px] text-white/70">
                  {t("طلبات قيد المتابعة")}
                </span>
                <strong className="mt-1 block text-[20px] font-bold text-white">
                  {activeCount.toLocaleString("ar-SY")}
                </strong>
              </div>
            </div>

            <div
              className="
                flex min-h-[72px] items-center gap-3
                rounded-[9px]
                border border-white/12
                bg-white/12
                px-4 py-3
                backdrop-blur-sm
              "
            >
              <span className="grid size-11 place-items-center rounded-[8px] bg-white/12">
                <ClipboardList size={18} strokeWidth={1.8} />
              </span>

              <div className="text-right">
                <span className="block text-[9.5px] text-white/70">
                  {t("إجمالي الطلبات")}
                </span>
                <strong className="mt-1 block text-[20px] font-bold text-white">
                  {allRequests.length.toLocaleString("ar-SY")}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <main className="mx-auto w-full max-w-[1200px] px-0 pb-10 pt-10">
        {/* شريط الفلاتر */}
        <section
          className="
            mb-10
            grid min-h-10 items-center gap-5
            lg:grid-cols-[641px_359px_123px]
          "
        >
          <div className="flex min-w-0 gap-2 overflow-x-auto">
            {filters.map((item) => {
              const count = getStatusCount(allRequests, item.value);

              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setStatus(item.value)}
                  className={`
                    min-h-[38px]
                    shrink-0
                    rounded-[8px]
                    border
                    px-4
                    text-[12px]
                    font-semibold
                    transition
                    ${
                      status === item.value
                        ? "border-[#174B57] bg-[#174B57] text-white"
                        : "border-[#E3E9EA] bg-white text-[#60777C] hover:border-[#BFD2D5] hover:bg-[#F5F9F9]"
                    }
                  `}
                >
                  {t(item.label)}

                  {item.value === "Pending" && pendingCount > 0 ? (
                    <span className="me-1 opacity-70">
                      ({pendingCount.toLocaleString("ar-SY")})
                    </span>
                  ) : item.value === "" && allRequests.length > 0 ? (
                    <span className="me-1 opacity-70">
                      ({count.toLocaleString("ar-SY")})
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search
              size={15}
              strokeWidth={1.7}
              className="
                pointer-events-none
                absolute right-3 top-1/2
                -translate-y-1/2
                text-[#93A3A6]
              "
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="
                h-10 w-full
                rounded-[4px]
                border border-[#DCE5E7]
                bg-[#FBFDFD]
                pr-9 pl-4
                text-right text-[10.5px]
                text-[#29464D]
                outline-none
                transition
                placeholder:text-[#A0ADB0]
                focus:border-[#216474]
                focus:bg-white
              "
              placeholder={t("ابحث عن طلب أو صيدلية...")}
            />
          </div>

          <div className="relative">
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="
                h-10 w-full
                appearance-none
                rounded-[6px]
                border border-[#DCE5E7]
                bg-white
                pr-3 pl-9
                text-[10.5px] font-medium
                text-[#60777C]
                outline-none
              "
            >
              <option value="Newest">{t("ترتيب حسب الأحدث")}</option>
              <option value="Oldest">{t("ترتيب حسب الأقدم")}</option>
            </select>

            <ChevronDown
              size={14}
              className="
                pointer-events-none
                absolute left-3 top-1/2
                -translate-y-1/2
                text-[#7B9196]
              "
            />
          </div>
        </section>

        {/* النتائج */}
        {query.isPending ? (
          <UserLoadingState label={t("جاري تحميل طلباتك...")} />
        ) : query.isError ? (
          <UserErrorState
            message={getApiErrorMessage(query.error)}
            onRetry={query.refetch}
          />
        ) : requests.length ? (
          <>
            <section className="space-y-3">
              {requests.map((request) => {
                const statusMeta = getRequestStatusMeta(request.status);
                const displayName =
                  request.medicineDisplayName ||
                  request.arabicMedicineName ||
                  request.medicineName ||
                  t("دواء");

                return (
                  <article
                    key={request.requestId}
                    className="
                      group
                      grid min-h-[88px]
                      items-center
                      rounded-[8px]
                      border border-[rgba(102,102,102,0.16)]
                      bg-white
                      px-6 py-2
                      transition
                      hover:border-[#C9DADD]
                      lg:grid-cols-[204px_1px_144px_1px_159px_1px_111px_1px_minmax(101px,1fr)_132px]
                      lg:gap-0
                    "
                  >
                    {/* الدواء */}
                    <div className="flex min-w-0 items-center gap-5">
                      <span
                        className="
                          grid size-10 shrink-0
                          place-items-center
                          rounded-[8px]
                          bg-[#E6F3F6]
                          text-[#216474]
                        "
                      >
                        <Pill size={24} strokeWidth={1.7} />
                      </span>

                      <div className="min-w-0 text-right">
                        <h3 className="truncate text-[16px] font-medium leading-none text-[#333333]">
                          {displayName}
                        </h3>

                        <p className="mt-2 truncate text-[12px] leading-none text-[#A5A5A5]">
                          {request.requestCode || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="hidden h-11 w-px bg-[rgba(102,102,102,0.16)] lg:block" />

                    {/* وقت الطلب */}
                    <div className="flex items-center justify-center gap-2 px-3 text-[10px] text-[#71858A]">
                      <Clock3
                        size={13}
                        strokeWidth={1.7}
                        className="text-[#9AACB0]"
                      />
                      <div>
                        <span className="block text-[8.5px] text-[#A6B0B2]">
                          {t("وقت الطلب")}
                        </span>
                        <strong className="mt-0.5 block font-semibold text-[#60777C]">
                          {formatRequestTime(request.createdAtUtc)}
                        </strong>
                      </div>
                    </div>

                    <div className="hidden h-11 w-px bg-[rgba(102,102,102,0.16)] lg:block" />

                    {/* تاريخ الطلب */}
                    <div className="flex items-center justify-center gap-2 px-3 text-[10px] text-[#71858A]">
                      <CalendarDays
                        size={13}
                        strokeWidth={1.7}
                        className="text-[#9AACB0]"
                      />
                      <div>
                        <span className="block text-[8.5px] text-[#A6B0B2]">
                          {t("تاريخ الطلب")}
                        </span>
                        <strong className="mt-0.5 block whitespace-nowrap font-semibold text-[#60777C]">
                          {formatRequestDate(request.createdAtUtc)}
                        </strong>
                      </div>
                    </div>

                    <div className="hidden h-11 w-px bg-[rgba(102,102,102,0.16)] lg:block" />

                    {/* الكمية */}
                    <div className="flex items-center justify-center gap-2 px-3 text-[10px] text-[#71858A]">
                      <ClipboardList
                        size={14}
                        strokeWidth={1.7}
                        className="text-[#A5A5A5]"
                      />
                      <div>
                        <span className="block text-[8.5px] text-[#A6B0B2]">
                          {t("الكمية")}
                        </span>
                        <strong className="mt-0.5 block font-semibold text-[#60777C]">
                          {Number(
                            request.requestedQuantity || 0,
                          ).toLocaleString("ar-SY")}
                        </strong>
                      </div>
                    </div>

                    <div className="hidden h-11 w-px bg-[rgba(102,102,102,0.16)] lg:block" />

                    {/* الحالة */}
                    <div className="flex justify-start px-4 lg:justify-center">
                      <span
                        className={`
                          inline-flex h-7 min-w-[101px]
                          items-center justify-center
                          rounded-full border
                          px-3
                          text-[14px]
                          font-medium
                          ${statusMeta.className}
                        `}
                      >
                        {t(statusMeta.label)}
                      </span>
                    </div>

                    {/* الإجراء */}
                    <div className="flex justify-start lg:justify-end">
                      <Link
                        to={`/app/requests/${request.requestId}`}
                        className="
                          inline-flex h-11
                          w-[132px]
                          items-center justify-center
                          rounded-[8px]
                          bg-[#216474]
                          px-4
                          text-[14px]
                          font-medium
                          text-white
                          transition
                          hover:bg-[#174B57]
                        "
                      >
                        {t("عرض الطلب")}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>

    <section
  className="
    mt-5
    flex min-h-[102px]
    items-center justify-between gap-6
    rounded-[12px]
    border border-[rgba(102,102,102,0.16)]
    bg-[rgba(230,243,246,0.6)]
    px-6 py-4
  "
>
  {/* الأيقونة ثم النص مباشرة */}
  <div className="flex min-w-0 items-center gap-3">
    <Info
      size={32}
      strokeWidth={1.7}
      className="shrink-0 text-[#216474]"
    />

    <div className="min-w-0 text-right">
      <h3 className="text-[20px] font-medium leading-none text-[#333333]">
        {t("تنويه هام")}
      </h3>

      <p className="mt-3 text-[16px] leading-[1.63] text-[#A5A5A5]">
        {t(
          "هذه الخدمة مخصصة فقط لتأكيد توفر الدواء داخل الصيدلية، ولا توفر المنصة خدمة توصيل الأدوية.",
        )}
      </p>
    </div>
  </div>

  {/* الصورة في أقصى اليسار + شفافية */}
  <img
    src={REQUESTS_NOTICE_IMAGE}
    alt=""
    aria-hidden="true"
    className="
      h-[68px] w-[102px]
      shrink-0
      object-contain
      opacity-30
    "
  />
</section>
          </>
        ) : (
          <UserEmptyState
            title={
              search
                ? t("لا توجد نتائج مطابقة")
                : t("لا توجد طلبات في هذه القائمة")
            }
            description={
              search
                ? t("جرّب البحث باسم مختلف.")
                : t("يمكنك البحث عن دواء وإرسال طلب إلى الصيدلية المناسبة.")
            }
          />
        )}
      </main>

    
    </div>
  );

}

function FooterFeature({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center justify-start gap-3">
      <span
        className="
          grid size-9 shrink-0
          place-items-center
          rounded-[7px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={18} strokeWidth={1.8} />
      </span>

      <div className="flex flex-col items-start gap-1.5">
        <strong className="text-[13px] font-medium text-[#666666]">
          {title}
        </strong>

        <p className="text-[10.5px] text-[#A5A5A5]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default MedicineRequestsPage;