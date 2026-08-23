import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock3,
  FileText,
  PackageCheck,
  QrCode,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  getPharmacyPrescriptionOrders,
  prescriptionKeys,
  updatePrescriptionStatus,
} from "../api/prescriptionsApi";

const PHARMACY_HERO_IMAGE = "/assets/app/pharmacy.png";

const statusLabels = {
  Reserved: "محجوزة",
  ReadyForPickup: "جاهزة للاستلام",
  Collected: "تم الاستلام",
};

const statusStyles = {
  Reserved: "bg-violet-50 text-violet-700",
  ReadyForPickup: "bg-amber-50 text-amber-700",
  Collected: "bg-emerald-50 text-emerald-700",
};

export function PharmacyPrescriptionOrdersPage() {
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

  const [codes, setCodes] = useState({});

  const orders = useQuery({
    queryKey: prescriptionKeys.pharmacy,
    queryFn: getPharmacyPrescriptionOrders,
    refetchInterval: 3000,
  });

  const update = useMutation({
    mutationFn: ({ id, ...payload }) =>
      updatePrescriptionStatus(id, payload),

    onSuccess: () =>
      client.invalidateQueries({
        queryKey: prescriptionKeys.pharmacy,
      }),
  });

  const orderItems = orders.data || [];

  const reservedCount = orderItems.filter(
    (order) => order.status === "Reserved",
  ).length;

  const readyCount = orderItems.filter(
    (order) => order.status === "ReadyForPickup",
  ).length;

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="space-y-5"
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="
          relative isolate
          min-h-[220px]
          overflow-hidden
          rounded-[14px]
          text-white
          shadow-[0_22px_55px_rgba(23,75,87,.16)]
          sm:min-h-[230px]
          lg:min-h-[250px]
        "
      >
        {/* Hero image */}

        <img
          src={PHARMACY_HERO_IMAGE}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`
            absolute inset-0
            h-full w-full
            object-cover
            object-[center_38%]
            ${
              isArabic
                ? "scale-x-[-1]"
                : ""
            }
          `}
        />

        {/* Same overlay as Pharmacy Working Hours */}

        <div
          className="absolute inset-0"
          style={{
            background: isArabic
              ? "linear-gradient(270deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)"
              : "linear-gradient(90deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)",
          }}
        />

        {/* Decorative circle */}

        <div
          aria-hidden="true"
          className="
            absolute
            -top-20
            -left-14
            size-64
            rounded-full
            border-[40px]
            border-white/[.04]
          "
        />

        {/* Content */}

        <div
          className="
            relative z-10
            flex min-h-[188px]
            items-center
            justify-between
            gap-6
            px-6
            py-7
            mt-10
            lg:px-10
          "
        >
          {/* Title */}

          <div
            className={`
              flex
              min-w-0
              items-center
              gap-5
              ${
                isArabic
                  ? "text-right"
                  : "text-left"
              }
            `}
          >
            <span
              className="
                grid
                size-12
                shrink-0
                place-items-center
                rounded-lg
                bg-[rgba(230,243,246,.10)]
                text-[#E6F3F6]
                backdrop-blur-sm
              "
            >
              <FileText
                size={28}
                strokeWidth={1.7}
              />
            </span>

            <div className="min-w-0">
              <span className="text-[12px] font-medium text-[#BFDADD]">
                {t("إدارة الوصفات")}
              </span>

              <h1
                className="
                  mt-1.5
                  text-[28px]
                  font-medium
                  leading-[1.2]
                  text-white
                  sm:text-[30px]
                "
              >
                {t("تجهيز واستلام الوصفات")}
              </h1>

              <p
                className="
                  mt-3
                  max-w-[560px]
                  text-[14px]
                  leading-7
                  text-[#D6D6D6]
                "
              >
                {t(
                  "تابع الوصفات المحجوزة، جهّز الأدوية، ثم أكد الاستلام باستخدام رمز التحقق."
                )}
              </p>
            </div>
          </div>

         
        </div>
      </section>

      {/* =====================================================
          MOBILE / SUMMARY
      ===================================================== */}

      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={FileText}
          label={t("إجمالي الوصفات")}
          value={orderItems.length}
        />

        <SummaryCard
          icon={Clock3}
          label={t("بانتظار التجهيز")}
          value={reservedCount}
        />

        <SummaryCard
          icon={PackageCheck}
          label={t("جاهزة للاستلام")}
          value={readyCount}
        />
      </section>

      {/* =====================================================
          AUTO REFRESH INFO
      ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          rounded-xl
          border
          border-[#DCE8EA]
          bg-[#F8FBFA]
          px-4
          py-3
        "
      >
        <div
          className={`
            flex
            items-center
            gap-2
            text-xs
            font-bold
            text-[#71858A]
            ${
              isArabic
                ? "text-right"
                : "text-left"
            }
          `}
        >
          <span
            className="
              grid
              size-8
              place-items-center
              rounded-lg
              bg-[#EAF4F3]
              text-[#216474]
            "
          >
            <Clock3 size={15} />
          </span>

          <span>
            {t(
              "تتحدث القائمة تلقائيًا كل 3 ثوانٍ."
            )}
          </span>
        </div>

        <span
          className="
            hidden
            rounded-full
            bg-[#EAF4F3]
            px-3
            py-1.5
            text-[10px]
            font-black
            text-[#216474]
            sm:block
          "
        >
          {t("تحديث تلقائي")}
        </span>
      </div>

      {/* =====================================================
          ORDERS
      ===================================================== */}

      <section className="space-y-4">
        {orderItems.map((order) => (
          <PrescriptionOrderCard
            key={order.id}
            order={order}
            code={codes[order.id] || ""}
            setCode={(value) =>
              setCodes((old) => ({
                ...old,
                [order.id]: value,
              }))
            }
            pending={update.isPending}
            onUpdate={(payload) =>
              update.mutate({
                id: order.id,
                ...payload,
              })
            }
            t={t}
            isArabic={isArabic}
          />
        ))}

        {!orderItems.length && (
          <div
            className="
              rounded-[14px]
              border
              border-[#DCE8EA]
              bg-white
              p-12
              text-center
              shadow-[0_10px_30px_rgba(23,75,87,.04)]
            "
          >
            <span
              className="
                mx-auto
                grid
                size-14
                place-items-center
                rounded-2xl
                bg-[#EAF4F3]
                text-[#216474]
              "
            >
              <FileText size={25} />
            </span>

            <h3 className="mt-4 text-base font-black text-[#29464D]">
              {t("لا توجد وصفات محجوزة")}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#829499]">
              {t(
                "ستظهر الوصفات هنا تلقائيًا عند قيام المستخدم بحجز وصفة من صيدليتك."
              )}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-[14px]
        border
        border-[#DCE8EA]
        bg-white
        px-4
        py-4
        shadow-[0_8px_25px_rgba(23,75,87,.04)]
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
        "
      >
        <Icon
          size={19}
          strokeWidth={1.8}
        />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] text-[#829499]">
          {label}
        </p>

        <strong className="mt-1 block text-xl font-black text-[#29464D]">
          {value}
        </strong>
      </div>
    </div>
  );
}

/* =========================================================
   PRESCRIPTION ORDER CARD
========================================================= */

function PrescriptionOrderCard({
  order,
  code,
  setCode,
  pending,
  onUpdate,
  t,
  isArabic,
}) {
  const statusLabel =
    statusLabels[order.status] ||
    order.status;

  const statusTone =
    statusStyles[order.status] ||
    "bg-slate-100 text-slate-600";

  return (
    <article
      className="
        overflow-hidden
        rounded-[14px]
        border
        border-[#DCE8EA]
        bg-white
        shadow-[0_10px_30px_rgba(23,75,87,.04)]
      "
    >
      {/* Header */}

      <div
        className="
          flex
          flex-wrap
          items-start
          justify-between
          gap-4
          border-b
          border-[#E6EEF0]
          px-5
          py-5
          sm:px-6
        "
      >
        <div
          className={
            isArabic
              ? "text-right"
              : "text-left"
          }
        >
          <div className="flex items-center gap-2">
            <span
              className="
                grid
                size-9
                shrink-0
                place-items-center
                rounded-lg
                bg-[#EAF4F3]
                text-[#216474]
              "
            >
              <FileText size={17} />
            </span>

            <strong className="max-w-[400px] truncate text-sm font-black text-[#29464D]">
              {order.originalFileName}
            </strong>
          </div>

          <p className="mt-2 text-xs text-[#829499]">
            {order.items?.length || 0}{" "}
            {t("أدوية")}
            {" — "}
            {t("نسبة المطابقة")}{" "}
            <strong className="text-[#216474]">
              {order.matchPercentage}%
            </strong>
          </p>
        </div>

        <span
          className={`
            rounded-full
            px-3
            py-1.5
            text-[11px]
            font-black
            ${statusTone}
          `}
        >
          {t(statusLabel)}
        </span>
      </div>

      {/* Medicines */}

      <div className="p-5 sm:p-6">
        <div className="grid gap-2">
          {(order.items || []).map((item) => (
            <div
              key={item.id}
              className="
                flex
                items-center
                justify-between
                gap-4
                rounded-xl
                border
                border-[#E6EEF0]
                bg-[#F8FBFA]
                px-4
                py-3
              "
            >
              <div
                className={`
                  min-w-0
                  ${
                    isArabic
                      ? "text-right"
                      : "text-left"
                  }
                `}
              >
                <p className="truncate text-sm font-black text-[#29464D]">
                  {item.matchedMedicineName ||
                    item.extractedName}
                </p>

                {item.extractedName &&
                  item.matchedMedicineName &&
                  item.extractedName !==
                    item.matchedMedicineName && (
                    <p className="mt-1 text-[11px] text-[#829499]">
                      {item.extractedName}
                    </p>
                  )}
              </div>

              <span
                dir="ltr"
                className="
                  shrink-0
                  rounded-lg
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-black
                  text-[#216474]
                  shadow-sm
                "
              >
                {item.reservedQuantity}/
                {item.requestedQuantity}
              </span>
            </div>
          ))}
        </div>

        {/* =================================================
            RESERVED
        ================================================= */}

        {order.status === "Reserved" && (
          <div
            className="
              mt-5
              border-t
              border-[#E6EEF0]
              pt-5
            "
          >
            <div
              className="
                mb-3
                flex
                items-center
                gap-2
                text-xs
                font-bold
                text-[#71858A]
              "
            >
              <Clock3 size={15} />

              <span>
                {t(
                  "بعد تجهيز جميع الأدوية اضغط على تم تجهيز الوصفة."
                )}
              </span>
            </div>

            <button
              type="button"
              className="
                inline-flex
                min-h-11
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
              "
              disabled={pending}
              onClick={() =>
                onUpdate({
                  status: "ReadyForPickup",
                })
              }
            >
              <Clock3 size={17} />

              {pending
                ? t("جاري التحديث...")
                : t("تم تجهيز الوصفة")}
            </button>
          </div>
        )}

        {/* =================================================
            READY FOR PICKUP
        ================================================= */}

        {order.status ===
          "ReadyForPickup" && (
          <div
            className="
              mt-5
              border-t
              border-[#E6EEF0]
              pt-5
            "
          >
            <div
              className="
                rounded-2xl
                border
                border-[#DCE8EA]
                bg-[#F8FBFA]
                p-4
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
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
                  "
                >
                  <QrCode size={19} />
                </span>

                <div
                  className={
                    isArabic
                      ? "text-right"
                      : "text-left"
                  }
                >
                  <p className="text-sm font-black text-[#29464D]">
                    {t("تأكيد الاستلام")}
                  </p>

                  <p className="mt-1 text-xs leading-6 text-[#829499]">
                    {t(
                      "أدخل رمز QR المكون من 8 أرقام الذي يقدمه المستخدم لتأكيد استلام الوصفة."
                    )}
                  </p>
                </div>
              </div>

              <div
                className="
                  mt-4
                  flex
                  flex-col
                  gap-2
                  sm:flex-row
                "
              >
                <label
                  className="
                    flex
                    min-h-11
                    flex-1
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-[#DCE8EA]
                    bg-white
                    px-3
                  "
                >
                  <QrCode
                    size={17}
                    className="shrink-0 text-[#216474]"
                  />

                  <input
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={8}
                    className="
                      h-10
                      min-w-0
                      flex-1
                      border-0
                      bg-transparent
                      text-center
                      text-sm
                      font-black
                      tracking-[.2em]
                      text-[#29464D]
                      outline-none
                    "
                    placeholder={t(
                      "رمز QR — 8 أرقام",
                    )}
                    value={code}
                    onChange={(event) =>
                      setCode(
                        event.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                  />
                </label>

                <button
                  type="button"
                  disabled={
                    pending ||
                    code.length !== 8
                  }
                  className="
                    inline-flex
                    min-h-11
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
                    disabled:opacity-50
                  "
                  onClick={() =>
                    onUpdate({
                      status: "Collected",
                      pickupCode: code,
                    })
                  }
                >
                  <CheckCircle2 size={17} />

                  {pending
                    ? t("جاري التأكيد...")
                    : t("تأكيد الاستلام")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            COLLECTED
        ================================================= */}

        {order.status === "Collected" && (
          <div
            className="
              mt-5
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-emerald-100
              bg-emerald-50
              p-4
              text-emerald-700
            "
          >
            <span
              className="
                grid
                size-10
                shrink-0
                place-items-center
                rounded-xl
                bg-white/70
              "
            >
              <CheckCircle2 size={20} />
            </span>

            <div>
              <strong className="block text-sm">
                {t("تم استلام الوصفة")}
              </strong>

              <p className="mt-1 text-xs opacity-75">
                {t(
                  "تم تأكيد تسليم الوصفة للمستخدم بنجاح."
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}