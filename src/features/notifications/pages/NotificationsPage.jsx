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

const WAREHOUSE_HERO_IMAGE = "/assets/app/home/SupplyChainWorkspace.png";

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

  const isAdminAccount = userRoles.some((role) =>
    ["admin", "administrator", "systemadmin", "system-admin"].includes(
      String(role).toLowerCase(),
    ),
  );

  const isWarehouseAccount = userRoles.some((role) =>
    ["warehouse", "warehouseadmin", "warehouse-admin"].includes(
      String(role).toLowerCase(),
    ),
  );

  const notificationsHeroImage = isPharmacyAccount
    ? PHARMACY_HERO_IMAGE
    : isAdminAccount
      ? ADMIN_HERO_IMAGE
      : isWarehouseAccount
        ? WAREHOUSE_HERO_IMAGE
        : isUserAccount
          ? USER_HERO_IMAGE
          : ORGANIZATION_HERO_IMAGE;

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
      className="m-0 min-h-screen w-full bg-[#F7F9FA] p-0 text-[#333333]"
    >
      <div className={isPharmacyAccount || isOrganizationAccount || isAdminAccount || isWarehouseAccount ? "space-y-6" : ""}>
      {/* Hero */}
      <section
        className={
          isPharmacyAccount || isOrganizationAccount || isAdminAccount || isWarehouseAccount
            ? "relative isolate min-h-[220px] overflow-hidden rounded-[14px] text-white shadow-[0_22px_55px_rgba(23,75,87,.16)] sm:min-h-[230px] lg:min-h-[250px]"
            : "relative isolate -mt-6 overflow-hidden bg-[#0D7586] text-white sm:-mt-7 lg:-mt-8"
        }
        style={
          isPharmacyAccount || isOrganizationAccount || isAdminAccount || isWarehouseAccount
            ? undefined
            : {
                width: "100vw",
                marginInline: "calc(50% - 50vw)",
              }
        }
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
            ${
              isPharmacyAccount
                ? isArabic
                  ? "scale-x-[-1] object-[center_42%] opacity-100"
                  : "scale-x-100 object-[center_42%] opacity-100"
                : isOrganizationAccount
                  ? isArabic
                    ? "scale-x-100 object-[center_50%] opacity-100"
                    : "scale-x-[-1] object-[center_50%] opacity-100"
                  : isAdminAccount
                    ? isArabic
                      ? "scale-x-100 object-[center_46%] opacity-100"
                      : "scale-x-[-1] object-[center_46%] opacity-100"
                    : isWarehouseAccount
                      ? isArabic
                        ? "scale-x-100 object-[center_48%] opacity-100"
                        : "scale-x-[-1] object-[center_48%] opacity-100"
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
            background: isPharmacyAccount
              ? isArabic
                ? "linear-gradient(270deg, #10505A 0%, rgba(16,80,90,.88) 34%, rgba(33,100,116,.42) 68%, rgba(33,100,116,.08) 100%)"
                : "linear-gradient(90deg, #10505A 0%, rgba(16,80,90,.88) 34%, rgba(33,100,116,.42) 68%, rgba(33,100,116,.08) 100%)"
              : isOrganizationAccount
                ? isArabic
                  ? "linear-gradient(270deg, #10505A 0%, rgba(16,80,90,.90) 32%, rgba(33,100,116,.46) 66%, rgba(33,100,116,.10) 100%)"
                  : "linear-gradient(90deg, #10505A 0%, rgba(16,80,90,.90) 32%, rgba(33,100,116,.46) 66%, rgba(33,100,116,.10) 100%)"
                : isAdminAccount
                  ? isArabic
                    ? "linear-gradient(270deg, #0D4E59 0%, rgba(13,78,89,.92) 34%, rgba(33,100,116,.48) 68%, rgba(33,100,116,.10) 100%)"
                    : "linear-gradient(90deg, #0D4E59 0%, rgba(13,78,89,.92) 34%, rgba(33,100,116,.48) 68%, rgba(33,100,116,.10) 100%)"
                  : isWarehouseAccount
                    ? isArabic
                      ? "linear-gradient(270deg, #10505A 0%, rgba(16,80,90,.91) 34%, rgba(33,100,116,.46) 68%, rgba(33,100,116,.08) 100%)"
                      : "linear-gradient(90deg, #10505A 0%, rgba(16,80,90,.91) 34%, rgba(33,100,116,.46) 68%, rgba(33,100,116,.08) 100%)"
                    : isArabic
                      ? "linear-gradient(270deg,rgba(0,63,76,.48) 0%,rgba(3,110,126,.60) 48%,rgba(0,60,73,.18) 100%)"
                      : "linear-gradient(90deg,rgba(0,63,76,.48) 0%,rgba(3,110,126,.60) 48%,rgba(0,60,73,.18) 100%)",
          }}
        />

        {(isPharmacyAccount || isOrganizationAccount || isAdminAccount || isWarehouseAccount) && (
          <div
            aria-hidden="true"
            className={`absolute -top-20 -z-[5] size-64 rounded-full border-[40px] border-white/[.04] ${
              isArabic ? "-left-14" : "-right-14"
            }`}
          />
        )}

        <div
          dir={direction}
          className={
            isPharmacyAccount || isOrganizationAccount || isAdminAccount || isWarehouseAccount
              ? "relative z-10 flex min-h-[220px] w-full items-center gap-6 px-6 py-7 sm:min-h-[230px] lg:min-h-[250px] lg:px-9"
              : "relative z-10 mx-auto flex min-h-[220px] w-full max-w-[1240px] items-center gap-6 px-5 py-9 sm:px-7 lg:px-8"
          }
        >
          <div
            className={`me-auto flex items-center gap-4 ${
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
              <h1 className="text-[28px] font-bold leading-tight text-white">
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
              inline-flex h-[50px] shrink-0
              items-center justify-center gap-2
              rounded-[10px]
              border border-white
              bg-white
              px-6
              text-[13px] font-bold
              text-[#216474]
              shadow-[0_10px_26px_rgba(0,0,0,.16)]
              transition-all duration-200
              hover:-translate-y-0.5
              hover:bg-[#F4FAFA]
              hover:shadow-[0_14px_30px_rgba(0,0,0,.20)]
              disabled:cursor-not-allowed
              disabled:border-white/70
              disabled:bg-white/75
              disabled:text-[#216474]/70
              disabled:opacity-100
            "
          >
            <CheckCheck size={18} strokeWidth={2} />

            {readAll.isPending ? t("جاري التحديث...") : t("تحديد الكل كمقروء")}
          </button>
        </div>
      </section>

      <main
        className={
          isPharmacyAccount || isOrganizationAccount || isAdminAccount || isWarehouseAccount
            ? "w-full"
            : "mx-auto w-full max-w-[1240px] px-5 pb-12 pt-8 sm:px-7 lg:px-8"
        }
      >
      {/* Notice */}
      {notice && (
        <div className="rounded-xl border border-[#CFE4E7] bg-[#EAF4F3] px-4 py-3 text-sm font-bold text-[#216474]">
          {notice}
        </div>
      )}

      {/* Summary */}
      <section className="grid gap-4 sm:grid-cols-3">
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
          iconBox="bg-[#E6F3F6]"
          iconColor="text-[#216474]"
          currentLanguage={currentLanguage}
          direction={direction}
        />
      </section>

      {/* Filters */}
      <section className="mt-5 rounded-[10px] border border-[rgba(102,102,102,.14)] bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
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
          <p className="font-bold text-rose-700">{t("تعذر تحميل الإشعارات")}</p>

          <p className="mt-2 text-sm text-[#71858A]">
            {getApiErrorMessage(list.error)}
          </p>

          <button
            type="button"
            onClick={() => list.refetch()}
            className="mt-4 inline-flex h-10 items-center rounded-[8px] border border-[#D5E3E5] bg-white px-4 text-[12px] font-semibold text-[#216474] transition hover:border-[#216474]/30 hover:bg-[#F4FAFA]"
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
            const target = notificationTarget(notification, user?.roles || []);

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
      className="flex min-h-[108px] items-center gap-4 rounded-[10px] border border-[rgba(102,102,102,.14)] bg-white p-5"
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl ${iconBox} ${iconColor}`}
      >
        <Icon size={19} />
      </span>

      <div>
        <p className="text-xs font-medium text-[#829499]">{label}</p>

        <strong
          dir="ltr"
          className="mt-2 block w-fit text-3xl font-bold leading-none tabular-nums text-[#29464D]"
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
      className={`inline-flex h-10 items-center gap-2 rounded-[8px] border px-4 text-[12px] font-semibold transition ${
        active
          ? "border-[#216474] bg-[#216474] text-white shadow-[0_6px_14px_rgba(33,100,116,.10)]"
          : "border-[#D8E5E7] bg-white text-[#60777D] hover:border-[#216474]/25 hover:bg-[#F4FAFA] hover:text-[#216474]"
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
      className={`relative flex min-h-[92px] w-full items-center overflow-hidden rounded-[10px] border border-[rgba(102,102,102,.14)] bg-white px-5 py-4 transition ${
        notification.isRead ? "" : "shadow-[0_5px_16px_rgba(23,75,87,.035)]"
      }`}
    >
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Notification content */}
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-14 shrink-0 items-center justify-center bg-transparent ${
              isArabic ? "border-r-2 pr-4" : "border-l-2 pl-4"
            } ${
              notification.isRead
                ? "border-[#C8DADD] text-[#216474]"
                : "border-[#216474] text-[#216474]"
            }`}
          >
            <Icon size={22} strokeWidth={1.8} />
          </span>

          <div className={`min-w-0 ${isArabic ? "text-right" : "text-left"}`}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-medium text-[#333333]">
                {title}
              </h2>

              {!notification.isRead && (
                <span className="inline-flex h-6 items-center justify-center rounded-full border border-[#D5E7E9] bg-[#E6F3F6] px-3 text-[10.5px] font-semibold text-[#216474]">
                  {t("جديد")}
                </span>
              )}
            </div>

            <p className="mt-1 line-clamp-1 max-w-[560px] text-xs leading-5 text-[#A5A5A5]">
              {message}
            </p>
          </div>
        </div>

        {/* Time and actions */}
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <span className="whitespace-nowrap text-sm text-[#666666]">
            {formatNotificationDate(createdAt, currentLanguage) ||
              t("منذ وقت قريب")}
          </span>

          <div className="flex items-center gap-3">
            {targetAvailable && (
              <button
                type="button"
                onClick={onOpen}
                className="inline-flex h-10 min-w-[128px] items-center justify-center gap-2 rounded-[8px] border border-[#216474] bg-[#216474] px-4 text-[12px] font-medium text-white transition hover:bg-[#174B57]"
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
                className="inline-flex h-10 min-w-[128px] items-center justify-center gap-2 rounded-[8px] border border-[#D5E4E6] bg-white px-4 text-[12px] font-medium text-[#216474] transition hover:border-[#216474]/35 hover:bg-[#F4FAFA] disabled:cursor-not-allowed disabled:opacity-50"
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