
import { useQuery } from "@tanstack/react-query";

import {
  MapPinned,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  MapPin,
  Navigation,
  Pill,
  Search,
  Star,
  ShieldCheck,
  Headphones,
} from "lucide-react";

import { lazy, Suspense, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../../../shared/components/Brand";

import {
  getNearestPharmacyRoute,
  getPopularMedicines,
  getUserDashboard,
  userKeys,
} from "../api/userApi";

import { LocationAction } from "../components/LocationAction";

import {
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { apiClient } from "../../../shared/api/client";
import { formatDistance } from "../utils/userFormatters";

const USER_HERO_IMAGE = "/assets/app/home/user-hero-pharmacy.png";
const USER_HERO_BACKGROUND =
  "/assets/app/home/background_hero_user.png";

// صور القسم السفلي
const AI_ASSISTANT_IMAGE = "/assets/app/home/ai-assistant.png";
const SMART_PRESCRIPTION_IMAGE =
  "/assets/app/home/smart-prescription.png";
const SMART = "/assets/app/home/smart.png";

const FOOTER_SOCIAL_ICONS = {
  whatsapp: "/assets/app/social/whatsapp.png",
  facebook: "/assets/app/social/facebook.png",
  email: "/assets/app/social/email.png",
  instagram: "/assets/app/social/instagram.png",
};

const smartServices = [
  {
    title: "اسأل المساعد",
    description:
      "تحدث مع المساعد الذكي للحصول على إجابات موثوقة على استفساراتك الصحية.",
    image: AI_ASSISTANT_IMAGE,
    to: "/app/chat",
  },
  {
    title: "الوصفة الذكية",
    description:
      "امسح وصفتك الطبية لقراءة الأدوية واستخراج المعلومات المهمة بسهولة.",
    image: SMART_PRESCRIPTION_IMAGE,
    to: "/app/prescriptions",
  },
];

const popularSearches = [
  "اكاربوس 25",
  "أوجمنتين",
  "بيبانتين",
  "سيفيكسيم 100",
];

const NearbyPharmaciesMap = lazy(() =>
  import("../components/NearbyPharmaciesMap").then((module) => ({
    default: module.NearbyPharmaciesMap,
  })),
);

function getMedicineImageSource(imageUrl) {
  if (!imageUrl) return null;

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  try {
    const baseUrl =
      apiClient.defaults.baseURL || window.location.origin;

    const apiOrigin = new URL(
      baseUrl,
      window.location.origin,
    ).origin;

    return `${apiOrigin}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  } catch {
    return imageUrl;
  }
}

function MedicineImage({ imageUrl, displayName }) {
  const [imageFailed, setImageFailed] = useState(false);

  const resolvedImageUrl =
    getMedicineImageSource(imageUrl);

  const shouldShowImage =
    Boolean(resolvedImageUrl) && !imageFailed;

  return (
    <div className="relative mx-3.5 mt-4 flex h-[145px] items-center justify-center overflow-hidden rounded-[14px] border border-[#edf2f2] bg-[linear-gradient(145deg,#fbfdfd_0%,#f1f7f6_100%)] sm:h-[180px]">
      {shouldShowImage ? (
        <img
          src={resolvedImageUrl}
          alt={displayName}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="
            max-h-[124px]
            max-w-[82%]
            object-contain
            drop-shadow-[0_10px_14px_rgba(23,75,87,.10)]
            transition-transform
            duration-300
            group-hover:scale-[1.04]
            sm:max-h-[154px]
            sm:max-w-[88%]
          "
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <span className="grid size-[72px] place-items-center rounded-[22px] border border-[#216474]/12 bg-white text-[#216474] shadow-[0_8px_22px_rgba(23,75,87,.07)]">
            <Pill size={31} strokeWidth={1.55} />
          </span>

          <span className="mt-3 text-[10px] font-semibold text-[#91a0a3]">
            صورة الدواء غير متوفرة
          </span>
        </div>
      )}
    </div>
  );
}

function UserDashboardPage() {
  const navigate = useNavigate();

  const [heroSearch, setHeroSearch] = useState("");
  const [popularStart, setPopularStart] = useState(0);

  const submitHeroSearch = (event) => {
    event.preventDefault();

    const term = heroSearch.trim();

    if (!term) {
      navigate("/app/search");
      return;
    }

    navigate(
      `/app/search?q=${encodeURIComponent(term)}`,
    );
  };

  const runPopularSearch = (term) => {
    setHeroSearch(term);

    navigate(
      `/app/search?q=${encodeURIComponent(term)}`,
    );
  };

  const popularMedicinesQuery = useQuery({
    queryKey: userKeys.popularMedicines(10),
    queryFn: () => getPopularMedicines(10),
    staleTime: 60_000,
  });

  const query = useQuery({
    queryKey: userKeys.dashboard({ take: 3 }),
    queryFn: () =>
      getUserDashboard({
        take: 3,
        externalTake: 3,
        includeExternalFallback: true,
      }),
  });

  const locationContext = query.data?.locationContext;

  const routeQuery = useQuery({
    queryKey: userKeys.nearestPharmacyRoute({
      radiusInMeters:
        locationContext?.radiusInMeters,
    }),

    queryFn: () =>
      getNearestPharmacyRoute({
        radiusInMeters:
          locationContext.radiusInMeters,
      }),

    enabled: Boolean(
      locationContext?.mapMarkers?.length,
    ),
  });

  if (query.isPending) {
    return (
      <UserLoadingState label="نجهز مساحتك الشخصية..." />
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

  const data = query.data;

  const nearbyDisplayPharmacies =
    data.locationContext?.mapMarkers?.slice(0, 3) ?? [];

  const popularMedicines =
    popularMedicinesQuery.data ?? [];

  const visiblePopularMedicines =
    popularMedicines.slice(
      popularStart,
      popularStart + 5,
    );

  const canMovePopularBack =
    popularStart > 0;

  const canMovePopularForward =
    popularStart + 5 < popularMedicines.length;

  const movePopularBack = () =>
    setPopularStart((current) =>
      Math.max(0, current - 1),
    );

  const movePopularForward = () =>
    setPopularStart((current) =>
      Math.min(
        Math.max(
          0,
          popularMedicines.length - 5,
        ),
        current + 1,
      ),
    );

  return (
    <div className="w-full overflow-x-hidden">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative isolate overflow-hidden
          bg-[#08788a]
          text-white
          shadow-[0_18px_45px_rgba(23,75,87,.10)]
        "
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <img
          src={USER_HERO_BACKGROUND}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="
            absolute inset-0 -z-20
            h-full w-full
            scale-x-[-1]
            select-none
            object-cover
            object-center
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0 -z-10
            bg-[linear-gradient(90deg,rgba(0,72,84,.01)_0%,rgba(0,72,84,.03)_34%,rgba(0,65,77,.15)_57%,rgba(0,51,63,.34)_78%,rgba(0,39,50,.52)_100%)]
          "
        />

        <div
          dir="ltr"
          className="
            mx-auto grid w-full max-w-[1440px]
            grid-cols-1
            items-center
            gap-6
            px-4 py-8
            sm:px-6 sm:py-10
            lg:min-h-[680px]
            lg:grid-cols-[47%_53%]
            lg:gap-10
            lg:px-12 lg:py-0
            xl:min-h-[700px]
            xl:gap-12
            xl:px-[90px]
          "
        >
          {/* LEFT IMAGE */}

          <div className="hidden h-full items-center justify-center lg:flex lg:justify-start">
            <img
              src={USER_HERO_IMAGE}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="
                block h-auto w-full
                max-w-[760px]
                select-none
                object-contain
                lg:max-w-[790px]
                xl:max-w-[830px]
                lg:-translate-x-4
                xl:-translate-x-6
                lg:scale-[1.08]
                xl:scale-[1.12]
              "
            />
          </div>

          {/* RIGHT CONTENT */}

          <div
            dir="rtl"
            className="
              flex w-full
              flex-col
              items-end
              justify-center
              text-right
              lg:ps-12
              xl:ps-16
            "
          >
            <h1
              className="
                w-full
                text-[28px]
                font-medium
                leading-[1.35]
                text-white
                sm:text-[34px]
                lg:whitespace-nowrap
                lg:text-[43px]
                xl:text-[46px]
              "
            >
              ابحث عن دوائك بسرعة واطمئن دائماً
            </h1>

            <p className="mt-5 w-full max-w-[650px] text-[15px] leading-7 text-white/75">
              نوصلك لأقرب الصيدليات التي يتوفر فيها
              دواؤك بدقة وسرعة في أي وقت.
            </p>

            <form
              onSubmit={submitHeroSearch}
              dir="rtl"
              className="
                mt-8 flex h-[58px]
                w-full max-w-[650px]
                flex-row
                overflow-hidden
                rounded-[7px]
                bg-white
                shadow-[0_8px_22px_rgba(0,0,0,.08)]
              "
            >
              <button
                type="submit"
                aria-label="بحث"
                className="
                  grid h-[58px] w-[60px]
                  shrink-0
                  place-items-center
                  bg-[#216474]
                  text-white
                  transition
                  hover:bg-[#174b57]
                "
              >
                <Search
                  size={23}
                  strokeWidth={1.8}
                />
              </button>

              <input
                type="search"
                dir="rtl"
                value={heroSearch}
                onChange={(event) =>
                  setHeroSearch(event.target.value)
                }
                placeholder="ابحث عن اسم دوائك أو المادة الفعالة...."
                className="
                  min-w-0 flex-1
                  bg-white px-5
                  text-right
                  text-[14px]
                  text-[#29464d]
                  outline-none
                  placeholder:text-[#7e8e92]
                "
              />

              <div className="flex h-full shrink-0 items-center bg-[#f8fbfb] px-3">
                <LocationAction
                  variant="hero"
                  compact
                />
              </div>
            </form>

            <div className="mt-7 flex w-full max-w-[650px] flex-wrap items-center justify-start gap-3">
              <span className="text-[14px] font-bold text-white">
                البحث الشائع:
              </span>

              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() =>
                    runPopularSearch(term)
                  }
                  className="
                    min-w-[94px]
                    rounded-full
                    border border-white/10
                    bg-white/20
                    px-4 py-2.5
                    text-[13px]
                    font-medium
                    text-white
                    transition
                    hover:bg-white/30
                  "
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          POPULAR MEDICINES
      ===================================================== */}

      <section
        dir="rtl"
        className="w-full bg-[#f7f9fa] py-16 lg:py-20"
      >
        <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-6 lg:px-8 xl:px-10">

          <div className="mb-9 flex items-end justify-between gap-6">
            <div className="text-right">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-[2px] w-8 rounded-full bg-[#216474]" />

                <span className="text-[11px] font-bold text-[#216474]">
                  الأكثر طلباً
                </span>
              </div>

              <h2 className="text-[24px] font-black leading-tight text-[#17363e] lg:text-[27px]">
                الأدوية الأكثر بحثاً
              </h2>

              <p className="mt-2 text-[12px] leading-6 text-[#8b9a9e] lg:text-[13px]">
                الأدوية التي يبحث عنها مستخدمو المنصة
                بشكل متكرر
              </p>
            </div>

            <Link
              to="/app/search"
              className="
                group inline-flex
                shrink-0
                items-center gap-2
                rounded-full
                border border-[#dfe6e8]
                bg-white
                px-4 py-2.5
                text-[12px]
                font-bold
                text-[#216474]
                shadow-[0_4px_14px_rgba(23,75,87,.04)]
                transition
                hover:border-[#216474]/35
                hover:bg-[#f5f9f9]
              "
            >
              عرض الكل

              <ArrowLeft
                size={14}
                className="text-[#216474] transition-transform group-hover:-translate-x-0.5"
              />
            </Link>
          </div>

          {popularMedicinesQuery.isPending ? (
            <UserLoadingState label="جاري تحميل الأدوية الأكثر بحثاً..." />
          ) : popularMedicinesQuery.isError ? (
            <UserErrorState
              message={getApiErrorMessage(
                popularMedicinesQuery.error,
              )}
              onRetry={
                popularMedicinesQuery.refetch
              }
            />
          ) : !popularMedicines.length ? (
            <div className="rounded-2xl border border-dashed border-[#d7e0e2] bg-white px-6 py-12 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eef6f6] text-[#216474]">
                <Pill size={24} strokeWidth={1.6} />
              </span>

              <h3 className="mt-4 text-sm font-black text-[#29464d]">
                لا توجد بيانات بحث كافية بعد
              </h3>

              <p className="mt-1 text-xs text-[#8a9a9e]">
                ستظهر الأدوية هنا تلقائياً بعد تسجيل
                عمليات البحث في المنصة.
              </p>
            </div>
          ) : (
            <div className="relative px-10 sm:px-12 lg:px-14">

              <button
                type="button"
                onClick={movePopularBack}
                disabled={!canMovePopularBack}
                aria-label="الأدوية السابقة"
                className="
                  absolute right-0 top-1/2 z-20
                  grid size-12
                  -translate-y-1/2
                  place-items-center
                  rounded-full
                  border border-[#174b57]
                  bg-[#174b57]
                  text-white
                  shadow-[0_10px_28px_rgba(23,75,87,.20)]
                  transition duration-200
                  hover:border-[#216474]
                  hover:bg-[#216474]
                  disabled:cursor-default
                  disabled:border-[#174b57]
                  disabled:bg-[#eef6f6]
                  disabled:text-[#174b57]
                  disabled:opacity-55
                "
              >
                <ChevronRight
                  size={22}
                  strokeWidth={2.3}
                />
              </button>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5 2xl:gap-6">
                {visiblePopularMedicines.map(
                  (medicine) => {
                    const displayName =
                      medicine.medicineDisplayName ||
                      medicine.arabicMedicineName ||
                      medicine.medicineName;

                    const secondaryName =
                      medicine.arabicScientificName ||
                      medicine.scientificName ||
                      medicine.manufacturer ||
                      "";

                    const medicineMeta = [
                      medicine.dosageForm,
                      medicine.capacity,
                    ]
                      .filter(Boolean)
                      .join(" • ");

                    return (
                      <article
                        key={medicine.medicineId}
                        className="
                          group relative
                          flex min-h-[390px]
                          flex-col
                          overflow-hidden
                          rounded-[20px]
                          border border-[#dde5e7]
                          bg-white
                          shadow-[0_10px_30px_rgba(23,75,87,.05)]
                          transition-all duration-300
                          hover:-translate-y-1
                          hover:border-[#216474]/30
                          hover:shadow-[0_18px_38px_rgba(23,75,87,.10)]
                        "
                      >
                        <MedicineImage
                          imageUrl={medicine.imageUrl}
                          displayName={displayName}
                        />

                        <div className="px-5 pt-5 text-right">
                          <h3 className="line-clamp-1 text-[15px] font-black leading-6 text-[#29464d]">
                            {displayName}
                          </h3>

                          <p
                            dir={
                              secondaryName &&
                              /[A-Za-z]/.test(
                                secondaryName,
                              )
                                ? "ltr"
                                : "rtl"
                            }
                            className="mt-1 line-clamp-1 min-h-[19px] text-[10.5px] leading-[19px] text-[#96a3a6]"
                          >
                            {secondaryName ||
                              "دواء مسجل في المنصة"}
                          </p>

                          {medicineMeta && (
                            <p className="mt-1 line-clamp-1 text-[10px] text-[#708287]">
                              {medicineMeta}
                            </p>
                          )}
                        </div>

                        <div className="mx-5 mt-4 flex items-center gap-2 border-t border-[#edf1f2] pt-3.5">
                          <span className="size-2 rounded-full bg-[#DFAE0D]" />

                          <span className="text-[10px] font-semibold text-[#667a7f]">
                            متوفر عبر صيدليات المنصة
                          </span>
                        </div>

                        <div className="mt-auto p-5 pt-6">
                          <Link
                            to={`/app/search?q=${encodeURIComponent(
                              medicine.medicineName ||
                                displayName,
                            )}`}
                            className="
                              group/button
                              flex min-h-[46px]
                              w-full
                              items-center
                              justify-between
                              rounded-[11px]
                              bg-[#216474]
                              px-4
                              text-[13px]
                              font-black
                              text-white
                              shadow-[0_7px_16px_rgba(33,100,116,.14)]
                              transition
                              hover:bg-[#174b57]
                            "
                          >
                            <span>
                              تحقق من التوفر
                            </span>

                            <span className="grid size-8 place-items-center rounded-full bg-white/12">
                              <ArrowLeft
                                size={16}
                                strokeWidth={2}
                                className="text-white transition-transform group-hover/button:-translate-x-0.5"
                              />
                            </span>
                          </Link>
                        </div>
                      </article>
                    );
                  },
                )}
              </div>

              <button
                type="button"
                onClick={movePopularForward}
                disabled={!canMovePopularForward}
                aria-label="الأدوية التالية"
                className="
                  absolute left-0 top-1/2 z-20
                  grid size-12
                  -translate-y-1/2
                  place-items-center
                  rounded-full
                  border border-[#174b57]
                  bg-[#174b57]
                  text-white
                  shadow-[0_10px_28px_rgba(23,75,87,.20)]
                  transition duration-200
                  hover:border-[#216474]
                  hover:bg-[#216474]
                  disabled:cursor-default
                  disabled:border-[#174b57]
                  disabled:bg-[#eef6f6]
                  disabled:text-[#174b57]
                  disabled:opacity-55
                "
              >
                <ChevronLeft
                  size={22}
                  strokeWidth={2.3}
                />
              </button>

              {popularMedicines.length > 5 && (
                <div
                  className="mt-8 flex items-center justify-center gap-2"
                  dir="ltr"
                >
                  {Array.from({
                    length: Math.max(
                      1,
                      popularMedicines.length - 4,
                    ),
                  }).map((_, dotIndex) => {
                    const active =
                      dotIndex === popularStart;

                    return (
                      <button
                        key={dotIndex}
                        type="button"
                        onClick={() =>
                          setPopularStart(dotIndex)
                        }
                        aria-label={`الانتقال إلى مجموعة الأدوية ${
                          dotIndex + 1
                        }`}
                        className={`h-2.5 rounded-full transition-all ${
                          active
                            ? "w-8 bg-[#174b57]"
                            : "w-2.5 bg-[#aebdc0] hover:bg-[#718b91]"
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          MAP Z-INDEX FIX
      ===================================================== */}

      <style>{`
        .dawaai-map-layer-fix {
          position: relative;
          isolation: isolate;
          z-index: 0;
        }

        .dawaai-map-layer-fix .leaflet-container {
          position: relative !important;
          z-index: 0 !important;
        }

        .dawaai-map-layer-fix .leaflet-pane,
        .dawaai-map-layer-fix .leaflet-top,
        .dawaai-map-layer-fix .leaflet-bottom,
        .dawaai-map-layer-fix .leaflet-control {
          z-index: 1 !important;
        }

        .dawaai-map-layer-fix .leaflet-map-pane,
        .dawaai-map-layer-fix .leaflet-tile-pane,
        .dawaai-map-layer-fix .leaflet-overlay-pane,
        .dawaai-map-layer-fix .leaflet-shadow-pane,
        .dawaai-map-layer-fix .leaflet-marker-pane,
        .dawaai-map-layer-fix .leaflet-tooltip-pane,
        .dawaai-map-layer-fix .leaflet-popup-pane {
          z-index: auto !important;
        }
      `}</style>

      {/* =====================================================
          NEARBY PHARMACIES
      ===================================================== */}

      <section
        dir="rtl"
        className="mt-16 w-full bg-[#f7f9fa] pb-16 lg:pb-20"
      >
        <div className="mx-auto w-full max-w-[1660px] px-6 sm:px-8 lg:px-10 xl:px-12">

          <div className="mb-8 text-right">
            <h2 className="text-[24px] font-black leading-tight text-[#17363e] lg:text-[27px]">
              أقرب الصيدليات إليك
            </h2>

            <p className="mt-2 text-[12px] leading-6 text-[#8b9a9e] lg:text-[13px]">
              عرض موقعك وأقرب الصيدليات إليك حسب المسافة
            </p>
          </div>

          {locationContext?.mapMarkers?.length ? (
            <div
              className="
                relative isolate z-0
                overflow-hidden
                rounded-[22px]
                border border-[#dde5e7]
                bg-white
                shadow-[0_12px_34px_rgba(23,75,87,.055)]
              "
            >
              <div
                dir="rtl"
                className="grid min-h-[520px] lg:grid-cols-[62%_38%]"
              >

                {/* PHARMACY LIST */}

                <div
                  dir="rtl"
                  className="
                    flex min-h-[500px]
                    flex-col
                    border-b border-[#edf1f2]
                    bg-white
                    p-5
                    sm:p-6
                    lg:col-start-2
                    lg:row-start-1
                    lg:border-b-0
                    lg:border-r
                    lg:p-7
                  "
                >
                  <div className="grid flex-1 grid-rows-3 gap-4">
                    {nearbyDisplayPharmacies.map(
                      (pharmacy, index) => {
                        const pharmacyName =
                          pharmacy.pharmacyName ||
                          pharmacy.name ||
                          `صيدلية ${index + 1}`;

                        const pharmacyAddress =
                          pharmacy.area &&
                          pharmacy.city
                            ? `${pharmacy.area}، ${pharmacy.city}`
                            : pharmacy.address ||
                              pharmacy.formattedAddress ||
                              "العنوان غير محدد";

                        const rating = Number(
                          pharmacy.averageRating ??
                            pharmacy.rating ??
                            0,
                        );

                        const isOpenNow =
                          pharmacy.isOpenNow ??
                          pharmacy.openNow ??
                          false;

                        const statusText =
                          pharmacy.statusText ||
                          (isOpenNow
                            ? "مفتوحة الآن"
                            : "مغلقة الآن");

                        const distanceMeters =
                          pharmacy.distanceMeters ??
                          pharmacy.distance ??
                          null;

                        return (
                          <article
                            key={
                              pharmacy.pharmacyId ||
                              pharmacy.markerId ||
                              index
                            }
                            className="
                              group
                              h-full
                              min-h-[118px]
                              rounded-[14px]
                              border border-[#e3e9ea]
                              bg-white
                              px-4 py-4
                              transition
                              hover:border-[#216474]/25
                              hover:bg-[#fbfdfd]
                              hover:shadow-[0_8px_22px_rgba(23,75,87,.055)]
                            "
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1 text-right">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate text-[14px] font-black text-[#29464d]">
                                    {pharmacyName}
                                  </h3>

                                  <span
                                    className={`inline-flex min-h-[30px] items-center justify-center rounded-full px-4 py-1.5 text-[11px] font-black ${
                                      isOpenNow
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {statusText}
                                  </span>
                                </div>

                                <p className="mt-0.5 line-clamp-1 text-[11px] text-[#8d9a9d]">
                                  {pharmacyAddress}
                                </p>

                                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[10.5px] text-[#697b80]">
                                  {distanceMeters != null && (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin
                                        size={12}
                                        className="text-[#216474]"
                                      />

                                      {formatDistance(
                                        distanceMeters,
                                      )}
                                    </span>
                                  )}

                                  <span className="inline-flex items-center gap-1">
                                    <Star
                                      size={12}
                                      fill="currentColor"
                                      className="text-[#DFAE0D]"
                                    />

                                    {rating.toLocaleString(
                                      "ar-SY-u-nu-latn",
                                      {
                                        maximumFractionDigits: 1,
                                      },
                                    )}
                                  </span>
                                </div>
                              </div>

                              {pharmacy.latitude != null &&
                              pharmacy.longitude !=
                                null ? (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${pharmacy.latitude},${pharmacy.longitude}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="
                                    grid size-9
                                    shrink-0
                                    place-items-center
                                    rounded-[10px]
                                    border border-[#dce5e7]
                                    bg-white
                                    text-[#216474]
                                    transition
                                    hover:border-[#216474]/30
                                    hover:bg-[#eef6f6]
                                  "
                                  aria-label={`فتح موقع ${pharmacyName}`}
                                  title="فتح الموقع"
                                >
                                  <Navigation
                                    size={15}
                                    strokeWidth={1.8}
                                  />
                                </a>
                              ) : (
                                <span
                                  className="
                                    grid size-9
                                    shrink-0
                                    place-items-center
                                    rounded-[10px]
                                    border border-[#dce5e7]
                                    bg-white
                                    text-[#216474]/40
                                  "
                                  aria-hidden="true"
                                >
                                  <Navigation
                                    size={15}
                                    strokeWidth={1.8}
                                  />
                                </span>
                              )}
                            </div>
                          </article>
                        );
                      },
                    )}
                  </div>

                  <Link
                    to="/app/search?view=pharmacies"
                    className="
                      mt-5
                      flex min-h-[48px]
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-[11px]
                      bg-[#216474]
                      px-5 py-3
                      text-[13px]
                      font-black
                      text-white
                      shadow-[0_8px_18px_rgba(33,100,116,.14)]
                      transition
                      hover:bg-[#174b57]
                    "
                  >
                    عرض المزيد من الصيدليات

                    <ArrowLeft
                      size={16}
                      strokeWidth={2}
                    />
                  </Link>
                </div>

                {/* MAP */}

                <div
                  dir="rtl"
                  className="
                    dawaai-map-layer-fix
                    relative isolate z-0
                    min-h-[360px]
                    bg-[#eef3f3]
                    sm:min-h-[420px]
                    lg:col-start-1
                    lg:row-start-1
                    lg:min-h-[500px]
                    [&>section]:h-full
                    [&>section]:rounded-none
                    [&>section]:border-0
                    [&>section]:shadow-none
                    [&>section>div]:!block
                    [&>section>div>aside]:!hidden
                    [&>section>div>div]:!min-h-[320px]
                    sm:[&>section>div>div]:!min-h-[380px]
                    lg:[&>section>div>div]:!min-h-[440px]
                    [&>section>div>div]:!h-full
                  "
                >
                  <Suspense
                    fallback={
                      <UserLoadingState label="جاري تجهيز الخريطة..." />
                    }
                  >
                    <NearbyPharmaciesMap
                      locationContext={locationContext}
                      route={routeQuery.data}
                      limit={3}
                      title="أقرب الصيدليات إليك"
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="
                grid min-h-[380px]
                place-items-center
                rounded-[22px]
                border border-dashed
                border-[#174b57]/15
                bg-white
                p-8
                text-center
              "
            >
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
                  <MapPinned size={25} />
                </span>

                <h3 className="mt-4 font-black text-[#29464d]">
                  حدد موقعك لعرض الصيدليات القريبة
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#71858a]">
                  سنستخدم موقعك لعرض أقرب الصيدليات
                  وترتيبها حسب المسافة.
                </p>

                <div className="mt-5 flex justify-center">
                  <LocationAction />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          SMART SERVICES
      ===================================================== */}

      <section
        dir="rtl"
        className="
          mt-16
          w-full
          bg-[#F8FAFC]
          pb-0
          pt-0
          font-['IBM_Plex_Sans_Arabic']
        "
      >
        <div className="mx-auto w-full max-w-[1660px] px-6 sm:px-8 lg:px-10 xl:px-12">

          <div
            dir="rtl"
            className="flex w-full flex-col items-stretch gap-5"
          >

            {/* SECTION TITLE */}

            <div
              dir="rtl"
              className="
                flex w-full
                flex-col
                items-stretch
                justify-center
                gap-2
                text-right
              "
            >
              <h2 className="w-full text-right text-[24px] font-medium leading-none text-[#333333]">
                المساعد الذكي
              </h2>

              <p className="w-full text-right text-[12px] font-normal leading-[20px] tracking-[0.01em] text-[#A5A5A5]">
                أدوات ذكية تساعدك في الوصول إلى المعلومة
                الصحية بشكل أبسط وأسرع
              </p>
            </div>

            {/* =================================================
                SMART CARDS
                أصبحت أعرض مع الحفاظ على التجاوب
            ================================================= */}

            <div
              className="
                mx-auto
                grid
                w-full
                max-w-[1500px]
                grid-cols-1
                gap-5
                sm:gap-6
                md:grid-cols-2
                lg:gap-8
                xl:gap-10
              "
            >
              {smartServices.map((service) => (
                <Link
                  key={service.title}
                  to={service.to}
                  dir="rtl"
                  aria-label={`الانتقال إلى ${service.title}`}
                  className="
                    group
                    flex
                    min-h-[330px]
                    w-full
                    flex-col
                    items-center
                    justify-center
                    gap-5
                    rounded-[12px]
                    border
                    border-[rgba(102,102,102,0.16)]
                    bg-white
                    px-8
                    py-7
                    no-underline
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#216474]/30
                    hover:shadow-[0_14px_34px_rgba(33,100,116,.10)]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#216474]/30
                    focus:ring-offset-2

                    sm:min-h-[350px]
                    sm:px-10
                    sm:py-8

                    lg:min-h-[370px]
                    lg:px-12
                    lg:py-9

                    xl:min-h-[390px]
                  "
                >
                  {/* ICON */}

                  <div className="relative grid size-[110px] shrink-0 place-items-center sm:size-[136px]">
                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        size-[94px]
                        rounded-full
                        bg-[rgba(75,187,187,0.12)]
                        sm:size-[116px]
                      "
                    />

                    <img
                      src={service.image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="
                        relative z-10
                        size-[76px]
                        object-contain
                        sm:size-[96px]
                      "
                    />
                  </div>

                  {/* TEXT */}

                  <div className="flex w-full flex-col items-center justify-center gap-3 sm:gap-4">
                    <h3
                      className="
                        w-full
                        text-center
                        text-[19px]
                        font-medium
                        leading-tight
                        text-[#333333]
                        transition-colors
                        duration-300
                        group-hover:text-[#216474]
                        sm:text-[20px]
                      "
                    >
                      {service.title}
                    </h3>

                    <p
                      className="
                        max-w-[500px]
                        text-center
                        text-[14px]
                        font-normal
                        leading-[24px]
                        tracking-[0.01em]
                        text-[#A5A5A5]
                        sm:text-[16px]
                        sm:leading-[26px]
                      "
                    >
                      {service.description}
                    </p>
                  </div>

                  {/* BUTTON */}

                  <div
                    className="
                      flex h-[44px]
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-[8px]
                      border border-[#216474]
                      bg-white
                      px-0 py-1
                      text-[16px]
                      font-medium
                      leading-[27px]
                      text-[#216474]
                      transition-all
                      duration-300
                      group-hover:bg-[#216474]
                      group-hover:text-white
                      sm:text-[18px]
                    "
                  >
                    <span>استخدم الآن</span>

                    <ArrowLeft
                      size={22}
                      strokeWidth={1.6}
                      className="
                        shrink-0
                        transition-transform
                        duration-300
                        group-hover:-translate-x-1
                        sm:size-6
                      "
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* =================================================
              HELP BANNER
          ================================================= */}

          <div
            dir="ltr"
            className="
              relative
              mt-12
              flex
              min-h-[260px]
              w-full
              flex-col
              items-center
              justify-center
              gap-6
              rounded-[8px]
              bg-[#216474]
              px-5 py-7
              sm:min-h-[210px]
              sm:px-8
              lg:mt-20
              lg:min-h-[160px]
              lg:flex-row
              lg:justify-between
              lg:px-10
              lg:py-5
            "
          >
            {/* CONTACT BUTTON */}

            <div className="relative z-10 flex w-full shrink-0 justify-center sm:w-[240px] lg:justify-start">
              <Link
                to="/app/assistant"
                dir="rtl"
                className="
                  flex h-[44px]
                  w-full
                  max-w-[280px]
                  items-center
                  justify-center
                  rounded-[8px]
                  bg-white
                  px-4
                  text-[16px]
                  font-medium
                  leading-6
                  text-[#216474]
                  transition
                  hover:bg-[#F3F8F9]
                  sm:w-[240px]
                "
              >
                تواصل معنا الآن
              </Link>
            </div>

            {/* CENTER TEXT */}

            <div
              dir="rtl"
              className="
                pointer-events-none
                relative
                left-auto
                top-auto
                z-10
                w-full
                max-w-[620px]
                translate-x-0
                translate-y-0
                text-center

                lg:absolute
                lg:left-1/2
                lg:top-1/2
                lg:w-[calc(100%-2rem)]
                lg:max-w-[520px]
                lg:-translate-x-1/2
                lg:-translate-y-1/2
              "
            >
              <div className="flex w-full flex-col items-center justify-center gap-4">
                <h3 className="w-full text-center text-xl font-bold leading-tight text-white sm:text-[32px] sm:leading-none">
                  لم تجد دواءك؟ نحن هنا لمساعدتك
                </h3>

                <p className="w-full text-center text-[12px] font-normal leading-[20px] tracking-[0.01em] text-[#D6D6D6]">
                  تواصل معنا وسنساعدك في إيجاد الدواء
                  أو الوصول إلى الخدمة المناسبة.
                </p>
              </div>
            </div>

            {/* IMAGE */}

            <div className="relative z-10 ml-auto hidden h-[118px] w-[177px] shrink-0 items-center justify-center lg:flex">
              <img
                src={SMART}
                alt="مساعدة دوائي"
                className="h-[118px] w-[177px] object-contain"
              />
            </div>
          </div>
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer
          dir="rtl"
          className="
            mt-12
            mb-0
            w-full
            border-y
            border-[rgba(102,102,102,0.16)]
            bg-white
            sm:mt-16
            lg:mt-20
          "
        >
          <div
            className="
              mx-auto
              flex w-full
              max-w-[1450px]
              flex-col
              px-5 py-7
              sm:px-7
              lg:px-12
            "
          >
            <div
              className="
                grid w-full
                grid-cols-1
                items-center
                gap-10
                md:grid-cols-2
                xl:grid-cols-4
                xl:gap-12
              "
            >
              {/* BRAND */}

              <div className="flex min-w-0 flex-col items-start gap-3">
                <Brand />

                <p
                  className="
                    max-w-[230px]
                    text-right
                    text-[12px]
                    font-normal
                    leading-[20px]
                    tracking-[0.01em]
                    text-[#666666]
                  "
                >
                  منصة ذكية تساعدك في العثور على أقرب
                  صيدلية والوصول إلى الخدمات الدوائية
                  بصورة أسرع وأكثر موثوقية.
                </p>
              </div>

              {/* PRIVACY */}

              <div className="flex items-center justify-start gap-3">
                <span
                  className="
                    grid size-10
                    shrink-0
                    place-items-center
                    rounded-[8px]
                    bg-[#E6F3F6]
                    text-[#216474]
                  "
                >
                  <LockKeyhole
                    size={22}
                    strokeWidth={1.8}
                  />
                </span>

                <div className="flex flex-col items-start gap-2">
                  <strong className="text-[16px] font-medium leading-none text-[#666666]">
                    خصوصية كاملة
                  </strong>

                  <p className="text-[12px] leading-[20px] text-[#A5A5A5]">
                    نحافظ على بياناتك ومعلوماتك
                  </p>
                </div>
              </div>

              {/* TRUST */}

              <div className="flex items-center justify-start gap-3">
                <span
                  className="
                    grid size-10
                    shrink-0
                    place-items-center
                    rounded-[8px]
                    bg-[#E6F3F6]
                    text-[#216474]
                  "
                >
                  <ShieldCheck
                    size={22}
                    strokeWidth={1.8}
                  />
                </span>

                <div className="flex flex-col items-start gap-2">
                  <strong className="text-[16px] font-medium leading-none text-[#666666]">
                    معلومات موثوقة
                  </strong>

                  <p className="text-[12px] leading-[20px] text-[#A5A5A5]">
                    بيانات منظمة ومحدثة قدر الإمكان
                  </p>
                </div>
              </div>

              {/* SUPPORT */}

              <div className="flex items-center justify-start gap-3">
                <span
                  className="
                    grid size-10
                    shrink-0
                    place-items-center
                    rounded-[8px]
                    bg-[#E6F3F6]
                    text-[#216474]
                  "
                >
                  <Headphones
                    size={22}
                    strokeWidth={1.8}
                  />
                </span>

                <div className="flex flex-col items-start gap-2">
                  <strong className="text-[16px] font-medium leading-none text-[#666666]">
                    دعم على مدار الساعة
                  </strong>

                  <p className="text-[12px] leading-[20px] text-[#A5A5A5]">
                    نحن هنا لمساعدتك عند الحاجة
                  </p>
                </div>
              </div>
            </div>

            <div className="my-6 h-px w-full bg-[rgba(102,102,102,0.16)]" />

            <div
              className="
                flex w-full
                flex-col
                items-center
                justify-between
                gap-4
                sm:flex-row
              "
            >
              <p
                className="
                  text-right
                  text-[12px]
                  font-normal
                  leading-[20px]
                  tracking-[0.01em]
                  text-[#A5A5A5]
                "
              >
                جميع الحقوق محفوظة لمنصة دوائي © 2026
              </p>

              <div
                dir="ltr"
                className="flex items-center gap-3"
              >
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
                      grid size-[44px]
                      place-items-center
                      rounded-full
                      border
                      border-[rgba(102,102,102,0.16)]
                      bg-[rgba(171,222,222,0.16)]
                      transition
                      hover:bg-[#E6F3F6]
                    "
                  >
                    <img
                      src={FOOTER_SOCIAL_ICONS[key]}
                      alt=""
                      aria-hidden="true"
                      className="size-6 object-contain"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}

export { UserDashboardPage };

export default UserDashboardPage;

