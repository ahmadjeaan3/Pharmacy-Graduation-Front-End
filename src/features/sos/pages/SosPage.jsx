import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  MapPin,
  Phone,
  Pill,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuth } from "../../auth/hooks/useAuth";

import {
  createSosAlert,
  getAdminSosAlerts,
  getMySosAlerts,
  getNearbySosAlerts,
  sosKeys,
  updateSosAlert,
} from "../api/sosApi";

/* =========================================================
   HERO IMAGES
========================================================= */

const HEALTH_HERO_BACKGROUND = "/assets/app/home/hero_search.png";

const ADMIN_HERO_BACKGROUND =
  "/assets/app/home/background_hero_admin.png";

const PHARMACY_HERO_IMAGE =
  "/assets/app/pharmacy.png";

/* =========================================================
   STATUS
========================================================= */

const statusLabels = {
  New: "جديد",
  InProgress: "قيد المتابعة",
  Resolved: "تمت المعالجة",
  Cancelled: "ملغي",
};

/* =========================================================
   MAIN PAGE
========================================================= */

export function SosPage() {
  const { user } = useAuth();

  const roles = (user?.roles || []).map((role) =>
    String(role).toLowerCase(),
  );

  if (roles.includes("admin")) {
    return <RequestsCenter admin />;
  }

  if (roles.includes("pharmacy")) {
    return <RequestsCenter />;
  }

  return <UserRequest />;
}

/* =========================================================
   USER REQUEST
========================================================= */

function UserRequest() {
  const qc = useQueryClient();

  const [medicineName, setMedicineName] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);

  const mine = useQuery({
    queryKey: sosKeys.mine,
    queryFn: getMySosAlerts,
  });

  const send = useMutation({
    mutationFn: async () =>
      createSosAlert({
        medicineName,
        message,
        shareContactAndLocation: consent,
        ...(await locate()),
      }),

    onSuccess: () => {
      setMedicineName("");
      setMessage("");
      setConsent(false);

      qc.invalidateQueries({
        queryKey: sosKeys.mine,
      });
    },
  });

  return (
    <div dir="rtl" className="space-y-5">
      {/* =====================================================
          USER HERO
      ===================================================== */}

      <section
        className="
          relative isolate
          -mt-6
          overflow-hidden
          bg-[#0D7586]
          text-white
          sm:-mt-7
          lg:-mt-8
        "
        style={{
          width: "100vw",
          marginInline: "calc(50% - 50vw)",
        }}
      >
        <img
          src={HEALTH_HERO_BACKGROUND}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="
            absolute inset-0 -z-20
            h-full w-full
            select-none
            object-cover
            object-center
            opacity-80
          "
        />

        <div
          aria-hidden="true"
          className="
            absolute inset-0 -z-10
            bg-[linear-gradient(90deg,rgba(0,60,73,.18),rgba(3,110,126,.58),rgba(0,63,76,.44))]
          "
        />

        <div
          className="
            mx-auto
            grid
            min-h-[240px]
            w-full
            max-w-[1200px]
            items-center
            gap-7
            px-5
            py-8
            sm:px-7
            lg:grid-cols-[1fr_auto]
            lg:px-8
          "
        >
          {/* Title */}

          <div className="flex min-w-0 items-center gap-4 text-right">
            <span
              className="
                grid
                size-12
                shrink-0
                place-items-center
                rounded-[10px]
                border
                border-white/15
                bg-white/10
                backdrop-blur-sm
              "
            >
              <Pill
                size={23}
                strokeWidth={1.8}
              />
            </span>

            <div className="min-w-0">
              <span className="text-[11px] font-medium text-white/75">
                خدمة المساعدة الدوائية
              </span>

              <h1
                className="
                  mt-1.5
                  text-[27px]
                  font-bold
                  leading-tight
                  sm:text-[30px]
                "
              >
                طلب مساعدة دوائية عاجلة
              </h1>

              <p
                className="
                  mt-2
                  max-w-[680px]
                  text-[12px]
                  leading-6
                  text-white/75
                "
              >
                حدد الدواء الذي تحتاجه وسنرسل طلبك إلى الصيدليات
                المعتمدة القريبة منك لمساعدتك في الحصول عليه بأسرع
                وقت ممكن.
              </p>
            </div>
          </div>

          {/* Emergency notice */}

          <div
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-[9px]
              border
              border-amber-200/20
              bg-white/10
              px-5
              py-4
              text-right
              backdrop-blur-sm
              lg:w-[360px]
            "
          >
            <AlertTriangle
              size={20}
              className="shrink-0 text-amber-200"
            />

            <p className="text-[11px] leading-6 text-white/80">
              إذا كانت الحالة تهدد الحياة فاتصل فوراً بالإسعاف أو
              رقم الطوارئ المحلي. هذه الخدمة ليست بديلاً عن الطوارئ.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          REQUEST FORM
      ===================================================== */}

      <section className="surface grid gap-4 p-5 sm:p-7">
        <div className="mb-1">
          <h2 className="text-xl font-black text-[#29464d]">
            تفاصيل الطلب
          </h2>

          <p className="mt-1 text-xs leading-6 text-[#829499]">
            أدخل اسم الدواء والمعلومات التي تساعد الصيدلية على فهم طلبك.
          </p>
        </div>

        {/* Medicine */}

        <label>
          <span className="form-label">
            اسم الدواء الضروري *
          </span>

          <input
            className="form-input"
            maxLength={200}
            value={medicineName}
            onChange={(event) =>
              setMedicineName(event.target.value)
            }
            placeholder="مثال: أنسولين سريع المفعول"
          />
        </label>

        {/* Message */}

        <label>
          <span className="form-label">
            الحالة أو ملاحظات تساعد الصيدلية
          </span>

          <textarea
            className="form-textarea min-h-28"
            maxLength={500}
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="الحالة، التركيز المطلوب، أو أي توضيح مهم..."
          />
        </label>

        {/* Consent */}

        <label
          className="
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-cyan-200
            bg-cyan-50
            p-4
            text-sm
            leading-6
            text-slate-700
          "
        >
          <input
            type="checkbox"
            className="mt-1 size-5 accent-[#176273]"
            checked={consent}
            onChange={(event) =>
              setConsent(event.target.checked)
            }
          />

          <span>
            أوافق على مشاركة اسمي ورقم هاتفي وموقعي الدقيق وبيانات
            هذا الطلب مع الصيدليات المعتمدة الموجودة ضمن 30 كم،
            ومع إدارة النظام للمتابعة.
          </span>
        </label>

        {/* Submit */}

        <button
          type="button"
          disabled={
            send.isPending ||
            !consent ||
            medicineName.trim().length < 2
          }
          onClick={() => send.mutate()}
          className="
            btn-primary
            min-h-14
            justify-center
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <ShieldAlert />

          {send.isPending
            ? "جاري تحديد الموقع والإرسال..."
            : "إرسال الطلب للصيدليات القريبة"}
        </button>

        {/* Error */}

        {send.isError && (
          <p className="text-sm font-bold text-rose-700">
            {send.error?.response?.data?.error ||
              send.error?.message ||
              "تعذر إرسال الطلب."}
          </p>
        )}
      </section>

      {/* =====================================================
          PREVIOUS REQUESTS
      ===================================================== */}

      <AlertList
        items={mine.data || []}
        mine
      />
    </div>
  );
}

