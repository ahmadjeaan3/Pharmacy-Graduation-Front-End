import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Clock3,
  Moon,
  Save,
  SunMedium,
} from "lucide-react";
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

  const currentLanguage = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "ar"
  )
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
        client.invalidateQueries({
          queryKey: pharmacyKeys.workingHours,
        }),
        client.invalidateQueries({
          queryKey: pharmacyKeys.openStatus,
        }),
        client.invalidateQueries({
          queryKey: pharmacyKeys.dashboard,
        }),
      ]);
    },

    onError: (error) =>
      setNotice({
        ok: false,
        text: getApiErrorMessage(error),
      }),
  });

  if (hours.isLoading) {
    return (
      <PharmacyLoadingState
        label={t("جاري تحميل ساعات العمل...")}
      />
    );
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
    <div
      dir={direction}
      lang={currentLanguage}
      className="w-full min-w-0 space-y-5 overflow-x-hidden sm:space-y-6"
    >
      {/* =====================================================
          HERO
      ===================================================== */}

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
          shadow-[0_22px_55px_rgba(23,75,87,.16)]
          min-h-[140px]
          sm:min-h-[180px]
          lg:min-h-[250px]
        "
      >
        {/* ===================================================
            HERO IMAGE
            DESKTOP ONLY
        =================================================== */}

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

        {/* ===================================================
            OVERLAY
            DESKTOP ONLY
        =================================================== */}

        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background: isArabic
              ? "linear-gradient(270deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)"
              : "linear-gradient(90deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)",
          }}
        />

        {/* ===================================================
            DECORATIVE CIRCLE
            DESKTOP ONLY
        =================================================== */}

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

        {/* ===================================================
            CONTENT
        =================================================== */}

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
            px-5
            py-5
            sm:min-h-[180px]
            sm:px-7
            lg:min-h-[250px]
            lg:px-10
            lg:py-7
          "
        >
          {/* =================================================
              TITLE
          ================================================= */}

          <div
            className={`
              flex
              w-full
              min-w-0
              max-w-[720px]
              items-center
              gap-4
              sm:gap-5
              ${isArabic ? "ml-auto" : "mr-auto"}
            `}
          >
            <span
              className="
                grid
                size-10
                shrink-0
                place-items-center
                rounded-lg
                bg-[rgba(230,243,246,.10)]
                text-[#E6F3F6]
                backdrop-blur-sm
                sm:size-12
              "
            >
              <Clock3
                size={24}
                strokeWidth={1.7}
                className="sm:hidden"
              />

              <Clock3
                size={28}
                strokeWidth={1.7}
                className="hidden sm:block"
              />
            </span>

            <div
              className={`
                min-w-0
                flex-1
                overflow-hidden
                ${isArabic ? "text-right" : "text-left"}
              `}
            >
              <h1
                className="
                  m-0
                  break-words
                  text-[21px]
                  font-medium
                  leading-[1.25]
                  text-white
                  sm:text-[26px]
                  lg:text-[28px]
                "
              >
                {t("ساعات العمل")}
              </h1>

              <p
                className="
                  mt-2
                  max-w-full
                  break-words
                  text-[11px]
                  leading-5
                  text-[#D6D6D6]
                  sm:mt-3
                  sm:text-[13px]
                  sm:leading-6
                  lg:text-[14px]
                  lg:leading-7
                "
              >
                {t(
                  "اضبط جدول الأسبوع بدقة؛ تستخدم المنصة هذه الأوقات لإظهار حالة الصيدلية الحالية للمستخدمين.",
                )}
              </p>
            </div>
          </div>

          {/* =================================================
              STATUS
          ================================================= */}

          <div
            className="
              hidden
              lg:inline-flex
              min-h-11
              w-auto
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-full
              px-5
              py-2.5
              text-sm
              font-bold
              shadow-sm
            "
          >
            {status.data?.isOpenNow ? (
              <SunMedium size={17} />
            ) : (
              <Moon size={17} />
            )}

            {status.data?.isOpenNow
              ? t("مفتوحة الآن")
              : t("مغلقة الآن")}
          </div>
        </div>
      </section>

      {/* =====================================================
          NOTICE
      ===================================================== */}

      {notice && (
        <div
          className={`
            w-full
            rounded-xl
            border
            p-4
            text-sm
            font-bold
            ${
              notice.ok
                ? "border-[#CFE4E7] bg-[#EAF4F3] text-[#216474]"
                : "border-[#FECDD3] bg-[#FFF1F2] text-[#E11D48]"
            }
          `}
        >
          {notice.text}
        </div>
      )}

      {/* =====================================================
          WEEKLY SCHEDULE
      ===================================================== */}

      <form
        onSubmit={submit}
        className="
          w-full
          min-w-0
          overflow-hidden
          rounded-[14px]
          border
          border-[#DCE8EA]
          bg-white
          shadow-[0_10px_30px_rgba(23,75,87,.04)]
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            flex
            min-w-0
            items-start
            gap-3
            border-b
            border-[#E6EEF0]
            bg-white
            px-4
            py-4
            sm:gap-4
            sm:px-6
            sm:py-5
          "
        >
          <span
            className="
              grid
              size-10
              shrink-0
              place-items-center
              rounded-xl
              bg-[#EAF4F3]
              text-[#216474]
              sm:size-11
            "
          >
            <CalendarDays
              size={19}
              strokeWidth={1.8}
            />
          </span>

          <div
            className={`
              min-w-0
              flex-1
              ${isArabic ? "text-right" : "text-left"}
            `}
          >
            <h2
              className="
                text-[15px]
                font-black
                text-[#29464D]
                sm:text-[16px]
              "
            >
              {t("الجدول الأسبوعي")}
            </h2>

            <p
              className="
                mt-1
                text-[11px]
                leading-5
                text-[#829499]
                sm:text-xs
                sm:leading-6
              "
            >
              {t(
                "يمكنك إغلاق أي يوم من زر الحالة المقابل، وتحديد وقت إغلاق في صباح اليوم التالي للدوام الليلي.",
              )}
            </p>
          </div>
        </div>

        {/* ===================================================
            DAYS
        =================================================== */}

        <div
          className="
            min-w-0
            space-y-3
            p-3
            sm:space-y-4
            sm:p-5
          "
        >
          {days.map((day, index) => {
            const closed = day.isClosed;

            return (
              <div
                key={day.dayOfWeek}
                className="
                  grid
                  min-w-0
                  min-h-[82px]
                  items-center
                  gap-4
                  rounded-xl
                  border
                  border-[#E6EEF0]
                  bg-white
                  px-3
                  py-4
                  sm:gap-5
                  sm:px-5
                  sm:py-5
                  md:grid-cols-[150px_170px_minmax(0,1fr)]
                  lg:gap-6
                "
              >
                {/* =================================================
                    DAY
                ================================================= */}

                <div
                  className={`
                    min-w-0
                    ${isArabic ? "text-right" : "text-left"}
                  `}
                >
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

                {/* =================================================
                    TOGGLE
                ================================================= */}

                <button
                  type="button"
                  role="switch"
                  aria-checked={!closed}
                  onClick={() =>
                    update(
                      index,
                      "isClosed",
                      !closed,
                    )
                  }
                  className="
                    inline-flex
                    w-fit
                    min-w-0
                    items-center
                    gap-2
                    text-xs
                    font-black
                    sm:gap-3
                  "
                >
                  <span
                    className={`
                      relative
                      inline-flex
                      h-7
                      w-12
                      shrink-0
                      items-center
                      rounded-full
                      border
                      transition
                      ${
                        closed
                          ? "border-[#DCE8EA] bg-[#E9EEF0]"
                          : "border-[#E6B90F] bg-[#DFAE0D]"
                      }
                    `}
                  >
                    <span
                      className={`
                        absolute
                        top-1/2
                        size-5
                        -translate-y-1/2
                        rounded-full
                        bg-white
                        shadow-[0_2px_7px_rgba(23,75,87,.18)]
                        transition-all
                        duration-200
                        ${
                          closed
                            ? "right-1"
                            : "right-6"
                        }
                      `}
                    />
                  </span>

                  <span
                    className={`
                      whitespace-nowrap
                      ${
                        closed
                          ? "text-[#829499]"
                          : "text-[#216474]"
                      }
                    `}
                  >
                    {closed
                      ? t("يوم مغلق")
                      : t("يوم عمل")}
                  </span>
                </button>

                {/* =================================================
                    TIME INPUTS
                ================================================= */}

                <div
                  className={`
                    grid
                    min-w-0
                    grid-cols-1
                    gap-3
                    transition
                    sm:grid-cols-2
                    sm:gap-4
                    ${
                      closed
                        ? "pointer-events-none opacity-40"
                        : ""
                    }
                  `}
                >
                  <label
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-2
                    "
                  >
                    <span className="shrink-0 text-xs font-semibold text-[#60777D]">
                      {t("من")}
                    </span>

                    <input
                      type="time"
                      dir="ltr"
                      className="
                        h-11
                        min-w-0
                        flex-1
                        rounded-xl
                        border
                        border-[#DCE8EA]
                        bg-white
                        px-2
                        text-center
                        text-sm
                        text-[#29464D]
                        outline-none
                        transition
                        focus:border-[#216474]
                        focus:ring-2
                        focus:ring-[#216474]/10
                        sm:h-12
                        sm:px-3
                      "
                      value={day.openTime}
                      onChange={(e) =>
                        update(
                          index,
                          "openTime",
                          e.target.value,
                        )
                      }
                      required={!closed}
                    />
                  </label>

                  <label
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-2
                    "
                  >
                    <span className="shrink-0 text-xs font-semibold text-[#60777D]">
                      {t("إلى")}
                    </span>

                    <input
                      type="time"
                      dir="ltr"
                      className="
                        h-11
                        min-w-0
                        flex-1
                        rounded-xl
                        border
                        border-[#DCE8EA]
                        bg-white
                        px-2
                        text-center
                        text-sm
                        text-[#29464D]
                        outline-none
                        transition
                        focus:border-[#216474]
                        focus:ring-2
                        focus:ring-[#216474]/10
                        sm:h-12
                        sm:px-3
                      "
                      value={day.closeTime}
                      onChange={(e) =>
                        update(
                          index,
                          "closeTime",
                          e.target.value,
                        )
                      }
                      required={!closed}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
          className="
            flex
            min-w-0
            flex-col
            gap-3
            border-t
            border-[#E6EEF0]
            bg-[#FAFCFC]
            px-4
            py-4
            sm:px-5
            sm:py-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <p
            className="
              flex
              min-w-0
              items-start
              gap-2
              text-[11px]
              leading-5
              text-[#71858A]
              sm:text-xs
              sm:leading-6
            "
          >
            <Clock3
              size={15}
              className="mt-0.5 shrink-0"
            />

            <span>
              {t(
                "إذا كان وقت الإغلاق أسبق من وقت الفتح، يُحتسب الإغلاق في اليوم التالي.",
              )}
            </span>
          </p>

          <button
            type="submit"
            disabled={save.isPending}
            className="
              inline-flex
              min-h-11
              w-full
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#174B57]
              px-5
              text-sm
              font-black
              text-white
              transition
              hover:bg-[#216474]
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:w-auto
            "
          >
            <Save size={17} />

            {save.isPending
              ? t("جاري الحفظ...")
              : t("حفظ ساعات العمل")}
          </button>
        </div>
      </form>
    </div>
  );
}