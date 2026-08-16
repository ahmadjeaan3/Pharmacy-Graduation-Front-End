import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Headphones,
  Info,
  LockKeyhole,
  MapPin,
  Navigation,
  PackagePlus,
  Phone,
  Pill,
  Search,
  Send,
  ShieldCheck,
  Star,
} from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import {
  createMedicineRequest,
  getNearestPharmacyRoute,
  getPharmacyDetails,
  ratePharmacy,
  userKeys,
} from "../api/userApi";

import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";

import {
  formatDistance,
  formatPrice,
} from "../utils/userFormatters";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { Brand } from "../../../shared/components/Brand";

const NearbyPharmaciesMap = lazy(() =>
  import("../components/NearbyPharmaciesMap").then((module) => ({
    default: module.NearbyPharmaciesMap,
  })),
);

/*
  ضع صورة الـ Hero هنا.
  التصميم سيبقى شغالاً حتى لو الصورة غير موجودة، وسيظهر لون الخلفية فقط.
*/
const PHARMACY_HERO_IMAGE = "/assets/app/home/hero_search.png";

const FOOTER_SOCIAL_ICONS = {
  whatsapp: "/assets/app/social/whatsapp.png",
  facebook: "/assets/app/social/facebook.png",
  email: "/assets/app/social/email.png",
  instagram: "/assets/app/social/instagram.png",
};


/* =========================================================
   HELPERS
========================================================= */

function getMedicineImageSource(imageUrl) {
  if (!imageUrl) return null;

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  try {
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      "https://localhost:7048/api";

    const apiOrigin = new URL(
      apiBaseUrl,
      window.location.origin,
    ).origin;

    return `${apiOrigin}${
      imageUrl.startsWith("/") ? "" : "/"
    }${imageUrl}`;
  } catch {
    return imageUrl;
  }
}

function getDayIndex(dayOfWeek) {
  if (typeof dayOfWeek === "number") {
    return dayOfWeek;
  }

  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ].indexOf(dayOfWeek);
}


const ARABIC_WEEK_DAYS = [
  { index: 6, label: "السبت" },
  { index: 0, label: "الأحد" },
  { index: 1, label: "الاثنين" },
  { index: 2, label: "الثلاثاء" },
  { index: 3, label: "الأربعاء" },
  { index: 4, label: "الخميس" },
  { index: 5, label: "الجمعة" },
];

function getFullWorkingWeek(workingHours) {
  const normalized = (workingHours || []).map((item) => ({
    ...item,
    dayIndex: getDayIndex(item.dayOfWeek),
  }));

  return ARABIC_WEEK_DAYS.map((day) => {
    const item = normalized.find(
      (entry) => entry.dayIndex === day.index,
    );

    return {
      ...day,
      isClosed: item?.isClosed ?? false,
      hasSchedule: Boolean(item),
      value: item
        ? formatWorkingTime(item)
        : "غير محدد",
    };
  });
}

function formatWorkingTime(item) {
  if (!item || item.isClosed) {
    return "مغلق";
  }

  return `${String(item.openTime || "").slice(0, 5)} - ${String(
    item.closeTime || "",
  ).slice(0, 5)}`;
}

function getGroupedWorkingHours(workingHours) {
  const normalized = (workingHours || []).map((item) => ({
    ...item,
    dayIndex: getDayIndex(item.dayOfWeek),
  }));

  const friday = normalized.find((item) => item.dayIndex === 5);

  const regularDays = normalized.filter(
    (item) => item.dayIndex !== 5,
  );

  const regularOpen = regularDays.find((item) => !item.isClosed);

  return {
    regularLabel: "السبت - الخميس",
    regularValue: regularOpen
      ? formatWorkingTime(regularOpen)
      : "حسب ساعات الدوام",
    fridayLabel: "الجمعة",
    fridayValue: friday
      ? formatWorkingTime(friday)
      : "حسب ساعات الدوام",
  };
}

/* =========================================================
   PAGE
========================================================= */