/* =========================================================
   PHARMACY / ADMIN REQUESTS CENTER
========================================================= */

function RequestsCenter({ admin = false }) {
  const qc = useQueryClient();

  const [status, setStatus] = useState("");

  const queryKey = admin
    ? sosKeys.admin
    : sosKeys.nearby;

  const requests = useQuery({
    queryKey: [...queryKey, status],

    queryFn: () =>
      admin
        ? getAdminSosAlerts(status)
        : getNearbySosAlerts(status),

    refetchInterval: 15000,
  });

  const update = useMutation({
    mutationFn: ({ id, next }) =>
      updateSosAlert(id, {
        status: next,
        note: null,
      }),

    onSuccess: () =>
      qc.invalidateQueries({
        queryKey,
      }),
  });

  return (
    <div dir="rtl" className="space-y-5">
      {/* =====================================================
          HERO
      ===================================================== */}

      {admin ? (
        <AdminSosHero
          requestCount={requests.data?.length || 0}
        />
      ) : (
        <PharmacySosHero
          requestCount={requests.data?.length || 0}
        />
      )}

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section className="surface flex flex-wrap gap-2 p-4">
        {[
          ["", "الكل"],
          ["New", "جديدة"],
          ["InProgress", "قيد المتابعة"],
          ["Resolved", "معالجة"],
        ].map(([value, label]) => (
          <button
            type="button"
            key={value}
            onClick={() => setStatus(value)}
            className={
              status === value
                ? "btn-primary"
                : "btn-secondary"
            }
          >
            {label}
          </button>
        ))}
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {requests.isError && (
        <p className="surface p-5 font-bold text-rose-700">
          تعذر تحميل الطلبات.
        </p>
      )}

      {/* =====================================================
          REQUESTS
      ===================================================== */}

      <AlertList
        items={requests.data || []}
        admin={admin}
        provider={!admin}
        busy={update.isPending}
        onUpdate={(id, next) =>
          update.mutate({
            id,
            next,
          })
        }
      />
    </div>
  );
}

