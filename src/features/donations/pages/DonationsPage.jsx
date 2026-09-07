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
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 bg-[#174B57] px-5 py-4 text-white">
          <div>
            <p className="text-xs text-white/65">
              {isOffer ? "تفاصيل عرض التبرع" : "تفاصيل طلب المساعدة"}
            </p>
            <h2 id="donation-details-title" className="mt-1 text-lg font-bold">
              {record.medicineName || "دواء"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20"
            aria-label="إغلاق التفاصيل"
          >
            <X size={19} />
          </button>
        </header>

        <div className="space-y-4 p-5">
          {isOffer ? <DonationProgress record={record} /> : null}

          {isOffer ? (
            <ProtectedDonationImage url={record.donationImageUrl} />
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailsItem label="الدواء" value={record.medicineName} />
            <DetailsItem label="الاسم العلمي" value={record.scientificName} />
            <DetailsItem label="الجهة" value={organization} />
            <DetailsItem label="الحملة" value={record.campaignTitle} />
            <DetailsItem
              label="الكمية"
              value={`${Number(quantity || 0).toLocaleString("ar-SY-u-nu-latn")} عبوة`}
            />
            <DetailsItem
              label={isOffer ? "تاريخ الصلاحية" : "مطلوب قبل"}
              value={formatDate(date)}
            />
            <DetailsItem label="الحالة" value={status.label || record.status} />
            {isOffer ? (
              <DetailsItem
                label="صيدلية التحقق"
                value={record.reviewingPharmacyName}
              />
            ) : null}
          </div>

          {(record.notes || record.reviewNote) && (
            <div className="rounded-2xl border border-[#174B57]/10 bg-[#F5F9F9] p-4">
              <span className="text-xs text-[#71858A]">الملاحظات</span>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#334F56]">
                {record.notes || record.reviewNote}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-xl bg-[#216474] text-sm font-bold text-white transition hover:bg-[#174B57]"
          >
            إغلاق
          </button>
        </div>
      </section>
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
    <div className="rounded-2xl border border-[#216474]/12 bg-[#F4F9F9] p-4">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm text-[#29464D]">مسار التبرع</strong>
        {rejected ? (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-600">
            توقف المسار بسبب الرفض
          </span>
        ) : null}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`rounded-xl border px-2 py-3 text-center text-[11px] font-semibold ${
              step.complete
                ? "border-emerald-100 bg-white text-emerald-700"
                : "border-[#174B57]/8 bg-white/55 text-[#91A0A3]"
            }`}
          >
            <span
              className={`mx-auto mb-2 grid size-6 place-items-center rounded-full ${
                step.complete
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-400"
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

function DetailsItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#174B57]/8 bg-[#F8FBFB] p-3.5">
      <span className="text-[11px] text-[#8A9A9E]">{label}</span>
      <strong className="mt-1.5 block break-words text-sm font-semibold text-[#29464D]">
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