export function PharmacyDetailsPage() {
  const { pharmacyId } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [request, setRequest] = useState({
    medicineId: searchParams.get("medicine") || "",
    requestedQuantity: 1,
    note: "",
  });

  const [ratingDraft, setRatingDraft] = useState(null);

  /*
    Figma يعرض الخريطة مباشرة، لذلك نبدأ بـ true.
    المستخدم ما زال يستطيع إخفاء/إظهار الخريطة من زر الـ Hero.
  */
  const [showDirections, setShowDirections] = useState(true);

  const query = useQuery({
    queryKey: userKeys.pharmacy(pharmacyId),
    queryFn: () => getPharmacyDetails(pharmacyId),
  });

  const routeQuery = useQuery({
    queryKey: userKeys.nearestPharmacyRoute({ pharmacyId }),
    queryFn: () => getNearestPharmacyRoute({ pharmacyId }),
    enabled: showDirections && Boolean(pharmacyId),
  });

  const requestMutation = useMutation({
    mutationFn: (payload) =>
      createMedicineRequest(pharmacyId, payload),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: userKeys.root,
      }),
  });

  const ratingMutation = useMutation({
    mutationFn: (payload) =>
      ratePharmacy(pharmacyId, payload),

    onSuccess: (result) => {
      setRatingDraft({
        score: result.userScore,
        comment: result.userComment || "",
      });

      queryClient.invalidateQueries({
        queryKey: userKeys.pharmacy(pharmacyId),
      });
    },
  });

  const selectedMedicine = useMemo(
    () =>
      query.data?.availableMedicines.find(
        (item) => item.medicineId === request.medicineId,
      ),
    [query.data, request.medicineId],
  );

  const routeMapContext = useMemo(() => {
    if (!routeQuery.data?.pharmacy) {
      return null;
    }

    return {
      latitude: routeQuery.data.originLatitude,
      longitude: routeQuery.data.originLongitude,
      mapMarkers: [routeQuery.data.pharmacy],
    };
  }, [routeQuery.data]);

  if (query.isPending) {
    return (
      <UserLoadingState label="جاري تحميل بيانات الصيدلية..." />
    );
  }

  if (query.isError) {
    return (
      <UserErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  }

  const {
    pharmacy,
    availableMedicines,
    workingHours,
  } = query.data;

  const rating = ratingDraft ?? {
    score: query.data.currentUserRating || 0,
    comment: query.data.currentUserComment || "",
  };

  const fullWorkingWeek =
    getFullWorkingWeek(workingHours);

  const groupedHours =
    getGroupedWorkingHours(workingHours);

  const address = [
    pharmacy.address,
    pharmacy.area,
    pharmacy.city,
  ]
    .filter(Boolean)
    .join("، ");

  const ratingValue = Number(
    pharmacy.averageRating || 0,
  );

  return (
    <div
      dir="rtl"
      className="
        m-0 min-h-screen w-full
        bg-[#F7F9FA] p-0
        text-[#333333]
      "
    >
      <style>{`
        .dawaai-full-bleed {
          width: 100vw;
          margin-inline: calc(50% - 50vw);
        }

        @supports (width: 100dvw) {
          .dawaai-full-bleed {
            width: 100dvw;
            margin-inline: calc(50% - 50dvw);
          }
        }
      `}</style>

      {/* =====================================================
          HERO — مطابق لصفحة "طلباتي"
      ====================================================== */}
      <section
        className="
          dawaai-full-bleed
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
          src={PHARMACY_HERO_IMAGE}
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
          {/* عنوان الصيدلية — يمين */}
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
              <Building2 size={23} strokeWidth={1.8} />
            </span>

            <div className="min-w-0 text-right">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[27px] font-bold leading-tight sm:text-[30px]">
                  {pharmacy.pharmacyName}
                </h1>

                <span
                  className={`
                    inline-flex min-h-[24px]
                    items-center justify-center
                    rounded-full px-3
                    text-[10.5px] font-medium
                    ${
                      pharmacy.isOpenNow
                        ? "bg-[#E9F8EF] text-[#2A8B57]"
                        : "bg-white/15 text-white/75"
                    }
                  `}
                >
                  {pharmacy.statusText ||
                    (pharmacy.isOpenNow ? "مفتوحة الآن" : "مغلقة الآن")}
                </span>
              </div>

              <div
                className="
                  mt-2 flex max-w-[650px]
                  flex-wrap items-center gap-x-3 gap-y-1
                  text-[11.5px] leading-6
                  text-white/75
                "
              >
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} strokeWidth={1.8} className="shrink-0" />
                  <span>{address || "العنوان غير متوفر"}</span>
                </span>

                <span className="inline-flex items-center gap-1">
                  <Star
                    size={14}
                    fill="currentColor"
                    className="shrink-0 text-[#FDBB07]"
                  />

                  <strong className="font-medium text-white">
                    {ratingValue.toLocaleString("ar-SY", {
                      maximumFractionDigits: 1,
                    })}
                  </strong>

                  <span>
                    (
                    {Number(pharmacy.ratingsCount || 0).toLocaleString("ar-SY")}
                    )
                  </span>
                </span>

                {pharmacy.distanceMeters != null ? (
                  <span>
                    {formatDistance(pharmacy.distanceMeters)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* كروت الإحصائيات — يسار، بنفس صفحة طلباتي */}
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
              <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-white/12">
                <Pill size={18} strokeWidth={1.8} />
              </span>

              <div className="text-right">
                <span className="block text-[9.5px] text-white/70">
                  الأدوية المتوفرة
                </span>

                <strong className="mt-1 block text-[20px] font-bold text-white">
                  {Number(
                    query.data.availableMedicinesCount ??
                      availableMedicines.length,
                  ).toLocaleString("ar-SY")}
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
              <span className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-white/12">
                <Clock3 size={18} strokeWidth={1.8} />
              </span>

              <div className="text-right">
                <span className="block text-[9.5px] text-white/70">
                  حالة الصيدلية
                </span>

                <strong className="mt-1 block text-[15px] font-bold text-white">
                  {pharmacy.statusText ||
                    (pharmacy.isOpenNow ? "مفتوحة الآن" : "مغلقة الآن")}
                </strong>
              </div>
            </div>
          </div>
        </div>

          {/* إجراءات الصيدلية داخل الـ Hero */}
          <div
            className="
              mx-auto grid w-full max-w-[1200px]
              gap-3 px-5 pb-7
              sm:px-7
              md:grid-cols-3
              lg:px-8
            "
          >
        <button
          type="button"
          onClick={() =>
            document
              .getElementById("available-medicines")
              ?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
          }
          className="
            inline-flex h-11
            items-center justify-center gap-2
            rounded-[8px]
            border border-white/25
            bg-white/10
            text-[13px] font-medium
            text-white
            backdrop-blur-sm
            transition hover:bg-white/20
          "
        >
          <Search size={18} className="shrink-0" />
          البحث داخل الصيدلية
        </button>

        <button
          type="button"
          onClick={() => {
            const next = !showDirections;
            setShowDirections(next);

            if (!showDirections) {
              window.setTimeout(() => {
                document
                  .getElementById("pharmacy-directions")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
              }, 80);
            }
          }}
          className="
            inline-flex h-11
            items-center justify-center gap-2
            rounded-[8px]
            border border-white/25
            bg-white/10
            text-[13px] font-medium
            text-white
            backdrop-blur-sm
            transition hover:bg-white/20
          "
        >
          <Navigation size={18} className="shrink-0" />
          {showDirections
            ? "إخفاء الخريطة"
            : "الانتقال للموقع على الخريطة"}
        </button>

        {pharmacy.phoneNumber ? (
          <a
            href={`tel:${pharmacy.phoneNumber}`}
            className="
              inline-flex h-11
              items-center justify-center gap-2
              rounded-[8px]
              border border-white/25
              bg-white/10
              text-[13px] font-medium
              text-white
              backdrop-blur-sm
              transition hover:bg-white/20
            "
          >
            <Phone size={18} className="shrink-0" />
            اتصل الآن
          </a>
        ) : (
          <div
            className="
              inline-flex h-11
              items-center justify-center
              rounded-[8px]
              border border-white/20
              bg-white/10
              text-[12px]
              text-white/70
              backdrop-blur-sm
            "
          >
            رقم الهاتف غير متوفر
          </div>
        )}
          </div>

      </section>

      {/* =====================================================
          MAIN BODY
      ====================================================== */}
      <main
        className="
          mx-auto flex w-full
          max-w-[1200px]
          flex-col gap-10
          px-4 py-10
          sm:px-6
          lg:px-8
          xl:px-0
        "
      >
        {/* ===================================================
            INFO + WORKING HOURS — مطابق للتصميم المرجعي
        ==================================================== */}
        <section className="grid gap-5 lg:grid-cols-2">
          {/* ساعات العمل — على اليمين */}
          <section
            className="
              rounded-[12px]
              border border-[rgba(102,102,102,0.16)]
              bg-white
              px-5 pb-6 pt-5
            "
          >
            <SectionTitle
              icon={Clock3}
              title="ساعات العمل"
            />

            <div className="mt-5 space-y-3">
              <CompactWorkingHoursCard
                title={groupedHours.regularLabel}
                value={groupedHours.regularValue}
              />

              <CompactWorkingHoursCard
                title={groupedHours.fridayLabel}
                value={groupedHours.fridayValue}
              />
            </div>
          </section>

          {/* معلومات الصيدلية — على اليسار */}
          <section
            className="
              rounded-[12px]
              border border-[rgba(102,102,102,0.16)]
              bg-white
              px-5 pb-6 pt-5
            "
          >
            <SectionTitle
              icon={Building2}
              title="معلومات الصيدلية"
            />

            <div className="mt-5 space-y-3">
              <CompactPharmacyInfoCard
                icon={MapPin}
                title="العنوان"
                value={address || "العنوان غير متوفر"}
              />

              <CompactPharmacyInfoCard
                icon={Phone}
                title="رقم الهاتف"
                value={
                  pharmacy.phoneNumber ||
                  "رقم الهاتف غير متوفر"
                }
                dir="ltr"
              />

              <CompactPharmacyInfoCard
                icon={Building2}
                title="نوع الصيدلية"
                value={
                  pharmacy.pharmacyType ||
                  pharmacy.type ||
                  "صيدلية مجتمعية"
                }
              />
            </div>
          </section>
        </section>

        {/* ===================================================
            AVAILABLE MEDICINES
        ==================================================== */}
        <section id="available-medicines">
          <div
            className="
              mb-5 flex
              items-end justify-between gap-5
            "
          >
            <div>
              <h2
                className="
                  text-[24px] font-medium
                  text-[#333333]
                "
              >
                أدوية المتوفرة في الصيدلية
              </h2>

              <p className="mt-2 text-[12px] text-[#A5A5A5]">
                استعرض الأدوية المتوفرة، ثم اختر الدواء لإرسال طلب إلى الصيدلية.
              </p>
            </div>

            <button
              type="button"
              className="text-[14px] font-medium text-[#216474]"
            >
              عرض الكل
            </button>
          </div>

          {availableMedicines.length ? (
            <div
              className="
                grid gap-3
                sm:grid-cols-2
                lg:grid-cols-4
                xl:grid-cols-5
              "
            >
              {availableMedicines
                .slice(0, 5)
                .map((medicine) => (
                  <MedicineCard
                    key={medicine.medicineId}
                    medicine={medicine}
                    active={
                      request.medicineId ===
                      medicine.medicineId
                    }
                    onChoose={() => {
                      setRequest({
                        ...request,
                        medicineId:
                          medicine.medicineId,
                      });

                      window.setTimeout(() => {
                        document
                          .getElementById(
                            "medicine-request",
                          )
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                      }, 50);
                    }}
                  />
                ))}
            </div>
          ) : (
            <UserEmptyState
              title="لا توجد أدوية متاحة حالياً"
              description="يمكنك العودة إلى البحث لاختيار صيدلية أخرى."
            />
          )}
        </section>

        {/* خريطة: منع طبقات Leaflet من تجاوز الهيدر + توحيد لون كارد الأقرب */}
        <style>{`
          #pharmacy-directions {
            isolation: isolate;
            position: relative;
            z-index: 0;
          }

          #pharmacy-directions .leaflet-container {
            position: relative !important;
            z-index: 0 !important;
          }

          /*
            كارد "الأقرب إليك" داخل NearbyPharmaciesMap:
            توحيد الخلفية مع لون الأزرار الأساسي في الموقع.
            وضعت أكثر الدرجات الداكنة الشائعة في نسخة الخريطة الحالية
            حتى يبقى التعديل فعالاً بدون المساس بالخريطة نفسها.
          */
          #pharmacy-directions .bg-\\[\\#174b57\\],
          #pharmacy-directions .bg-\\[\\#174B57\\],
          #pharmacy-directions .bg-\\[\\#17363e\\],
          #pharmacy-directions .bg-\\[\\#17363E\\],
          #pharmacy-directions .bg-\\[\\#164f5c\\],
          #pharmacy-directions .bg-\\[\\#164F5C\\] {
            background-color: #216474 !important;
          }
        `}</style>

        {/* ===================================================
            MAP + ACCESS INFO
        ==================================================== */}
        <section
          id="pharmacy-directions"
          className="
            relative isolate z-0
            grid gap-5
            lg:grid-cols-[1.7fr_.55fr]
          "
        >
          {/* الخريطة */}
          <div
            className="
              relative isolate z-0
              min-h-[360px]
              overflow-hidden
              rounded-[12px]
              border border-[rgba(102,102,102,0.16)]
              bg-white
            "
          >
            {showDirections ? (
              <>
                {routeQuery.isPending ? (
                  <UserLoadingState label="جاري تجهيز مسار الوصول داخل المنصة..." />
                ) : null}

                {routeQuery.isError ? (
                  <UserErrorState
                    message={getApiErrorMessage(
                      routeQuery.error,
                    )}
                    onRetry={routeQuery.refetch}
                  />
                ) : null}

                {routeMapContext ? (
                  <Suspense
                    fallback={
                      <UserLoadingState label="جاري تحميل خريطة الصيدلية..." />
                    }
                  >
                    <NearbyPharmaciesMap
                      locationContext={routeMapContext}
                      route={routeQuery.data}
                      limit={1}
                      title="مسار الوصول إلى الصيدلية"
                    />
                  </Suspense>
                ) : null}
              </>
            ) : (
              <div
                className="
                  flex min-h-[360px]
                  items-center justify-center
                  text-sm text-[#A5A5A5]
                "
              >
                اضغط على زر الخريطة في الأعلى لإظهار مسار الوصول.
              </div>
            )}
          </div>

          {/* معلومات الوصول */}
          <aside
            className="
              rounded-[12px]
              border border-[rgba(102,102,102,0.16)]
              bg-white
              px-5 py-5
            "
          >
            <SectionTitle
              icon={Navigation}
              title="معلومات الوصول"
            />

            <div className="mt-5 space-y-4">
              <AccessRow
                title="المسافة"
                value={formatDistance(
                  pharmacy.distanceMeters,
                )}
              />

              <AccessRow
                title="ساعات العمل"
                value={
                  pharmacy.statusText ||
                  (pharmacy.isOpenNow
                    ? "مفتوحة الآن"
                    : "مغلقة الآن")
                }
              />

              <AccessRow
                title="الموقع الحالي"
                value={
                  routeQuery.data?.originAddress ||
                  "يتم الاعتماد على موقعك الحالي"
                }
              />
            </div>
          </aside>
        </section>

        {/* ===================================================
            RATING + REQUEST FORM
        ==================================================== */}
        <section
          className="
            grid gap-5
            lg:grid-cols-[.75fr_1.25fr]
          "
        >
          {/* إرسال طلب */}
          <form
            id="medicine-request"
            onSubmit={(event) => {
              event.preventDefault();

              requestMutation.mutate({
                ...request,
                requestedQuantity: Number(
                  request.requestedQuantity,
                ),
              });
            }}
            className="
              rounded-[12px]
              border border-[rgba(102,102,102,0.16)]
              bg-white
              p-5
            "
          >
            <div className="flex items-center gap-3 text-right">
              <span
                className="
                  grid size-10
                  place-items-center
                  rounded-[8px]
                  bg-[#E6F3F6]
                  text-[#216474]
                "
              >
                <PackagePlus size={19} />
              </span>

              <div className="text-right">
                <h3 className="text-[16px] font-medium text-[#333333]">
                  إرسال طلب دواء
                </h3>

                <p className="mt-1 text-[11px] text-[#A5A5A5]">
                  ستراجع الصيدلية طلبك وترد عليه.
                </p>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="form-label">
                الدواء
              </span>

              <select
                required
                value={request.medicineId}
                onChange={(event) =>
                  setRequest({
                    ...request,
                    medicineId: event.target.value,
                  })
                }
                className="form-input"
              >
                <option value="">
                  اختر الدواء
                </option>

                {availableMedicines.map(
                  (medicine) => (
                    <option
                      key={medicine.medicineId}
                      value={medicine.medicineId}
                    >
                      {medicine.medicineDisplayName ||
                        medicine.arabicMedicineName ||
                        medicine.medicineName}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="form-label">
                الكمية المطلوبة
              </span>

              <input
                type="number"
                min="1"
                max="1000"
                required
                value={request.requestedQuantity}
                onChange={(event) =>
                  setRequest({
                    ...request,
                    requestedQuantity:
                      event.target.value,
                  })
                }
                className="form-input"
              />
            </label>

            <label className="mt-4 block">
              <span className="form-label">
                ملاحظة للصيدلية (اختياري)
              </span>

              <textarea
                rows={3}
                maxLength={1000}
                value={request.note}
                onChange={(event) =>
                  setRequest({
                    ...request,
                    note: event.target.value,
                  })
                }
                className="form-textarea"
                placeholder="أي تفاصيل تساعد الصيدلية على معالجة الطلب"
              />
            </label>

            {selectedMedicine?.requiresPrescription ? (
              <p className="mt-3 rounded-[8px] bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                هذا الدواء يتطلب وصفة طبية عند الاستلام.
              </p>
            ) : null}

            {requestMutation.isSuccess ? (
              <p className="mt-3 flex items-center gap-2 rounded-[8px] bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 size={17} />
                تم إرسال الطلب برقم{" "}
                {requestMutation.data.requestCode}
              </p>
            ) : null}

            {requestMutation.isError ? (
              <p className="mt-3 rounded-[8px] bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {getApiErrorMessage(
                  requestMutation.error,
                )}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={
                !request.medicineId ||
                requestMutation.isPending
              }
              className="
                mt-5 inline-flex h-11 w-full
                items-center justify-center gap-2
                rounded-[8px]
                bg-[#216474]
                text-[14px] font-medium
                text-white
                transition hover:bg-[#174B57]
                disabled:opacity-50
              "
            >
              <Send size={17} />

              {requestMutation.isPending
                ? "جاري الإرسال..."
                : "إرسال الطلب"}
            </button>
          </form>

          {/* التقييم */}
          <RatingForm
            rating={rating}
            setRating={setRatingDraft}
            mutation={ratingMutation}
          />
        </section>

        {/* ===================================================
            USER REVIEWS — Visual Figma-like cards
            يعتمد على التقييم الحالي المتوفر في الـ API.
        ==================================================== */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-5">
            <div>
              <h2 className="text-[24px] font-medium text-[#333333]">
                تقييمات المستخدمين
              </h2>

              <p className="mt-2 text-[12px] text-[#A5A5A5]">
                شارك تجربتك وساعد المستخدمين الآخرين في اختيار الصيدلية المناسبة.
              </p>
            </div>

            <a
              href="#pharmacy-rating-form"
              className="
                inline-flex items-center gap-2
                text-[14px] font-medium
                text-[#216474]
              "
            >
              <Star size={17} />
              إضافة تقييم
            </a>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <ReviewPlaceholder
              score={rating.score || ratingValue || 4}
              comment={
                rating.comment ||
                "تجربة جيدة، وكانت معلومات الصيدلية واضحة وسهلة الوصول."
              }
            />

            <ReviewPlaceholder
              score={ratingValue || 4}
              comment="سهولة الوصول ووضوح معلومات الدواء كانت جيدة."
            />

            <ReviewPlaceholder
              score={ratingValue || 4}
              comment="خدمة منظمة وتجربة استخدام بسيطة."
            />
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer
        dir="rtl"
        className="
          mt-2
          border-t border-[rgba(102,102,102,0.14)]
          bg-white
        "
        style={{
          width: "100vw",
          maxWidth: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <div className="mx-auto w-full max-w-[1200px] px-0 py-8">
          <div className="grid items-center gap-8 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex min-w-0 flex-col items-start gap-3">
              <Brand />

              <p className="max-w-[280px] text-right text-[11px] leading-5 text-[#777777]">
                منصة ذكية تساعدك في العثور على أقرب صيدلية والوصول إلى الخدمات الدوائية بصورة أسرع وأكثر موثوقية.
              </p>
            </div>

            <FooterFeature
              icon={LockKeyhole}
              title="خصوصية كاملة"
              description="نحافظ على بياناتك ومعلوماتك"
            />

            <FooterFeature
              icon={ShieldCheck}
              title="معلومات موثوقة"
              description="بيانات منظمة ومحدثة قدر الإمكان"
            />

            <FooterFeature
              icon={Headphones}
              title="دعم على مدار الساعة"
              description="نحن هنا لمساعدتك عند الحاجة"
            />
          </div>

          <div className="my-6 h-px w-full bg-[rgba(102,102,102,0.14)]" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-[11px] text-[#A5A5A5]">
              جميع الحقوق محفوظة لمنصة دوائي © 2026
            </p>

            <div dir="ltr" className="flex items-center gap-3">
              {[
                ["instagram", "Instagram"],
                ["email", "Email"],
                ["facebook", "Facebook"],
                ["whatsapp", "WhatsApp"],
              ].map(([key, label]) => (
                <a
                  key={key}
                  href="#"
                  aria-label={label}
                  className="
                    grid size-11 place-items-center
                    rounded-full
                    border border-[rgba(102,102,102,0.14)]
                    bg-[#F4F9F9]
                    transition hover:bg-[#E6F3F6]
                  "
                >
                  <img
                    src={FOOTER_SOCIAL_ICONS[key]}
                    alt=""
                    aria-hidden="true"
                    className="size-5 object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center justify-start gap-2 text-right text-[#216474]">
      <span
        className="
          grid size-8 shrink-0
          place-items-center
          rounded-[7px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={17} strokeWidth={1.8} />
      </span>

      <h3 className="text-[20px] font-medium">
        {title}
      </h3>
    </div>
  );
}

function CompactPharmacyInfoCard({
  icon: Icon,
  title,
  value,
  dir,
}) {
  return (
    <div
      className="
        flex min-h-[92px]
        items-center gap-3
        rounded-[8px]
        border border-[rgba(102,102,102,0.14)]
        bg-white
        px-4 py-3
        text-right
      "
    >
      <span
        className="
          grid size-8 shrink-0
          place-items-center
          rounded-[7px]
          bg-[#F5F9FA]
          text-[#A5A5A5]
        "
      >
        <Icon size={15} strokeWidth={1.7} />
      </span>

      <div className="min-w-0 flex-1 text-right">
        <h4 className="text-[13px] font-semibold text-[#555555]">
          {title}
        </h4>

        <div className="mt-2 text-[12px] leading-6 text-[#A5A5A5]">
          <span
            dir={dir}
            className="inline-block max-w-full break-words"
          >
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

function CompactWorkingHoursCard({
  title,
  value,
}) {
  return (
    <div
      className="
        flex min-h-[92px]
        items-center gap-3
        rounded-[8px]
        border border-[rgba(102,102,102,0.14)]
        bg-white
        px-4 py-3
        text-right
      "
    >
      <span
        className="
          grid size-8 shrink-0
          place-items-center
          rounded-[7px]
          bg-[#F5F9FA]
          text-[#A5A5A5]
        "
      >
        <Clock3 size={15} strokeWidth={1.7} />
      </span>

      <div className="min-w-0 flex-1 text-right">
        <h4 className="text-[13px] font-semibold text-[#555555]">
          {title}
        </h4>

        <div
          className="
            mt-2 w-full
            text-right
            text-[12px] leading-6
            text-[#A5A5A5]
          "
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function PharmacyInfoCard({
  title,
  value,
  icon: Icon,
  dir,
}) {
  return (
    <div
      className="
        flex min-h-[96px]
        items-center gap-4
        rounded-[8px]
        border border-[rgba(102,102,102,0.16)]
        px-5
        text-right
      "
    >
      {/* الأيقونة ثابتة على يمين النص */}
      <span
        className="
          grid size-11 shrink-0
          place-items-center
          rounded-[8px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Icon size={21} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1 text-right">
        <h4 className="text-[16px] font-medium text-[#333333]">
          {title}
        </h4>

        <div className="mt-3 text-[13px] text-[#A5A5A5]">
          <span dir={dir} className="inline-block max-w-full break-words">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}

function WorkingHourCard({
  title,
  value,
}) {
  return (
    <div
      className="
        flex min-h-[96px]
        items-center gap-4
        rounded-[8px]
        border border-[rgba(102,102,102,0.16)]
        px-5
        text-right
      "
    >
      <span
        className="
          grid size-11 shrink-0
          place-items-center
          rounded-[8px]
          bg-[#E6F3F6]
          text-[#216474]
        "
      >
        <Clock3 size={21} strokeWidth={1.8} />
      </span>

      <div className="min-w-0 flex-1 text-right">
        <h4 className="text-[16px] font-medium text-[#333333]">
          {title}
        </h4>

        <div dir="ltr" className="mt-3 text-left text-[13px] text-[#A5A5A5]">
          {value}
        </div>
      </div>
    </div>
  );
}

function MedicineCard({
  medicine,
  active,
  onChoose,
}) {
  const imageUrl = getMedicineImageSource(
    medicine.imageUrl ||
      medicine.medicineImageUrl,
  );

  const name =
    medicine.medicineDisplayName ||
    medicine.arabicMedicineName ||
    medicine.medicineName;

  const details = [
    medicine.arabicScientificName ||
      medicine.scientificName,
    medicine.dosageForm,
    medicine.capacity,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <article
      className={`
        flex min-h-[301px]
        flex-col
        rounded-[8px]
        border
        bg-white
        px-[14px] pb-5 pt-4
        transition
        ${
          active
            ? "border-[#216474] ring-2 ring-[#216474]/10"
            : "border-[rgba(102,102,102,0.16)]"
        }
      `}
    >
      <div
        className="
          relative flex h-[103px]
          items-center justify-center
          overflow-hidden
          rounded-[6px]
          bg-[#FBFCFC]
        "
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-contain"
          />
        ) : (
          <Pill
            size={42}
            strokeWidth={1.4}
            className="text-[#216474]/40"
          />
        )}

        <span
          className="
            absolute end-2 top-2
            inline-flex min-h-[22px]
            items-center rounded-full
            bg-[#DBFFE6]
            px-2
            text-[10px] font-medium
            text-[#22C55E]
          "
        >
          متوفر
        </span>
      </div>

      <div className="mt-4 min-h-[76px] text-right">
        <h4 className="truncate text-[15px] font-medium text-[#333333]">
          {name}
        </h4>

        <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#A5A5A5]">
          {details || "معلومات الدواء"}
        </p>

        <strong className="mt-2 block text-[14px] font-medium text-[#A5A5A5]">
          {formatPrice(medicine.sellingPrice)}
        </strong>
      </div>

      <button
        type="button"
        onClick={onChoose}
        className="
          mt-auto inline-flex h-11
          w-full items-center
          justify-center gap-2
          rounded-[8px]
          bg-[#216474]
          text-[13px] font-medium
          text-white
          transition hover:bg-[#174B57]
        "
      >
        طلب
        <ArrowLeft size={17} />
      </button>
    </article>
  );
}

function AccessRow({ title, value }) {
  return (
    <div
      className="
        rounded-[8px]
        border border-[rgba(102,102,102,0.16)]
        px-5 py-4
        text-right
      "
    >
      <span className="text-[12px] text-[#A5A5A5]">
        {title}
      </span>

      <strong className="mt-2 block text-[14px] font-medium text-[#333333]">
        {value || "غير محدد"}
      </strong>
    </div>
  );
}

function RatingForm({
  rating,
  setRating,
  mutation,
}) {
  return (
    <form
      id="pharmacy-rating-form"
      onSubmit={(event) => {
        event.preventDefault();

        mutation.mutate({
          score: rating.score,
          comment: rating.comment,
        });
      }}
      className="
        rounded-[12px]
        border border-[rgba(102,102,102,0.16)]
        bg-white
        p-5
        text-right
      "
    >
      <h3 className="text-[18px] font-medium text-[#333333]">
        قيّم تجربتك
      </h3>

      <p className="mt-2 text-[12px] text-[#A5A5A5]">
        شارك رأيك لمساعدة مستخدمين آخرين.
      </p>

      <div className="mt-5 flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            type="button"
            key={score}
            onClick={() =>
              setRating({
                ...rating,
                score,
              })
            }
            className={
              score <= rating.score
                ? "text-[#FDBB07]"
                : "text-slate-200"
            }
            aria-label={`${score} نجوم`}
          >
            <Star
              size={28}
              fill="currentColor"
            />
          </button>
        ))}
      </div>

      <textarea
        rows={4}
        maxLength={1000}
        value={rating.comment}
        onChange={(event) =>
          setRating({
            ...rating,
            comment: event.target.value,
          })
        }
        className="form-textarea mt-5"
        placeholder="اكتب رأيك باختصار (اختياري)"
      />

      {mutation.isSuccess ? (
        <p className="mt-3 text-sm font-bold text-emerald-600">
          شكراً، تم حفظ تقييمك.
        </p>
      ) : null}

      {mutation.isError ? (
        <p className="mt-3 text-sm font-semibold text-rose-600">
          {getApiErrorMessage(
            mutation.error,
          )}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={
          !rating.score ||
          mutation.isPending
        }
        className="
          mt-5 inline-flex h-11
          items-center justify-center
          gap-2 rounded-[8px]
          border border-[#216474]
          bg-white
          px-5
          text-[13px] font-medium
          text-[#216474]
          transition hover:bg-[#F2F8F8]
          disabled:opacity-50
        "
      >
        <Star size={16} />
        حفظ التقييم
      </button>
    </form>
  );
}

function ReviewPlaceholder({
  score,
  comment,
}) {
  const safeScore = Math.max(
    0,
    Math.min(5, Math.round(Number(score || 0))),
  );

  return (
    <article
      className="
        min-h-[130px]
        rounded-[12px]
        border border-[rgba(102,102,102,0.16)]
        bg-white
        px-4 pb-6 pt-4
      "
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className="
            grid size-8
            place-items-center
            rounded-full
            bg-[#E6F3F6]
            text-[12px] font-medium
            text-[#216474]
          "
        >
          م
        </div>

        <div className="flex items-center gap-1" dir="ltr">
          {[1, 2, 3, 4, 5].map((item) => (
            <Star
              key={item}
              size={15}
              fill={
                item <= safeScore
                  ? "currentColor"
                  : "none"
              }
              className={
                item <= safeScore
                  ? "text-[#FDBB07]"
                  : "text-[#D6D6D6]"
              }
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-[13px] leading-6 text-[#333333]">
        {comment}
      </p>
    </article>
  );
}

function FooterFeature({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-center justify-start gap-3 text-right">
      <span
        className="
          grid size-10
          shrink-0 place-items-center
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

        <p className="mt-1 text-[10.5px] text-[#A5A5A5]">
          {description}
        </p>
      </div>
    </div>
  );
}

export default PharmacyDetailsPage;