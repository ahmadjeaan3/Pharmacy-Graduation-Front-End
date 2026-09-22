import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Building2,
  Crosshair,
  ExternalLink,
  Keyboard,
  MapPin,
  Navigation,
  Phone,
  Save,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../shared/api/errors";

import {
  getMyPharmacy,
  updatePharmacyLocation,
  updatePharmacyProfile,
  pharmacyKeys,
} from "../api/pharmacyApi";

import {
  PharmacyErrorState,
  PharmacyLoadingState,
} from "../components/PharmacyStates";
import { PharmacyLocationPickerMap } from "../components/PharmacyLocationPickerMap";

const PHARMACY_HERO_IMAGE = "/assets/app/pharmacy.png";

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
  const { t, i18n } = useTranslation();

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

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
      client.invalidateQueries({
        queryKey: pharmacyKeys.profile,
      }),
      client.invalidateQueries({
        queryKey: pharmacyKeys.dashboard,
      }),
    ]);
  };

  const saveProfile = useMutation({
    mutationFn: updatePharmacyProfile,

    onSuccess: async () => {
      setFormDraft(null);

      setMessage({
        ok: true,
        text: t("تم حفظ بيانات الصيدلية بنجاح."),
      });

      await refresh();
    },

    onError: (error) =>
      setMessage({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const saveLocation = useMutation({
    mutationFn: updatePharmacyLocation,

    onSuccess: async (_, variables) => {
      setMessage({
        ok: true,
        text: variables.tryVerifyWithGoogle
          ? t("تم حفظ موقع الجهاز، ويمكنك الآن مراجعة نتيجة المطابقة أدناه.")
          : t(
              "تم حفظ الإحداثيات اليدوية بنجاح، ويمكنك مطابقة الصيدلية مع الموقع الصحيح أدناه.",
            ),
      });

      await refresh();
    },

    onError: (error) =>
      setMessage({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  const locate = () => {
    if (!navigator.geolocation) {
      return setMessage({
        ok: false,
        text: t("تحديد الموقع غير مدعوم في هذا المتصفح."),
      });
    }

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
          tryVerifyWithGoogle: false,
          overwriteNameFromGoogle: false,
          overwriteAddressFromGoogle: false,
        });
      },

      () => {
        setFinding(false);

        setMessage({
          ok: false,
          text: t(
            "لم نتمكن من قراءة موقعك. اسمح للمتصفح بالوصول إلى الموقع ثم أعد المحاولة.",
          ),
        });
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
      },
    );
  };

  const saveManualLocation = ({ latitude, longitude }) => {
    const value = {
      latitude,
      longitude,
      accuracyMeters: null,
    };

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

  if (profile.isLoading) {
    return <PharmacyLoadingState />;
  }

  if (profile.isError) {
    return (
      <PharmacyErrorState
        message={getApiErrorMessage(profile.error)}
        onRetry={profile.refetch}
      />
    );
  }

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
    <div
      dir={direction}
      lang={currentLanguage}
      className="
        relative
        box-border
        block
        w-full
        min-w-0
        max-w-full
        overflow-x-hidden
        pb-6
        sm:pb-8
        lg:pb-10
      "
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative
          isolate
          block
          w-full
          min-w-0
          max-w-full
          overflow-hidden
          rounded-[14px]
          bg-[#10505A]
          text-white
          shadow-[0_18px_45px_rgba(23,75,87,.14)]
          min-h-[140px]
          sm:min-h-[180px]
          lg:min-h-[250px]
        "
      >
        {/* Background image - desktop only */}

        <img
          src={PHARMACY_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`
            pointer-events-none
            absolute
            inset-0
            hidden
            h-full
            w-full
            min-w-0
            max-w-none
            select-none
            object-cover
            object-[center_38%]
            lg:block
            ${isArabic ? "scale-x-[-1]" : ""}
          `}
        />

        {/* Overlay - desktop only */}

        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background: isArabic
              ? "linear-gradient(270deg,#10505A 0%,rgba(16,80,90,.94) 38%,rgba(33,100,116,.62) 72%,rgba(33,100,116,.18) 100%)"
              : "linear-gradient(90deg,#10505A 0%,rgba(16,80,90,.94) 38%,rgba(33,100,116,.62) 72%,rgba(33,100,116,.18) 100%)",
          }}
        />

        {/* Decorative circle - desktop only */}

        <div
          aria-hidden="true"
          className={`
            pointer-events-none
            absolute
            -top-20
            hidden
            size-64
            rounded-full
            border-[40px]
            border-white/[.04]
            lg:block
            ${isArabic ? "-left-14" : "-right-14"}
          `}
        />

        {/* Hero content */}

        <div
          className="
            relative
            z-10
            flex
            min-h-[140px]
            w-full
            min-w-0
            max-w-full
            items-center
            overflow-hidden
            px-4
            py-5
            sm:min-h-[180px]
            sm:px-7
            sm:py-6
            lg:min-h-[250px]
            lg:px-10
            lg:py-7
          "
        >
          <div
            className={`
              flex
              w-full
              min-w-0
              max-w-[650px]
              items-center
              gap-3
              sm:gap-4
              lg:gap-5
              ${isArabic ? "flex-row-reverse" : ""}
            `}
          >
            <div
              className={`
                min-w-0
                flex-1
                overflow-hidden
                ${isArabic ? "text-right" : "text-left"}
              `}
            >
              <p
                className="
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-bold
                  text-[#BFE8E7]
                  sm:text-[12px]
                "
              >
                <MapPin size={13} />

                {t("إدارة الصيدلية")}
              </p>

              <h1
                className="
                  m-0
                  mt-1
                  break-words
                  text-[21px]
                  font-medium
                  leading-[1.25]
                  text-white
                  sm:mt-1.5
                  sm:text-[26px]
                  lg:text-[28px]
                "
              >
                {t("الملف والموقع")}
              </h1>

              <p
                className="
                  mt-1.5
                  max-w-[580px]
                  break-words
                  text-[11px]
                  leading-5
                  text-[#D6D6D6]
                  sm:mt-2
                  sm:text-[13px]
                  sm:leading-6
                  lg:text-[14px]
                  lg:leading-7
                "
              >
                {t(
                  "حافظ على بيانات الصيدلية وموقعها محدثين كي يصل المرضى إليك بسهولة .",
                )}
              </p>
            </div>

            <span
              className="
                grid
                size-9
                shrink-0
                place-items-center
                rounded-xl
                bg-white/[.10]
                text-[#E6F3F6]
                backdrop-blur-sm
                sm:size-11
              "
            >
              <MapPin size={22} strokeWidth={1.7} className="sm:hidden" />

              <MapPin size={25} strokeWidth={1.7} className="hidden sm:block" />
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          MESSAGE
      ====================================================== */}

      {message && (
        <div
          className={`
            mt-4
            mb-4
            box-border
            w-full
            min-w-0
            max-w-full
            overflow-hidden
            break-words
            rounded-2xl
            border
            p-4
            text-sm
            font-bold
            ${
              message.ok
                ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#216474]"
                : "border-rose-100 bg-rose-50 text-rose-700"
            }
          `}
        >
          {message.text}
        </div>
      )}

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          mt-5
          grid
          w-full
          min-w-0
          max-w-full
          grid-cols-1
          gap-5
          md:gap-6
          xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]
        "
      >
        {/* ===================================================
            PROFILE FORM
        ==================================================== */}

        <form
          className="
            surface
            box-border
            w-full
            min-w-0
            max-w-full
            overflow-hidden
            p-4
            sm:p-5
            lg:p-6
          "
          onSubmit={(e) => {
            e.preventDefault();
            setMessage(null);
            saveProfile.mutate(form);
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="
                grid
                size-10
                shrink-0
                place-items-center
                rounded-2xl
                bg-[#eaf4f3]
                text-[#216474]
                sm:size-11
              "
            >
              <Building2 size={21} />
            </span>

            <div
              className={`
                min-w-0
                flex-1
                overflow-hidden
                ${isArabic ? "text-right" : "text-left"}
              `}
            >
              <h3 className="break-words font-black">{t("بيانات التعريف")}</h3>

              <p className="mt-1 break-words text-xs leading-5 text-[#829499]">
                {t("تظهر هذه المعلومات للمرضى عند فتح صفحة الصيدلية")}
              </p>
            </div>
          </div>

          <div
            className="
              mt-5
              grid
              w-full
              min-w-0
              max-w-full
              grid-cols-1
              gap-4
              sm:gap-5
              md:grid-cols-2
            "
          >
            <label className="block min-w-0 max-w-full">
              <span className="form-label">{t("اسم الصيدلية")}</span>

              <input
                className="
                  form-input
                  box-border
                  block
                  w-full
                  min-w-0
                  max-w-full
                "
                value={form.pharmacyName}
                onChange={change("pharmacyName")}
                required
                maxLength={200}
              />
            </label>

            <label className="block min-w-0 max-w-full">
              <span className="form-label">{t("المدينة")}</span>

              <input
                className="
                  form-input
                  box-border
                  block
                  w-full
                  min-w-0
                  max-w-full
                "
                value={form.city}
                onChange={change("city")}
                required
                maxLength={100}
              />
            </label>

            <label className="block min-w-0 max-w-full">
              <span className="form-label">{t("المنطقة أو الحي")}</span>

              <input
                className="
                  form-input
                  box-border
                  block
                  w-full
                  min-w-0
                  max-w-full
                "
                value={form.area}
                onChange={change("area")}
                required
                maxLength={100}
              />
            </label>

            <label className="block min-w-0 max-w-full">
              <span className="form-label">{t("المنطقة الزمنية")}</span>

              <select
                className="
                  form-input
                  box-border
                  block
                  w-full
                  min-w-0
                  max-w-full
                "
                value={form.timeZoneId}
                onChange={change("timeZoneId")}
              >
                <option value="Asia/Riyadh">{t("توقيت الرياض")}</option>

                <option value="Asia/Damascus">{t("توقيت دمشق")}</option>

                <option value="Asia/Baghdad">{t("توقيت بغداد")}</option>
              </select>
            </label>

            <label className="block min-w-0 max-w-full md:col-span-2">
              <span className="form-label">{t("العنوان التفصيلي")}</span>

              <input
                className="
                  form-input
                  box-border
                  block
                  w-full
                  min-w-0
                  max-w-full
                "
                value={form.address}
                onChange={change("address")}
                required
                maxLength={300}
              />
            </label>

            <label className="block min-w-0 max-w-full md:col-span-2">
              <span className="form-label">{t("نبذة عن الصيدلية")}</span>

              <textarea
                className="
                  form-textarea
                  box-border
                  block
                  min-h-28
                  w-full
                  min-w-0
                  max-w-full
                  resize-y
                "
                value={form.description}
                onChange={change("description")}
                maxLength={1000}
                placeholder={t("الخدمات والتخصصات التي تميز الصيدلية")}
              />
            </label>
          </div>

          {/* Delivery */}

          <label
            className="
              mt-5
              flex
              w-full
              min-w-0
              max-w-full
              cursor-pointer
              items-center
              justify-between
              gap-3
              overflow-hidden
              rounded-2xl
              border
              border-[#174b57]/10
              bg-[#f8fbfa]
              p-3
              sm:p-4
            "
          >
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="block break-words text-sm font-extrabold">
                {t("خدمة توصيل الأدوية")}
              </span>

              <p className="mt-1 break-words text-xs leading-5 text-[#829499]">
                {t("فعّلها فقط إذا كانت الخدمة متاحة فعليًا")}
              </p>
            </div>

            <input
              type="checkbox"
              checked={form.hasDeliveryService}
              onChange={change("hasDeliveryService")}
              className="size-5 shrink-0 accent-[#216474]"
            />
          </label>

          <button
            type="submit"
            disabled={saveProfile.isPending}
            className="
              btn-primary
              mt-5
              w-full
              max-w-full
              justify-center
              sm:mt-6
              sm:w-auto
            "
          >
            <Save size={17} />

            {saveProfile.isPending ? t("جاري الحفظ...") : t("حفظ البيانات")}
          </button>
        </form>

        {/* ===================================================
            LOCATION COLUMN
        ==================================================== */}

        <div className="w-full min-w-0 max-w-full space-y-5">
          <section
            className="
              surface
              box-border
              w-full
              min-w-0
              max-w-full
              overflow-hidden
            "
          >
            {/* Location header */}

            <div
              className="
                relative
                min-w-0
                overflow-hidden
                border-b
                border-[#DCE8EA]
                bg-[#F2F8F8]
                p-4
                sm:p-5
                lg:p-6
              "
            >
              <div
                className={`
                  pointer-events-none
                  absolute
                  top-1/2
                  -translate-y-1/2
                  text-[#174B57]/10
                  ${isArabic ? "left-1 sm:left-5" : "right-1 sm:right-5"}
                `}
              >
                <Navigation size={78} strokeWidth={1.6} />
              </div>

              <div className="relative min-w-0 max-w-full">
                <div className="flex min-w-0 max-w-full items-start gap-3">
                  <span
                    className="
                      grid
                      size-10
                      shrink-0
                      place-items-center
                      rounded-xl
                      border
                      border-[#DCE8EA]
                      bg-white
                      text-[#174B57]
                      shadow-[0_4px_12px_rgba(23,75,87,.06)]
                      sm:size-11
                    "
                  >
                    <MapPin size={21} strokeWidth={1.9} />
                  </span>

                  <div
                    className={`
                      min-w-0
                      flex-1
                      overflow-hidden
                      ${isArabic ? "text-right" : "text-left"}
                    `}
                  >
                    <h3 className="break-words text-lg font-black text-[#29464D] sm:text-xl">
                      {t("موقع الصيدلية")}
                    </h3>

                    <p className="mt-2 break-words text-sm leading-6 text-[#60777D]">
                      {data.hasLocation
                        ? data.address
                        : t("لم يحدد موقع الصيدلية بعد")}
                    </p>

                    {data.hasLocation && (
                      <p
                        className="
                          mt-3
                          max-w-full
                          break-all
                          text-xs
                          font-medium
                          text-[#829499]
                        "
                        dir="ltr"
                      >
                        {Number(data.latitude).toFixed(6)},{" "}
                        {Number(data.longitude).toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Location body */}

            <div className="box-border w-full min-w-0 max-w-full overflow-hidden p-4 sm:p-5">
              <PharmacyLocationPickerMap
                latitude={coords?.latitude ?? data.latitude}
                longitude={coords?.longitude ?? data.longitude}
                disabled={saveLocation.isPending}
                t={t}
                onChange={(value) => {
                  setCoords({
                    ...value,
                    accuracyMeters: null,
                  });
                  setMessage({
                    ok: true,
                    text: t(
                      "تم تحديد الموقع على الخريطة. راجع الإحداثيات ثم اضغط حفظ.",
                    ),
                  });
                }}
              />

              <div className="mb-4 min-w-0 max-w-full">
                <h4 className="break-words font-extrabold text-[#173f48]">
                  {t("اختر طريقة تحديد الموقع")}
                </h4>

                <p className="mt-1 break-words text-xs leading-5 text-[#829499]">
                  {t("استخدم موقع الجهاز أو أدخل الإحداثيات بنفسك")}
                </p>
              </div>

              {/* Current location */}

              <div
                className="
                  box-border
                  w-full
                  min-w-0
                  max-w-full
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#174b57]/10
                  bg-[#f8fbfa]
                  p-3
                  sm:p-4
                "
              >
                <div className="mb-3 flex min-w-0 max-w-full items-center gap-3">
                  <span
                    className="
                      grid
                      size-9
                      shrink-0
                      place-items-center
                      rounded-xl
                      bg-[#e7f2f0]
                      text-[#216474]
                    "
                  >
                    <Crosshair size={17} />
                  </span>

                  <div
                    className={`
                      min-w-0
                      flex-1
                      overflow-hidden
                      ${isArabic ? "text-right" : "text-left"}
                    `}
                  >
                    <h5 className="break-words text-sm font-extrabold">
                      {t("الموقع الحالي")}
                    </h5>

                    <p className="mt-0.5 break-words text-[11px] leading-5 text-[#829499]">
                      {t("يتطلب السماح للمتصفح بمعرفة موقع الجهاز")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={locate}
                  disabled={finding || saveLocation.isPending}
                  className="
                    btn-primary
                    w-full
                    max-w-full
                    justify-center
                  "
                >
                  <Crosshair size={17} />

                  {finding
                    ? t("جاري تحديد الموقع...")
                    : t("استخدام موقعي الحالي")}
                </button>
              </div>

              {/* OR */}

              <div
                className="
                  my-3
                  flex
                  w-full
                  min-w-0
                  items-center
                  gap-3
                  text-[11px]
                  font-bold
                  text-[#9aabad]
                "
              >
                <span className="h-px min-w-0 flex-1 bg-[#174b57]/10" />

                <span className="shrink-0">{t("أو")}</span>

                <span className="h-px min-w-0 flex-1 bg-[#174b57]/10" />
              </div>

              <ManualLocationForm
                key={`${coords?.latitude ?? data.latitude ?? ""}:${
                  coords?.longitude ?? data.longitude ?? ""
                }`}
                currentLatitude={coords?.latitude ?? data.latitude}
                currentLongitude={coords?.longitude ?? data.longitude}
                pending={saveLocation.isPending}
                onSave={saveManualLocation}
                t={t}
                direction={direction}
              />

              {data.hasLocation && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=18/${data.latitude}/${data.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    btn-quiet
                    mt-3
                    w-full
                    max-w-full
                    justify-center
                  "
                >
                  {t("فتح الموقع على الخريطة")}

                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </section>

          {/* Static data */}

          <section
            className="
              surface
              box-border
              w-full
              min-w-0
              max-w-full
              overflow-hidden
              p-4
              sm:p-5
            "
          >
            <h3 className="break-words font-black">{t("بيانات ثابتة")}</h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex min-w-0 max-w-full items-center gap-3">
                <BadgeCheck className="shrink-0 text-[#216474]" size={17} />

                <span className="min-w-0 shrink text-[#829499]">
                  {t("رقم الترخيص")}
                </span>

                <strong
                  className="
                    ms-auto
                    min-w-0
                    max-w-[55%]
                    break-all
                    text-right
                  "
                  dir="ltr"
                >
                  {data.licenseNumber}
                </strong>
              </div>

              <div className="flex min-w-0 max-w-full items-center gap-3">
                <Phone className="shrink-0 text-[#216474]" size={17} />

                <span className="min-w-0 shrink text-[#829499]">
                  {t("الهاتف")}
                </span>

                <strong
                  className="
                    ms-auto
                    min-w-0
                    max-w-[55%]
                    break-all
                    text-right
                  "
                  dir="ltr"
                >
                  {data.phoneNumber || t("غير مسجل")}
                </strong>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MANUAL LOCATION FORM
============================================================ */

function ManualLocationForm({
  currentLatitude,
  currentLongitude,
  pending,
  onSave,
  t,
  direction,
}) {
  const [values, setValues] = useState({
    latitude: currentLatitude ?? "",
    longitude: currentLongitude ?? "",
  });

  const [validationError, setValidationError] = useState("");

  const change = (key) => (event) => {
    setValues((old) => ({
      ...old,
      [key]: event.target.value,
    }));

    setValidationError("");
  };

  const submit = (event) => {
    event.preventDefault();

    if (values.latitude === "" || values.longitude === "") {
      return setValidationError(t("أدخل خط العرض وخط الطول قبل الحفظ."));
    }

    const latitude = Number(values.latitude);

    const longitude = Number(values.longitude);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return setValidationError(t("يجب أن يكون خط العرض رقمًا بين ‎-90 و90."));
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return setValidationError(
        t("يجب أن يكون خط الطول رقمًا بين ‎-180 و180."),
      );
    }

    onSave({
      latitude,
      longitude,
    });
  };

  return (
    <form
      dir={direction}
      onSubmit={submit}
      className="
        box-border
        w-full
        min-w-0
        max-w-full
        overflow-hidden
        rounded-2xl
        border
        border-[#174b57]/10
        p-3
        sm:p-4
      "
    >
      <div className="mb-4 flex min-w-0 max-w-full items-center gap-3">
        <span
          className="
            grid
            size-9
            shrink-0
            place-items-center
            rounded-xl
            bg-[#fff6e4]
            text-[#a97416]
          "
        >
          <Keyboard size={17} />
        </span>

        <div
          className={`
            min-w-0
            flex-1
            overflow-hidden
            ${direction === "rtl" ? "text-right" : "text-left"}
          `}
        >
          <h5 className="break-words text-sm font-extrabold">
            {t("إدخال الإحداثيات يدويًا")}
          </h5>

          <p className="mt-0.5 break-words text-[11px] leading-5 text-[#829499]">
            {t("انسخ القيم الدقيقة من تطبيق الخرائط")}
          </p>
        </div>
      </div>

      <div
        className="
          grid
          w-full
          min-w-0
          max-w-full
          grid-cols-1
          gap-3
          sm:grid-cols-2
        "
      >
        <label className="block min-w-0 max-w-full">
          <span className="form-label">{t("خط العرض")}</span>

          <input
            className="
              form-input
              box-border
              block
              w-full
              min-w-0
              max-w-full
            "
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

        <label className="block min-w-0 max-w-full">
          <span className="form-label">{t("خط الطول")}</span>

          <input
            className="
              form-input
              box-border
              block
              w-full
              min-w-0
              max-w-full
            "
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
          className="
            mt-3
            max-w-full
            break-words
            text-xs
            font-bold
            leading-5
            text-rose-600
          "
        >
          {validationError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="
          btn-secondary
          mt-4
          w-full
          max-w-full
          justify-center
        "
      >
        <Save size={16} />

        {pending ? t("جاري الحفظ...") : t("حفظ الإحداثيات")}
      </button>
    </form>
  );
}
