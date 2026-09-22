import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Gift,
  HandHeart,
  Headphones,
  HeartHandshake,
  History,
  LockKeyhole,
  Package,
  Pill,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { Brand } from "../../../shared/components/Brand";

import {
  donationKeys,
  getMyAssistanceRequests,
  getMyDonationOffers,
} from "../api/donationsApi";

import { AssistanceRequestForm } from "../components/AssistanceRequestForm";
import { DonationOfferForm } from "../components/DonationOfferForm";
import { ProtectedDonationImage } from "../components/ProtectedDonationImage";

import {
  assistanceStatuses,
  getStatusMeta,
  offerStatuses,
} from "../utils/donationFormatters";

/* =========================================================
   ASSETS
========================================================= */

const HERO_BACKGROUND = "/assets/app/home/hero_search.png";

/*
  هذه الصورة موجودة أصلًا ضمن assets المستخدمة بالمشروع.
  إذا عندك صورة السلة الكبيرة الخاصة بتصميم Figma،
  غيّر المسار هنا فقط بدون تعديل أي JSX.
*/
const HERO_DONATION_IMAGE = "/assets/app/home/donation.png";

const FOOTER_SOCIAL_ICONS = {
  whatsapp: "/assets/app/social/whatsapp.png",
  facebook: "/assets/app/social/facebook.png",
  email: "/assets/app/social/email.png",
  instagram: "/assets/app/social/instagram.png",
};

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("ar-SY-u-nu-latn", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getRecordStatus(record, type) {
  return (
    getStatusMeta?.(
      record?.status,
      type === "offer" ? "offer" : "assistance",
    ) || {
      label: record?.status || "غير محدد",
    }
  );
}

function getStatusClasses(status) {
  const normalized = String(status || "").toLowerCase();

  if (
    normalized.includes("approved") ||
    normalized.includes("received") ||
    normalized.includes("fulfilled")
  ) {
    return "bg-[#DCF8E6] text-[#27824D]";
  }

  if (normalized.includes("rejected") || normalized.includes("cancel")) {
    return "bg-[#FFF0F0] text-[#D95454]";
  }

  if (normalized.includes("review") || normalized.includes("pending")) {
    return "bg-[#E6F3F6] text-[#216474]";
  }

  return "bg-[#EEF3F4] text-[#71858A]";
}

/* =========================================================
   PAGE
========================================================= */

export function DonationsPage() {
  const [searchParams] = useSearchParams();
  const requestedAction =
    searchParams.get("action") === "assistance" ? "assistance" : "offer";
  const initialTarget = useMemo(
    () => ({
      organizationId: searchParams.get("organizationId") || "",
      campaignId: searchParams.get("campaignId") || "",
    }),
    [searchParams],
  );
  const hasRequestedForm = Boolean(
    searchParams.get("action") || initialTarget.campaignId,
  );
  const [formType, setFormType] = useState(requestedAction);
  const [showForm, setShowForm] = useState(hasRequestedForm);

  const [listType, setListType] = useState("offer");

  const [offerStatus, setOfferStatus] = useState("");
  const [assistanceStatus, setAssistanceStatus] = useState("");

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const offerParams = {
    status: offerStatus,
    take: 50,
  };

  const assistanceParams = {
    status: assistanceStatus,
    take: 50,
  };

  const offers = useQuery({
    queryKey: donationKeys.offers(offerParams),
    queryFn: () => getMyDonationOffers(offerParams),
  });

  const requests = useQuery({
    queryKey: donationKeys.assistanceRequests(assistanceParams),
    queryFn: () => getMyAssistanceRequests(assistanceParams),
  });

  const switchForm = (type) => {
    setFormType(type);
    setShowForm(true);

    window.setTimeout(() => {
      document.getElementById("donation-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  };

  const activeRecords = useMemo(
    () => (listType === "offer" ? offers.data || [] : requests.data || []),
    [listType, offers.data, requests.data],
  );

  const filteredRecords = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return activeRecords;

    return activeRecords.filter((record) =>
      [
        record.medicineName,
        record.scientificName,
        record.targetOrganizationName,
        record.campaignTitle,
        record.reviewingPharmacyName,
        record.notes,
      ].some((item) =>
        String(item || "")
          .toLowerCase()
          .includes(value),
      ),
    );
  }, [activeRecords, search]);

  const activeQuery = listType === "offer" ? offers : requests;

  const activeStatus = listType === "offer" ? offerStatus : assistanceStatus;

  const activeStatuses =
    listType === "offer" ? offerStatuses : assistanceStatuses;

  const setActiveStatus =
    listType === "offer" ? setOfferStatus : setAssistanceStatus;

  return (
    <div
      dir="rtl"
      className="
        m-0 min-h-screen w-full
        bg-[#F7F9FA] p-0
        text-[#333333]
      "
    >
      {/* =====================================================
          HERO — نفس عرض صفحات المستخدم
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
          src={HERO_BACKGROUND}
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
          dir="ltr"
          className="
            mx-auto grid min-h-[300px]
            w-full max-w-[1200px]
            items-center gap-8
            px-5 py-8
            sm:px-7
            lg:grid-cols-[280px_1fr]
            lg:px-8
          "
        >
          {/* الصورة — اليسار */}
          <div className="hidden h-full items-end justify-center lg:flex">
            <img
              src={HERO_DONATION_IMAGE}
              alt=""
              aria-hidden="true"
              className="
              mr-20
                max-h-[220px]
                w-[270px]
                object-contain
                drop-shadow-[0_20px_24px_rgba(0,0,0,.16)]
              "
            />
          </div>

          {/* المحتوى — اليمين */}
          <div dir="rtl" className="min-w-0 text-right">
            <div className="flex items-center gap-3">
              <span
                className="
                  grid size-11 shrink-0
                  place-items-center
                  rounded-[9px]
                  border border-white/15
                  bg-white/10
                  backdrop-blur-sm
                "
              >
                <HeartHandshake size={22} strokeWidth={1.8} />
              </span>

              <div>
                <h1
                  className="
                    text-[27px] font-bold
                    leading-tight
                    sm:text-[30px]
                  "
                >
                  التبرعات والمساعدة الدوائية
                </h1>

                <p
                  className="
                    mt-2 text-[12px]
                    leading-6 text-white/75
                  "
                >
                  ساهم في إيصال الدواء لمن يحتاجه أو اطلب المساعدة من منظمة
                  معتمدة.
                </p>
              </div>
            </div>

            {/* كرتا الإجراء */}
            <div
              className="
                mt-6 grid gap-4
                md:grid-cols-2
              "
            >
              <HeroActionCard
                icon={Gift}
                title="تبرع بدواء"
                description="لديك دواء صالح للتبرع؟"
                buttonLabel="تبرع بدواء"
                buttonClassName="
                  bg-[#216474]
                  text-white
                  hover:bg-[#174B57]
                "
                onClick={() => switchForm("offer")}
              />

              <HeroActionCard
                icon={HandHeart}
                title="طلب المساعدة"
                description="تحتاج دواء ولا تستطيع تأمينه؟"
                buttonLabel="تقديم طلب مساعدة"
                buttonClassName="
                  bg-[#DFAF45]
                  text-white
                  hover:bg-[#C99B35]
                "
                onClick={() => switchForm("assistance")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          BODY
      ====================================================== */}
      <main
        className="
          mx-auto w-full
          max-w-[1200px]
          px-4 pb-12 pt-10
          sm:px-6
          lg:px-8
          xl:px-0
        "
      >
        {/* FORM — يظهر فقط عند الضغط على أحد كروت Hero */}
        {showForm ? (
          <section
            id="donation-form"
            className="
              scroll-mt-28
              overflow-hidden
              rounded-[10px]
              border border-[rgba(102,102,102,.14)]
              bg-white
              shadow-[0_8px_24px_rgba(23,75,87,.035)]
            "
          >
            <div
              className="
                grid grid-cols-2
                border-b border-[rgba(102,102,102,.12)]
                p-2
              "
            >
              <FormTab
                active={formType === "offer"}
                icon={Gift}
                label="عرض تبرع"
                onClick={() => setFormType("offer")}
              />

              <FormTab
                active={formType === "assistance"}
                icon={HandHeart}
                label="طلب مساعدة"
                onClick={() => setFormType("assistance")}
              />
            </div>

            <div className="p-5 lg:p-7">
              {formType === "offer" ? (
                <DonationOfferForm initialTarget={initialTarget} />
              ) : (
                <AssistanceRequestForm initialTarget={initialTarget} />
              )}
            </div>
          </section>
        ) : null}

        {/* ===================================================
            TABS — مطابق للصورة
        ==================================================== */}
        <section className={showForm ? "mt-10" : ""}>
          <div
            className="
              grid h-11
              grid-cols-2
              overflow-hidden
              rounded-[4px]
              border border-[rgba(102,102,102,.12)]
              bg-white
            "
          >
            <button
              type="button"
              onClick={() => {
                setListType("offer");
                setShowForm(false);
                setVisibleCount(5);
              }}
              className={`
                inline-flex
                items-center justify-center
                gap-2 text-[13px]
                font-medium transition
                ${
                  listType === "offer"
                    ? "bg-[#216474] text-white"
                    : "bg-white text-[#A5A5A5]"
                }
              `}
            >
              <Gift size={16} />
              عروضي للتبرع
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">
                {(offers.data || []).length.toLocaleString("ar-SY-u-nu-latn")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setListType("assistance");
                setShowForm(false);
                setVisibleCount(5);
              }}
              className={`
                inline-flex
                items-center justify-center
                gap-2 text-[13px]
                font-medium transition
                ${
                  listType === "assistance"
                    ? "bg-[#216474] text-white"
                    : "bg-white text-[#A5A5A5]"
                }
              `}
            >
              <HandHeart size={16} />
              طلبات المساعدة
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">
                {(requests.data || []).length.toLocaleString("ar-SY-u-nu-latn")}
              </span>
            </button>
          </div>

          {/* =================================================
              FILTERS
          ================================================== */}
          <div
            className="
              mt-6 flex flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <label
              className="
                flex h-10
                min-w-0 flex-1
                items-center gap-2
                rounded-[5px]
                border border-[rgba(102,102,102,.14)]
                bg-white px-3
                sm:max-w-[720px]
              "
            >
              <Search size={16} className="shrink-0 text-[#A5A5A5]" />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleCount(5);
                }}
                placeholder="ابحث داخل سجل التبرعات..."
                className="
                  min-w-0 flex-1
                  bg-transparent
                  text-right text-[12px]
                  text-[#555555]
                  outline-none
                  placeholder:text-[#B8C1C3]
                "
              />
            </label>

            <div className="relative w-full sm:w-[150px]">
              <select
                value={activeStatus}
                onChange={(event) => {
                  setActiveStatus(event.target.value);
                  setVisibleCount(5);
                }}
                className="
                  h-10 w-full
                  appearance-none
                  rounded-[5px]
                  border border-[rgba(102,102,102,.14)]
                  bg-white
                  pe-9 ps-3
                  text-[12px]
                  text-[#A5A5A5]
                  outline-none
                "
              >
                {activeStatuses.map((item) => (
                  <option key={item.value || "all"} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="
                  pointer-events-none
                  absolute end-3
                  top-1/2
                  -translate-y-1/2
                  text-[#A5A5A5]
                "
              />
            </div>
          </div>

          {/* =================================================
              RECORDS
          ================================================== */}
          <div className="mt-5">
            {activeQuery.isLoading ? (
              <UserLoadingState label="جاري تحميل السجل..." />
            ) : activeQuery.isError ? (
              <UserErrorState
                message={getApiErrorMessage(activeQuery.error)}
                onRetry={activeQuery.refetch}
              />
            ) : !filteredRecords.length ? (
              <UserEmptyState
                title={
                  activeStatus || search.trim()
                    ? "لا توجد سجلات مطابقة للفلاتر الحالية"
                    : listType === "offer"
                      ? "لا توجد عروض تبرع في حسابك حالياً"
                      : "لا توجد طلبات مساعدة في حسابك حالياً"
                }
                description={
                  activeStatus || search.trim()
                    ? "جرّب تغيير الحالة أو مسح عبارة البحث."
                    : "البيانات هنا تأتي مباشرة من سجل حسابك في الخادم."
                }
              />
            ) : (
              <div
                className={`
                  space-y-3
                  ${activeQuery.isFetching ? "opacity-60" : ""}
                `}
              >
                {filteredRecords.slice(0, visibleCount).map((record) => (
                  <DonationRow
                    key={
                      listType === "offer" ? record.offerId : record.requestId
                    }
                    record={record}
                    type={listType}
                    onViewDetails={() =>
                      setSelectedRecord({ record, type: listType })
                    }
                  />
                ))}
              </div>
            )}

            {filteredRecords.length > visibleCount ? (
              <div className="mt-7 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + 5)}
                  className="
                    inline-flex h-10
                    min-w-[180px]
                    items-center justify-center
                    gap-2
                    rounded-[5px]
                    border border-[#216474]
                    bg-white
                    px-5
                    text-[12px] font-medium
                    text-[#216474]
                    transition
                    hover:bg-[#F2F8F8]
                  "
                >
                  عرض المزيد
                  <ChevronDown size={15} />
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      {selectedRecord
        ? createPortal(
            <DonationDetailsDialog
              record={selectedRecord.record}
              type={selectedRecord.type}
              onClose={() => setSelectedRecord(null)}
            />,
            document.body,
          )
        : null}
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function HeroActionCard({
  icon: Icon,
  title,
  description,
  buttonLabel,
  buttonClassName,
  onClick,
}) {
  return (
    <div
      className="
        rounded-[7px]
        border border-white/15
        bg-white
        p-4
        text-[#333333]
        shadow-[0_8px_18px_rgba(0,0,0,.08)]
      "
    >
      <div className="flex items-start gap-3">
        <span
          className="
            grid size-9 shrink-0
            place-items-center
            rounded-[6px]
            bg-[#EEF7F7]
            text-[#216474]
          "
        >
          <Icon size={18} strokeWidth={1.8} />
        </span>

        <div className="min-w-0 text-right">
          <h3 className="text-[13px] font-semibold text-[#333333]">{title}</h3>

          <p className="mt-1 text-[10.5px] leading-5 text-[#A5A5A5]">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`
          mt-4 inline-flex h-9
          w-full items-center
          justify-center gap-2
          rounded-[5px]
          text-[11px] font-medium
          transition
          ${buttonClassName}
        `}
      >
        {buttonLabel}
        <ArrowLeft size={14} />
      </button>
    </div>
  );
}

function FormTab({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center
        justify-center gap-2
        rounded-[6px]
        px-4 py-3
        text-[13px] font-medium
        transition
        ${
          active
            ? "bg-[#216474] text-white"
            : "text-[#71858A] hover:bg-[#F4F8F8]"
        }
      `}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function DonationRow({ record, type, onViewDetails }) {
  const status = getRecordStatus(record, type);

  const isOffer = type === "offer";

  const quantity = isOffer ? record.packageCount : record.requestedPackageCount;

  const date = isOffer
    ? record.expiryDateUtc || record.createdAtUtc
    : record.neededBeforeUtc || record.createdAtUtc;

  const organization =
    record.targetOrganizationName || record.campaignTitle || "منظمة معتمدة";

  return (
    <article
      className="
        grid min-h-[78px]
        items-center gap-4
        rounded-[7px]
        border border-[rgba(102,102,102,.14)]
        bg-white
        px-5 py-3
        lg:grid-cols-[1.3fr_.9fr_.8fr_.55fr_.8fr_auto]
      "
    >
      {/* الدواء */}
      <div className="flex min-w-0 items-center gap-3 text-right">
        <span
          className="
            grid size-9 shrink-0
            place-items-center
            rounded-[6px]
            bg-[#E6F3F6]
            text-[#216474]
          "
        >
          <Pill size={17} />
        </span>

        <div className="min-w-0">
          <strong className="block truncate text-[12.5px] font-semibold text-[#333333]">
            {record.medicineName || "دواء"}
          </strong>

          <span className="mt-1 block truncate text-[9.5px] text-[#A5A5A5]">
            {record.scientificName || (isOffer ? "عرض تبرع" : "طلب مساعدة")}
          </span>
        </div>
      </div>

      {/* المنظمة */}
      <InfoCell
        label="الجهة"
        value={organization}
        icon={isOffer ? Gift : HandHeart}
        accent
      />

      {/* التاريخ */}
      <InfoCell
        label={isOffer ? "تاريخ الصلاحية" : "مطلوب قبل"}
        value={formatDate(date)}
        icon={CalendarDays}
      />

      {/* الكمية */}
      <InfoCell
        label="الكمية"
        value={`${Number(quantity || 0).toLocaleString("ar-SY-u-nu-latn")} عبوة`}
        icon={Package}
      />

      {/* الحالة */}
      <div className="flex justify-center">
        <span
          className={`
            inline-flex
            min-h-[26px]
            items-center
            rounded-full
            px-3
            text-[10.5px]
            font-medium
            ${getStatusClasses(record.status)}
          `}
        >
          {status.label || record.status || "غير محدد"}
        </span>
      </div>

      {/* التفاصيل */}
      <button
        type="button"
        onClick={onViewDetails}
        className="
          inline-flex h-9
          min-w-[132px]
          items-center
          justify-center gap-2
          rounded-[5px]
          border border-[#216474]
          bg-white
          px-4
          text-[11px] font-medium
          text-[#216474]
          transition
          hover:bg-[#F2F8F8]
        "
      >
        عرض التفاصيل
        <ArrowLeft size={14} />
      </button>
    </article>
  );
}

function DonationDetailsDialog({ record, type, onClose }) {
  const isOffer = type === "offer";
  const status = getRecordStatus(record, type);
  const quantity = isOffer ? record.packageCount : record.requestedPackageCount;
  const date = isOffer
    ? record.expiryDateUtc || record.createdAtUtc
    : record.neededBeforeUtc || record.createdAtUtc;
  const organization =
    record.targetOrganizationName || record.campaignTitle || "منظمة معتمدة";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center overflow-y-auto bg-[#102f36]/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-details-title"
        className={`max-h-[92vh] w-full overflow-y-auto shadow-2xl sm:rounded-[28px] ${
          isOffer ? "max-w-5xl" : "max-w-3xl"
        } ${isOffer ? "border border-[#B8D5D7] bg-[#F6FAFA]" : "bg-white"}`}
      >
        <header
          className={`relative isolate overflow-hidden px-5 py-5 text-white sm:px-7 sm:py-7 ${
            isOffer
              ? "min-h-[178px] border-b-4 border-[#62B8AB]"
              : "bg-gradient-to-l from-[#70445F] via-[#59394F] to-[#3F3046]"
          }`}
          style={
            isOffer
              ? {
                  backgroundImage:
                    "linear-gradient(90deg, rgba(8,72,80,.22) 0%, rgba(8,72,80,.64) 48%, rgba(7,59,67,.96) 100%), url('/assets/app/donations/donation-details-classic.png')",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }
              : undefined
          }
        >
          <div
            className={`pointer-events-none absolute inset-0 ${
              isOffer
                ? "bg-[radial-gradient(circle_at_78%_45%,rgba(111,220,198,.18),transparent_42%)]"
                : "bg-transparent"
            }`}
          />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span
                className={`grid size-12 shrink-0 place-items-center border shadow-inner sm:size-14 ${
                  isOffer
                    ? "rounded-md border-[#A7D6D2]/55 bg-[#083F48]/75 text-[#C9F1E9] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08),0_8px_25px_rgba(0,0,0,.22)]"
                    : "rounded-2xl border-white/15 bg-white/10"
                }`}
              >
                {isOffer ? <Gift size={25} /> : <HandHeart size={25} />}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-xs font-medium ${
                      isOffer ? "tracking-wide text-[#CDE9E6]" : "text-white/70"
                    }`}
                  >
                    {isOffer ? "عرض تبرع دوائي" : "طلب مساعدة دوائية"}
                  </p>
                  <span
                    className={`border px-2.5 py-1 text-[10px] font-bold ${
                      isOffer
                        ? "rounded-md border-[#B9E1DB]/60 bg-[#EAF8F5]/95 text-[#12555F]"
                        : "rounded-full border-white/15 bg-white/10 text-white/90"
                    }`}
                  >
                    {status.label || record.status || "غير محدد"}
                  </span>
                </div>
                <h2
                  id="donation-details-title"
                  className={`mt-2 truncate text-xl font-black sm:text-3xl ${
                    isOffer ? "font-serif text-white drop-shadow-md" : ""
                  }`}
                >
                  {record.medicineName || "دواء"}
                </h2>
                <p
                  className={`mt-1 text-xs ${
                    isOffer ? "text-[#D4ECE9]" : "text-white/60"
                  }`}
                >
                  {record.scientificName ||
                    (isOffer
                      ? "بيانات الدواء ومسار تسليمه"
                      : "ملخص الحاجة والموعد المطلوب")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`grid size-11 shrink-0 place-items-center border transition hover:rotate-90 ${
                isOffer
                  ? "rounded-md border-[#A7D6D2]/45 bg-[#083F48]/65 text-[#E1F5F1] hover:bg-[#0F5965]"
                  : "rounded-2xl border-white/10 bg-white/10 hover:bg-white/20"
              }`}
              aria-label="إغلاق التفاصيل"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {isOffer ? (
            <OfferDetailsLayout
              record={record}
              organization={organization}
              quantity={quantity}
              date={date}
            />
          ) : (
            <AssistanceDetailsLayout
              record={record}
              organization={organization}
              quantity={quantity}
              date={date}
              status={status}
            />
          )}

          <button
            type="button"
            onClick={onClose}
            className={`mt-5 h-11 w-full rounded-xl text-sm font-bold text-white transition ${
              isOffer
                ? "rounded-md border border-[#174B57] bg-[#216474] font-serif shadow-[0_8px_20px_rgba(15,89,101,.16)] hover:bg-[#174B57]"
                : "bg-[#654057] hover:bg-[#4C3042]"
            }`}
          >
            إغلاق
          </button>
        </div>
      </section>
    </div>
  );
}

function OfferDetailsLayout({ record, organization, quantity, date }) {
  return (
    <div className="space-y-5">
      <DonationProgress record={record} />

      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <div className="overflow-hidden rounded-lg border border-[#CFE2E3] bg-[#EFF8F7] p-3 shadow-[0_10px_28px_rgba(15,89,101,.07)]">
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <strong className="block font-serif text-sm text-[#254B54]">
                صورة الدواء المرفقة
              </strong>
              <span className="mt-1 block text-[11px] text-[#718B90]">
                تستخدمها الصيدلية للتحقق الأولي قبل الاستلام
              </span>
            </div>
            <span className="grid size-10 place-items-center rounded-md border border-[#C7DFDF] bg-white text-[#216474] shadow-sm">
              <ShieldCheck size={19} />
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white">
            <ProtectedDonationImage url={record.donationImageUrl} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-[#CFE2E3] bg-white p-5 shadow-[0_10px_28px_rgba(15,89,101,.06)]">
            <div className="flex items-center gap-3 border-b border-[#E1EEEE] pb-4">
              <span className="grid size-11 place-items-center rounded-md bg-[#E7F5F4] text-[#216474]">
                <Pill size={20} />
              </span>
              <div>
                <span className="text-[11px] text-[#789095]">بيانات العبوة</span>
                <strong className="mt-1 block font-serif text-base text-[#17363E]">
                  {record.medicineName || "دواء"}
                </strong>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailsItem
                label="الاسم العلمي"
                value={record.scientificName}
                tone="classic"
              />
              <DetailsItem
                label="الكمية المتبرع بها"
                value={`${Number(quantity || 0).toLocaleString("ar-SY-u-nu-latn")} عبوة`}
                tone="classic"
              />
              <DetailsItem
                label="تاريخ الصلاحية"
                value={formatDate(date)}
                tone="classic"
              />
              <DetailsItem
                label="صيدلية التحقق"
                value={record.reviewingPharmacyName}
                tone="classic"
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#BFE1DB] bg-[#EAF8F5] p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-md border border-[#C5E3DE] bg-white text-[#16816F] shadow-sm">
                <HeartHandshake size={19} />
              </span>
              <div>
                <span className="text-[11px] text-[#9D7B43]">وجهة التبرع</span>
                <strong className="mt-1 block text-sm text-[#5A4524]">
                  {organization}
                </strong>
                {record.campaignTitle ? (
                  <p className="mt-1.5 text-xs text-[#8F7447]">
                    ضمن حملة: {record.campaignTitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RecordNotes record={record} tone="offer" />
    </div>
  );
}

function AssistanceDetailsLayout({
  record,
  organization,
  quantity,
  date,
  status,
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[1.15fr_.85fr]">
        <div className="relative overflow-hidden rounded-3xl border border-[#E5D5DF] bg-[#FBF6F9] p-5">
          <div className="absolute -left-8 -top-10 size-28 rounded-full bg-[#B989A5]/15" />
          <div className="relative">
            <span className="text-xs font-bold text-[#8B657C]">
              الحاجة المطلوبة
            </span>
            <h3 className="mt-3 text-xl font-black text-[#3E2D38]">
              {record.medicineName || "دواء"}
            </h3>
            <p className="mt-1 text-xs text-[#8B7A84]">
              {record.scientificName || "لم يُذكر اسم علمي"}
            </p>
            <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#E9DDE4] pt-4">
              <div>
                <span className="block text-[11px] text-[#9C8793]">
                  الكمية المطلوبة
                </span>
                <strong className="mt-1 block text-3xl font-black text-[#654057]">
                  {Number(quantity || 0).toLocaleString("ar-SY-u-nu-latn")}
                  <small className="me-1 text-sm font-bold">عبوة</small>
                </strong>
              </div>
              <span className="grid size-12 place-items-center rounded-2xl bg-white text-[#70445F] shadow-sm">
                <Package size={22} />
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-[#173F48] p-5 text-white">
          <CalendarDays className="text-[#8BD0CB]" size={24} />
          <span className="mt-5 block text-xs text-white/60">مطلوب قبل</span>
          <strong className="mt-2 block text-lg font-black">
            {formatDate(date)}
          </strong>
          <span className="mt-5 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold">
            {status.label || record.status || "قيد المتابعة"}
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-[#D9E8EA] bg-white p-5">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#E7F5F4] text-[#216474]">
            <HandHeart size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-[#829499]">الجهة المستلمة</span>
            <strong className="mt-1 block text-base text-[#17363E]">
              {organization}
            </strong>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailsItem label="الحملة" value={record.campaignTitle} />
              <DetailsItem
                label="تاريخ إنشاء الطلب"
                value={formatDate(record.createdAtUtc)}
              />
            </div>
          </div>
        </div>
      </div>

      <RecordNotes record={record} tone="assistance" />
    </div>
  );
}

function RecordNotes({ record, tone }) {
  const notes = record.notes || record.reviewNote;
  if (!notes) return null;
  return (
    <div
      className={`rounded-3xl border p-5 ${
        tone === "assistance"
          ? "border-[#E5D5DF] bg-[#FBF6F9]"
          : "border-[#CFE2E3] bg-[#F2F9F8]"
      }`}
    >
      <span className="text-xs font-bold text-[#71858A]">ملاحظات الحالة</span>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#334F56]">
        {notes}
      </p>
    </div>
  );
}

function DonationProgress({ record }) {
  const pharmacyStatus = String(record.pharmacyReviewStatus || "");
  const offerStatus = String(record.status || "");
  const rejected =
    pharmacyStatus === "PharmacyRejected" || offerStatus === "Rejected";
  const steps = [
    { label: "تم إرسال العرض", complete: true },
    {
      label: "تحقق الصيدلية",
      complete: ["PharmacyApproved", "ReceivedByPharmacy"].includes(
        pharmacyStatus,
      ),
    },
    {
      label: "استلام الصيدلية",
      complete: pharmacyStatus === "ReceivedByPharmacy",
    },
    {
      label: "مراجعة المنظمة",
      complete: ["Approved", "Received"].includes(offerStatus),
    },
    { label: "اكتمل الاستلام", complete: offerStatus === "Received" },
  ];

  return (
    <div className="rounded-lg border border-[#CFE2E3] bg-[#F2F9F8] p-4 shadow-[inset_0_0_35px_rgba(15,89,101,.04)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <strong className="font-serif text-sm text-[#254B54]">مسار التبرع</strong>
        {rejected ? (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-600">
            توقف المسار بسبب الرفض
          </span>
        ) : null}
      </div>
      <div className="relative mt-5 grid gap-3 sm:grid-cols-5 sm:gap-0">
        <span className="absolute left-[10%] right-[10%] top-4 hidden h-px bg-[#BFDAD9] sm:block" />
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`relative z-10 flex items-center gap-3 rounded-2xl px-2 py-2 text-[11px] font-semibold sm:flex-col sm:bg-transparent sm:text-center ${
              step.complete ? "text-emerald-700" : "text-[#91A0A3]"
            }`}
          >
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full border-4 border-[#F2F9F8] shadow-sm ${
                step.complete
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-slate-400"
              }`}
            >
              {step.complete ? <CheckCircle2 size={14} /> : index + 1}
            </span>
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailsItem({ label, value, tone = "default" }) {
  return (
    <div
      className={`border p-3.5 ${
        tone === "classic"
          ? "rounded-md border-[#D4E5E5] bg-[#F5FAFA]"
          : "rounded-2xl border-[#174B57]/8 bg-[#F8FBFB]"
      }`}
    >
      <span
        className={`text-[11px] ${
          tone === "classic" ? "text-[#789095]" : "text-[#8A9A9E]"
        }`}
      >
        {label}
      </span>
      <strong
        className={`mt-1.5 block break-words text-sm font-semibold ${
          tone === "classic" ? "font-serif text-[#254B54]" : "text-[#29464D]"
        }`}
      >
        {value || "—"}
      </strong>
    </div>
  );
}

function InfoCell({ label, value, icon: Icon, accent = false }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-right">
      <span
        className={`
          grid size-8 shrink-0
          place-items-center
          rounded-[6px]
          ${accent ? "bg-[#FF8A2A] text-white" : "bg-[#F5F8F9] text-[#A5A5A5]"}
        `}
      >
        <Icon size={14} />
      </span>

      <div className="min-w-0">
        <span className="block text-[9px] text-[#B0B8BA]">{label}</span>

        <strong className="mt-1 block truncate text-[10.5px] font-medium text-[#555555]">
          {value || "—"}
        </strong>
      </div>
    </div>
  );
}

function FooterFeature({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center justify-start gap-3 text-right">
      <span
        className="
          grid size-10 shrink-0
          place-items-center
          rounded-[8px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={18} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 text-right">
        <strong className="text-[13px] font-medium text-[#666666]">
          {title}
        </strong>

        <p className="mt-1 text-[10.5px] text-[#A5A5A5]">{description}</p>
      </div>
    </div>
  );
}

export default DonationsPage;
