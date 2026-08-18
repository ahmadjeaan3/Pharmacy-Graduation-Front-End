import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ChevronDown,
  Filter,
  Headphones,
  LockKeyhole,
  MapPin,
  Navigation,
  PackageSearch,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  getLocationContext,
  getNearestPharmacies,
  getNearestPharmacyRoute,
  getPopularMedicines,
  getSearchHistory,
  searchMedicines,
  userKeys,
} from "../api/userApi";
import { LocationAction } from "../components/LocationAction";
import { PharmacyCard } from "../components/PharmacyCard";
import {
  EmptyState as UserEmptyState,
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { formatDistance } from "../utils/userFormatters";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { MedicineAlternativesButton } from "../../intelligence/components/MedicineAlternativesButton";
import { Brand } from "../../../shared/components/Brand";

const SEARCH_HERO_BACKGROUND = "/assets/app/home/hero_search.png";

const FOOTER_SOCIAL_ICONS = {
  whatsapp: "/assets/app/social/whatsapp.png",
  facebook: "/assets/app/social/facebook.png",
  email: "/assets/app/social/email.png",
  instagram: "/assets/app/social/instagram.png",
};

const popularSearches = ["بانادول", "أوجمنتين", "بيبانتين", "سيفيكسيم"];

function getMedicineImageSource(imageUrl) {
  if (!imageUrl) return null;

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  try {
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "https://localhost:7048/api";

    const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin;

    return `${apiOrigin}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  } catch {
    return imageUrl;
  }
}

const sortOptions = [
  { value: "BestMatch", label: "الأفضل تطابقاً" },
  { value: "Distance", label: "الأقرب" },
  { value: "OpenNow", label: "المفتوحة الآن" },
  { value: "Rating", label: "الأعلى تقييماً" },
];

const NearbyPharmaciesMap = lazy(() =>
  import("../components/NearbyPharmaciesMap").then((module) => ({
    default: module.NearbyPharmaciesMap,
  })),
);

export function MedicineSearchPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [radius, setRadius] = useState(5000);
  const [sortBy, setSortBy] = useState("BestMatch");
  const [routePharmacy, setRoutePharmacy] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [visiblePreviousCount, setVisiblePreviousCount] = useState(5);

  const searchHistoryQuery = useQuery({
    queryKey: userKeys.searchHistory(20),
    queryFn: () => getSearchHistory(20),
    staleTime: 30_000,
  });

  const popularMedicinesQuery = useQuery({
    queryKey: userKeys.popularMedicines(20),
    queryFn: () => getPopularMedicines(20),
    staleTime: 60_000,
  });

  const previousSearches = useMemo(() => {
    const history = Array.isArray(searchHistoryQuery.data)
      ? searchHistoryQuery.data
      : [];

    const medicines = Array.isArray(popularMedicinesQuery.data)
      ? popularMedicinesQuery.data
      : [];

    const normalize = (value) =>
      String(value || "")
        .trim()
        .toLowerCase();

    return history.map((entry, index) => {
      const term =
        entry.query ||
        entry.searchQuery ||
        entry.term ||
        entry.searchText ||
        "";

      const normalizedTerm = normalize(term);

      const medicine =
        medicines.find((item) => {
          const names = [
            item.medicineName,
            item.arabicMedicineName,
            item.medicineDisplayName,
            item.scientificName,
          ];

          return names.some((name) => {
            const normalizedName = normalize(name);

            return (
              normalizedName &&
              normalizedTerm &&
              (normalizedName.includes(normalizedTerm) ||
                normalizedTerm.includes(normalizedName))
            );
          });
        }) || null;

      return {
        id: entry.id || entry.searchHistoryId || `${term}-${index}`,
        term: term || "بحث سابق",
        searchedAt:
          entry.searchedAtUtc ||
          entry.createdAtUtc ||
          entry.createdAt ||
          entry.date ||
          null,
        medicine,
      };
    });
  }, [searchHistoryQuery.data, popularMedicinesQuery.data]);

  const activeView =
    searchParams.get("view") === "pharmacies" ? "pharmacies" : "medicines";

  const locationQuery = useQuery({
    queryKey: userKeys.locationContext({ radius, take: 6 }),
    queryFn: () =>
      getLocationContext({
        radiusInMeters: radius,
        take: 6,
        externalTake: 4,
        includeExternalFallback: true,
        sortBy: "Distance",
      }),
  });

  const pharmaciesQuery = useQuery({
    queryKey: userKeys.nearestPharmacies({ radius, sortBy }),
    queryFn: () =>
      getNearestPharmacies({
        radiusInMeters: radius,
        take: 20,
        externalTake: 4,
        includeExternalFallback: true,
        sortBy,
      }),
    enabled: activeView === "pharmacies",
  });

  const [searchRequest, setSearchRequest] = useState(() => {
    const initialQuery = searchParams.get("q")?.trim();

    return initialQuery
      ? {
          query: initialQuery,
          radiusInMeters: 5000,
          maxResults: 50,
          sortBy: "BestMatch",
        }
      : null;
  });

  const medicineSearchQuery = useQuery({
    queryKey: ["user", "medicine-search", searchRequest],
    queryFn: () => searchMedicines(searchRequest),
    enabled: Boolean(searchRequest),
    retry: 1,
    staleTime: 30_000,
  });

  const routeQuery = useQuery({
    queryKey: userKeys.nearestPharmacyRoute({
      pharmacyId: routePharmacy?.pharmacyId,
    }),
    queryFn: () =>
      getNearestPharmacyRoute({
        pharmacyId: routePharmacy.pharmacyId,
      }),
    enabled: Boolean(routePharmacy?.pharmacyId),
  });

  const searchMutation = {
    data: medicineSearchQuery.data,
    error: medicineSearchQuery.error,
    isError: medicineSearchQuery.isError,
    isPending: medicineSearchQuery.isFetching,
    reset: () => setSearchRequest(null),
  };

  const results = useMemo(
    () => searchMutation.data ?? [],
    [searchMutation.data],
  );

  const visibleResults = useMemo(
    () => results.slice(0, visibleCount),
    [results, visibleCount],
  );

  const groupedCount = useMemo(
    () => new Set(results.map((item) => item.pharmacy.pharmacyId)).size,
    [results],
  );

  const resultPharmacies = useMemo(() => {
    const map = new Map();

    results.forEach(({ pharmacy }) => {
      if (pharmacy?.pharmacyId && !map.has(pharmacy.pharmacyId)) {
        map.set(pharmacy.pharmacyId, pharmacy);
      }
    });

    return [...map.values()]
      .sort(
        (a, b) =>
          Number(a.distanceMeters ?? Infinity) -
          Number(b.distanceMeters ?? Infinity),
      )
      .slice(0, 3);
  }, [results]);

  const resultsMapContext = useMemo(() => {
    if (!locationQuery.data || !results.length) return null;

    const pharmacies = new Map();

    results.forEach(({ pharmacy }) => {
      if (
        pharmacy?.pharmacyId &&
        pharmacy.latitude != null &&
        pharmacy.longitude != null &&
        !pharmacies.has(pharmacy.pharmacyId)
      ) {
        pharmacies.set(pharmacy.pharmacyId, {
          markerId: pharmacy.pharmacyId,
          pharmacyId: pharmacy.pharmacyId,
          name: pharmacy.pharmacyName,
          address: pharmacy.address,
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
          distanceMeters: pharmacy.distanceMeters,
          averageRating: pharmacy.averageRating,
          isOpenNow: pharmacy.isOpenNow,
          statusText: pharmacy.statusText,
        });
      }
    });

    return {
      ...locationQuery.data,
      mapMarkers: [...pharmacies.values()],
    };
  }, [locationQuery.data, results]);

  const routeMapContext = useMemo(() => {
    if (!routeQuery.data?.pharmacy) return null;

    return {
      latitude: routeQuery.data.originLatitude,
      longitude: routeQuery.data.originLongitude,
      mapMarkers: [routeQuery.data.pharmacy],
    };
  }, [routeQuery.data]);

  const showRoute = (pharmacy) => {
    setRoutePharmacy(pharmacy);

    window.setTimeout(
      () =>
        document.getElementById("selected-pharmacy-route")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      80,
    );
  };

  const submit = (event) => {
    event.preventDefault();

    const normalized = query.trim();
    if (!normalized) return;

    setVisibleCount(5);

    setSearchRequest({
      query: normalized,
      radiusInMeters: radius,
      maxResults: 50,
      sortBy,
    });

    setSearchParams({ q: normalized });
  };

  const runPopularSearch = (term) => {
    setQuery(term);
    setVisibleCount(5);

    setSearchRequest({
      query: term,
      radiusInMeters: radius,
      maxResults: 50,
      sortBy,
    });

    setSearchParams({ q: term });
  };

  const applyFilters = () => {
    const normalized = query.trim();
    if (!normalized) return;

    setVisibleCount(5);

    setSearchRequest({
      query: normalized,
      radiusInMeters: radius,
      maxResults: 50,
      sortBy,
    });
  };

  const resetFilters = () => {
    setRadius(5000);
    setSortBy("BestMatch");
  };

  return (
    <div
      dir="rtl"
      className="w-full bg-[#F7F9FA] text-[#333333]"
      style={{
        marginTop: "-24px",
        marginBottom: "-24px",
      }}
    >
      {/* =====================================================
          HERO
      ====================================================== */}
      <section
        className="relative isolate overflow-hidden bg-[#0D7586] text-white"
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <img
          src={SEARCH_HERO_BACKGROUND}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 -z-20 h-full w-full select-none object-cover object-center"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,58,71,.16),rgba(3,112,130,.52),rgba(0,60,73,.32))]"
        />

        <div className="mx-auto flex min-h-[320px] w-full max-w-[1440px] flex-col items-center justify-center px-5 py-10 text-center sm:px-7 lg:px-10">
          <h1 className="text-[28px] font-bold leading-tight sm:text-[32px]">
            ابحث عن دوائك بسهولة
          </h1>

          <p className="mt-3 max-w-[650px] text-[13px] leading-7 text-white/75">
            نوصلك لأقرب الصيدليات التي يتوفر فيها دواؤك بسرعة، مع إمكانية مقارنة
            النتائج حسب المسافة والتوفر والتقييم.
          </p>

          <form
            onSubmit={submit}
            className="mt-6 flex h-[52px] w-full max-w-[600px] overflow-hidden rounded-[8px] bg-white shadow-[0_8px_22px_rgba(0,0,0,.08)]"
          >
            <button
              type="submit"
              aria-label="بحث"
              className="grid h-[52px] w-[56px] shrink-0 place-items-center bg-[#216474] text-white transition hover:bg-[#174B57]"
            >
              <Search size={21} strokeWidth={1.8} />
            </button>

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث عن اسم دوائك أو المادة الفعالة..."
              className="min-w-0 flex-1 bg-white px-5 text-right text-[14px] text-[#29464D] outline-none placeholder:text-[#8A9A9E]"
            />

            <div className="flex h-full shrink-0 items-center border-r border-[#EDF1F2] bg-[#F8FBFB] px-3">
              <LocationAction variant="hero" compact />
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <span className="text-[12px] font-semibold text-white/80">
              البحث الشائع:
            </span>

            {popularSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => runPopularSearch(term)}
                className="min-w-[82px] rounded-full border border-white/10 bg-white/18 px-4 py-2 text-[12px] font-medium text-white transition hover:bg-white/28"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          MEDICINE RESULTS
      ====================================================== */}
      {activeView === "medicines" ? (
        <section className="mx-auto w-full max-w-[1380px] px-5 pb-12 pt-10 sm:px-7 lg:px-10">
          {searchMutation.isPending ? (
            <UserLoadingState label="نبحث في الصيدليات القريبة..." />
          ) : searchMutation.isError ? (
            <UserErrorState
              message={getApiErrorMessage(searchMutation.error)}
              onRetry={() => searchMutation.reset()}
            />
          ) : !searchMutation.data ? (
            <div className="mx-auto w-full max-w-[1120px]">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div className="text-right">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="h-[2px] w-8 rounded-full bg-[#216474]" />
                    <span className="text-[11px] font-bold text-[#216474]">
                      سجل البحث
                    </span>
                  </div>

                  <h2 className="text-[22px] font-black text-[#29464D]">
                    نتائج البحث السابقة
                  </h2>

                  <p className="mt-1 text-[12px] text-[#8A9A9E]">
                    يمكنك العودة إلى عمليات البحث الأخيرة بسرعة
                  </p>
                </div>
              </div>

              {searchHistoryQuery.isPending ? (
                <UserLoadingState label="جاري تحميل عمليات البحث السابقة..." />
              ) : previousSearches.length ? (
                <>
                  <div className="space-y-3">
                    {previousSearches
                      .slice(0, visiblePreviousCount)
                      .map((entry) => {
                        const medicine = entry.medicine;
                        const displayName =
                          medicine?.medicineDisplayName ||
                          medicine?.arabicMedicineName ||
                          medicine?.medicineName ||
                          entry.term;

                        const secondaryName =
                          medicine?.scientificName ||
                          medicine?.manufacturer ||
                          "بحث سابق";

                        const resolvedImageUrl = getMedicineImageSource(
                          medicine?.imageUrl,
                        );

                        return (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => runPopularSearch(entry.term)}
                            className="
                            group grid min-h-[84px] w-full items-center gap-4
                            rounded-[9px] border border-[#E2E8EA]
                            bg-white px-4 py-3 text-right
                            shadow-[0_3px_12px_rgba(23,75,87,.025)]
                            transition
                            hover:border-[#216474]/25
                            hover:shadow-[0_8px_22px_rgba(23,75,87,.05)]
                            sm:grid-cols-[70px_minmax(0,1fr)_150px_42px]
                          "
                          >
                            <div className="flex h-[64px] w-[70px] items-center justify-center overflow-hidden rounded-[9px] bg-[#F8FBFA]">
                              {resolvedImageUrl ? (
                                <img
                                  src={resolvedImageUrl}
                                  alt={displayName}
                                  className="max-h-[56px] max-w-[62px] object-contain"
                                />
                              ) : (
                                <PackageSearch
                                  size={24}
                                  strokeWidth={1.5}
                                  className="text-[#216474]"
                                />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h3 className="truncate text-[13px] font-black text-[#29464D]">
                                {displayName}
                              </h3>

                              <p
                                dir={
                                  secondaryName &&
                                  /[A-Za-z]/.test(secondaryName)
                                    ? "ltr"
                                    : "rtl"
                                }
                                className="mt-1 line-clamp-1 text-[10.5px] text-[#8A9A9E]"
                              >
                                {secondaryName}
                              </p>
                            </div>

                            <div className="hidden border-r border-[#EDF1F2] pr-4 text-right sm:block">
                              <span className="block text-[10px] text-[#A0ADB0]">
                                آخر بحث
                              </span>
                              <span className="mt-1 block text-[11px] font-semibold text-[#60777C]">
                                {entry.searchedAt
                                  ? new Date(
                                      entry.searchedAt,
                                    ).toLocaleDateString("ar-SY")
                                  : "مؤخراً"}
                              </span>
                            </div>

                            <span className="grid size-9 place-items-center justify-self-end rounded-full text-[#216474] transition group-hover:bg-[#EEF6F6]">
                              <ChevronDown size={16} className="rotate-90" />
                            </span>
                          </button>
                        );
                      })}
                  </div>

                  {visiblePreviousCount < previousSearches.length ? (
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setVisiblePreviousCount((current) =>
                            Math.min(current + 5, previousSearches.length),
                          )
                        }
                        className="
                          inline-flex min-h-[40px] min-w-[160px]
                          items-center justify-center gap-2
                          rounded-[8px] border border-[#216474]
                          bg-white px-5 text-[12px] font-semibold
                          text-[#216474] transition hover:bg-[#EEF6F6]
                        "
                      >
                        عرض المزيد
                        <ChevronDown size={15} />
                      </button>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-[10px] border border-dashed border-[#D6E2E4] bg-white px-6 py-12 text-center">
                  <PackageSearch
                    size={30}
                    strokeWidth={1.5}
                    className="mx-auto text-[#216474]"
                  />

                  <h3 className="mt-4 text-[14px] font-black text-[#29464D]">
                    لا توجد عمليات بحث سابقة
                  </h3>

                  <p className="mt-2 text-[11px] text-[#8A9A9E]">
                    ابحث عن دواء وسيظهر هنا ضمن سجل البحث.
                  </p>
                </div>
              )}
            </div>
          ) : !results.length ? (
            <UserEmptyState
              title="لم نجد نتائج مطابقة"
              description="جرّب الاسم العلمي، وسّع نطاق البحث أو تحقق من كتابة اسم الدواء."
              action={
                searchRequest?.query ? (
                  <MedicineAlternativesButton
                    medicineName={searchRequest.query}
                    label="البحث عن بدائل دوائية"
                    className="mx-auto mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#174B57] px-5 text-sm font-bold text-white"
                  />
                ) : null
              }
            />
          ) : (
            <>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div className="text-right">
                  <h2 className="text-[20px] font-bold text-[#29464D]">
                    نتائج البحث
                  </h2>
                  <p className="mt-1 text-[11px] text-[#8A9A9E]">
                    تم العثور على {results.length.toLocaleString("ar-SY")} نتيجة
                  </p>
                </div>
              </div>

              <div className="grid items-start gap-5 xl:grid-cols-[240px_minmax(0,1fr)_330px]">
                {/* RIGHT: filters */}
                <aside className="order-1 rounded-[10px] border border-[#E2E8EA] bg-white p-4 xl:sticky xl:top-20">
                  <div className="flex items-center gap-2 border-b border-[#EDF1F2] pb-4">
                    <Filter size={18} className="text-[#216474]" />
                    <div>
                      <h2 className="text-[15px] font-bold text-[#216474]">
                        فلترة النتائج
                      </h2>
                      <p className="mt-1 text-[11px] text-[#8A9A9E]">
                        خصص النتائج حسب ما يناسبك
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-5">
                    <FilterSelect
                      label="نطاق البحث"
                      value={radius}
                      onChange={(event) =>
                        setRadius(Number(event.target.value))
                      }
                    >
                      <option value={1000}>ضمن 1 كم</option>
                      <option value={3000}>ضمن 3 كم</option>
                      <option value={5000}>ضمن 5 كم</option>
                      <option value={10000}>ضمن 10 كم</option>
                      <option value={25000}>ضمن 25 كم</option>
                    </FilterSelect>

                    <FilterSelect
                      label="ترتيب النتائج"
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </FilterSelect>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={applyFilters}
                        className="flex min-h-[44px] w-full items-center justify-center rounded-[8px] bg-[#216474] px-4 text-[13px] font-semibold text-white transition hover:bg-[#174B57]"
                      >
                        تطبيق
                      </button>

                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-2 flex min-h-[42px] w-full items-center justify-center rounded-[8px] border border-[#216474] bg-white px-4 text-[13px] font-semibold text-[#216474] transition hover:bg-[#EEF6F6]"
                      >
                        إعادة تعيين
                      </button>
                    </div>
                  </div>
                </aside>

                {/* CENTER: result list */}
                <main className="order-2 min-w-0">
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <h2 className="text-[22px] font-bold text-[#29464D]">
                        النتائج
                      </h2>

                      <p className="mt-1 text-[12px] text-[#8A9A9E]">
                        {results.length.toLocaleString("ar-SY")} نتيجة لدى{" "}
                        {groupedCount.toLocaleString("ar-SY")} صيدلية
                      </p>
                    </div>

                    <MedicineAlternativesButton
                      medicineName={results[0]?.medicineName}
                      label="عرض بدائل للدواء"
                      className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-[8px] border border-[#CFE4E7] bg-[#EEF7F6] px-4 text-[12px] font-semibold text-[#216474]"
                    />
                  </div>

                  <div className="space-y-3">
                    {visibleResults.map((item) => {
                      const displayName =
                        item.medicineDisplayName ||
                        item.arabicMedicineName ||
                        item.medicineName;

                      const medicineMeta = [
                        item.arabicScientificName || item.scientificName,
                        item.dosageForm,
                        item.capacity,
                      ]
                        .filter(Boolean)
                        .join(" • ");

                      return (
                        <article
                          key={`${item.pharmacy.pharmacyId}-${item.medicineId}`}
                          className="grid min-h-[92px] items-center gap-3 rounded-[8px] border border-[#E2E8EA] bg-white px-3.5 py-3 shadow-[0_3px_12px_rgba(23,75,87,.025)] sm:grid-cols-[64px_minmax(0,1fr)_118px]"
                        >
                          <div className="flex h-[62px] w-[64px] items-center justify-center rounded-[9px] bg-[#F8FBFA]">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={displayName}
                                className="max-h-[54px] max-w-[58px] object-contain"
                              />
                            ) : (
                              <PackageSearch
                                size={23}
                                strokeWidth={1.5}
                                className="text-[#216474]"
                              />
                            )}
                          </div>

                          <div className="min-w-0 text-right">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-[13px] font-bold text-[#29464D]">
                                {displayName}
                              </h3>

                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                                متوفر الآن
                              </span>
                            </div>

                            <p className="mt-1 line-clamp-1 text-[11px] text-[#8A9A9E]">
                              {medicineMeta || "دواء مسجل في المنصة"}
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-4 text-[10.5px] text-[#708287]">
                              <span>
                                {formatDistance(item.pharmacy.distanceMeters)}
                              </span>

                              <span className="inline-flex items-center gap-1">
                                <Star
                                  size={12}
                                  fill="currentColor"
                                  className="text-[#DFAE0D]"
                                />
                                {Number(
                                  item.pharmacy.averageRating || 0,
                                ).toLocaleString("ar-SY", {
                                  maximumFractionDigits: 1,
                                })}
                              </span>

                              <span className="font-semibold text-[#216474]">
                                {item.pharmacy.pharmacyName}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-col gap-2">
                            <Link
                              to={`/app/pharmacies/${item.pharmacy.pharmacyId}?medicine=${item.medicineId}`}
                              className="inline-flex min-h-[40px] min-w-[120px] items-center justify-center rounded-[8px] bg-[#216474] px-4 text-[12px] font-semibold text-white transition hover:bg-[#174B57]"
                            >
                              عرض الصيدلية
                            </Link>

                            {item.pharmacy.latitude != null &&
                              item.pharmacy.longitude != null && (
                                <button
                                  type="button"
                                  onClick={() => showRoute(item.pharmacy)}
                                  className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-[8px] border border-[#DCE5E7] bg-white px-3 text-[11px] font-medium text-[#216474] transition hover:bg-[#EEF6F6]"
                                >
                                  <Navigation size={14} />
                                  المسار
                                </button>
                              )}
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {visibleCount < results.length ? (
                    <div className="mt-7 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleCount((current) =>
                            Math.min(current + 5, results.length),
                          )
                        }
                        className="inline-flex min-h-[42px] min-w-[180px] items-center justify-center gap-2 rounded-[8px] border border-[#216474] bg-white px-5 text-[12px] font-semibold text-[#216474] transition hover:bg-[#EEF6F6]"
                      >
                        عرض المزيد
                        <ChevronDown size={15} />
                      </button>
                    </div>
                  ) : null}
                </main>

                {/* LEFT: nearest pharmacies + map */}
                <aside className="order-3 min-w-0">
                  <div className="mb-4">
                    <h2 className="text-[16px] font-bold text-[#29464D]">
                      أقرب الصيدليات المتوفر فيها
                    </h2>

                    <p className="mt-1 text-[11px] text-[#8A9A9E]">
                      مرتبة حسب المسافة من موقعك
                    </p>
                  </div>

                  <div className="space-y-3">
                    {resultPharmacies.map((pharmacy) => (
                      <article
                        key={pharmacy.pharmacyId}
                        className="rounded-[8px] border border-[#E2E8EA] bg-white px-3.5 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-[13px] font-bold text-[#29464D]">
                              {pharmacy.pharmacyName}
                            </h3>

                            <p className="mt-1 truncate text-[10.5px] text-[#8A9A9E]">
                              {pharmacy.address || "العنوان غير محدد"}
                            </p>

                            <div className="mt-2 flex items-center gap-3 text-[10px] text-[#708287]">
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={11} />
                                {formatDistance(pharmacy.distanceMeters)}
                              </span>

                              <span className="inline-flex items-center gap-1">
                                <Star
                                  size={11}
                                  fill="currentColor"
                                  className="text-[#DFAE0D]"
                                />
                                {Number(
                                  pharmacy.averageRating || 0,
                                ).toLocaleString("ar-SY", {
                                  maximumFractionDigits: 1,
                                })}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-semibold ${
                              pharmacy.isOpenNow
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {pharmacy.statusText ||
                              (pharmacy.isOpenNow
                                ? "مفتوحة الآن"
                                : "مغلقة الآن")}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>

                  {resultsMapContext?.mapMarkers?.length > 0 ? (
                    <div className="mt-4 overflow-hidden rounded-[10px] border border-[#E2E8EA] bg-white">
                      <div className="h-[230px] [&>section]:h-full [&>section]:rounded-none [&>section]:border-0 [&>section]:shadow-none [&>section>div]:!block [&>section>div>aside]:!hidden [&>section>div>div]:!h-full [&>section>div>div]:!min-h-[230px]">
                        <Suspense
                          fallback={
                            <UserLoadingState label="جاري تجهيز الخريطة..." />
                          }
                        >
                          <NearbyPharmaciesMap
                            locationContext={resultsMapContext}
                            route={null}
                            limit={8}
                            title="الصيدليات المتوفر لديها الدواء"
                          />
                        </Suspense>
                      </div>
                    </div>
                  ) : null}
                </aside>
              </div>
            </>
          )}

          {routePharmacy ? (
            <section id="selected-pharmacy-route" className="mt-8 scroll-mt-24">
              {routeQuery.isPending ? (
                <UserLoadingState
                  label={t("جاري رسم طريق الوصول إلى الصيدلية...")}
                />
              ) : null}

              {routeQuery.isError ? (
                <UserErrorState
                  message={getApiErrorMessage(routeQuery.error)}
                  onRetry={routeQuery.refetch}
                />
              ) : null}

              {routeMapContext ? (
                <Suspense
                  fallback={
                    <UserLoadingState label={t("جاري تحميل خريطة المسار...")} />
                  }
                >
                  <NearbyPharmaciesMap
                    locationContext={routeMapContext}
                    route={routeQuery.data}
                    limit={1}
                    title={`${t("مسار الوصول إلى الصيدلية")} — ${
                      routePharmacy.pharmacyName
                    }`}
                  />
                </Suspense>
              ) : null}
            </section>
          ) : null}
        </section>
      ) : (
        <section className="mx-auto w-full max-w-[1440px] px-5 pb-14 pt-8 sm:px-7 lg:px-10">
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <FilterSelect
              label="نطاق البحث"
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            >
              <option value={1000}>ضمن 1 كم</option>
              <option value={3000}>ضمن 3 كم</option>
              <option value={5000}>ضمن 5 كم</option>
              <option value={10000}>ضمن 10 كم</option>
              <option value={25000}>ضمن 25 كم</option>
            </FilterSelect>

            <FilterSelect
              label="ترتيب النتائج"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </div>

          <PharmaciesResults query={pharmaciesQuery} onShowRoute={showRoute} />
        </section>
      )}

      {/* =====================================================
          FOOTER — نفس Footer الداشبورد
      ====================================================== */}
      <footer
        dir="rtl"
        className="m-0 w-full border-t border-[rgba(102,102,102,0.16)] bg-white"
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <div className="mx-auto flex w-full flex-col px-9 pb-5 pt-7 lg:px-12">
          <div className="grid w-full grid-cols-1 items-center gap-8 md:grid-cols-2 xl:grid-cols-4 xl:gap-12">
            <div className="flex min-w-0 flex-col items-start gap-3 xl:mr-30">
              <Brand />

              <p className="max-w-[300px] text-right text-[12px] font-normal leading-[20px] tracking-[0.01em] text-[#666666]">
                منصة ذكية تساعدك في العثور على أقرب صيدلية والوصول إلى الخدمات
                الدوائية بصورة أسرع وأكثر موثوقية.
              </p>
            </div>

            <DashboardFooterFeature
              icon={LockKeyhole}
              title="خصوصية كاملة"
              description="نحافظ على بياناتك ومعلوماتك"
            />

            <DashboardFooterFeature
              icon={ShieldCheck}
              title="معلومات موثوقة"
              description="بيانات منظمة ومحدثة قدر الإمكان"
            />

            <DashboardFooterFeature
              icon={Headphones}
              title="دعم على مدار الساعة"
              description="نحن هنا لمساعدتك عند الحاجة"
            />
          </div>

          <div className="my-6 h-px w-full bg-[rgba(102,102,102,0.16)]" />

          <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-right text-[12px] font-normal leading-[20px] tracking-[0.01em] text-[#A5A5A5] xl:mr-30">
              جميع الحقوق محفوظة لمنصة دوائي © 2026
            </p>

            <div dir="ltr" className="flex items-center gap-3 xl:ml-40">
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
                  className="grid size-[44px] place-items-center rounded-full border border-[rgba(102,102,102,0.16)] bg-[rgba(171,222,222,0.16)] transition hover:bg-[#E6F3F6]"
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
    </div>
  );
}

function PharmaciesResults({ query, onShowRoute }) {
  if (query.isPending) {
    return <UserLoadingState label="نحدد الصيدليات الأقرب..." />;
  }

  if (query.isError) {
    return (
      <UserErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  }

  if (!query.data?.length) {
    return (
      <UserEmptyState
        title="لا توجد صيدليات مسجلة ضمن النطاق"
        description="حدّث موقعك أو وسّع مسافة البحث لعرض خيارات أكثر."
      />
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {query.data.map((pharmacy) => (
        <PharmacyCard
          key={pharmacy.pharmacyId}
          pharmacy={pharmacy}
          onShowRoute={onShowRoute}
        />
      ))}
    </section>
  );
}

function FilterSelect({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-semibold text-[#60777C]">
        {label}
      </span>

      <div className="relative">
        <select
          {...props}
          className="h-[44px] w-full appearance-none rounded-[8px] border border-[#DCE5E7] bg-white px-4 pl-10 text-[13px] font-medium text-[#29464D] outline-none transition hover:border-[#AFC9CD] focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
        >
          {children}
        </select>

        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#216474]">
          <ChevronDown size={16} strokeWidth={1.8} />
        </span>
      </div>
    </label>
  );
}

function DashboardFooterFeature({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center justify-start gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#E6F3F6] text-[#216474]">
        <Icon size={22} strokeWidth={1.8} />
      </span>

      <div className="flex flex-col items-start gap-2">
        <strong className="text-[16px] font-medium leading-none text-[#666666]">
          {title}
        </strong>

        <p className="text-[12px] leading-[20px] text-[#A5A5A5]">
          {description}
        </p>
      </div>
    </div>
  );
}
