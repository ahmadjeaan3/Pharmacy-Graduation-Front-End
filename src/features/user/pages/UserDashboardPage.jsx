import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowLeft,
  Clock3,
  HeartPulse,
  LocateFixed,
  MapPinned,
  PackageCheck,
  Search,
  Sparkles,
} from "lucide-react";
import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  getNearestPharmacyRoute,
  getUserDashboard,
  userKeys,
} from "../api/userApi";
import { LocationAction } from "../components/LocationAction";
import { PharmacyCard } from "../components/PharmacyCard";
import { RequestCard } from "../components/RequestCard";
import {
  ErrorState as UserErrorState,
  LoadingState as UserLoadingState,
} from "../../../shared/components/AsyncStates";
import { getApiErrorMessage } from "../../../shared/api/errors";
import { searchTypeLabels } from "../utils/userFormatters";

const NearbyPharmaciesMap = lazy(() =>
  import("../components/NearbyPharmaciesMap").then((module) => ({
    default: module.NearbyPharmaciesMap,
  })),
);

export function UserDashboardPage() {
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
      radiusInMeters: locationContext?.radiusInMeters,
    }),
    queryFn: () =>
      getNearestPharmacyRoute({
        radiusInMeters: locationContext.radiusInMeters,
      }),
    enabled: Boolean(locationContext?.mapMarkers?.length),
  });
  if (query.isPending)
    return <UserLoadingState label="نجهز مساحتك الشخصية..." />;
  if (query.isError)
    return (
      <UserErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  const data = query.data;
  const pharmacies = data.locationContext?.registeredNearbyPharmacies ?? [];
  const stats = [
    {
      label: "طلبات نشطة",
      value: data.activeRequestsCount,
      icon: Activity,
      tone: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "قيد المراجعة",
      value: data.pendingRequestsCount,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "طلبات مكتملة",
      value: data.completedRequestsCount,
      icon: PackageCheck,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "صيدليات مفتوحة قربك",
      value: data.openNearbyPharmaciesCount,
      icon: MapPinned,
      tone: "bg-violet-50 text-violet-700",
    },
  ];
  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-[1.8rem] bg-[#174b57] px-6 py-8 text-white shadow-[0_22px_55px_rgba(23,75,87,.16)] lg:px-9">
        <div className="noise absolute inset-0 -z-10" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#8bd0cb]">
              <Sparkles size={16} />
              مساحتك الصحية
            </p>
            <h2 className="mt-2 text-3xl font-black">
              أهلاً {data.profile.fullName?.split(" ")[0]}
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/60">
              ابحث عن دوائك، تابع طلباتك واحتفظ بمعلوماتك الصحية المهمة في مكان
              واحد.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/app/search"
                className="inline-flex items-center gap-2 rounded-xl bg-[#f5cb72] px-5 py-3 text-sm font-black text-[#173d46]"
              >
                <Search size={17} />
                ابحث عن دواء
              </Link>
              <Link
                to="/app/health"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.07] px-5 py-3 text-sm font-bold"
              >
                <HeartPulse size={17} />
                ملفي الصحي
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4 lg:w-72">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#f5cb72]">
                <LocateFixed size={19} />
              </span>
              <div>
                <strong className="block text-sm">
                  {data.profile.hasSavedLocation ? "موقعك محفوظ" : "أضف موقعك"}
                </strong>
                <small className="text-white/45">
                  لعرض النتائج الأقرب إليك
                </small>
              </div>
            </div>
            <div className="mt-4">
              <LocationAction />
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="rounded-[1.35rem] border border-[#174b57]/8 bg-white p-5"
          >
            <span
              className={`grid size-11 place-items-center rounded-xl ${tone}`}
            >
              <Icon size={20} />
            </span>
            <strong className="mt-5 block text-3xl font-black text-[#17363e]">
              {Number(value).toLocaleString("ar-SY")}
            </strong>
            <span className="mt-1 block text-sm text-[#71858a]">{label}</span>
          </div>
        ))}
      </section>
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-[#17363e]">
              الخريطة القريبة
            </h3>
            <p className="mt-1 text-sm text-[#71858a]">
              موقعك وأقرب ثلاث صيدليات والطريق إلى الخيار الأقرب
            </p>
          </div>
          {locationContext && (
            <span className="text-xs font-semibold text-[#60777c]">
              نطاق البحث:{" "}
              {(locationContext.radiusInMeters / 1000).toLocaleString("ar-SY")}{" "}
              كم
            </span>
          )}
        </div>
        {locationContext?.mapMarkers?.length ? (
          <Suspense
            fallback={<UserLoadingState label="جاري تجهيز الخريطة..." />}
          >
            <NearbyPharmaciesMap
              locationContext={locationContext}
              route={routeQuery.data}
            />
          </Suspense>
        ) : (
          <div className="grid min-h-72 place-items-center rounded-[1.5rem] border border-dashed border-[#174b57]/15 bg-white p-8 text-center">
            <div>
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
                <MapPinned size={25} />
              </span>
              <h3 className="mt-4 font-extrabold text-[#29464d]">
                حدد موقعك لعرض الخريطة
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#71858a]">
                سنستخدم موقعك لعرض أقرب الصيدليات وترتيبها حسب المسافة.
              </p>
              <div className="mt-5 flex justify-center">
                <LocationAction />
              </div>
            </div>
          </div>
        )}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-xl font-black text-[#17363e]">أحدث طلباتك</h3>
              <p className="mt-1 text-sm text-[#71858a]">
                آخر المستجدات على طلبات الأدوية
              </p>
            </div>
            <Link
              to="/app/requests"
              className="flex items-center gap-1 text-sm font-bold text-[#216474]"
            >
              عرض الكل <ArrowLeft size={15} />
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentRequests.length ? (
              data.recentRequests.map((request) => (
                <RequestCard key={request.requestId} request={request} />
              ))
            ) : (
              <div className="rounded-[1.35rem] border border-dashed border-[#174b57]/15 bg-white p-7 text-center text-sm text-[#71858a]">
                لا توجد طلبات بعد. ابدأ بالبحث عن دوائك.
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-black text-[#17363e]">نشاطك الأخير</h3>
            <p className="mt-1 text-sm text-[#71858a]">عمليات البحث الحديثة</p>
          </div>
          <div className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5">
            {data.recentSearches.length ? (
              <div className="space-y-3">
                {data.recentSearches.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl bg-[#f8fbfa] p-3"
                  >
                    <span className="grid size-9 place-items-center rounded-lg bg-white text-[#216474]">
                      <Search size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="block truncate text-sm text-[#29464d]">
                        {item.query ||
                          searchTypeLabels[item.searchType] ||
                          "بحث"}
                      </strong>
                      <small className="text-[#8a9a9e]">
                        {searchTypeLabels[item.searchType] || "نشاط بحث"}
                      </small>
                    </div>
                    <span className="text-xs font-bold text-[#60777c]">
                      {item.resultCount.toLocaleString("ar-SY")} نتيجة
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[#71858a]">
                لم تبدأ البحث بعد.
              </p>
            )}
            <Link
              to="/app/history"
              className="mt-4 flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-sm font-bold text-[#216474]"
            >
              عرض سجل البحث <ArrowLeft size={15} />
            </Link>
          </div>
        </div>
      </section>
      {pharmacies.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-xl font-black text-[#17363e]">
                صيدليات قريبة منك
              </h3>
              <p className="mt-1 text-sm text-[#71858a]">
                خيارات مسجلة ومتاحة بالقرب من موقعك
              </p>
            </div>
            <Link
              to="/app/search?view=pharmacies"
              className="text-sm font-bold text-[#216474]"
            >
              استكشف المزيد
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pharmacies.map((pharmacy) => (
              <PharmacyCard key={pharmacy.pharmacyId} pharmacy={pharmacy} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
