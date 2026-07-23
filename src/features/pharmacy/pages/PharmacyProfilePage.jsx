import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Building2,
  Check,
  Crosshair,
  ExternalLink,
  Keyboard,
  LoaderCircle,
  MapPin,
  Navigation,
  Phone,
  Save,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";
import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  getLocationCandidates,
  getMyPharmacy,
  linkPharmacyLocation,
  pharmacyKeys,
  updatePharmacyLocation,
  updatePharmacyProfile,
} from "../api/pharmacyApi";
import { PharmacyPageHeader } from "../components/PharmacyPageHeader";
import {
  PharmacyErrorState,
  PharmacyLoadingState,
} from "../components/PharmacyStates";

const initialForm = {
  pharmacyName: "",
  description: "",
  city: "",
  area: "",
  address: "",
  timeZoneId: "Asia/Riyadh",
  hasDeliveryService: false,
};

export function PharmacyProfilePage() {
  const client = useQueryClient();
  const [formDraft, setFormDraft] = useState(null);
  const [coords, setCoords] = useState(null);
  const [message, setMessage] = useState(null);
  const [finding, setFinding] = useState(false);
  const profile = useQuery({
    queryKey: pharmacyKeys.profile,
    queryFn: getMyPharmacy,
  });
  const serverForm = profile.data
    ? {
        pharmacyName: profile.data.pharmacyName || "",
        description: profile.data.description || "",
        city: profile.data.city || "",
        area: profile.data.area || "",
        address: profile.data.address || "",
        timeZoneId: profile.data.timeZoneId || "Asia/Riyadh",
        hasDeliveryService: Boolean(profile.data.hasDeliveryService),
      }
    : initialForm;
  const form = formDraft ?? serverForm;
  const setForm = (updater) =>
    setFormDraft((current) => updater(current ?? form));
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: pharmacyKeys.profile }),
      client.invalidateQueries({ queryKey: pharmacyKeys.dashboard }),
    ]);
  };
  const saveProfile = useMutation({
    mutationFn: updatePharmacyProfile,
    onSuccess: async () => {
      setFormDraft(null);
      setMessage({ ok: true, text: "تم حفظ بيانات الصيدلية بنجاح." });
      await refresh();
    },
    onError: (error) =>
      setMessage({ ok: false, text: getApiErrorMessage(error) }),
  });
  const saveLocation = useMutation({
    mutationFn: updatePharmacyLocation,
    onSuccess: async (_, variables) => {
      setMessage({
        ok: true,
        text: variables.tryVerifyWithGoogle
          ? "تم حفظ موقع الجهاز، ويمكنك الآن مراجعة نتيجة المطابقة أدناه."
          : "تم حفظ الإحداثيات اليدوية بنجاح، ويمكنك مطابقة الصيدلية مع الموقع الصحيح أدناه.",
      });
      await refresh();
    },
    onError: (error) =>
      setMessage({ ok: false, text: getApiErrorMessage(error) }),
  });
  const candidates = useQuery({
    queryKey: pharmacyKeys.candidates(coords || {}),
    queryFn: () =>
      getLocationCandidates(
        coords
          ? {
              latitude: coords.latitude,
              longitude: coords.longitude,
              radiusInMeters: 500,
              take: 5,
            }
          : {},
      ),
    enabled: Boolean(coords || profile.data?.hasLocation),
    retry: false,
  });
  const linkLocation = useMutation({
    mutationFn: linkPharmacyLocation,
    onSuccess: async () => {
      setMessage({ ok: true, text: "تم ربط الصيدلية بالموقع المعتمد بنجاح." });
      await refresh();
      await client.invalidateQueries({
        queryKey: ["pharmacy", "location-candidates"],
      });
    },
    onError: (error) =>
      setMessage({ ok: false, text: getApiErrorMessage(error) }),
  });
  const locate = () => {
    if (!navigator.geolocation)
      return setMessage({
        ok: false,
        text: "تحديد الموقع غير مدعوم في هذا المتصفح.",
      });
    setFinding(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        const value = {
          latitude: c.latitude,
          longitude: c.longitude,
          accuracyMeters: c.accuracy,
        };
        setCoords(value);
        setFinding(false);
        saveLocation.mutate({
          ...value,
          city: form.city || null,
          area: form.area || null,
          address: form.address || null,
          timeZoneId: form.timeZoneId || "Asia/Riyadh",
          tryVerifyWithGoogle: true,
          overwriteNameFromGoogle: false,
          overwriteAddressFromGoogle: false,
        });
      },
      () => {
        setFinding(false);
        setMessage({
          ok: false,
          text: "لم نتمكن من قراءة موقعك. اسمح للمتصفح بالوصول إلى الموقع ثم أعد المحاولة.",
        });
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };
  const saveManualLocation = ({ latitude, longitude }) => {
    const value = { latitude, longitude, accuracyMeters: null };
    setCoords(value);
    setMessage(null);
    saveLocation.mutate({
      ...value,
      city: form.city || null,
      area: form.area || null,
      address: form.address || null,
      timeZoneId: form.timeZoneId || "Asia/Riyadh",
      tryVerifyWithGoogle: false,
      overwriteNameFromGoogle: false,
      overwriteAddressFromGoogle: false,
    });
  };
  if (profile.isLoading) return <PharmacyLoadingState />;
  if (profile.isError)
    return (
      <PharmacyErrorState
        message={getApiErrorMessage(profile.error)}
        onRetry={profile.refetch}
      />
    );
  const data = profile.data;
  const change = (key) => (event) =>
    setForm((old) => ({
      ...old,
      [key]:
        event.target.type === "checkbox"
          ? event.target.checked
          : event.target.value,
    }));
  return (
    <div>
      <PharmacyPageHeader
        eyebrow="هوية الصيدلية"
        title="الملف والموقع"
        description="حافظ على بيانات الصيدلية وموقعها محدثين كي يصل المرضى إليك بسهولة وتظهر ساعات الخدمة بصورة صحيحة."
      />
      {message && (
        <div
          className={`mb-5 rounded-2xl border p-4 text-sm font-bold ${message.ok ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}
        >
          {message.text}
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <form
          className="surface p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setMessage(null);
            saveProfile.mutate(form);
          }}
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#eaf4f3] text-[#216474]">
              <Building2 size={21} />
            </span>
            <div>
              <h3 className="font-black">بيانات التعريف</h3>
              <p className="mt-1 text-xs text-[#829499]">
                تظهر هذه المعلومات للمرضى عند فتح صفحة الصيدلية
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label>
              <span className="form-label">اسم الصيدلية</span>
              <input
                className="form-input"
                value={form.pharmacyName}
                onChange={change("pharmacyName")}
                required
                maxLength={200}
              />
            </label>
            <label>
              <span className="form-label">المدينة</span>
              <input
                className="form-input"
                value={form.city}
                onChange={change("city")}
                required
                maxLength={100}
              />
            </label>
            <label>
              <span className="form-label">المنطقة أو الحي</span>
              <input
                className="form-input"
                value={form.area}
                onChange={change("area")}
                required
                maxLength={100}
              />
            </label>
            <label>
              <span className="form-label">المنطقة الزمنية</span>
              <select
                className="form-input"
                value={form.timeZoneId}
                onChange={change("timeZoneId")}
              >
                <option value="Asia/Riyadh">توقيت الرياض</option>
                <option value="Asia/Damascus">توقيت دمشق</option>
                <option value="Asia/Baghdad">توقيت بغداد</option>
              </select>
            </label>
            <label className="md:col-span-2">
              <span className="form-label">العنوان التفصيلي</span>
              <input
                className="form-input"
                value={form.address}
                onChange={change("address")}
                required
                maxLength={300}
              />
            </label>
            <label className="md:col-span-2">
              <span className="form-label">نبذة عن الصيدلية</span>
              <textarea
                className="form-textarea min-h-28"
                value={form.description}
                onChange={change("description")}
                maxLength={1000}
                placeholder="الخدمات والتخصصات التي تميز الصيدلية"
              />
            </label>
          </div>
          <label className="mt-5 flex cursor-pointer items-center justify-between rounded-2xl border border-[#174b57]/10 bg-[#f8fbfa] p-4">
            <div>
              <span className="text-sm font-extrabold">خدمة توصيل الأدوية</span>
              <p className="mt-1 text-xs text-[#829499]">
                فعّلها فقط إذا كانت الخدمة متاحة فعليًا
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.hasDeliveryService}
              onChange={change("hasDeliveryService")}
              className="size-5 accent-[#216474]"
            />
          </label>
          <button disabled={saveProfile.isPending} className="btn-primary mt-6">
            <Save size={17} />
            {saveProfile.isPending ? "جاري الحفظ..." : "حفظ البيانات"}
          </button>
        </form>
        <div className="space-y-6">
          <section className="surface overflow-hidden">
            <div className="relative bg-[#123f49] p-6 text-white">
              <div className="absolute left-4 top-4 text-[#f5cb72]/20">
                <Navigation size={90} />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-white/10">
                    <MapPin size={21} />
                  </span>
                  {data.isLocationVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-bold text-emerald-200">
                      <ShieldCheck size={14} />
                      موقع مطابق
                    </span>
                  )}
                </div>
                <h3 className="mt-5 text-xl font-black">موقع الصيدلية</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  {data.hasLocation
                    ? data.address
                    : "لم يحدد موقع الصيدلية بعد"}
                </p>
                {data.hasLocation && (
                  <p className="mt-3 text-xs text-white/40" dir="ltr">
                    {Number(data.latitude).toFixed(6)},{" "}
                    {Number(data.longitude).toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <h4 className="font-extrabold text-[#173f48]">
                  اختر طريقة تحديد الموقع
                </h4>
                <p className="mt-1 text-xs leading-5 text-[#829499]">
                  استخدم موقع الجهاز أو أدخل الإحداثيات بنفسك
                </p>
              </div>
              <div className="rounded-2xl border border-[#174b57]/10 bg-[#f8fbfa] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-[#e7f2f0] text-[#216474]">
                    <Crosshair size={17} />
                  </span>
                  <div>
                    <h5 className="text-sm font-extrabold">الموقع الحالي</h5>
                    <p className="mt-0.5 text-[11px] text-[#829499]">
                      يتطلب السماح للمتصفح بمعرفة موقع الجهاز
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={locate}
                  disabled={finding || saveLocation.isPending}
                  className="btn-primary w-full justify-center"
                >
                  <Crosshair size={17} />
                  {finding ? "جاري تحديد الموقع..." : "استخدام موقعي الحالي"}
                </button>
              </div>
              <div className="my-3 flex items-center gap-3 text-[11px] font-bold text-[#9aabad]">
                <span className="h-px flex-1 bg-[#174b57]/10" />
                <span>أو</span>
                <span className="h-px flex-1 bg-[#174b57]/10" />
              </div>
              <ManualLocationForm
                currentLatitude={data.latitude}
                currentLongitude={data.longitude}
                pending={saveLocation.isPending}
                onSave={saveManualLocation}
              />
              {data.locationGoogleMapsUrl && (
                <a
                  href={data.locationGoogleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-quiet mt-3 w-full justify-center"
                >
                  فتح الموقع على الخريطة <ExternalLink size={15} />
                </a>
              )}
            </div>
          </section>
          <section className="surface p-5">
            <h3 className="font-black">بيانات ثابتة</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <BadgeCheck className="text-[#216474]" size={17} />
                <span className="text-[#829499]">رقم الترخيص</span>
                <strong className="mr-auto" dir="ltr">
                  {data.licenseNumber}
                </strong>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-[#216474]" size={17} />
                <span className="text-[#829499]">الهاتف</span>
                <strong className="mr-auto" dir="ltr">
                  {data.phoneNumber || "غير مسجل"}
                </strong>
              </div>
            </div>
          </section>
        </div>
      </div>
      <section className="surface mt-6 p-6">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <h3 className="text-lg font-black">مطابقة الموقع</h3>
            <p className="mt-1 text-xs text-[#829499]">
              اختر النتيجة التي تمثل صيدليتك بدقة لتثبيت الاسم والعنوان على
              الخريطة
            </p>
          </div>
          {candidates.isFetching && (
            <LoaderCircle className="animate-spin text-[#216474]" />
          )}
        </div>
        {candidates.isError ? (
          <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
            {getApiErrorMessage(candidates.error)}
          </p>
        ) : (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {(candidates.data || []).map((item) => (
              <article
                key={item.placeId}
                className={`rounded-2xl border p-4 ${item.isBestMatch ? "border-[#216474]/30 bg-[#f2f8f7]" : "border-[#174b57]/9"}`}
              >
                <div className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#216474] shadow-sm">
                    <MapPin size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold">{item.name}</h4>
                      {item.isBestMatch && (
                        <span className="rounded-full bg-[#216474] px-2 py-1 text-[10px] font-bold text-white">
                          الأقرب للموقع
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#71858a]">
                      {item.address}
                    </p>
                    <p className="mt-2 flex items-center gap-3 text-xs text-[#829499]">
                      <span>{Math.round(item.distanceMeters)} م</span>
                      <span className="flex items-center gap-1">
                        <Star
                          size={12}
                          className="fill-amber-400 text-amber-400"
                        />
                        {item.rating || "—"}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  disabled={
                    linkLocation.isPending ||
                    data.externalPlaceId === item.placeId
                  }
                  onClick={() =>
                    linkLocation.mutate({
                      placeId: item.placeId,
                      overwriteName: false,
                      overwriteAddress: true,
                    })
                  }
                  className="btn-secondary mt-4 w-full justify-center"
                >
                  {data.externalPlaceId === item.placeId ? (
                    <>
                      <Check size={16} />
                      الموقع مرتبط
                    </>
                  ) : (
                    "اعتماد هذا الموقع"
                  )}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ManualLocationForm({
  currentLatitude,
  currentLongitude,
  pending,
  onSave,
}) {
  const [values, setValues] = useState({
    latitude: currentLatitude ?? "",
    longitude: currentLongitude ?? "",
  });
  const [validationError, setValidationError] = useState("");
  const change = (key) => (event) => {
    setValues((old) => ({ ...old, [key]: event.target.value }));
    setValidationError("");
  };
  const submit = (event) => {
    event.preventDefault();
    if (values.latitude === "" || values.longitude === "")
      return setValidationError("أدخل خط العرض وخط الطول قبل الحفظ.");
    const latitude = Number(values.latitude);
    const longitude = Number(values.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)
      return setValidationError("يجب أن يكون خط العرض رقمًا بين ‎-90 و90.");
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)
      return setValidationError("يجب أن يكون خط الطول رقمًا بين ‎-180 و180.");
    onSave({ latitude, longitude });
  };
  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-[#174b57]/10 p-4"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-[#fff6e4] text-[#a97416]">
          <Keyboard size={17} />
        </span>
        <div>
          <h5 className="text-sm font-extrabold">إدخال الإحداثيات يدويًا</h5>
          <p className="mt-0.5 text-[11px] text-[#829499]">
            انسخ القيم الدقيقة من تطبيق الخرائط
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className="form-label">خط العرض</span>
          <input
            className="form-input"
            dir="ltr"
            inputMode="decimal"
            type="number"
            step="any"
            min="-90"
            max="90"
            value={values.latitude}
            onChange={change("latitude")}
            placeholder="24.713552"
            aria-describedby={
              validationError ? "manual-location-error" : undefined
            }
          />
        </label>
        <label>
          <span className="form-label">خط الطول</span>
          <input
            className="form-input"
            dir="ltr"
            inputMode="decimal"
            type="number"
            step="any"
            min="-180"
            max="180"
            value={values.longitude}
            onChange={change("longitude")}
            placeholder="46.675296"
            aria-describedby={
              validationError ? "manual-location-error" : undefined
            }
          />
        </label>
      </div>
      {validationError && (
        <p
          id="manual-location-error"
          className="mt-3 text-xs font-bold text-rose-600"
        >
          {validationError}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-secondary mt-4 w-full justify-center"
      >
        <Save size={16} />
        {pending ? "جاري الحفظ..." : "حفظ الإحداثيات"}
      </button>
    </form>
  );
}
