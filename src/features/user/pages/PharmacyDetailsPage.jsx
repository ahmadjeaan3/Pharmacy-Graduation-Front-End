import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  PackagePlus,
  Phone,
  Pill,
  Send,
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
  dayLabels,
} from "../utils/userFormatters";
import { getApiErrorMessage } from "../../../shared/api/errors";

const NearbyPharmaciesMap = lazy(() =>
  import("../components/NearbyPharmaciesMap").then((module) => ({
    default: module.NearbyPharmaciesMap,
  })),
);

export function PharmacyDetailsPage() {
  const { pharmacyId } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: userKeys.pharmacy(pharmacyId),
    queryFn: () => getPharmacyDetails(pharmacyId),
  });
  const [request, setRequest] = useState({
    medicineId: searchParams.get("medicine") || "",
    requestedQuantity: 1,
    note: "",
  });
  const [ratingDraft, setRatingDraft] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const routeQuery = useQuery({
    queryKey: userKeys.nearestPharmacyRoute({ pharmacyId }),
    queryFn: () => getNearestPharmacyRoute({ pharmacyId }),
    enabled: showDirections && Boolean(pharmacyId),
  });
  const requestMutation = useMutation({
    mutationFn: (payload) => createMedicineRequest(pharmacyId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.root }),
  });
  const ratingMutation = useMutation({
    mutationFn: (payload) => ratePharmacy(pharmacyId, payload),
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
    if (!routeQuery.data?.pharmacy) return null;
    return {
      latitude: routeQuery.data.originLatitude,
      longitude: routeQuery.data.originLongitude,
      mapMarkers: [routeQuery.data.pharmacy],
    };
  }, [routeQuery.data]);

  if (query.isPending)
    return <UserLoadingState label="جاري تحميل بيانات الصيدلية..." />;
  if (query.isError)
    return (
      <UserErrorState
        message={getApiErrorMessage(query.error)}
        onRetry={query.refetch}
      />
    );
  const { pharmacy, availableMedicines, workingHours } = query.data;
  const rating = ratingDraft ?? {
    score: query.data.currentUserRating || 0,
    comment: query.data.currentUserComment || "",
  };
  return (
    <div className="space-y-6">
      <Link
        to="/app/search?view=pharmacies"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#60777c]"
      >
        <ArrowRight size={16} />
        العودة إلى الصيدليات
      </Link>
      <section className="relative isolate overflow-hidden rounded-[1.8rem] bg-[#174b57] p-6 text-white shadow-[0_22px_55px_rgba(23,75,87,.15)] lg:p-8">
        <div className="noise absolute inset-0 -z-10" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${pharmacy.isOpenNow ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-white/60"}`}
              >
                <Clock3 size={13} className="me-1 inline" />
                {pharmacy.statusText}
              </span>
              {pharmacy.hasDeliveryService && (
                <span className="rounded-full bg-[#f5cb72]/15 px-3 py-1.5 text-xs font-bold text-[#f5cb72]">
                  <Bike size={13} className="me-1 inline" />
                  توصيل متاح
                </span>
              )}
            </div>
            <h2 className="mt-4 text-3xl font-black">
              {pharmacy.pharmacyName}
            </h2>
            <p className="mt-3 flex max-w-2xl items-start gap-2 leading-7 text-white/60">
              <MapPin size={18} className="mt-1 shrink-0" />
              {pharmacy.address}، {pharmacy.area}، {pharmacy.city}
            </p>
            <div className="mt-4 flex flex-wrap gap-5 text-sm">
              <span>
                <Star
                  size={17}
                  fill="currentColor"
                  className="me-1 inline text-[#f5cb72]"
                />
                {Number(pharmacy.averageRating || 0).toLocaleString("ar-SY", {
                  maximumFractionDigits: 1,
                })}{" "}
                ({pharmacy.ratingsCount.toLocaleString("ar-SY")})
              </span>
              <span>{formatDistance(pharmacy.distanceMeters)}</span>
              <span>
                {query.data.availableMedicinesCount.toLocaleString("ar-SY")}{" "}
                دواء متوفر
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {pharmacy.phoneNumber && (
              <a
                href={`tel:${pharmacy.phoneNumber}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#f5cb72] px-4 py-3 text-sm font-black text-[#173d46]"
              >
                <Phone size={17} />
                اتصال
              </a>
            )}
            {pharmacy.latitude != null && pharmacy.longitude != null && (
              <button
                type="button"
                onClick={() => {
                  if (showDirections) {
                    setShowDirections(false);
                    return;
                  }
                  setShowDirections(true);
                  window.setTimeout(
                    () =>
                      document
                        .getElementById("pharmacy-directions")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        }),
                    80,
                  );
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[.08] px-4 py-3 text-sm font-bold"
              >
                <Navigation size={17} />
                {showDirections ? "إخفاء مسار الوصول" : "الذهاب إلى الصيدلية"}
              </button>
            )}
          </div>
        </div>
      </section>
      {showDirections && (
        <section id="pharmacy-directions">
          {routeQuery.isPending && (
            <UserLoadingState label="جاري تجهيز مسار الوصول داخل المنصة..." />
          )}
          {routeQuery.isError && (
            <UserErrorState
              message={getApiErrorMessage(routeQuery.error)}
              onRetry={routeQuery.refetch}
            />
          )}
          {routeMapContext && (
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
          )}
        </section>
      )}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-black text-[#17363e]">
              الأدوية المتوفرة
            </h3>
            <p className="mt-1 text-sm text-[#71858a]">
              اختر الدواء ثم أرسل طلبك إلى الصيدلية
            </p>
          </div>
          {availableMedicines.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {availableMedicines.map((medicine) => (
                <button
                  type="button"
                  key={medicine.medicineId}
                  onClick={() => {
                    setRequest({ ...request, medicineId: medicine.medicineId });
                    document
                      .getElementById("medicine-request")
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className={`rounded-[1.25rem] border bg-white p-4 text-start transition ${request.medicineId === medicine.medicineId ? "border-[#216474] ring-4 ring-[#216474]/8" : "border-[#174b57]/8 hover:border-[#216474]/25"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
                      <Pill size={19} />
                    </span>
                    {medicine.requiresPrescription && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                        يتطلب وصفة
                      </span>
                    )}
                  </div>
                  <h4 className="mt-4 font-extrabold text-[#29464d]">
                    {medicine.medicineName}
                  </h4>
                  <p className="mt-1 text-xs text-[#71858a]">
                    {[
                      medicine.scientificName,
                      medicine.dosageForm,
                      medicine.capacity,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                  <strong className="mt-3 block text-sm text-[#216474]">
                    {formatPrice(medicine.sellingPrice)}
                  </strong>
                </button>
              ))}
            </div>
          ) : (
            <UserEmptyState
              title="لا توجد أدوية متاحة حالياً"
              description="يمكنك العودة إلى البحث لاختيار صيدلية أخرى."
            />
          )}
        </div>
        <div className="space-y-5">
          <form
            id="medicine-request"
            onSubmit={(event) => {
              event.preventDefault();
              requestMutation.mutate({
                ...request,
                requestedQuantity: Number(request.requestedQuantity),
              });
            }}
            className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[#eaf4f3] text-[#216474]">
                <PackagePlus size={20} />
              </span>
              <div>
                <h3 className="font-extrabold text-[#29464d]">
                  إرسال طلب دواء
                </h3>
                <p className="text-xs text-[#71858a]">
                  ستراجع الصيدلية طلبك وترد عليه
                </p>
              </div>
            </div>
            <label className="mt-5 block">
              <span className="form-label">الدواء</span>
              <select
                required
                value={request.medicineId}
                onChange={(event) =>
                  setRequest({ ...request, medicineId: event.target.value })
                }
                className="form-input"
              >
                <option value="">اختر الدواء</option>
                {availableMedicines.map((medicine) => (
                  <option key={medicine.medicineId} value={medicine.medicineId}>
                    {medicine.medicineName}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="form-label">الكمية المطلوبة</span>
              <input
                type="number"
                min="1"
                max="1000"
                required
                value={request.requestedQuantity}
                onChange={(event) =>
                  setRequest({
                    ...request,
                    requestedQuantity: event.target.value,
                  })
                }
                className="form-input"
              />
            </label>
            <label className="mt-4 block">
              <span className="form-label">ملاحظة للصيدلية (اختياري)</span>
              <textarea
                rows={3}
                maxLength={1000}
                value={request.note}
                onChange={(event) =>
                  setRequest({ ...request, note: event.target.value })
                }
                className="form-textarea"
                placeholder="أي تفاصيل تساعد الصيدلية على معالجة الطلب"
              />
            </label>
            {selectedMedicine?.requiresPrescription && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                هذا الدواء يتطلب وصفة طبية عند الاستلام.
              </p>
            )}
            {requestMutation.isSuccess && (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                <CheckCircle2 size={17} />
                تم إرسال الطلب برقم {requestMutation.data.requestCode}
              </p>
            )}
            {requestMutation.isError && (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {getApiErrorMessage(requestMutation.error)}
              </p>
            )}
            <button
              type="submit"
              disabled={!request.medicineId || requestMutation.isPending}
              className="btn-primary mt-5 w-full justify-center disabled:opacity-50"
            >
              <Send size={17} />
              {requestMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
            </button>
          </form>
          <RatingForm
            rating={rating}
            setRating={setRatingDraft}
            mutation={ratingMutation}
          />
        </div>
      </section>
      <section className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5">
        <h3 className="font-extrabold text-[#29464d]">ساعات العمل</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {workingHours.map((item) => {
            const dayIndex =
              typeof item.dayOfWeek === "number"
                ? item.dayOfWeek
                : [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ].indexOf(item.dayOfWeek);
            return (
              <div
                key={item.dayOfWeek}
                className="flex items-center justify-between rounded-xl bg-[#f8fbfa] px-3 py-2.5 text-sm"
              >
                <strong className="text-[#29464d]">
                  {dayLabels[dayIndex] || item.dayOfWeek}
                </strong>
                <span
                  className={
                    item.isClosed ? "text-slate-400" : "text-[#216474]"
                  }
                >
                  {item.isClosed
                    ? "مغلق"
                    : `${String(item.openTime).slice(0, 5)} - ${String(item.closeTime).slice(0, 5)}`}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function RatingForm({ rating, setRating, mutation }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate({ score: rating.score, comment: rating.comment });
      }}
      className="rounded-[1.4rem] border border-[#174b57]/8 bg-white p-5"
    >
      <h3 className="font-extrabold text-[#29464d]">قيّم تجربتك</h3>
      <p className="mt-1 text-xs text-[#71858a]">
        شارك رأيك لمساعدة مستخدمين آخرين
      </p>
      <div className="mt-4 flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            type="button"
            key={score}
            onClick={() => setRating({ ...rating, score })}
            className={
              score <= rating.score ? "text-amber-500" : "text-slate-200"
            }
            aria-label={`${score} نجوم`}
          >
            <Star size={28} fill="currentColor" />
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        maxLength={1000}
        value={rating.comment}
        onChange={(event) =>
          setRating({ ...rating, comment: event.target.value })
        }
        className="form-textarea mt-4"
        placeholder="اكتب رأيك باختصار (اختياري)"
      />
      {mutation.isSuccess && (
        <p className="mt-2 text-sm font-bold text-emerald-600">
          شكراً، تم حفظ تقييمك.
        </p>
      )}
      {mutation.isError && (
        <p className="mt-2 text-sm font-semibold text-rose-600">
          {getApiErrorMessage(mutation.error)}
        </p>
      )}
      <button
        type="submit"
        disabled={!rating.score || mutation.isPending}
        className="btn-secondary mt-4 justify-center disabled:opacity-50"
      >
        <Star size={16} />
        حفظ التقييم
      </button>
    </form>
  );
}