/* =========================================================
   ADMIN SOS HERO
========================================================= */

function AdminSosHero({ requestCount }) {
  return (
    <section
      className="
        relative isolate
        min-h-[270px]
        overflow-hidden
        rounded-[2rem]
        border
        border-[#d5e7e8]
        bg-[#8bcbd0]
        text-white
        shadow-[0_24px_60px_rgba(23,75,87,.13)]
        sm:min-h-[300px]
      "
    >
      <img
        src={ADMIN_HERO_BACKGROUND}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="
          absolute inset-0 -z-20
          h-full w-full
          select-none
          object-cover
          object-[42%_center]
          sm:object-center
        "
      />

      <div
        className="
          absolute inset-0 -z-10
          bg-[linear-gradient(90deg,rgba(255,255,255,.02)_0%,rgba(20,91,103,.12)_38%,rgba(8,73,85,.76)_72%,rgba(7,61,72,.9)_100%)]
        "
      />

      <div
        className="
          flex
          min-h-[270px]
          flex-col
          justify-center
          gap-6
          px-6
          py-8
          sm:min-h-[300px]
          sm:px-9
          lg:flex-row
          lg:items-center
          lg:justify-between
          lg:px-12
        "
      >
        <div className="max-w-[720px] text-white">
          <p className="flex items-center gap-2 text-sm font-bold text-[#b9f0ec]">
            <ShieldCheck size={17} />
            رقابة إدارية محمية
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight drop-shadow-sm sm:text-4xl lg:text-[44px]">
            مراقبة طلبات الدواء العاجلة
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
            متابعة وإدارة طلبات المساعدة الدوائية العاجلة ومراقبة
            حالة الطلبات والجهات التي تتولى معالجتها.
          </p>
        </div>

        <div
          className="
            flex
            w-fit
            min-w-[180px]
            items-center
            gap-3
            rounded-2xl
            border
            border-white/35
            bg-white/90
            px-5
            py-4
            text-[#174b57]
            shadow-xl
            backdrop-blur-md
          "
        >
          <span
            className="
              grid
              size-11
              place-items-center
              rounded-xl
              bg-[#e5f3f2]
              text-[#216474]
            "
          >
            <Database size={21} />
          </span>

          <div>
            <span className="text-xs font-bold text-[#71858a]">
              الطلبات الحالية
            </span>

            <strong className="mt-0.5 block text-2xl font-black">
              {requestCount}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PHARMACY SOS HERO
   SAME STYLE AS PharmacyWorkingHoursPage
========================================================= */

function PharmacySosHero({ requestCount }) {
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

  return (
    <section
      dir={direction}
      lang={currentLanguage}
      className="
        relative
        isolate
        min-h-[220px]
        overflow-hidden
        rounded-[14px]
        text-white
        shadow-[0_22px_55px_rgba(23,75,87,.16)]
        sm:min-h-[230px]
        lg:min-h-[250px]
      "
    >
      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <img
        src={PHARMACY_HERO_IMAGE}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`
          absolute
          inset-0
          h-full
          w-full
          select-none
          object-cover
          object-[center_38%]
          ${isArabic ? "scale-x-[-1]" : ""}
        `}
      />

      {/* ===================================================
          OVERLAY
      =================================================== */}

      <div
        className="absolute inset-0"
        style={{
          background: isArabic
            ? "linear-gradient(270deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)"
            : "linear-gradient(90deg,#10505A 0%,rgba(16,80,90,.90) 38%,rgba(33,100,116,.48) 70%,rgba(33,100,116,.08) 100%)",
        }}
      />

      {/* ===================================================
          DECORATIVE CIRCLE
      =================================================== */}

      <div
        aria-hidden="true"
        className={`
          pointer-events-none
          absolute
          -top-20
          size-64
          rounded-full
          border-[40px]
          border-white/[.04]
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
          min-h-[220px]
          flex-col
          items-center
          justify-center
          gap-7
          px-6
          py-7
          sm:min-h-[230px]
          lg:min-h-[250px]
          lg:flex-row
          lg:justify-between
          lg:px-10
        "
      >
        {/* =================================================
            TITLE
        ================================================= */}

        <div
          className={`
            flex
            min-w-0
            items-center
            gap-5
            ${isArabic ? "text-right" : "text-left"}
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
            <ShieldAlert
              size={28}
              strokeWidth={1.7}
            />
          </span>

          <div className="min-w-0">
            <p
              className="
                flex
                items-center
                gap-2
                text-[12px]
                font-bold
                text-[#BFE8E7]
              "
            >
              <Pill size={14} />

              {t("مركز طلبات المساعدة")}
            </p>

            <h1
              className="
                mt-2
                text-[28px]
                font-medium
                leading-[1.2]
                text-white
                sm:text-[30px]
              "
            >
              {t("الطلبات الدوائية العاجلة")}
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
                "تابع طلبات المساعدة الدوائية القريبة من صيدليتك وساعد المرضى في الحصول على الأدوية التي يحتاجونها.",
              )}
            </p>
          </div>
        </div>

        {/* =================================================
            REQUEST COUNT
        ================================================= */}

        <div
          className="
            flex
            min-w-[190px]
            shrink-0
            items-center
            gap-3
            rounded-[14px]
            border
            border-white/15
            bg-[rgba(2,77,82,.58)]
            px-5
            py-4
            backdrop-blur-[10px]
          "
        >
          <span
            className="
              grid
              size-11
              shrink-0
              place-items-center
              rounded-xl
              bg-[rgba(230,243,246,.10)]
              text-[#E6F3F6]
            "
          >
            <FileText
              size={22}
              strokeWidth={1.8}
            />
          </span>

          <div>
            <p className="text-xs text-[#D6D6D6]">
              {t("الطلبات الحالية")}
            </p>

            <strong
              className="
                mt-1
                block
                text-2xl
                font-black
                text-[#E6F3F6]
              "
            >
              {requestCount}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ALERT LIST
========================================================= */

function AlertList({
  items,
  admin,
  provider,
  mine,
  onUpdate,
  busy,
}) {
  const canManage = admin || provider;

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <article
          key={item.id}
          className="
            surface
            border-s-4
            border-s-[#168da0]
            p-5
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex justify-between gap-3">
            <div>
              <h3 className="text-lg font-black">
                {item.medicineName || "طلب قديم"}
              </h3>

              {canManage && (
                <p className="mt-1 text-sm font-bold text-slate-600">
                  {item.userName}
                </p>
              )}

              <p className="mt-1 text-xs text-slate-500">
                {new Date(
                  item.createdAtUtc,
                ).toLocaleString("ar-SY")}
              </p>
            </div>

            <span
              className="
                h-fit
                rounded-full
                bg-cyan-50
                px-3
                py-1
                text-xs
                font-black
                text-cyan-800
              "
            >
              {statusLabels[item.status] || item.status}
            </span>
          </div>

          {/* =================================================
              MESSAGE
          ================================================= */}

          {item.message && (
            <p className="mt-4 text-sm leading-7">
              {item.message}
            </p>
          )}

          {/* =================================================
              CONTACT / LOCATION
          ================================================= */}

          {canManage && (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.phoneNumber && (
                <a
                  href={`tel:${item.phoneNumber}`}
                  className="btn-secondary"
                >
                  <Phone size={16} />
                  اتصال بالمستخدم
                </a>
              )}

              {item.latitude != null &&
                item.longitude != null && (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                    className="btn-secondary"
                  >
                    <MapPin size={16} />
                    فتح الموقع
                  </a>
                )}
            </div>
          )}

          {/* =================================================
              START
          ================================================= */}

          {canManage &&
            item.status === "New" && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  onUpdate(
                    item.id,
                    "InProgress",
                  )
                }
                className="btn-primary mt-4"
              >
                <Clock3 size={16} />
                بدء المتابعة
              </button>
            )}

          {/* =================================================
              RESOLVE
          ================================================= */}

          {canManage &&
            item.status === "InProgress" && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  onUpdate(
                    item.id,
                    "Resolved",
                  )
                }
                className="btn-primary mt-4"
              >
                <CheckCircle2 size={16} />
                تمت المساعدة
              </button>
            )}

          {/* =================================================
              HANDLER
          ================================================= */}

          {item.handledByName && (
            <p className="mt-3 text-xs text-slate-500">
              جهة المتابعة: {item.handledByName}
            </p>
          )}

          {/* =================================================
              RESOLUTION NOTE
          ================================================= */}

          {mine && item.resolutionNote && (
            <p className="mt-2 text-xs text-slate-500">
              الملاحظة: {item.resolutionNote}
            </p>
          )}
        </article>
      ))}

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {!items.length && (
        <div
          className="
            surface
            col-span-full
            p-12
            text-center
            text-slate-500
          "
        >
          لا توجد طلبات مطابقة.
        </div>
      )}
    </section>
  );
}

/* =========================================================
   GEOLOCATION
========================================================= */

function locate() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(
        new Error(
          "المتصفح لا يدعم تحديد الموقع.",
        ),
      );
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: coords.accuracy,
        }),

      () =>
        reject(
          new Error(
            "تعذر تحديد موقعك. فعّل إذن الموقع ثم أعد المحاولة.",
          ),
        ),

      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 15000,
      },
    );
  });
}