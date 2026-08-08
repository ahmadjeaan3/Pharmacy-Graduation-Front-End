import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Filter,
  LocateFixed,
  MapPin,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getLocationContext,
  getNearestPharmacies,
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
import { PageHeader as UserPageHeader } from "../../../shared/components/PageHeader";
import { formatDistance, formatPrice } from "../utils/userFormatters";
import { getApiErrorMessage } from "../../../shared/api/errors";

const NearbyPharmaciesMap = lazy(() =>
  import("../components/NearbyPharmaciesMap").then((module) => ({
    default: module.NearbyPharmaciesMap,
  })),
);

const sortOptions = [
  { value: "BestMatch", label: "الأفضل تطابقاً" },
  { value: "Distance", label: "الأقرب" },
  { value: "OpenNow", label: "المفتوحة الآن" },
  { value: "Rating", label: "الأعلى تقييماً" },
  { value: "PriceLowToHigh", label: "السعر الأقل" },
];

export function MedicineSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [radius, setRadius] = useState(5000);
  const [sortBy, setSortBy] = useState("BestMatch");
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
        sortBy: sortBy === "PriceLowToHigh" ? "Distance" : sortBy,
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
  const groupedCount = useMemo(
    () => new Set(results.map((item) => item.pharmacy.pharmacyId)).size,
    [results],
  );
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
    return { ...locationQuery.data, mapMarkers: [...pharmacies.values()] };
  }, [locationQuery.data, results]);

  const submit = (event) => {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;
    setSearchRequest({
      query: normalized,
      radiusInMeters: radius,
      maxResults: 50,
      sortBy,
    });
  };
  const switchView = (view) =>
    setSearchParams(view === "pharmacies" ? { view } : {});

  return (
    <div className="space-y-6">
      <UserPageHeader
        eyebrow="اكتشف الأقرب"
        title="ابحث عن دوائك بسهولة"
        description="قارن توفر الدواء وسعره والمسافة، ثم أرسل طلبك مباشرة إلى الصيدلية المناسبة."
        icon={PackageSearch}
        action={<LocationAction compact />}
      />
      <section className="rounded-[1.5rem] border border-[#174b57]/8 bg-white p-5 shadow-[0_12px_35px_rgba(23,75,87,.045)] lg:p-6">
        <div className="flex gap-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => switchView("medicines")}
            className={`flex items-center gap-2 border-b-2 px-4 pb-4 text-sm font-bold ${activeView === "medicines" ? "border-[#216474] text-[#216474]" : "border-transparent text-slate-400"}`}
          >
            <PackageSearch size={17} />
            بحث عن دواء
          </button>
          <button
            type="button"
            onClick={() => switchView("pharmacies")}
            className={`flex items-center gap-2 border-b-2 px-4 pb-4 text-sm font-bold ${activeView === "pharmacies" ? "border-[#216474] text-[#216474]" : "border-transparent text-slate-400"}`}
          >
            <Building2 size={17} />
            الصيدليات القريبة
          </button>
        </div>
        {activeView === "medicines" && (
          <form
            onSubmit={submit}
            className="mt-5 grid gap-3 lg:grid-cols-[1fr_190px_180px_auto]"
          >
            <div className="field-control">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="form-input has-field-icon"
                maxLength={200}
                placeholder="اكتب اسم الدواء أو الاسم العلمي"
              />
              <span className="field-icon-shell">
                <Search size={18} />
              </span>
            </div>
            <SelectControl
              icon={LocateFixed}
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            >
              <option value={1000}>ضمن 1 كم</option>
              <option value={3000}>ضمن 3 كم</option>
              <option value={5000}>ضمن 5 كم</option>
              <option value={10000}>ضمن 10 كم</option>
              <option value={25000}>ضمن 25 كم</option>
            </SelectControl>
            <SelectControl
              icon={SlidersHorizontal}
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectControl>
            <button
              type="submit"
              disabled={!query.trim() || searchMutation.isPending}
              className="btn-primary justify-center px-7 disabled:opacity-50"
            >
              <Search size={17} />
              {searchMutation.isPending ? "جاري البحث..." : "بحث"}
            </button>
          </form>
        )}
        {activeView === "pharmacies" && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SelectControl
              icon={LocateFixed}
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
            >
              <option value={1000}>ضمن 1 كم</option>
              <option value={3000}>ضمن 3 كم</option>
              <option value={5000}>ضمن 5 كم</option>
              <option value={10000}>ضمن 10 كم</option>
              <option value={25000}>ضمن 25 كم</option>
            </SelectControl>
            <SelectControl
              icon={Filter}
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              {sortOptions
                .filter((option) => option.value !== "PriceLowToHigh")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </SelectControl>
          </div>
        )}
      </section>
      {activeView === "medicines" ? (
        <>
          <MedicineResults
            mutation={searchMutation}
            results={results}
            groupedCount={groupedCount}
          />
          {resultsMapContext?.mapMarkers?.length > 0 && (
            <Suspense
              fallback={
                <UserLoadingState label="جاري تجهيز الخريطة داخل المنصة..." />
              }
            >
              <NearbyPharmaciesMap
                locationContext={resultsMapContext}
                route={null}
                limit={12}
                title="صيدليات يتوفر لديها الدواء"
              />
            </Suspense>
          )}
        </>
      ) : (
        <PharmaciesResults query={pharmaciesQuery} />
      )}
      {activeView === "pharmacies" &&
        locationQuery.data?.externalNearbyPharmacies?.length > 0 && (
          <section>
            <div className="mb-4">
              <h3 className="text-xl font-black text-[#17363e]">
                خيارات إضافية بالقرب منك
              </h3>
              <p className="mt-1 text-sm text-[#71858a]">
                أماكن قريبة يمكنك الوصول إليها عبر الخريطة
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {locationQuery.data.externalNearbyPharmacies.map((item) => (
                <article
                  key={item.markerId}
                  className="flex items-center gap-4 rounded-[1.25rem] border border-[#174b57]/8 bg-white p-4"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
                    <MapPin size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-extrabold text-[#29464d]">
                      {item.name}
                    </h4>
                    <p className="mt-1 truncate text-xs text-[#71858a]">
                      {item.address}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#216474]">
                      {formatDistance(item.distanceMeters)}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-2 rounded-xl bg-[#eaf4f3] px-3 py-2 text-xs font-black text-[#216474]"
                    title="الموقع ظاهر على الخريطة داخل الصفحة"
                  >
                    <MapPin size={15} />
                    داخل الخريطة
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}

function MedicineResults({ mutation, results, groupedCount }) {
  const { t } = useTranslation();
  if (mutation.isPending)
    return <UserLoadingState label="نبحث في الصيدليات القريبة..." />;
  if (mutation.isError)
    return (
      <UserErrorState
        message={getApiErrorMessage(mutation.error)}
        onRetry={() => mutation.reset()}
      />
    );
  if (!mutation.data)
    return (
      <UserEmptyState
        title="ابدأ بكتابة اسم الدواء"
        description="ستظهر هنا الصيدليات التي يتوفر لديها الدواء مع السعر والمسافة وحالة الدوام."
      />
    );
  if (!results.length)
    return (
      <UserEmptyState
        title="لم نجد نتائج مطابقة"
        description="جرّب الاسم العلمي، وسّع نطاق البحث أو تحقق من كتابة اسم الدواء."
      />
    );
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-[#17363e]">نتائج البحث</h3>
          <p className="mt-1 text-sm text-[#71858a]">
            {results.length.toLocaleString("ar-SY")} نتيجة لدى{" "}
            {groupedCount.toLocaleString("ar-SY")} صيدليات
          </p>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {results.map((item) => (
          <article
            key={`${item.pharmacy.pharmacyId}-${item.medicineId}`}
            className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#29464d]">
                  {item.medicineName}
                </h3>
                <p className="mt-1 text-sm text-[#71858a]">
                  {[item.scientificName, item.dosageForm, item.capacity]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                  متوفر الآن
                </span>
                {item.requiresPrescription && (
                  <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                    يتطلب وصفة
                  </span>
                )}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-[#f8fbfa] p-4 sm:grid-cols-4">
              <Info label="السعر" value={formatPrice(item.sellingPrice)} />
              <Info label={t("التوفر")} value={t("متوفر")} />
              <Info
                label="المسافة"
                value={formatDistance(item.pharmacy.distanceMeters)}
              />
              <Info
                label="التقييم"
                value={`${Number(item.pharmacy.averageRating || 0).toLocaleString("ar-SY", { maximumFractionDigits: 1 })} ★`}
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <strong className="block truncate text-sm text-[#29464d]">
                  {item.pharmacy.pharmacyName}
                </strong>
                <span className="text-xs text-[#71858a]">
                  {item.pharmacy.statusText}
                </span>
              </div>
              <Link
                to={`/app/pharmacies/${item.pharmacy.pharmacyId}?medicine=${item.medicineId}`}
                className="btn-secondary shrink-0"
              >
                عرض وطلب الدواء
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PharmaciesResults({ query }) {
  if (query.isPending)
    return <UserLoadingState label="نحدد الصيدليات الأقرب..." />;
  if (query.isError)
    return (
      <UserErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  if (!query.data?.length)
    return (
      <UserEmptyState
        title="لا توجد صيدليات مسجلة ضمن النطاق"
        description="حدّث موقعك أو وسّع مسافة البحث لعرض خيارات أكثر."
      />
    );
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {query.data.map((pharmacy) => (
        <PharmacyCard key={pharmacy.pharmacyId} pharmacy={pharmacy} />
      ))}
    </section>
  );
}

function SelectControl({ icon: Icon, children, ...props }) {
  return (
    <div className="field-control">
      <select {...props} className="form-input has-field-icon appearance-none">
        <option disabled value="">
          اختر
        </option>
        {children}
      </select>
      <span className="field-icon-shell">
        <Icon size={17} />
      </span>
    </div>
  );
}
function Info({ label, value }) {
  return (
    <div>
      <span className="block text-[11px] text-[#8a9a9e]">{label}</span>
      <strong className="mt-1 block text-sm text-[#29464d]">{value}</strong>
    </div>
  );
}
