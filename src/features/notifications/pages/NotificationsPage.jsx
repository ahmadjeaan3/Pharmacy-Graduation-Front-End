import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BellDot,
  CheckCheck,
  CircleCheckBig,
  Eye,
  Layers3,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "../../../shared/api/errors";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  getMyNotifications,
  getNotificationSummary,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  notificationKeys,
} from "../api/notificationsApi";
import {
  formatNotificationDate,
  notificationTarget,
  notificationTypes,
} from "../utils/notificationFormatters";

const USER_HERO_IMAGE = "/assets/app/home/hero_search.png";

const ORGANIZATION_HERO_IMAGE =
  "/assets/app/organization/organization-dashboard-hero.png";

const PHARMACY_HERO_IMAGE = "/assets/app/pharmacy.png";

const ADMIN_HERO_IMAGE = "/assets/app/home/background_hero_admin.png";

export function NotificationsPage() {
  const { t, i18n } = useTranslation();

  const currentLanguage = (i18n.resolvedLanguage || i18n.language || "ar")
    .split("-")[0]
    .toLowerCase();

  const isArabic = currentLanguage === "ar";
  const direction = isArabic ? "rtl" : "ltr";

  const [filters, setFilters] = useState({
    unreadOnly: false,
    type: "",
    take: 100,
  });

  const [notice, setNotice] = useState("");

  const client = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const userRoles = user?.roles || [];

  const isPharmacyAccount = userRoles.some(
    (role) => String(role).toLowerCase() === "pharmacy",
  );

  const isUserAccount = userRoles.some(
    (role) => String(role).toLowerCase() === "user",
  );

  const isOrganizationAccount = userRoles.some(
    (role) => String(role).toLowerCase() === "organization",
  );

  const notificationsHeroImage = isPharmacyAccount
    ? PHARMACY_HERO_IMAGE
    : isUserAccount
      ? USER_HERO_IMAGE
      : isOrganizationAccount
        ? ORGANIZATION_HERO_IMAGE
        : ADMIN_HERO_IMAGE;

  const summary = useQuery({
    queryKey: notificationKeys.summary,
    queryFn: getNotificationSummary,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const list = useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => getMyNotifications(filters),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const refresh = async () =>
    client.invalidateQueries({
      queryKey: notificationKeys.root,
    });

  const readOne = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: refresh,
  });

  const readAll = useMutation({
    mutationFn: markAllNotificationsAsRead,

    onSuccess: async (result) => {
      setNotice(
        result.updatedCount
          ? t("تم تحديد {{count}} إشعارات كمقروءة.", {
              count: formatNotificationCount(
                result.updatedCount,
                currentLanguage,
              ),
            })
          : t("لا توجد إشعارات جديدة لتحديثها."),
      );

      await refresh();
    },
  });

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      await readOne.mutateAsync(notification.id);
    }

    const target = notificationTarget(notification, user?.roles || []);

    if (target) {
      navigate(target);
    }
  };

  const total = summary.data?.totalCount || 0;

  const unread = summary.data?.unreadCount || 0;

  const read = summary.data?.readCount || 0;

  return (
    <div
      dir={direction}
      lang={currentLanguage}
      className="m-0 min-h-screen w-full bg-[#F4F8F9] p-0 text-[#333333]"
    >
      {/* Hero */}
      <section
        className="
          relative isolate
          -mt-6 overflow-hidden
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
          src={notificationsHeroImage}
          alt=""
          aria-hidden="true"
          className={`
            absolute inset-0 -z-20
            h-full w-full
            select-none
            object-cover object-center
            opacity-80
            ${
              isPharmacyAccount
                ? isArabic
                  ? "scale-x-[-1]"
                  : "scale-x-100"
                : isArabic
                  ? "scale-x-100"
                  : "scale-x-[-1]"
            }
          `}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background: isArabic
              ? "linear-gradient(270deg,rgba(0,63,76,.48) 0%,rgba(3,110,126,.60) 48%,rgba(0,60,73,.18) 100%)"
              : "linear-gradient(90deg,rgba(0,63,76,.48) 0%,rgba(3,110,126,.60) 48%,rgba(0,60,73,.18) 100%)",
          }}
        />

        <div
          dir={direction}
          className="
            relative z-10
          mx-auto flex min-h-[200px]
          w-full max-w-[1240px]
            flex-col items-stretch justify-center gap-6
            px-4 py-8
            sm:px-7
            md:flex-row md:items-center md:justify-between
            lg:px-8 lg:py-9
          "
        >
          <div
            className={`flex min-w-0 items-center gap-4 ${
              isArabic ? "text-right" : "text-left"
            }`}
          >
            <span
              className="
                grid size-12 shrink-0
                place-items-center
                rounded-xl
                bg-white/[.10]
                text-[#E6F3F6]
                backdrop-blur-sm
              "
            >
              <BellDot size={26} strokeWidth={1.8} />
            </span>

            <div className={`min-w-0 ${isArabic ? "text-right" : "text-left"}`}>
              <h1 className="text-[24px] font-black leading-tight text-white sm:text-[30px]">
                {t("إشعاراتك في مكان واحد")}
              </h1>

              <p className="mt-3 max-w-[620px] text-sm leading-7 text-[#D6D6D6]">
                {t(
                  "تابع الطلبات والاعتمادات والتحديثات المهمة، وانتقل مباشرة إلى التفاصيل عندما تكون متاحة.",
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!unread || readAll.isPending}
            onClick={() => readAll.mutate()}
            className="
              inline-flex h-[46px] w-full shrink-0
              items-center justify-center gap-2
              rounded-xl
              border border-white/20
              bg-white
              px-5 md:w-auto
              text-sm font-bold
              text-[#174B57]
              shadow-[0_10px_24px_rgba(7,31,37,.10)]
              transition
              hover:bg-[#F8FBFB]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <CheckCheck size={17} />

            {readAll.isPending ? t("جاري التحديث...") : t("تحديد الكل كمقروء")}
          </button>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1240px] space-y-5 px-4 pb-12 pt-6 sm:px-7 sm:pt-8 lg:px-8">
        {/* Notice */}
        {notice && (
          <div className="rounded-xl border border-[#CFE4E7] bg-[#EAF4F3] px-4 py-3 text-sm font-bold text-[#216474]">
            {notice}
          </div>
        )}

        {/* Summary */}
        <section className="grid gap-3 sm:grid-cols-3 lg:gap-4">
          <SummaryCard
            icon={Layers3}
            label={t("جميع الإشعارات")}
            value={total}
            iconBox="bg-[#E6F3F6]"
            iconColor="text-[#216474]"
            currentLanguage={currentLanguage}
            direction={direction}
          />

          <SummaryCard
            icon={BellDot}
            label={t("غير المقروءة")}
            value={unread}
            iconBox="bg-[#F0F6F7]"
            iconColor="text-[#52727A]"
            currentLanguage={currentLanguage}
            direction={direction}
          />

          <SummaryCard
            icon={CircleCheckBig}
            label={t("تمت قراءتها")}
            value={read}
            iconBox="bg-[#EAF4F3]"
            iconColor="text-[#174B57]"
            currentLanguage={currentLanguage}
            direction={direction}
          />
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-[#DCE8EA] bg-white p-3 shadow-[0_8px_26px_rgba(23,75,87,.04)] sm:p-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            <FilterButton
              active={!filters.unreadOnly && !filters.type}
              label={t("جميع الإشعارات")}
              currentLanguage={currentLanguage}
              onClick={() =>
                setFilters({
                  unreadOnly: false,
                  type: "",
                  take: 100,
                })
              }
            />

            <FilterButton
              active={filters.unreadOnly && !filters.type}
              label={t("غير المقروءة")}
              count={unread}
              currentLanguage={currentLanguage}
              onClick={() =>
                setFilters({
                  unreadOnly: true,
                  type: "",
                  take: 100,
                })
              }
            />

            {Object.entries(notificationTypes)
              .filter(
                ([type]) =>
                  (summary.data?.unreadByType || []).some(
                    (item) => item.type === type,
                  ) || list.data?.some((item) => item.type === type),
              )
              .map(([type, meta]) => (
                <FilterButton
                  key={type}
                  active={filters.type === type}
                  label={t(meta.label)}
                  count={
                    (summary.data?.unreadByType || []).find(
                      (item) => item.type === type,
                    )?.count
                  }
                  currentLanguage={currentLanguage}
                  onClick={() =>
                    setFilters({
                      unreadOnly: false,
                      type,
                      take: 100,
                    })
                  }
                />
              ))}
          </div>
        </section>

        {/* List */}
        {list.isLoading ? (
          <div className="grid min-h-64 place-items-center rounded-xl bg-white text-sm font-bold text-[#829499]">
            {t("جاري تحميل الإشعارات...")}
          </div>
        ) : list.isError ? (
          <div className="rounded-xl border border-rose-100 bg-white p-8 text-center">
            <p className="font-bold text-rose-700">
              {t("تعذر تحميل الإشعارات")}
            </p>

            <p className="mt-2 text-sm text-[#71858A]">
              {getApiErrorMessage(list.error)}
            </p>

            <button
              type="button"
              onClick={() => list.refetch()}
              className="mt-4 inline-flex h-10 items-center rounded-lg border border-[#D5E3E5] bg-white px-4 text-sm font-bold text-[#216474] transition hover:bg-[#EAF4F3]"
            >
              {t("إعادة المحاولة")}
            </button>
          </div>
        ) : !list.data?.length ? (
          <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-[#CFE0E3] bg-white p-8 text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[#EAF4F3] text-[#216474]">
                <Bell size={23} />
              </span>

              <h2 className="mt-4 font-bold text-[#29464D]">
                {t("لا توجد إشعارات هنا")}
              </h2>

              <p className="mt-2 text-sm text-[#829499]">
                {t("ستظهر التحديثات المهمة فور حدوثها.")}
              </p>
            </div>
          </div>
        ) : (
          <section className="space-y-3">
            {list.data.map((notification) => {
              const target = notificationTarget(
                notification,
                user?.roles || [],
              );

              return (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  targetAvailable={Boolean(target)}
                  pending={readOne.isPending}
                  onRead={() => readOne.mutate(notification.id)}
                  onOpen={() => openNotification(notification)}
                  t={t}
                  direction={direction}
                  currentLanguage={currentLanguage}
                />
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  iconBox,
  iconColor,
  currentLanguage = "ar",
  direction = "rtl",
}) {
  return (
    <article
      dir={direction}
      className="flex min-h-[100px] items-center gap-4 rounded-2xl border border-[#DCE8EA] bg-white p-4 shadow-[0_8px_26px_rgba(23,75,87,.04)] sm:min-h-[112px] sm:p-5"
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${iconBox} ${iconColor} sm:size-12`}
      >
        <Icon size={19} />
      </span>

      <div>
        <p className="text-xs font-medium text-[#829499]">{label}</p>

        <strong
          dir="ltr"
          className="mt-2 block w-fit text-2xl font-black leading-none tabular-nums text-[#29464D] sm:text-3xl"
        >
          {formatNotificationCount(value, currentLanguage)}
        </strong>
      </div>
    </article>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick,
  currentLanguage = "ar",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-4 text-sm font-bold transition ${
        active
          ? "border-[#216474] bg-[#216474] text-white"
          : "border-[#D8E5E7] bg-[#F8FBFB] text-[#60777D] hover:border-[#AFC9CD] hover:bg-[#EAF4F3]"
      }`}
    >
      <span>{label}</span>

      {count > 0 && (
        <span
          className={`grid min-w-6 place-items-center rounded-full px-1.5 text-[10px] leading-5 ${
            active ? "bg-white/15 text-white" : "bg-[#E6F3F6] text-[#216474]"
          }`}
        >
          {formatNotificationCount(count, currentLanguage)}
        </span>
      )}
    </button>
  );
}

function NotificationCard({
  notification,
  targetAvailable,
  pending,
  onRead,
  onOpen,
  t,
  direction,
  currentLanguage,
}) {
  const isArabic = currentLanguage === "ar";

  const meta = notificationTypes[notification.type] || {};

  const Icon = meta.icon || Bell;

  const rawTitle =
    notification.title ||
    notification.subject ||
    meta.title ||
    meta.label ||
    "إشعار جديد";

  const rawMessage =
    notification.message ||
    notification.body ||
    notification.description ||
    "لديك تحديث جديد ضمن حسابك.";

  const title = translateNotificationTitle({
    rawTitle,
    notification,
    t,
  });

  const message = translateNotificationMessage({
    rawMessage,
    notification,
    t,
  });

  const createdAt = notification.createdAtUtc || notification.createdAt;

  return (
    <article
      dir={direction}
      className={`relative flex min-h-[104px] w-full items-center overflow-hidden rounded-2xl border bg-white p-4 transition sm:p-5 ${
        notification.isRead
          ? "border-[#DCE8EA]"
          : "border-[#BFD9DD] shadow-[0_8px_24px_rgba(23,75,87,.06)]"
      }`}
    >
      {!notification.isRead && (
        <span className={`absolute inset-y-0 w-1 bg-[#DFAE0D] ${isArabic ? "right-0" : "left-0"}`} />
      )}
      <div className="flex w-full flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Notification content */}
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-xl ${
              notification.isRead
                ? "bg-[#EAF4F3] text-[#216474]"
                : "bg-[#FFF7DF] text-[#B88400]"
            }`}
          >
            <Icon size={22} strokeWidth={1.8} />
          </span>

          <div className={`min-w-0 ${isArabic ? "text-right" : "text-left"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="line-clamp-2 text-sm font-bold text-[#29464D] sm:text-base">
                {title}
              </h2>

              {!notification.isRead && (
                <span className="inline-flex h-6 items-center justify-center rounded-full border border-[#E6F3F6] bg-[#E6F3F6] px-3 text-[11px] font-medium text-[#216474]">
                  {t("جديد")}
                </span>
              )}
            </div>

            <p className="mt-1 line-clamp-2 max-w-[650px] text-xs leading-5 text-[#829499] sm:text-sm">
              {message}
            </p>
          </div>
        </div>

        {/* Time and actions */}
        <div className="flex shrink-0 flex-col gap-3 border-t border-[#EDF2F3] pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between xl:border-0 xl:pt-0">
          <span className="whitespace-nowrap text-sm text-[#666666]">
            {formatNotificationDate(createdAt, currentLanguage) ||
              t("منذ وقت قريب")}
          </span>

          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:items-center">
            {targetAvailable && (
              <button
                type="button"
                onClick={onOpen}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#D8E5E7] bg-white px-4 text-sm font-bold text-[#52727A] transition hover:border-[#AFC9CD] hover:bg-[#F8FBFB] hover:text-[#216474] sm:min-w-[128px]"
              >
                <Eye size={15} />

                {t("عرض التفاصيل")}
              </button>
            )}

            {!notification.isRead && (
              <button
                type="button"
                onClick={onRead}
                disabled={pending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#D8E5E7] bg-white px-4 text-sm font-bold text-[#52727A] transition hover:border-[#DFAE0D]/50 hover:bg-[#FFF9EC] hover:text-[#A87818] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[128px]"
              >
                <CheckCheck size={15} />

                {t("تمييز كمقروء")}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function translateNotificationTitle({ rawTitle, notification, t }) {
  if (notification.type === "OrganizationApprovalUpdated") {
    return t("تحديث اعتماد المنظمة");
  }

  if (notification.type === "PharmacyApprovalUpdated") {
    return t("تحديث اعتماد الصيدلية");
  }

  if (notification.type === "WarehouseApprovalUpdated") {
    return t("تحديث اعتماد المستودع");
  }

  return t(rawTitle);
}

function translateNotificationMessage({ rawMessage, notification, t }) {
  /*
   * الرسائل القادمة من الـ API قد تحتوي على أسماء ديناميكية،
   * لذلك لا نعتمد على t(rawMessage) فقط.
   * نستخرج القيم المتغيرة ثم نستخدم مفتاح ترجمة ثابت.
   */

  if (notification.type === "OrganizationApprovalUpdated") {
    const organizationName = extractOrganizationName(rawMessage);

    if (organizationName) {
      return t("تم اعتماد المنظمة {{name}}.", {
        name: organizationName,
      });
    }

    return t("تم تحديث حالة اعتماد المنظمة من إدارة المنصة.");
  }

  if (notification.type === "PharmacyApprovalUpdated") {
    const pharmacyName = extractPharmacyName(rawMessage);

    if (pharmacyName) {
      return t("تم اعتماد صيدلية {{name}}.", {
        name: pharmacyName,
      });
    }

    return t("تم تحديث حالة اعتماد الصيدلية من إدارة المنصة.");
  }

  if (notification.type === "MedicineRequestCreated") {
    const requestData = extractMedicineRequestData(rawMessage);

    if (requestData) {
      return t("طلب {{user}} دواء {{medicine}} من {{pharmacy}}.", {
        user: requestData.user,
        medicine: requestData.medicine,
        pharmacy: requestData.pharmacy,
      });
    }

    return t("تم إنشاء طلب دواء جديد.");
  }

  return t(rawMessage);
}

function extractOrganizationName(message) {
  if (!message) {
    return "";
  }

  const normalized = String(message).replace(/\s+/g, " ").trim();

  const patterns = [
    /تم اعتماد منظمة\s+(.+?)[.،]?$/i,
    /تم اعتماد المنظمة\s+(.+?)[.،]?$/i,
    /اعتماد منظمة\s+(.+?)[.،]?$/i,
    /Organization\s+(.+?)\s+has been approved[.]?$/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);

    if (match?.[1]) {
      return match[1].replace(/[.،]+$/g, "").trim();
    }
  }

  return "";
}

function extractPharmacyName(message) {
  if (!message) {
    return "";
  }

  const normalized = String(message).replace(/\s+/g, " ").trim();

  const patterns = [
    /تم اعتماد صيدلية\s+(.+?)[.،]?$/i,
    /تم اعتماد الصيدلية\s+(.+?)[.،]?$/i,
    /اعتماد صيدلية\s+(.+?)[.،]?$/i,
    /Pharmacy\s+(.+?)\s+has been approved[.]?$/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);

    if (match?.[1]) {
      return match[1].replace(/[.،]+$/g, "").trim();
    }
  }

  return "";
}

function extractMedicineRequestData(message) {
  if (!message) {
    return null;
  }

  const normalized = String(message).replace(/\s+/g, " ").trim();

  /*
   * مثال من الـ API:
   * طلب eman habbar دواء Acarbose 25 من صيدلية.
   *
   * إذا كان اسم الصيدلية موجودًا:
   * طلب eman habbar دواء Acarbose 25 من صيدلية الشفاء.
   */
  const arabicMatch = normalized.match(
    /^طلب\s+(.+?)\s+دواء\s+(.+?)\s+من\s+(.+?)[.،]?$/i,
  );

  if (arabicMatch) {
    return {
      user: arabicMatch[1].replace(/[.،]+$/g, "").trim(),

      medicine: arabicMatch[2].replace(/[.،]+$/g, "").trim(),

      pharmacy: arabicMatch[3].replace(/[.،]+$/g, "").trim(),
    };
  }

  const englishMatch = normalized.match(
    /^(.+?)\s+requested\s+(.+?)\s+from\s+(.+?)[.]?$/i,
  );

  if (englishMatch) {
    return {
      user: englishMatch[1].trim(),
      medicine: englishMatch[2].trim(),
      pharmacy: englishMatch[3].trim(),
    };
  }

  return null;
}

function formatNotificationCount(value, currentLanguage = "ar") {
  const locale =
    currentLanguage === "ar"
      ? "ar-SY"
      : currentLanguage === "tr"
        ? "tr-TR"
        : "en-US";

  return Number(value || 0).toLocaleString(locale);
}
