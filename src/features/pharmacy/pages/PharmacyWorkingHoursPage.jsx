import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, Moon, Save, SunMedium } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../shared/api/errors";
import {
  getOpenStatus,
  getWorkingHours,
  pharmacyKeys,
  updateWorkingHours,
} from "../api/pharmacyApi";
import {
  PharmacyErrorState,
  PharmacyLoadingState,
} from "../components/PharmacyStates";
import { dayNames, toTimeValue } from "../utils/pharmacyFormatters";

const PHARMACY_HERO_IMAGE = "/assets/app/pharmacy.png";

const defaults = () =>
  dayNames.map((_, dayOfWeek) => ({
    dayOfWeek,
    isClosed: dayOfWeek === 5,
    openTime: "09:00",
    closeTime: "22:00",
  }));

const mapWorkingHours = (periods) => {
  const schedule = defaults();

  (periods || []).forEach((period) => {
    schedule[period.dayOfWeek] = {
      dayOfWeek: period.dayOfWeek,
      isClosed: period.isClosed,
      openTime: toTimeValue(period.openTime) || "09:00",
      closeTime: toTimeValue(period.closeTime) || "22:00",
    };
  });

  return schedule;
};

export function PharmacyWorkingHoursPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const client = useQueryClient();
  const [daysDraft, setDaysDraft] = useState(null);
  const [notice, setNotice] = useState(null);

  const hours = useQuery({
    queryKey: pharmacyKeys.workingHours,
    queryFn: getWorkingHours,
  });

  const status = useQuery({
    queryKey: pharmacyKeys.openStatus,
    queryFn: getOpenStatus,
    refetchInterval: 60000,
  });

  const days = daysDraft ?? mapWorkingHours(hours.data);

  const save = useMutation({
    mutationFn: updateWorkingHours,
    onSuccess: async (updatedHours) => {
      setDaysDraft(mapWorkingHours(updatedHours));
      setNotice({
        ok: true,
        text: t("تم حفظ جدول ساعات العمل وتحديث حالة الصيدلية."),
      });

      await Promise.all([
        client.invalidateQueries({ queryKey: pharmacyKeys.workingHours }),
        client.invalidateQueries({ queryKey: pharmacyKeys.openStatus }),
        client.invalidateQueries({ queryKey: pharmacyKeys.dashboard }),
      ]);
    },
    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  if (hours.isLoading) {
    return <PharmacyLoadingState label={t("جاري تحميل ساعات العمل...")} />;
  }

  if (hours.isError) {
    return (
      <PharmacyErrorState
        message={getApiErrorMessage(hours.error)}
        onRetry={hours.refetch}
      />
    );
  }

  const update = (index, key, value) =>
    setDaysDraft((current) =>
      (current ?? days).map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    );

  const submit = (event) => {
    event.preventDefault();

    const periods = days.map((day) =>
      day.isClosed
        ? {
            dayOfWeek: day.dayOfWeek,
            isClosed: true,
            openTime: null,
            closeTime: null,
          }
        : {
            dayOfWeek: day.dayOfWeek,
            isClosed: false,
            openTime: `${day.openTime}:00`,
            closeTime: `${day.closeTime}:00`,
          },
    );

    save.mutate({ periods });
  };

  return (
    <div dir={direction} lang={currentLanguage} className="space-y-5">
      {/* Hero */}
      <section
        className="relative isolate min-h-[220px] overflow-hidden rounded-[14px] text-white shadow-[0_22px_55px_rgba(23,75,87,.16)]
sm:min-h-[230px]
lg:min-h-[250px]"
      >
        <img
          src={PHARMACY_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover object-[center_38%] ${isArabic ? "scale-x-[-1]" : ""}`}
        />

        <div
          className="absolute inset-0"
          style={{
            background: isArabic
              ? "linear-gradient(270deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)"
              : "linear-gradient(90deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)",
          }}
        />

        <div className="relative z-10 flex min-h-[188px] items-center justify-between gap-6 px-6 lg:px-10 mt-10">
          {/* Right title block */}
          <div
            className={`flex items-center gap-5 ${isArabic ? "text-right" : "text-left"}`}
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[rgba(230,243,246,.10)] text-[#E6F3F6] backdrop-blur-sm">
              <Clock3 size={28} strokeWidth={1.7} />
            </span>

            <div>
              <h1 className="text-[28px] font-medium leading-[1.2] text-white">
                {t("ساعات العمل")}
              </h1>

              <p className="mt-3 max-w-[560px] text-[14px] leading-7 text-[#D6D6D6]">
                {t(
                  "اضبط جدول الأسبوع بدقة؛ تستخدم المنصة هذه الأوقات لإظهار حالة الصيدلية الحالية للمستخدمين.",
                )}
              </p>
            </div>
          </div>

          {/* Left status badge */}
          <div
            className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-bold shadow-sm ${
              status.data?.isOpenNow
                ? "bg-[#FFF7DF] text-[#DFAE0D]"
                : "bg-[#F0F6F7] text-[#60777D]"
            }`}
          >
            {status.data?.isOpenNow ? (
              <SunMedium size={17} />
            ) : (
              <Moon size={17} />
            )}
            {status.data?.isOpenNow ? t("مفتوحة الآن") : t("مغلقة الآن")}
          </div>
        </div>
      </section>

      {notice && (
        <div
          className={`rounded-xl border p-4 text-sm font-bold ${
            notice.ok
              ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#216474]"
              : "border-[#FECDD3] bg-[#FFF1F2] text-[#E11D48]"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Weekly schedule */}
      <form
        onSubmit={submit}
        className="overflow-hidden rounded-[14px] border border-[#DCE8EA] bg-white shadow-[0_10px_30px_rgba(23,75,87,.04)]"
      >
        <div className="flex items-start gap-4 border-b border-[#E6EEF0] bg-white px-6 py-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
            <CalendarDays size={21} strokeWidth={1.8} />
          </span>

          <div className={isArabic ? "text-right" : "text-left"}>
            <h2 className="text-[16px] font-black text-[#29464D]">
              {t("الجدول الأسبوعي")}
            </h2>

            <p className="mt-1 text-xs leading-6 text-[#829499]">
              {t(
                "يمكنك إغلاق أي يوم من زر الحالة المقابل، وتحديد وقت إغلاق في صباح اليوم التالي للدوام الليلي.",
              )}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {days.map((day, index) => {
            const closed = day.isClosed;

            return (
              <div
                key={day.dayOfWeek}
                className="grid min-h-[82px] items-center gap-6 rounded-xl border border-[#E6EEF0] bg-white px-5 py-5 md:grid-cols-[150px_170px_minmax(0,1fr)]"
              >
                {/* Day */}
                <div className={isArabic ? "text-right" : "text-left"}>
                  <p className="text-sm font-black text-[#29464D]">
                    {t(dayNames[day.dayOfWeek])}
                  </p>

                  <p className="mt-1 text-[11px] text-[#A5A5A5]">
                    {closed
                      ? t("يوم مغلق")
                      : day.closeTime < day.openTime
                        ? t("يمتد لليوم التالي")
                        : t("يوم عمل")}
                  </p>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={!closed}
                  onClick={() => update(index, "isClosed", !closed)}
                  className="inline-flex w-fit items-center gap-3 text-xs font-black"
                >
                  <span
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${
                      closed
                        ? "border-[#DCE8EA] bg-[#E9EEF0]"
                        : "border-[#E6B90F] bg-[#DFAE0D]"
                    }`}
                  >
                    <span
                      className={`absolute top-1/2 size-5 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_7px_rgba(23,75,87,.18)] transition-all duration-200 ${
                        closed ? "right-1" : "right-6"
                      }`}
                    />
                  </span>

                  <span
                    className={`whitespace-nowrap ${
                      closed ? "text-[#829499]" : "text-[#216474]"
                    }`}
                  >
                    {closed ? t("يوم مغلق") : t("يوم عمل")}
                  </span>
                </button>

                {/* Time inputs */}
                <div
                  className={`grid grid-cols-2 gap-4 transition ${
                    closed ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <label className="flex items-center gap-2">
                    <span className="shrink-0 text-xs font-semibold text-[#60777D]">
                      {t("من")}
                    </span>

                    <input
                      type="time"
                      dir="ltr"
                      className="h-12 min-w-0 flex-1 rounded-xl border border-[#DCE8EA] bg-white px-3 text-center text-sm text-[#29464D] outline-none transition focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                      value={day.openTime}
                      onChange={(e) =>
                        update(index, "openTime", e.target.value)
                      }
                      required={!closed}
                    />
                  </label>

                  <label className="flex items-center gap-2">
                    <span className="shrink-0 text-xs font-semibold text-[#60777D]">
                      {t("إلى")}
                    </span>

                    <input
                      type="time"
                      dir="ltr"
                      className="h-12 min-w-0 flex-1 rounded-xl border border-[#DCE8EA] bg-white px-3 text-center text-sm text-[#29464D] outline-none transition focus:border-[#216474] focus:ring-2 focus:ring-[#216474]/10"
                      value={day.closeTime}
                      onChange={(e) =>
                        update(index, "closeTime", e.target.value)
                      }
                      required={!closed}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-[#E6EEF0] bg-[#FAFCFC] px-5 py-4 sm:flex-row sm:items-center">
          <p className="flex items-center gap-2 text-xs leading-6 text-[#71858A]">
            <Clock3 size={15} />
            {t(
              "إذا كان وقت الإغلاق أسبق من وقت الفتح، يُحتسب الإغلاق في اليوم التالي.",
            )}
          </p>

          <button
            disabled={save.isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#174B57] px-5 text-sm font-black text-white transition hover:bg-[#216474] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            {save.isPending ? t("جاري الحفظ...") : t("حفظ ساعات العمل")}
          </button>
        </div>
      </form>
    </div>
  );
}
